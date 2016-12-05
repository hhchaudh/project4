package Command::RemoveUserLobbySide;

use strict;
use warnings;

sub removeUser
{
	my $stream  = shift;
	my $lobby   = shift;
	my $command = shift;
	
	my $reporter = $lobby->{"reporter"};
	
	unless ( ( defined $command ) && ( defined $command->{"userName"} ) )
	{
		$reporter->{'log'}->( "did not get a userName field for removeUser!!!", "ERROR" );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $userName = $command->{"userName"};
	
	my $gameOwner = $stream->{"userName"};
	
	if( defined $lobby->{'games'}->{$gameOwner} )
	{
		my $game = $lobby->{'games'}->{$gameOwner};
		delete $game->{"users"}->{$userName};
	}
	
	if( defined $lobby->{'activeUsers'}->{ $userName } )
	{
		my $userInfo = $lobby->{'activeUsers'}->{ $userName };
		
		$userInfo->{"status"} = "LOBBY";
		delete $userInfo->{"game"};
	}
	
	return;
}

1;
