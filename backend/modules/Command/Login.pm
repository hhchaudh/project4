package Command::Login;

use strict;
use warnings;

sub login
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $users    = $game->{"users"};
	my $reporter = $game->{"reporter"};
	
	unless( defined $command->{"userName"} && ( length $command->{"userName"} > 0 ) )
	{
		$reporter->{'log'}->( "Request did not have a |userName| field.", "ERROR" );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Command did not have a |userName| field." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $userName = $command->{"userName"};
	
	unless( defined $users->{ $userName } )
	{
		$reporter->{'log'}->( "userName |$userName| does not exists." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "userName |$userName| does not exists.", 'DISPLAY' );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	unless( defined $command->{"password"} && ( length $command->{"password"} > 0 ) )
	{
		$reporter->{'log'}->( "Request did not have a |password| field.", "ERROR" );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Command did not have a |password| field." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $password = $command->{"password"};
	
	unless( $users->{ $userName }->{"password"} eq $password )
	{
		$reporter->{'log'}->( "Password was invalid." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Password was invalid.", 'DISPLAY' );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	if( defined $game->{'activeUsers'}->{ $userName } )
	{
		$reporter->{'log'}->( "user |$userName| is already logged in." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "user |$userName| is already logged in.", 'DISPLAY' );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $token = $game->{"newToken"}->( $game );
	
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
												status  => 'LOBBY',
											};
	
	my %tokCmd = (
		name    => 'userToken',
		token   => $token,
    );
	
	$stream->{'sendCommand'}->( $stream, \%tokCmd );
	$stream->{'close'}->( $stream );
	return;
}

sub timeOutUser
{
	my $userName = shift;
	my $game = shift;
	
	my $token = $game->{'activeUsers'}->{ $userName }->{'token'};
	
	$game->{'activeUsers'}->{ $userName }->{"timeOutGameOwner"}->( $userName, $game );
	
	if( defined $game->{'activeUsers'}->{ $userName }->{'game'} )
	{
		my $gameRef = $game->{'activeUsers'}->{ $userName }->{'game'};
		my $gameUser = $gameRef->{'primaryUser'};
		
		my %removeCmd = (
			name     => 'removeUser',
			userName => $userName,
		);
		
		$gameRef->{'stream'}->{'sendCommand'}->( $gameRef->{'stream'}, \%removeCmd );
		
		delete $gameRef->{'users'}->{$userName};
		$game->{'activeUsers'}->{ $gameUser }->{"status"} = "JOINABLE";
	}
	
	delete $game->{'tokens'}->{ $token };
	delete $game->{'activeUsers'}->{ $userName };
	
	return;
}

sub empty{}

1;
