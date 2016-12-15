package Command::IncrementRecord;

use strict;
use warnings;

require "modules/UserInfo.pm";

sub incrementRecord
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	unless ( ( defined $command ) && ( defined $command->{"userName"} ) )
	{
		$reporter->{'log'}->( "did not get a userName field for incrementRecord!!!", "ERROR" );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $userName = $command->{"userName"};
	
	unless ( defined $game->{"users"}->{ $userName } )
	{
		$reporter->{'log'}->( "user |$userName| is not a valid user from incrementRecord!!!", "ERROR" );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $user = $game->{"users"}->{ $userName };
	
	unless ( ( defined $command ) && ( defined $command->{"what"} ) && ( defined $user->{ $command->{"what"} } ) )
	{
		$reporter->{'log'}->( "improper what field for incrementRecord!!!", "ERROR" );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $field = $command->{"what"};
	
	my $result = ++$user->{ $field };
	
	$reporter->{'log'}->( "Incrementing |$field| for user |$userName| is now |$result|." );
	
	UserInfo::store( $game->{'users'}, $reporter );
	
	return;
}

1;
