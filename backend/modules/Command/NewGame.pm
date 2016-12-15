package Command::NewGame;

use strict;
use warnings;

sub newGame
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $command->{'vector'}->{'getUserFromToken'}->( $stream, $game, $command );
	
	return unless defined $userName;
	
	my $innerGame = $game->{'innerGame'};
	unless( $innerGame->{'state'} eq "VICTORY" )
	{
		$reporter->{'log'}->( "user |$userName| trying to reset game when game not in VICTORY." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "user |$userName| trying to reset game when game not in VICTORY." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	$reporter->{'log'}->( "Resetting game for  user |$userName|" );
	
	forceResetGame( $game );
	
	$game->{'extraUpdate'} = 1;
	
	$stream->{'close'}->( $stream );
	
	return;
}

sub forceResetGame
{
	my $game = shift;
	
	my $players = $game->{'players'};
	
	foreach my $player ( @{ $players } )
	{
		$player->{'ready'} = 0;
		$player->{'lastFrame'} = -1000;
	}
	
	$game->{'innerGame'} = Game::newInnerGame( $game );
}

1;
