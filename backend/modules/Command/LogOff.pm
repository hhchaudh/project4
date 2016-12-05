package Command::LogOff;

use strict;
use warnings;

use JSON;

sub logOff
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $command->{'vector'}->{'getUserFromToken'}->( $stream, $game, $command );
	
	return unless defined $userName;
	
	$game->{'activeUsers'}->{$userName}->{'timeOutUser'}->( $userName, $game );
	
	$stream->{'close'}->( $stream );	
	return;
}

1;
