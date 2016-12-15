package Command::CreateGame;

use strict;
use warnings;

use IO::Socket::UNIX;
use IO::Socket;

require "modules/Stream.pm";
require "modules/Conf.pm";
require "modules/Report.pm";
require "modules/Game.pm";

require "modules/Command/AcceptUser.pm";

sub createGame
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $command->{'vector'}->{'getUserFromToken'}->( $stream, $game, $command );
	
	return unless defined $userName;
	
	if( defined $game->{'games'}->{ $userName } )
	{
		$reporter->{'log'}->( "user |$userName| already has a game." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "user |$userName| already has a game." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	$reporter->{'log'}->( "Creating new game for user |$userName|" );
	
	my $gameToken = $game->{"newToken"}->( $game );
	my $userInfo = $game->{'activeUsers'}->{ $userName };
	
	my $gameSock;
	my $lobbySock;
	unless( ( $gameSock, $lobbySock ) = IO::Socket->socketpair ( AF_UNIX, SOCK_STREAM, PF_UNSPEC ) )
	{
		$reporter->{'log'}->( "Could not open a socket pair for the game says |$!|." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Could not open a socket pair for the game says |$!|." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	$gameSock->autoflush( 1 );
	$gameSock->blocking( 0 );
	$lobbySock->autoflush( 1 );
	$lobbySock->blocking( 0 );
	
	my $pid = fork();
	
	unless( defined $pid )
	{
		$reporter->{'log'}->( "Could not create game, says |$!|." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Could not create game, says |$!|." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	if( $pid )
	{
		### This is the lobby
		my $gameStream = Stream::newGameStream( $lobbySock, $game, $userName, \&destroyGame );
		
		my %newGame = (
			users  => { 
						$userName => 1,
					  },
			stream => $gameStream,
			token  => $gameToken,
			primaryUser => $userName,
		);
		
		$game->{'games'}->{$userName} = \%newGame;
		
		$game->{'tokens'}->{ $gameToken } = {
											type     => 'GAME',
											userName => $userName,
										};
		
		$userInfo->{"timeOutGameOwner"} = \&timeOutGameOwner;
		$userInfo->{"status"} = "JOINABLE";
		$userInfo->{"game"} = \%newGame;
		
		my %tokCmd = (
			name    => 'gameToken',
			token   => $gameToken,
		);
		
		$stream->{'sendCommand'}->( $stream, \%tokCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	else
	{
		### This is the game
		
		my $conf = Conf::get();
		Report::start( $conf->{'logFile'} ); ## this should close the old handle
		my $socketFile = $conf->{'fileDir'} . "/$gameToken";
		
		my $server = IO::Socket::UNIX->new(
			Type => SOCK_STREAM(),
			Local => $socketFile,
			Listen => 10,
		);
		
		unless( $server )
		{
			$reporter->{'log'}->( "Could not open UNIX socket says: $!", "ERROR", "DIE" );
		}
		
		$server->autoflush( 1 );
		
		my $savedUserInfo = {
								token   => $userInfo->{'token'},
								totalWins   => $game->{"users"}->{ $userName }->{"wins"},
								totalLosses => $game->{"users"}->{ $userName }->{"losses"},
							};
		my $savedToken = $userInfo->{'token'};
		
		$game->{'state'}        = "WAITING";
		$game->{'updateStatus'} = "GAME";
		$game->{'extraUpdate'} = 0;
		$game->{'users'} = {
			"$userName" => {
				wins   => $savedUserInfo->{"totalWins"},
				losses => $savedUserInfo->{"totalLosses"},
			}
		};
		$game->{'activeUsers'} = {
			"$userName" => {
				token   => $savedUserInfo->{"token"},
				timeOut => 0,
				streams => [],
				status  => 'GAME',
				timeOutUser => \&Command::AcceptUser::timeOutUser,
				timeOutGameOwner => sub {
											my $userName = shift;
											my $game = shift; 
											$game->{'properDie'}->( "Game owner timed out!!!");
										},
				player => 0,
			}
		};
		$game->{'players'} = [
			{ user => $userName, wins => 0, losses => 0, lastFrame => -1000, ready => 0 },
		];
		$game->{'tokens'} = {
			"$gameToken"  => { type => 'GAME',  userName => $userName },
			"$savedToken" => { type => 'USER', userName => $userName },
		};
		$game->{'inStreams'} = [];
		$game->{'newInStreams'} = [];
		$game->{'socket'} = $server;
		$game->{'socketFile'} = $socketFile;
		$game->{'clientCommands'} = $game->{'gameClientCommands'};
		
		my $deathFunc = $game->{'properDie'};
		my $lobbyStream = Stream::newLobbyStream( $gameSock, $game, sub {
																		my $stream = shift;
																		$stream->{'game'}->{'properDie'}->( "Game socket closing!!!")
																		} );
		
		my %lobbyGame = (
			stream => $lobbyStream,
		);
	
		$game->{'games'}->{'Lobby'} = \%lobbyGame;
		$game->{'innerGame'} = Game::newInnerGame( $game );
	}
	
	return;
}

sub timeOutGameOwner
{
	my $userName = shift;
	my $game = shift;
	
	my $stream = $game->{'games'}->{$userName}->{"stream"};
	
	my %closeGameCmd = (
		name    => 'closeGame',
	);
	
	$stream->{'sendCommand'}->( $stream, \%closeGameCmd );
}

sub destroyGame
{
	my $stream = shift;
	my $lobby = $stream->{'game'};
	
	my $userName = $stream->{'userName'};
	
	my $game = $lobby->{'games'}->{$userName};
	
	$game->{"stream"}->{'sock'}->close();
	foreach my $user ( keys %{ $game->{"users"} } )
	{
		next unless defined $lobby->{'activeUsers'}->{ $user };
		my $userInfo = $lobby->{'activeUsers'}->{ $user };
		
		$userInfo->{"timeOutGameOwner"} = \&empty;
		$userInfo->{"status"} = "LOBBY";
		delete $userInfo->{"game"};
	}
	
	my $gameToken = $game->{"token"};
	
	delete $lobby->{'tokens'}->{ $gameToken };
	delete $lobby->{'games'}->{$userName};
	
	return;
}

sub empty{}

1;
