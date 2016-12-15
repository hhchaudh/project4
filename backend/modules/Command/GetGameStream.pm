package Command::GetGameStream;

use strict;
use warnings;

sub getGameStream
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $command->{'vector'}->{'getUserFromToken'}->( $stream, $game, $command );
	
	return unless defined $userName;
	
	$reporter->{'log'}->( "Setting up game stream for |$userName|" );
	
	### convert the stream to a gameStream.
	$stream->{'timeOut'}       = 1;
	$stream->{'expire'}        = 100;
	
	$stream->{'close'}         = \&closeGameStream;
	$stream->{'userName'}      = $userName;
	
	push @{ $game->{'activeUsers'}->{$userName}->{'streams'} }, $stream;
	$game->{'extraUpdate'} = 1;
	
	return;
}

sub closeGameStream
{
	my $stream  = shift;
	my $game = $stream->{'game'};
	my $reporter = $game->{"reporter"};
	
	my $userName = $stream->{'userName'};
	
	$stream->{'sock'}->close();
	
	shift @{ $game->{'activeUsers'}->{$userName}->{'streams'} };
	
	return;
}

1;
