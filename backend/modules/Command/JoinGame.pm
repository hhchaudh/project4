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
		$reporter->{'log'}->( "User |userName| does not own a game." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "User |userName| does not own a game." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $gameRef = $game->{'games'}->{$gameUser};
	
	$gameRef->{'users'}->{$userName} = 1;
	$game->{'activeUsers'}->{ $userName }->{"status"} = "IN-GAME";
	$game->{'activeUsers'}->{ $gameUser }->{"status"} = "IN-GAME";
	$game->{'activeUsers'}->{ $userName }->{"game"} = $gameRef;
	
	my %tokCmd = (
		name    => 'gameToken',
		token   => $gameRef->{'token'},
	);
	
	$stream->{'close'}->( $stream );	
	return;
}

1;
