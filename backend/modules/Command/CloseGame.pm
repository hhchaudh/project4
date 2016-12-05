package Command::CloseGame;

use strict;
use warnings;

require "modules/Command/AcceptUser.pm";

### The only reason the lobby would send us this is if the primary user
### timed out on their side so if we were in a game, send them back that
### that player lost.
sub closeGame
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $game->{'players'}->[0]->{'user'};
	
	Command::AcceptUser::timeOutRecord( $userName, $game );
	
	$reporter->{'log'}->( "Lobby told us to close!!!" );
	$stream->{'close'}->( $stream );
	return;
}

1;
