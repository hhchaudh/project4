package Command::RemoveUserGameSide;

use strict;
use warnings;

sub removeUser
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	unless ( ( defined $command ) && ( defined $command->{"userName"} ) )
	{
		$reporter->{'log'}->( "did not get a userName field for removeUser!!!", "ERROR" );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $userName = $command->{"userName"};
	
	unless( defined $game->{'activeUsers'}->{ $userName } )
	{
		$reporter->{'log'}->( "Don't have user |$userName|, ignoring!!!" );
		return;
	}
	
	my $userInfo = $game->{'activeUsers'}->{ $userName };
	my $playerNum = $userInfo->{'player'};
	
	if( ( $playerNum == 0 ) )
	{
		$reporter->{'log'}->( "Requested to remove the main player!!!" );
		$stream->{'close'}->( $stream );
		return;
	}
	
	pop @{ $game->{'players'} };
	
	my $token = $userInfo->{'token'};
	if( defined $game->{'tokens'}->{$token} )
	{
		delete $game->{'tokens'}->{$token};
	}
	
	if( defined $game->{'users'}->{$userName} )
	{
		delete $game->{'users'}->{$userName};
	}
	
	delete $game->{'activeUsers'}->{$userName};
	
	return;
}

1;
