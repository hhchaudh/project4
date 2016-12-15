#!/usr/bin/perl

use strict;
use warnings;
use IO::Socket::UNIX;
use IO::Select;
use POSIX;
use Time::HiRes qw(time);

use lib "/home/jfustos/perl5/share/perl5";
use lib "/home/jfustos/perl5/lib64/perl5";
use lib "/home/jfustos/perl5/lib/perl5";

use JSON;

use lib "/home/jfustos/EECS448/altStack";

require "modules/Conf.pm";
require "modules/Report.pm";
require "modules/Command.pm";
require "modules/GameUtil.pm";
require "modules/Stream.pm";
require "modules/UserInfo.pm";
require "modules/Game.pm";

require "modules/Command/GetGameStream.pm";
require "modules/Command/SendMessage.pm";
require "modules/Command/CreateUser.pm";
require "modules/Command/Login.pm";
require "modules/Command/CreateGame.pm";
require "modules/Command/RemoveUserLobbySide.pm";
require "modules/Command/RemoveUserGameSide.pm";
require "modules/Command/IncrementRecord.pm";
require "modules/Command/CloseGame.pm";
require "modules/Command/AcceptUser.pm";
require "modules/Command/LogOff.pm";
require "modules/Command/JoinGame.pm";
require "modules/Command/GetNewGameFrame.pm";
require "modules/Command/SetReady.pm";
require "modules/Command/NewGame.pm";
require "modules/Command/Key.pm";

$SIG{CHLD} = "IGNORE";

### Start loging
my $conf = Conf::get();
my $reporter = Report::start( $conf->{'logFile'} );
UserInfo::setUserInfoFile( $conf->{'userInfo'} );

my $frameStep = 0.05;

my $server = IO::Socket::UNIX->new(
	Type => SOCK_STREAM(),
	Local => $conf->{'socketFile'},
	Listen => 10,
);

unless( $server )
{
	$reporter->{'log'}->( "Could not open UNIX socket says: $!", "ERROR", "DIE" );
}

$server->autoflush( 1 );

my $game = {
	state        => "Lobby",
	updateStatus => "LOBBY",
	innerGame    => undef,
	extraUpdate  => 0,
	users        => UserInfo::get( $reporter ),
	activeUsers  => {},
	players      => [],
	tokens       => {
		'0000000000' => { type => 'GAME', userName => 'NONE' },
	},
	inStreams    => [],
	games        => {},
	newInStreams => [],
	reporter     => $reporter,
	DEBUG        => 0,
	socket       => $server,
	socketFile   => $conf->{'socketFile'},
	clientCommands => {},
	
	sendToUsers    => \&sendToUsers,
	newToken       => \&newToken,
	properDie      => \&properDie,
	
	lobbyClientCommands => {
		getGameStream => \&Command::GetGameStream::getGameStream,
		sendMessage   => \&Command::SendMessage::sendMessage,
		createUser    => \&Command::CreateUser::createUser,
		login         => \&Command::Login::login,
		createGame    => \&Command::CreateGame::createGame,
		logOff        => \&Command::LogOff::logOff,
		joinGame      => \&Command::JoinGame::joinGame,
	},
	gameClientCommands  => {
		getGameStream   => \&Command::GetGameStream::getGameStream,
		sendMessage     => \&Command::SendMessage::sendMessage,
		logOff          => \&Command::LogOff::logOff,
		getNewGameFrame => \&Command::GetNewGameFrame::getNewGameFrame,
		setReady        => \&Command::SetReady::setReady,
		newGame         => \&Command::NewGame::newGame,
		keyDown         => \&Command::Key::keyDown,
		keyUp           => \&Command::Key::keyUp,
	},
	gameCommands => {
		removeUser      => \&Command::RemoveUserLobbySide::removeUser,
		incrementRecord => \&Command::IncrementRecord::incrementRecord,
	},
	lobbyCommands => {
		removeUser      => \&Command::RemoveUserGameSide::removeUser,
		closeGame       => \&Command::CloseGame::closeGame,
		acceptUser      => \&Command::AcceptUser::acceptUser,
	},
};

