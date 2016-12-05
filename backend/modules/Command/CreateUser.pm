package Command::CreateUser;

use strict;
use warnings;

require "modules/UserInfo.pm";

sub createUser
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
	
	if( defined $users->{ $userName } )
	{
		$reporter->{'log'}->( "userName |$userName| already exists." );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "userName |$userName| already exists.", 'DISPLAY' );
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
	
	
	$users->{ $userName } = { password => $password, wins => 0, losses => 0 };
	UserInfo::store( $users, $reporter );
	
	$stream->{'close'}->( $stream );
	return;
}

1;
