package Command::SetReady;

use strict;
use warnings;

sub setReady
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $command->{'vector'}->{'getUserFromToken'}->( $stream, $game, $command );
	
	return unless defined $userName;
	
	my $innerGame = $game->{'innerGame'};
	unless( $innerGame->{'state'} eq "WAITING" )
	{
		$reporter->{'log'}->( "user |$userName| trying to set to ready when game not in WAITING." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "user |$userName| trying to set to ready when game not in WAITING." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	$reporter->{'log'}->( "Setting user |$userName| to ready" );
	
	my $players = $game->{'players'};
	
	foreach my $player ( @{ $players } )
	{
		if( $player->{'user'} eq $userName )
		{
			$player->{'ready'} = 1;
			last;
		}
	}
	
	$game->{'extraUpdate'} = 1;
	
	$stream->{'close'}->( $stream );
	
	return;
}

1;
