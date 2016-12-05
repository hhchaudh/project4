package Command::SendMessage;

use strict;
use warnings;

use JSON;

sub sendMessage
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $command->{'vector'}->{'getUserFromToken'}->( $stream, $game, $command );
	
	return unless defined $userName;
	
	unless ( ( defined $command ) && ( defined $command->{"message"} ) )
	{
		$reporter->{'log'}->( "Did not get a message for sendMessage!!!", "ERROR" );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Did not get a message for sendMessage!!!" );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $message = $command->{"message"};
	$message = GameUtil::unTaint($message);
	
	$reporter->{'log'}->( "Sending out from user |$userName| the message |$message|" );
	
	my %msgPacket = (
		name => "newMessage",
		userName => $userName,
		message => $message,
	);
	
	$game->{"sendToUsers"}->( \%msgPacket );
	
	$stream->{'close'}->( $stream );	
	return;
}

1;
