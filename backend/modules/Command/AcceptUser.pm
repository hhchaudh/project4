package Command::AcceptUser;

use strict;
use warnings;

sub acceptUser
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	unless( defined $command->{"info"} )
	{
		$reporter->{'log'}->( "Request did not have a |info| field.", "ERROR" );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $userInfo = $command->{"info"};
	
	if( @{ $game->{'players'} } > 1 )
	{
		$reporter->{'log'}->( "Trying to add more than 2 players.", "ERROR" );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $userName = $userInfo->{'userName'};
	
	if( defined $game->{'users'}->{$userName} )
	{
		$reporter->{'log'}->( "Already had user |$userName|.", "ERROR" );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $token = $userInfo->{'token'};
	
	$game->{'users'}->{ $userName } = {
										wins   => $userInfo->{'wins'},
										losses => $userInfo->{'losses'},
									};
	
	$game->{'tokens'}->{ $token } = { 
										type     => 'USER', 
										userName => $userName,
									};
	
	$game->{'activeUsers'}->{ $userName } = {
												token   => $token,
												timeOut => 0,
												streams => [],
												timeOutUser => \&timeOutUser,
												timeOutGameOwner => \&empty,
												status  => 'GAME',
											};
	
	push @{ $game->{'players'} }, { user => $userName, wins => 0, losses => 0 };
	
	return;
}

sub timeOutUser
{
	my $userName = shift;
	my $game = shift;
	
	my $token = $game->{'activeUsers'}->{ $userName }->{'token'};
	
	updateRecordPlayerLost( $userName, $game );
	
	$game->{'activeUsers'}->{ $userName }->{"timeOutGameOwner"}->( $userName, $game );
	
	delete $game->{'users'}->{ $userName };
	delete $game->{'tokens'}->{ $token };
	delete $game->{'activeUsers'}->{ $userName };
	pop @{ $game->{'players'} };
	
	return;
}

sub timeOutRecord
{
	my $userName = shift;
	my $game = shift;
	
	my $reporter = $game->{"reporter"};
	
	if( $game->{'state'} eq "ON" )
	{
		unless( defined $game->{'activeUsers'}->{$userName} )
		{
			$reporter->{'log'}->( "Tried to time out user |$userName| but that user not in active users. IGNORE." );
			return;
		}
		
		updateRecordPlayerLost( $userName, $game );
	}
}

sub updateRecordPlayerLost
{
	my $userName = shift;
	my $game = shift;
	
	my $losePlayerNum = $game->{'activeUsers'}->{$userName}->{"player"};
	
	my %incCmd = (
		name     => 'incrementRecord',
		userName => $userName,
		what     => 'losses',
	);
	
	my $stream = $game->{'games'}->{'Lobby'}->{"stream"};
	$stream->{'sendCommand'}->( $stream, \%incCmd );
	
	$game->{'users'}->{$userName}->{'losses'}++;
	$game->{'players'}->[$losePlayerNum]->{'losses'}++;
	
	my $winPlayerNum = ( $losePlayerNum ) ? 0 : 1;
	
	if( defined $game->{'players'}->[$winPlayerNum] )
	{
		$userName = $game->{'players'}->[$winPlayerNum]->{"user"};
		
		$incCmd{'userName'} = $userName;
		$incCmd{'what'} = 'wins';
		$stream->{'sendCommand'}->( $stream, \%incCmd );
		
		$game->{'users'}->{$userName}->{'wins'}++;
		$game->{'players'}->[$winPlayerNum]->{'wins'}++;
	}
}

sub empty{}

1;
