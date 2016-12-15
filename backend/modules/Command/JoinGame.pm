package Command::JoinGame;

use strict;
use warnings;

use JSON;

sub joinGame
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $command->{'vector'}->{'getUserFromToken'}->( $stream, $game, $command );
	
	return unless defined $userName;
	
	unless( defined $command->{"userName"} && ( length $command->{"userName"} > 0 ) )
	{
		$reporter->{'log'}->( "Request did not have a |userName| field.", "ERROR" );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Command did not have a |userName| field." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $gameUser = $command->{"userName"};
	
	unless( defined $game->{'games'}->{$gameUser} )
	{
		$reporter->{'log'}->( "User |$gameUser| does not own a game." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "User |$gameUser| does not own a game." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $gameRef = $game->{'games'}->{$gameUser};
	
	if( defined $gameRef->{'users'}->{$userName} )
	{
		$reporter->{'log'}->( "You are already in this game." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "You are already in this game." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	unless( $game->{'activeUsers'}->{ $gameUser }->{"status"} eq "JOINABLE" )
	{
		$reporter->{'log'}->( "Game owned by |$gameUser| is not joinable." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Game owned by |$gameUser| is not joinable." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	$gameRef->{'users'}->{$userName} = 1;
	$game->{'activeUsers'}->{ $userName }->{"status"} = "IN-GAME";
	$game->{'activeUsers'}->{ $gameUser }->{"status"} = "IN-GAME";
	$game->{'activeUsers'}->{ $userName }->{"game"} = $gameRef;
	
	my %acceptCmd = (
		name    => 'acceptUser',
		info    => {
			userName   => $userName,
			token      => $game->{'activeUsers'}->{ $userName }->{"token"},
			wins       => $game->{'users'}->{ $userName }->{'wins'},
			losses     => $game->{'users'}->{ $userName }->{'losses'},
		}
	);
	
	my $gameStream = $gameRef->{'stream'};
	$gameStream->{'sendCommand'}->( $gameStream, \%acceptCmd );
	
	my %tokCmd = (
		name    => 'gameToken',
		token   => $gameRef->{'token'},
	);
	
	$stream->{'sendCommand'}->( $stream, \%tokCmd );
	$stream->{'close'}->( $stream );	
	return;
}

1;
