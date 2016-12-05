package Command;

use strict;
use warnings;

use JSON;
use POSIX;

my %vector = (
	newErrorCommand  => \&newErrorCommand,
	getUserFromToken => \&getUserFromToken,
);

sub runCommand
{
	my $commandString = shift;
	my $stream = shift;
	my $game = $stream->{"game"};
	
	my $reporter = $game->{"reporter"};
	my $command;

	eval{   $command = decode_json( $commandString );    };
	if ( $@ )
	{
		$reporter->{'log'}->( "Problem decoding JSON string: |$commandString|. says:\n$@", "ERROR" );
		my $errorCmd = newErrorCommand( "Could not decode JSON command." );
		$stream->{'sendCommand'}->( $stream, $errorCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	unless ( ( defined $command ) && ( defined $command->{"name"} ) )
	{
		$reporter->{'log'}->( "Request did not have a |name| field. Request was: |$commandString|", "ERROR" );
		my $errorCmd = newErrorCommand( "Command did not have a |name| field." );
		$stream->{'sendCommand'}->( $stream, $errorCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $command_name = $command->{"name"};
	unless ( defined $stream->{"validCommands"}->{$command_name} )
	{
		$reporter->{'log'}->( "The name of the request was not valid. Request was: |$commandString|", "ERROR" );
		my $errorCmd = newErrorCommand( "|$command_name| is not a valid command name." );
		$stream->{'sendCommand'}->( $stream, $errorCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	$command->{'vector'} = \%vector;
	$stream->{"validCommands"}->{$command_name}->( $stream, $game, $command );
}

sub newErrorCommand
{
	my $message = shift;
	my $display = shift;
	
	$display = ( $display ) ? 1 : 0 ;
	
	my %errCmd = (
		name    => 'ERROR',
		message => $message,
		display => $display,
	);
	
	return \%errCmd;
}

sub getUserFromToken
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	unless( defined $command->{"userToken"} && ( length $command->{"userToken"} > 0 ) )
	{
		$reporter->{'log'}->( "Request did not have a |userToken| field.", "ERROR" );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Command did not have a |userToken| field." );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $token = $command->{"userToken"};
	
	unless( defined $game->{'tokens'}->{ $token } && ( $game->{'tokens'}->{ $token }->{'type'} eq 'USER' ))
	{
		$reporter->{'log'}->( "Token |$token| was invalid.", "ERROR" );
		
		my %badUserToken = (
			name     => 'badUserToken',	
		);
		
		$stream->{'sendCommand'}->( $stream, \%badUserToken );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $userName = $game->{'tokens'}->{ $token }->{'userName'};
	
	return $userName;
}

1;