$game->{'clientCommands'} = $game->{'lobbyClientCommands'};

my $frame = 0;

while( 1 )
{
	$frame++;
	
	### check the death file and make sure it is OK to run.
	if( -e $conf->{'dieFile'} )
	{
		properDie( "All stop found. Dying!!!" );
	}
	
	my $sel = IO::Select->new( $game->{"socket"} );
	
	### add all game streams first
	foreach my $userName ( keys %{ $game->{"games"} } )
	{
		push @{ $game->{'inStreams'} }, $game->{"games"}->{ $userName }->{"stream"};
	}
	
	### grab all connections.
	while( 1 )
	{
		$reporter->{'log'}->( "Looking for connections |$frame|." ) if $game->{'DEBUG'};
		if(my @ready = $sel->can_read( 0.001 ) )
		{
			foreach my $fh (@ready) 
			{
				my $new_sock = $fh->accept;
				if( $new_sock )
				{
					$new_sock->autoflush( 1 );
					$new_sock->blocking( 0 );
					$reporter->{'log'}->( "Accepting new connection." );
					push @{ $game->{'inStreams'} }, Stream::newClientStream( $new_sock, $game );
				}
			}
		}
		else
		{
			last;
		}
	}	
	
	
	### process all commands
	while( my $stream = shift @{ $game->{'inStreams'} } )
	{
		$stream->{'getCommand'}->( $stream );
	}
	
	
	### update the lobby
	if(  ( $game->{'extraUpdate'} == 1 )  ||  ( $frame % 20 == 0 )  )
	{
		$game->{'extraUpdate'} = 0;
		my $which = ( $game->{'state'} eq "Lobby" ) ? "Lobby" : "Player";
		updateInfo( $which );
	}
	
	### run internal periodic logic
	my $innerGame = $game->{'innerGame'};
	if( defined $innerGame )
	{
		$innerGame->{'runFrame'}->( $innerGame );
		updateGameInfo();
	}
	
	
	### update all player streams
	updatePlayerStreams();
	
	
	### print that we are alive
	if( $frame % 1200 == 0 )
	{
		$reporter->{'log'}->( "---HEARTBEAT---" );
	}
	
	
	### wait so we don't eat up processor
	select(undef, undef, undef, $frameStep);
}

properDie( "Exiting OK." );

exit 0;

sub updateGameInfo
{
	my $players = $game->{'players'};
	my $innerGame = $game->{'innerGame'};
	
	my $updateFrame = $innerGame->{'getUpdateFrame'}->( $innerGame );
	my $updateFrameNum = $updateFrame->{'frame'};
	my $newFrame;
	
	foreach my $player ( @{ $players } )
	{
		my $userName  = $player->{'user'};
		my $lastFrame = $player->{'lastFrame'};
		
		if( defined $game->{'activeUsers'}->{ $userName } )
		{
			my $user = $game->{'activeUsers'}->{ $userName };
			
			if( @{ $user->{'streams'} } )
			{
				my $stream = $user->{'streams'}->[ 0 ];
				
				if( ( $updateFrameNum == ( $lastFrame + 1 ) ) && ( !$user->{'requestNewFrame'} ) )
				{
					$stream->{'sendCommand'}->( $stream, $updateFrame );
				}
				elsif( ( $updateFrameNum == $lastFrame ) && ( !$user->{'requestNewFrame'} ) )
				{
					
				}
				else
				{
					$newFrame = $innerGame->{'getNewFrame'}->( $innerGame ) unless defined $newFrame;
					
					$stream->{'sendCommand'}->( $stream, $newFrame );
					$user->{'requestNewFrame'} = 0;
				}
				
				$player->{'lastFrame'} = $updateFrameNum;
			}
		}
	}
}

sub properDie
{
	my $message = shift;
	my $error = shift;
	
	$reporter->{'log'}->( $message, $error );
	
	$reporter->{'log'}->( "Closing server." );
	$game->{'server'}->close() if $game->{'server'};
	
	### assume all other sockets will get closed by the OS.
	
	if( -e $game->{'socketFile'} )
	{
		unlink $game->{'socketFile'};
	}
	
	exit 0;
}

