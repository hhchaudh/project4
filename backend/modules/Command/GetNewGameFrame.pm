package Command::GetNewGameFrame;

use strict;
use warnings;

sub getNewGameFrame
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $command->{'vector'}->{'getUserFromToken'}->( $stream, $game, $command );
	
	return unless defined $userName;
	
	$reporter->{'log'}->( "Marking to send a new gameFrame instead of an update for user |$userName|" );
	
	my $user = $game->{'activeUsers'}->{ $userName };
	
	$user->{'requestNewFrame'} = 1;
	
	$stream->{'close'}->( $stream );
	
	return;
}

1;
