package Stream;

use strict;
use warnings;

use IO::Select;
use IO::Socket::UNIX;
use JSON;

require "modules/GameUtil.pm";

sub newLobbyStream
{
	my $sock = shift;
	my $game = shift;
	my $closeFunc = shift;
	
	my $stream = newClientStream( $sock, $game );
	
	$stream->{"validCommands"} = $game->{'lobbyCommands'};
	$stream->{"constant"} = 1;
	$stream->{"close"} = $closeFunc;
	
	return $stream;
}

sub newGameStream
{
	my $sock = shift;
	my $game = shift;
	my $userName = shift;
	my $closeFunc = shift;
	
	my $stream = newClientStream( $sock, $game );
	
	$stream->{"validCommands"} = $game->{'gameCommands'};
	$stream->{"constant"} = 1;
	$stream->{"userName"} = $userName;
	$stream->{"close"} = $closeFunc;
	
	return $stream;
}

sub newClientStream
{
	my $sock = shift;
	my $game = shift;
	my %stream = (
		sock          => $sock,
		game          => $game,
		validCommands => $game->{'clientCommands'},
		timeOut       => 1,
		expire        => 0,
		pastMessage   => '',
		constant      => 0,
		
		getCommand    => \&getCommand,
		sendCommand   => \&sendCommand,
		sendMore      => 0,
		sendMessage   => '',
		
		readError     => \&tryAgain,
		readPartial   => \&ClientReadPartial,
		readComplete  => \&clientReadComplete,
		
		writeError     => \&tryAgain,
		writePartial   => \&ClientReadPartial,
		writeComplete  => \&clientReadComplete,
		
		readUpdateTimeOut  => \&updateTimeOut,
		writeUpdateTimeOut => \&updateTimeOut,
		readWait           => \&standardWait,
		writeWait          => \&standardWait,
		close              => \&clientClose,
	);
	
	return \%stream;
}

sub clientReadComplete
{
	my $stream = shift;
	$stream->{'timeOut'} = 1;
}

sub clientClose
{
	my $stream = shift;
	$stream->{'sock'}->close( );
}

sub ClientReadPartial
{
	my $stream = shift;
	my $read = shift;
	my $game = $stream->{'game'};
	
	return if $stream->{'updateTimeOut'}->( $stream );
	
	$stream->{'wait'}->( $stream );
	if( $read )
	{
		push @{ $game->{'inStreams'} }, $stream;
	}
	else
	{
		$stream->{"sendMore"} = 1;
	}
	
	return;
}

sub tryAgain
{
	my $stream = shift;
	my $errno = shift;
	my $game = $stream->{'game'};
	my $read = shift;
	
	my $specialCase = ( $read && $stream->{"constant"}) ? 1 : 0;
	
	unless( $specialCase )
	{
		return if $stream->{'updateTimeOut'}->( $stream );
	}
	
	unless( ( $errno == POSIX::EAGAIN ) || ( $errno == POSIX::EWOULDBLOCK ) || ( $errno == POSIX::EINTR ) )
	{
		$game->{'reporter'}->{'log'}->( "Unrecoverable error. was |$errno|." );
		$stream->{'close'}->( $stream );
		return;
	}
	
	return if $specialCase;
	
	$stream->{'wait'}->( $stream );
	if( $read )
	{
		push @{ $game->{'inStreams'} }, $stream;
	}
	else
	{
		$stream->{"sendMore"} = 1;
	}
	
	return;
}

sub updateTimeOut
{
	my $stream = shift;
	my $game = $stream->{'game'};
	
	if( $stream->{'timeOut'}-- <= 0 )
	{
		$game->{'reporter'}->{'log'}->( "Timed out trying to do full task on stream." );
		$stream->{'close'}->( $stream );
		return 1;
	}
	
	return 0;
}

sub standardWait
{
	my $stream = shift;
	my $sel = IO::Select->new( $stream->{'sock'} );
	$sel->can_read( 0.01 );
}

sub sendCommand
{
	my $stream = shift;
	my $sendStruct = shift;
	
	my $game = $stream->{'game'};
	my $socket = $stream->{"sock"};
	
	my $reporter = $game->{'reporter'};
	my $DEBUG = $game->{'DEBUG'};
		
	my $sendMessage;
	eval { $sendMessage = encode_json ( $sendStruct ); };
	if( $@ )
	{
		$reporter->{'log'}->( "Problem encoding JSON for sendMessage says: |$@|", "ERROR" );
		$stream->{'close'}->( $stream );
		return;
	}
	
	$stream->{"sendMessage"} = GameUtil::unTaint( $sendMessage ) . "\n";
	$stream->{"sendMore"} = 1;
	
	while( $stream->{"sendMore"} )
	{
		$stream->{"sendMore"} = 0;
		my $outBuffer = $stream->{"sendMessage"};
		
		my $byteSent = $socket->send( $outBuffer, 0 );
		
		unless( ( defined $byteSent ) && ( $byteSent > 0 ) )
		{
			unless( defined $byteSent )
			{
				$stream->{'writeError'}->( $stream, $!, 0 );
			}
			else
			{
				$game->{'reporter'}->{'log'}->( "Pipe closed. Did not send |$outBuffer|." );
				$stream->{'close'}->( $stream );
			}
		}
		else
		{
			if( $byteSent >= length $outBuffer )
			{
				$reporter->{'log'}->( "Successfully sent |$outBuffer|. Message complete." );
				$stream->{"sendMessage"} = '';
				$stream->{'writeComplete'}->( $stream );
				last;
			}
			else
			{
				$outBuffer = substr $outBuffer, $byteSent;
				$stream->{"sendMessage"} = $outBuffer;
				$stream->{'writePartial'}->( $stream, 0 );
			}
		}
	}
}

sub getCommand
{
	my $stream = shift;
	my $game = $stream->{'game'};
	
	my $socket = $stream->{"sock"};
	my $recvMessage = '';
	
	### try to get some bytes.
	my $byteRecv = $socket->recv( $recvMessage, POSIX::BUFSIZ, 0 );
	
	unless( ( defined $byteRecv ) && ( defined $recvMessage ) && ( length $recvMessage ) )
	{
		### no characters were recv, see if we can recover from this.
		unless( defined $byteRecv )
		{
			$stream->{'readError'}->( $stream, $!, 1 );
		}
		else
		{
			### the socket closed, so do cleanup work for that socket.
			$game->{'reporter'}->{'log'}->( "Pipe closed. Close this socket." );
			$stream->{'close'}->( $stream );
		}
	}
	else
	{
		### We got something back, check to see if full message, if it is, send it out.
		$stream->{'pastMessage'} .= $recvMessage;
		my $pastMessage = $stream->{'pastMessage'};
		$game->{'reporter'}->{'log'}->( "Got more bytes from clinet, buffer is now |$pastMessage|." );
		
		if( $pastMessage =~ /(.*?)\n/ )
		{
			my $command = $1;
			$stream->{'readComplete'}->( $stream );
			return $command;
		}
		else
		{
			$stream->{'readPartial'}->( $stream, 1 );
		}
	}
	
	return;
}

1;