sub newToken
{
	my $game = shift;
	
	### look for a unique token forever!!!
	while( 1 )
	{
		my $token = int( rand( 4000000000 ) );
		
		my $stringToken = sprintf "%010u", $token;
		
		unless( defined $game->{'tokens'}->{ $stringToken } )
		{
			return $stringToken;
		}
	}
}

sub sendToUsers
{
	my $packet = shift;
	my $statusForSend = $game->{'updateStatus'};
	
	foreach my $userName ( keys %{ $game->{'activeUsers'} } )
	{
		my $user = $game->{'activeUsers'}->{$userName};
		
		if( $user->{'status'} eq $statusForSend )
		{
			if( @{ $user->{'streams'} } > 0 )
			{
				my $stream = $user->{'streams'}[0];
				$stream->{'sendCommand'}->( $stream, $packet );
			}
		}
	}
}

sub updateInfo
{
	my $which = shift;
	
	my %updateLobbyInfoPacket = (
		name    => "update${which}Info",
		users   => [],
	);
	
	my @usersToSort = ();
	
	foreach my $userName ( keys %{ $game->{'activeUsers'} } )
	{
		my $user = $game->{'activeUsers'}->{$userName};
		
		my %userInfo = (
			name     => $userName,
			status   => $user->{'status'},
			totalWins     => $game->{'users'}->{ $userName }->{'wins'},
			totalLosses   => $game->{'users'}->{ $userName }->{'losses'},
		);
		
		getExtraInfo( $userName, $user, \%userInfo ) if $which eq "Player";
		
		push @usersToSort, \%userInfo;
	}
	
	my @sortedUsers;
	if( $which eq "Lobby" )
	{
		@sortedUsers = sort byStatusName @usersToSort;
	}
	else
	{
		@sortedUsers = sort { $a->{'player'} <=> $b->{'player'} } @usersToSort;
	}
	
	$updateLobbyInfoPacket{'users'} = \@sortedUsers;
	
	sendToUsers( \%updateLobbyInfoPacket );
	
	return;
}

sub getExtraInfo
{
	my $userName = shift;
	my $user     = shift;
	my $userInfo = shift;
	
	$userInfo->{'player'} = $user->{'player'};
	
	my $player = $game->{'players'}->[$user->{'player'}];
	
	$userInfo->{'wins'} = $player->{'wins'};
	$userInfo->{'losses'} = $player->{'losses'};
	$userInfo->{'ready'} = $player->{'ready'};
}

sub byStatusName
{
	my %statusOrder = (
		LOBBY    => 1,
		JOINABLE => 2,
		'IN-GAME'=> 3,
	);
	
	my $statusA = $statusOrder{ $a->{'status'} };
	my $statusB = $statusOrder{ $b->{'status'} };
	
	if( $statusA == $statusB )
	{
		return ( $a->{'name'} cmp $b->{'name'});
	}
	
	return ( $statusA <=> $statusB );
}

sub updatePlayerStreams
{
	my $users = $game->{'activeUsers'};
	
	foreach my $userName ( keys %{ $users } )
	{
		my $user = $users->{$userName};
		
		unless( ( defined $user ) && ( defined $user->{'streams'} ) )
		{
			$reporter->{'log'}->( "|$userName| is not there anymore must have gotten timed out SPECIAL ERROR." );
			next;
		}
		
		if( @{ $user->{'streams'} } > 0 )
		{
			$user->{'timeOut'} = 0;
			my $stream = $user->{'streams'}[0];
			my $expire = $stream->{"expire"}--;
			
			if( $expire < 0 )
			{
				$reporter->{'log'}->( "Stream expired closing." );
				
				$stream->{'close'}->( $stream );
			}
		}
		else
		{
			$user->{'timeOut'}++;
			if( $user->{"timeOut"} >= 100 )
			{
				$reporter->{'log'}->( "Timing out user |$userName|." );
				$user->{"timeOutUser"}->( $userName, $game );
			}
		}
	}
}
