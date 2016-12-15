package Command::Key;

use strict;
use warnings;

my %validKeys = (
	down   => 1,
	rotate => 1,
	right  => 1,
	left   => 1,
);

sub keyDown
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $command->{'vector'}->{'getUserFromToken'}->( $stream, $game, $command );
	
	return unless defined $userName;
	
	my $innerGame = $game->{'innerGame'};
	
	unless( ( defined $command->{'key'} ) && ( $validKeys{ $command->{'key'} } ) )
	{
		$reporter->{'log'}->( "Did not get a vaild key!!!" );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Did not get a vaild key!!!" );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $key = $command->{'key'};
	
	$reporter->{'log'}->( "|$userName| key down |$key|" );
	
	my $players = $game->{'players'};
	my $side = "right";
	
	if( $players->[0]->{'user'} eq $userName )
	{
		$side = "left";
	}
	
	my $p = $innerGame->{ $side };
	
	if( $key eq "down" )
	{
		$p->{"wantMoveDown"} = 1;
	}
	elsif( $key eq "rotate" )
	{
		if( $p->{"wantRotate"} == 0 )
		{
			$p->{"wantRotate"} = 1;
			$p->{"rotateCount"}++ if $p->{"rotateCount"} < 3;
		}
	}
	elsif( $key eq "right" )
	{
		$p->{"wantMoveRight"} = 1;
	}
	elsif( $key eq "left" )
	{
		$p->{"wantMoveLeft"} = 1;
	}
	
	$stream->{'close'}->( $stream );
	
	return;
}

sub keyUp
{
	my $stream  = shift;
	my $game    = shift;
	my $command = shift;
	
	my $reporter = $game->{"reporter"};
	
	my $userName = $command->{'vector'}->{'getUserFromToken'}->( $stream, $game, $command );
	
	return unless defined $userName;
	
	my $innerGame = $game->{'innerGame'};
	
	unless( ( defined $command->{'key'} ) && ( $validKeys{ $command->{'key'} } ) )
	{
		$reporter->{'log'}->( "Did not get a vaild key!!!" );
		my $errCmd = $command->{'vector'}->{'newErrorCommand'}->( "Did not get a vaild key!!!" );
		$stream->{'sendCommand'}->( $stream, $errCmd );
		$stream->{'close'}->( $stream );
		return;
	}
	
	my $key = $command->{'key'};
	
	$reporter->{'log'}->( "|$userName| key up |$key|" );
	
	my $players = $game->{'players'};
	my $side = "right";
	
	if( $players->[0]->{'user'} eq $userName )
	{
		$side = "left";
	}
	
	my $p = $innerGame->{ $side };
	
	if( $key eq "down" )
	{
		$p->{"wantMoveDown"} = 0;
	}
	elsif( $key eq "rotate" )
	{
		$p->{"wantRotate"} = 0;
	}
	elsif( $key eq "right" )
	{
		$p->{"wantMoveRight"} = 0;
	}
	elsif( $key eq "left" )
	{
		$p->{"wantMoveLeft"} = 0;
	}
	
	$stream->{'close'}->( $stream );
	
	return;
}

1;
