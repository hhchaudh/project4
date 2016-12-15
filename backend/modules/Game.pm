package Game;

use strict;
use warnings;

require "modules/Command/AcceptUser.pm";

my @floorFrame = ( 2, 3, 1, 4, 0, 5 );

my @colors = ( "blue", "red", "green", "yellow", "purple" );

sub getRandomColor
{
	my $randIndex = int( rand( @colors ) );
	
	return $colors[ $randIndex ];
}

my %blowFrame = (
	1 => 'bugEye',
	2 => 'vanish',
	3 => 'bugEye',
	4 => 'blow1',
	5 => 'blow2',
	6 => 'blow3',
	7 => 'blow4',
	8 => 'vanish',
);

my %searchFrame = (
	1 => 'smushed',
	2 => 'vertSmushed',
	3 => 'normal',
);

my %compliment = (
	Left  => "Right",
	Right => "Left",
	Up    => "Down",
	Down  => "Up",
);

sub newInnerGame
{
	my $outterGame = shift;
	
	my %innerGame = (
		outterGame   => $outterGame,
		winner       => "NONE",
		winnerUpdate => 0,
		state        => "WAITING",
		ready        => [ 0, 0 ],
		
		blobID       => 0,
		blobIDUpdate => 0,
		freeBlobIDs  => [],
		blobs        => [],
		update       => {},
		
		countDown    => 0,
		countTimer   => 0,
		countUpdate  => 0,
		
		updateFrame  => 0,
		prevUpdate   => {},
		updateStatus => 0,
		displayWinner => 0,
		displayWinnerCounter => 0,
		updateDisplayWinner  => 0,
		
		left         => {
			hadAction    => 0,
			happyLevel   => 0,
			prevHappyLevel => 1,
			
			master       => -1,
			masterFrame  =>  0,
			slave        => -1,
			canMove      =>  0,
			rotating     =>  0,
			rotateCount  =>  0,
			rotateFrame  =>  8,
			wantMoveRight => 0,
			movingRight   => 0,
			wantMoveLeft  => 0,
			movingLeft    => 0,
			wantMoveDown  => 0,
			wantRotate    => 0,
			
			drop         => [],
			dropping     => 0,
			testDropBuffer => \&testInitBuffer1,
			
			falling      => [],
			searching    => [],
			explode      => [],
			orb          => [],
			orbGoal      => [ 5000, 1000 ],
			
			floorFrame   => 0,
			
			blowGroups      => {},
			readyBlowGroups => {},
			combos       => 0,
			
			column       => [    -1, -1, -1, -1, -1, -1,    ],
			
			grid         => [
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
			],
		},
		
		right         => {
			hadAction    => 0,
			happyLevel   => 0,
			prevHappyLevel => 1,
			
			master       => -1,
			masterFrame  =>  0,
			slave        => -1,
			canMove      =>  0,
			rotating     =>  0,
			rotateCount  =>  0,
			rotateFrame  =>  8,
			wantMoveRight => 0,
			movingRight   => 0,
			wantMoveLeft  => 0,
			movingLeft    => 0,
			wantMoveDown  => 0,
			wantRotate    => 0,
			
			drop         => [],
			dropping     => 0,
			testDropBuffer => \&testInitBuffer2,
			
			falling      => [],
			searching    => [],
			explode      => [],
			orb          => [],
			orbGoal      => [ 0, 1000 ],
			
			floorFrame   => 0,
			
			blowGroups      => {},
			readyBlowGroups => {},
			combos       => 0,
			
			column       => [    -1, -1, -1, -1, -1, -1,    ],
			
			grid         => [
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
				[   -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1  ],
			],
		},
		
		runFrame       => \&waiting,
		getNewFrame    => \&newFrame,
		getUpdateFrame => \&updateFrame,
	);
	
	my $loseID_0 = getFreeBlob( \%innerGame, "left" );
	
	return \%innerGame;
}

sub waiting
{
	my $innerGame = shift;
	
	my $outterGame = $innerGame->{'outterGame'};
	my $players = $outterGame->{'players'};
	
	if( ( @{ $players } >= 1 ) && ( $players->[0]->{'user'} eq "test1" ) && ( $players->[0]->{'ready'} ) )
	{
		$innerGame->{'left'}->{'testDropBuffer'}->( $innerGame->{'left'}, $innerGame, "left");
		$innerGame->{'right'}->{'testDropBuffer'}->( $innerGame->{'right'}, $innerGame, "right");
		
		startCountDown( $innerGame );
	}
	
	if( ( @{ $players } >= 2 )  &&  ( $players->[0]->{'ready'} )  && ( $players->[1]->{'ready'} )  )
	{
		startCountDown( $innerGame );
	}
}

sub newFrame
{
	my $innerGame = shift;
	
	return updateFrame( $innerGame, 1 );
}

sub updateFrame
{
	my $innerGame = shift;
	my $new = shift;
	
	my %frame = ( );
	
	my @blobIDs;
	my $blobs = $innerGame->{'blobs'};

	if( $new || $innerGame->{'winnerUpdate'} )
	{
		$frame{'winner'} = $innerGame->{'winner'};
		$innerGame->{'winnerUpdate'} = 0;
	}
	if( $new || $innerGame->{'updateStatus'} )
	{
		$frame{'state'} = $innerGame->{'state'};
		$innerGame->{'updateStatus'} = 0;
	}
	if( $new || $innerGame->{'blobIDUpdate'} )
	{
		$frame{'numBlob'} = $innerGame->{'blobID'};
		$innerGame->{'blobIDUpdate'} = 0;
	}
	if( $new || $innerGame->{'countUpdate'} )
	{
		$frame{'countDown'} = $innerGame->{'countDown'};
		$innerGame->{'countUpdate'} = 0;
	}
	if( $new || $innerGame->{'updateDisplayWinner'} )
	{
		$frame{'displayWinner'} = $innerGame->{'displayWinner'};
		$innerGame->{'updateDisplayWinner'} = 0;
	}
	
	if( $innerGame->{'state'} eq "GAMEON" )
	{
		$innerGame->{'left'}->{'happyLevel'} = getHappy( $innerGame->{'left'} );
		if( $new || ( $innerGame->{'left'}->{'happyLevel'} != $innerGame->{'left'}->{'prevHappyLevel'} ) )
		{
			$frame{'player'} = {} unless defined $frame{'player'};
			$innerGame->{'left'}->{'prevHappyLevel'} = $innerGame->{'left'}->{'happyLevel'};
			$frame{'player'}->{'left'} = {} unless defined $frame{'player'}->{'left'};
			$frame{'player'}->{'left'}->{'happy'} = $innerGame->{'left'}->{'happyLevel'};
		}
		
		$innerGame->{'right'}->{'happyLevel'} = getHappy( $innerGame->{'right'} );
		if( $new || ( $innerGame->{'right'}->{'happyLevel'} != $innerGame->{'right'}->{'prevHappyLevel'} ) )
		{
			$frame{'player'} = {} unless defined $frame{'player'};
			$innerGame->{'right'}->{'prevHappyLevel'} = $innerGame->{'right'}->{'happyLevel'};
			$frame{'player'}->{'right'} = {} unless defined $frame{'player'}->{'right'};
			$frame{'player'}->{'right'}->{'happy'} = $innerGame->{'right'}->{'happyLevel'};
		}
	}
	
	if( $new )
	{
		@blobIDs = ( 0 .. ( $innerGame->{'blobID'} -1 ) );
	}
	else
	{
		@blobIDs = keys %{ $innerGame->{'update'} };
		$innerGame->{'update'} = {};
	}
	
	foreach my $blobID ( @blobIDs )
	{
		my $blob = $blobs->[$blobID];
		
		my %blobInfo = (
			id    => $blobID,
			frame => $blob->{'frame'},
			color => $blob->{'color'},
			side  => $blob->{'side'},
			
			xPos  => $blob->{'xPos'},
			yPos  => $blob->{'yPos'},
		);
		
		$frame{'blobs'} = [] unless defined $frame{'blobs'};
		push @{ $frame{'blobs'} }, \%blobInfo;
	}
	
	my $prevFrameNum = $innerGame->{'updateFrame'};
	my $prevFrame    = $innerGame->{'prevUpdate'};
	
	if( $new )
	{
		$frame{'name'}  = "newFrame";
		$frame{'frame'} = $prevFrameNum;
		
		return \%frame;
	}
	
	unless( keys %frame )
	{
		return $prevFrame;
	}
	
	$frame{'name'}  = "updateFrame";
	$frame{'frame'}  = ++$innerGame->{'updateFrame'};
	
	$innerGame->{'prevUpdate'} = \%frame;
	
	return \%frame;
}

sub getHappy
{
	my $p = shift;
	my $grid = $p->{'grid'};
	my $col = $grid->[2];
	
	return 3 unless $col->[ 4 ] == -1;
	return 2 unless $col->[ 7 ] == -1;
	return 1 unless $col->[10 ] == -1;
	return 0;
}

sub grab2Normal
{
	my $p = shift;
	my $innerGame = shift;
	my $side = shift;
	my $drop = shift;
	
	return if @{ $p->{'drop'} };
	
	my $blobs = $innerGame->{'blobs'};
	
	foreach ( 1, 2 )
	{
		my $blobID = getFreeBlob( $innerGame, $side );
		my $blob = $blobs->[$blobID];
		
		$blob->{'color'} = getRandomColor();
		push @{ $p->{'drop'} }, $blobID;
	}
	
	markQue( $p, $innerGame );
}

sub testInitBuffer1
{
	my $p = shift;
	my $innerGame = shift;
	my $side = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my @testBlobs = (
		[ 3, "blue"   ],    [ 3, "blue"   ],    [ 3, "blue"   ],
		[ 3, "green"  ],
		[ 3, "blue"   ],
		[ 4, "green"  ],    [ 4, "green"  ],    [ 4, "green"  ],    [ 4, "green"  ],
		[ 1, "red"    ],    [ 2, "red"    ],    [ 3, "red"    ],    [ 4, "red"    ],
		[ 0, "yellow" ],    [ 0, "yellow" ],
		[ 1, "yellow" ],    [ 1, "green"  ],    [ 1, "red"    ],    [ 1, "green"  ],
		[ 1, "green"  ],    [ 1, "green"  ],    [ 1, "yellow" ],    [ 1, "yellow" ],
		[ 2, "green"  ],    [ 2, "blue"   ],    [ 2, "red"    ],    [ 2, "blue"   ],
		[ 3, "green"  ],    [ 3, "blue"   ],    [ 3, "red"    ],    [ 3, "blue"   ],
		[ 4, "yellow" ],    [ 4, "yellow" ],    [ 4, "purple" ],    [ 4, "red"    ],
		[ 5, "purple" ],    [ 5, "purple" ],    [ 5, "purple" ],
		[ 2, "green"  ],    [ 2, "blue"   ],    [ 2, "red"    ],    [ 2, "blue"   ],
		[ 2, "green"  ],    [ 2, "blue"   ],    [ 2, "red"    ],    [ 2, "blue"   ],
		[ 2, "green"  ],    [ 2, "blue"   ],    [ 2, "red"    ],    [ 2, "blue"   ],
		[ 2, "blue"   ],
	);
	
	foreach my $testBlob ( @testBlobs )
	{
		my $blobID = getFreeBlob( $innerGame, $side );
		my $blob = $blobs->[$blobID];
		
		$blob->{'xPos'}  = $testBlob->[ 0 ] * 1000;
		$blob->{'color'} = $testBlob->[ 1 ];
		
		push @{ $p->{'drop'} }, $blobID;
	}
}

sub testInitBuffer2
{
	my $p = shift;
	my $innerGame = shift;
	my $side = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my @testBlobs = (
		[ 0, "red"    ],    [ 5, "green"  ],    [ 0, "blue"   ],    [ 5, "yellow" ],    [ 0, "purple" ],
		[ 5, "red"    ],    [ 0, "green"  ],    [ 5, "blue"   ],    [ 0, "yellow" ],    [ 5, "purple" ],
		[ 0, "red"    ],    [ 5, "green"  ],    [ 0, "blue"   ],    [ 5, "yellow" ],    [ 0, "purple" ],
		[ 5, "red"    ],    [ 0, "green"  ],    [ 5, "blue"   ],    [ 0, "yellow" ],    [ 5, "purple" ],
		[ 1, "red"    ],    [ 4, "green"  ],    [ 1, "blue"   ],    [ 4, "yellow" ],    [ 1, "purple" ],
		[ 4, "red"    ],    [ 1, "green"  ],    [ 4, "blue"   ],    [ 1, "yellow" ],    [ 4, "purple" ],
		[ 1, "red"    ],    [ 4, "green"  ],    [ 1, "blue"   ],    [ 4, "yellow" ],    [ 1, "purple" ],
		[ 4, "red"    ],    [ 1, "green"  ],    [ 4, "blue"   ],    [ 1, "yellow" ],    [ 4, "purple" ],
		[ 0, "blue"   ],    [ 5, "yellow" ],    [ 1, "red"    ],    [ 4, "green"  ],    [ 3, "blue"   ],
		[ 2, "red"    ],    [ 3, "green"  ],    [ 2, "green"  ],    [ 3, "green"  ],    [ 2, "green"  ],
		[ 2, "green"  ],    [ 3, "green"  ],    [ 2, "green"  ],    [ 3, "green"  ],    [ 2, "green"  ],
		[ 3, "green"  ],    [ 2, "green"  ],    [ 3, "green"  ],    [ 2, "green"  ],    [ 3, "green"  ],
		[ 2, "green"  ],    [ 3, "green"  ],    [ 2, "green"  ],    [ 3, "green"  ],    [ 2, "green"  ],
		[ 3, "green"  ],    [ 2, "green"  ],    [ 3, "green"  ],    [ 2, "green"  ],    [ 3, "green"  ],
		[ 2, "green"  ],    [ 3, "green"  ],    [ 2, "green"  ],    [ 3, "green"  ],    [ 2, "green"  ],
	);
	
	foreach my $testBlob ( @testBlobs )
	{
		my $blobID = getFreeBlob( $innerGame, $side );
		my $blob = $blobs->[$blobID];
		
		$blob->{'xPos'}  = $testBlob->[ 0 ] * 1000;
		$blob->{'color'} = $testBlob->[ 1 ];
		
		push @{ $p->{'drop'} }, $blobID;
	}
}

sub startCountDown
{
	my $innerGame = shift;
	
	$innerGame->{'runFrame'} = \&runFrame;
	
	$innerGame->{'state'} = "COUNTDOWN";
	$innerGame->{'countDown'} = 6;
	$innerGame->{'countTimer'} = 0;
	$innerGame->{'countUpdate'} = 1;
	$innerGame->{'updateStatus'} = 1;
	
	foreach my $side ( ( "left", "right" ) )
	{
		my $p = $innerGame->{ $side };
		
		grab2Normal( $p, $innerGame, $side );
		
		initFloor( $p, $innerGame, $side );
		
		markQue( $p, $innerGame );
	}
}

sub initFloor
{
	my $p = shift;
	my $innerGame = shift;
	my $side = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	foreach my $colNum ( 0, 1, 2, 3, 4, 5 )
	{
		my $blobID = getFreeBlob( $innerGame, $side );
		my $blob = $blobs->[$blobID];
		
		$blob->{'xPos'} = $colNum * 1000;
		$blob->{'yPos'} = 14000;
		
		addToColumn( $p, $innerGame, $blobID );
	}
}

sub destroyFloor
{
	my $p = shift;
	my $innerGame = shift;
	my $side = shift;
	my $blobs = $innerGame->{'blobs'};
	
	return unless $p->{'floorFrame'} < 6;
	
	my $colNum = $floorFrame[ $p->{'floorFrame'}++ ];
	
	my $blobID = $p->{'column'}->[ $colNum ];
	my $blob = $blobs->[$blobID];
	
	removeColumn( $p, $innerGame, $blobID, $blob );
}

sub runFrame
{
	my $innerGame = shift;
	
	if( $innerGame->{'state'} eq "COUNTDOWN" )
	{
		$innerGame->{'countTimer'}++;
		if( $innerGame->{'countTimer'} == 12 )
		{
			$innerGame->{'countTimer'} = 0;
			$innerGame->{'countDown'}--;
			$innerGame->{'countUpdate'} = 1;
			
			if( $innerGame->{'countDown'} == 0 )
			{
				$innerGame->{'updateStatus'} = 1;
				$innerGame->{'state'} = "GAMEON";
			}
		}
	}
	else
	{
		foreach my $side ( ( "left", "right" ) )
		{
			my $p = $innerGame->{ $side };
			
			$p->{'hadAction'} = 0;
			
			moveOrbs( $p, $innerGame, $side );
			
			animateExplosion( $p, $innerGame );
			
			findMatches( $p, $innerGame );
			
			keepFalling( $p, $innerGame );
			
			doMaster( $p, $innerGame );
			
			drop( $p, $innerGame, $side );
			
			if( $innerGame->{'state'} eq "VICTORY" )
			{
				destroyFloor( $p, $innerGame, $side );
				
				$innerGame->{'displayWinnerCounter'}-- if $innerGame->{'displayWinnerCounter'} > 0;
				
				if( $innerGame->{'displayWinnerCounter'} == 0 )
				{
					$innerGame->{'displayWinnerCounter'} = -1;
					$innerGame->{'displayWinner'} = 1;
					$innerGame->{'updateDisplayWinner'} = 1;
				}
			}
		}
	}
}

sub playerLost
{
	my $p = shift;
	my $innerGame = shift;
	my $side = shift;
	
	my %pConv = ( left => 0, right => 1 );
	my $outterGame = $innerGame->{'outterGame'};
	my $players = $outterGame->{'players'};
	
	$outterGame->{'extraUpdate'} = 1;
	$innerGame->{'state'} = "VICTORY";
	$innerGame->{'updateStatus'} = 1;
	
	if( defined $players->[ $pConv{ $side } ] )
	{
		my $user = $players->[ $pConv{ $side} ]->{'user'};
		Command::AcceptUser::updateRecordPlayerLost( $user, $outterGame );
	}
	
	my $winner = ( $side eq "left" ) ? "right" : "left";
	
	$innerGame->{'winner'} = $winner;
	$innerGame->{'winnerUpdate'} = 1;
	
	$innerGame->{'displayWinnerCounter'} = 15;
	
	addToFalling( $p, $innerGame, $innerGame->{'left'}->{'slave'}  ) unless( $innerGame->{'left' }->{'slave'} == -1 );
	addToFalling( $p, $innerGame, $innerGame->{'right'}->{'slave'} ) unless( $innerGame->{'right'}->{'slave'} == -1 );
	addToFalling( $p, $innerGame, $innerGame->{'left'}->{'master'}  ) unless( $innerGame->{'left' }->{'master'} == -1 );
	addToFalling( $p, $innerGame, $innerGame->{'right'}->{'master'} ) unless( $innerGame->{'right'}->{'master'} == -1 );
	
	return;
}

sub drop
{
	my $p = shift;
	my $innerGame = shift;
	my $side = shift;
	
	return unless $innerGame->{'state'} eq "GAMEON";
	
	unless( ( $p->{'hadAction'} == 0 ) || ( $p->{'dropping'} == 1 ) )
	{
		return;
	}
	
	my $opponentSide = ( $side eq "left" ) ? "right" : "left";
	my $opponent = $innerGame->{ $opponentSide };
	addBlacks( $p, $innerGame, $opponentSide, $opponent ) unless $p->{'combos'} == 0;
	
	unless( $p->{'grid'}->[ 2 ]->[ 1 ] == -1 )
	{
		playerLost( $p, $innerGame, $side );
	}
	
	my $blobs = $innerGame->{'blobs'};
	
	if ( @{ $p->{'falling'} } )
	{
		my $blobID = $p->{'falling'}->[-1];
		my $blob = $blobs->[$blobID];
		
		return if $blob->{'yPos'} < 2000;
	}
	
	my $blobID = shift @{ $p->{'drop'} };
	
	if( defined $blobID )
	{
		my $blob = $blobs->[$blobID];
			
		if( $blob->{'color'} eq 'black' )
		{
			$p->{'dropping'} = 1;
			dropBlacks( $p, $innerGame, $blobID, $blob );
		}
		elsif( $blob->{'xPos'} != -1 )
		{
			dropTest( $p, $innerGame, $blobID, $blob );
		}
		else
		{
			dropPair( $p, $innerGame, $side, $blobID, $blob );
		}
	}
}

sub dropPair
{
	my $p = shift;
	my $innerGame = shift;
	my $side = shift;
	my $blobID = shift;
	my $blob = shift;
	
	my $blobs = $innerGame->{'blobs'};
	my $slaveID = shift @{ $p->{'drop'} };
	
	unless( defined $slaveID )
	{
		destroyBlob( $p, $innerGame, $blobID );
		return;
	}
	
	my $slave = $blobs->[$slaveID];
	
	if(  ( $slave->{'color'} eq 'black' )  ||  ( $slave->{'xPos'} != -1 )  )
	{
		destroyBlob( $p, $innerGame, $blobID );
		destroyBlob( $p, $innerGame, $slaveID );
		return;
	}
	
	grab2Normal( $p, $innerGame, $side );
	
	setMasterSlave( $p, $innerGame, $blobID, $blob, $slaveID, $slave );
	
	return;
}

sub setMasterSlave
{
	my $p         = shift;
	my $innerGame = shift;
	my $masterID  = shift;
	my $master    = shift;
	my $slaveID   = shift;
	my $slave     = shift;
	
	$master->{'xPos'} = 2000;
	$master->{'yPos'} = 1000;
	$master->{'frame'} = "normal";
	$innerGame->{'update'}->{ $masterID } = 1;
	
	$p->{'master'} = $masterID;
	
	$slave->{'xPos'} = 2000;
	$slave->{'yPos'} = 0;
	$slave->{'frame'} = "normal";
	$innerGame->{'update'}->{ $slaveID } = 1;
	
	$p->{'slave'} = $slaveID;
	
	$p->{'rotateCount'} = 0;
	$p->{'wantMoveLeft'} = 0;
	$p->{'wantMoveRight'} = 0;
	$p->{'rotateFrame'} = 8;
	
	return;
}

sub dropBlacks
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	my $blob = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my @dropSpots = ( 0, 1, 2, 3, 4, 5 );
	
	while( 1 )
	{
		my $randIndex = int( rand( @dropSpots ) );
		
		my $columnNum = $dropSpots[ $randIndex ];
		
		splice @dropSpots, $randIndex, 1;
		
		$blob->{'xPos'} = $columnNum * 1000;
		
		dropSingle( $p, $innerGame, $blobID, $blob );
		
		unless( @{ $p->{'drop'} } )
		{
			$p->{'dropping'} = 0;
			return;
		}
		
		$blobID = $p->{'drop'}->[0];
		
		$blob = $blobs->[$blobID];
		
		unless( $blob->{'color'} eq "black" )
		{
			$p->{'dropping'} = 0;
			return;
		}
		
		unless( @dropSpots )
		{
			return;
		}
		
		$blobID = shift @{ $p->{'drop'} };
	}
}

sub dropTest
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	my $blob = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	dropSingle( $p, $innerGame, $blobID, $blob );
	
	markQue( $p, $innerGame );
}

sub markQue
{
	my $p = shift;
	my $innerGame = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my @next = ( "que1", "que2" );
	
	foreach my $blobID ( @{ $p->{'drop'} } )
	{
		my $blob = $blobs->[$blobID];
		
		if( $blob->{'color'} ne "black" )
		{
			$blob->{'frame'} = shift @next;
			$innerGame->{'update'}->{ $blobID } = 1;
		}
		
		unless( @next )
		{
			last;
		}
	}	
}

sub dropSingle
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	my $blob = shift;
	
	my $columnNum = int( $blob->{'xPos'} / 1000 );
	
	unless( $p->{'grid'}->[ $columnNum ]->[ 1 ] == -1 )
	{
		destroyBlob( $p, $innerGame, $blobID );
		return;
	}
	
	$blob->{'yPos'} = int( rand( 999 ) );
	addToFalling( $p, $innerGame, $blobID );
}

sub addBlacks
{
	my $p = shift;
	my $innerGame = shift;
	my $side = shift;
	my $opponent = shift;
	
	my @combo = ( 0, 1, 6, 18, 30, 42 );
	
	my $numCombos = $p->{'combos'};
	$p->{'combos'} = 0;
	
	$numCombos = $#combo if $numCombos > $#combo;
	
	my $numBlacks = $combo[ $numCombos ];
	
	while( $numBlacks-- > 0 )
	{
		unshift @{ $opponent->{'drop'} }, getFreeBlob( $innerGame, $side );
	}
}

my @rotateFrames = (
	[ 500, \&rotateLeft  ],
	[ 500, \&rotateLeft  ],
	[ 500, \&rotateUp    ],
	[ 500, \&rotateUp    ],
	[ 500, \&rotateUp    ],
	[ 500, \&rotateUp    ],
	[ 500, \&rotateRight ],
	[ 500, \&rotateRight ],
	[ 500, \&rotateRight ],
	[ 500, \&rotateRight ],
	[ 500, \&rotateDown  ],
	[ 500, \&rotateDown  ],
	[ 500, \&rotateDown  ],
	[ 500, \&rotateDown  ],
	[ 500, \&rotateLeft  ],
	[ 500, \&rotateLeft  ],
);

sub rotateRight
{
	my $p = shift;
	my $innerGame = shift;
	my $amount = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my $slaveID = $p->{'slave'};
	my $slave = $blobs->[$slaveID];
	
	$slave->{'newX'} = $slave->{'xPos'} + $amount;
	
	my $adjust = checkRight( $p, $innerGame, $slave );
	
	$slave->{'xPos'} = $slave->{'newX'};
	
	return 1 unless $adjust;
	
	my $masterID = $p->{'master'};
	my $master = $blobs->[$masterID];
	
	$master->{'newX'} = $master->{'xPos'} - $adjust;
	
	my $adjust2 = checkLeft( $p, $innerGame, $master );
	
	$master->{'xPos'} = $master->{'newX'};
	
	return 1 unless $adjust2;
	
	return 0;
}

sub rotateLeft
{
	my $p = shift;
	my $innerGame = shift;
	my $amount = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my $slaveID = $p->{'slave'};
	my $slave = $blobs->[$slaveID];
	
	$slave->{'newX'} = $slave->{'xPos'} - $amount;
	
	my $adjust = checkLeft( $p, $innerGame, $slave );
	
	$slave->{'xPos'} = $slave->{'newX'};
	
	return 1 unless $adjust;
	
	my $masterID = $p->{'master'};
	my $master = $blobs->[$masterID];
	
	$master->{'newX'} = $master->{'xPos'} + $adjust;
	
	my $adjust2 = checkRight( $p, $innerGame, $master );
	
	$master->{'xPos'} = $master->{'newX'};
	
	return 1 unless $adjust2;
	
	return 0;
}

sub rotateDown
{
	my $p = shift;
	my $innerGame = shift;
	my $amount = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my $slaveID = $p->{'slave'};
	my $slave = $blobs->[$slaveID];
	
	$slave->{'newY'} = $slave->{'yPos'} + $amount;
	
	my $adjust = checkDown( $p, $innerGame, $slave );
	
	$slave->{'yPos'} = $slave->{'newY'};
	
	return 1 unless $adjust;
	
	my $masterID = $p->{'master'};
	my $master = $blobs->[$masterID];
	
	$master->{'newY'} = $master->{'yPos'} - $adjust;
	
	my $adjust2 = checkUp( $p, $innerGame, $master );
	
	$master->{'yPos'} = $master->{'newY'};
	
	return 1 unless $adjust2;
	
	return 0;
}

sub rotateUp
{
	my $p = shift;
	my $innerGame = shift;
	my $amount = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my $slaveID = $p->{'slave'};
	my $slave = $blobs->[$slaveID];
	
	$slave->{'newY'} = $slave->{'yPos'} - $amount;
	
	my $adjust = checkUp( $p, $innerGame, $slave );
	
	$slave->{'yPos'} = $slave->{'newY'};
	
	return 1 unless $adjust;
	
	my $masterID = $p->{'master'};
	my $master = $blobs->[$masterID];
	
	$master->{'newY'} = $master->{'yPos'} + $adjust;
	
	my $adjust2 = checkDown( $p, $innerGame, $master );
	
	$master->{'yPos'} = $master->{'newY'};
	
	return 1 unless $adjust2;
	
	return 0;
}

sub checkUp
{
	return 0;
}

sub checkRight
{
	my $p = shift;
	my $innerGame = shift;
	my $blob = shift;
	
	my $blobs = $innerGame->{'blobs'};
	my $adjust;
	
	my $oldX = $blob->{'xPos'};
	my $newX = $blob->{'newX'};
	if( ( $newX + 1000 ) >= 6000 )
	{
		$adjust = ( $newX + 1000 ) - 6000;
		$blob->{'newX'} = $newX - $adjust;
		return $adjust;
	}
	
	my $checkColNum = int ( ( $newX + 1000 ) / 1000 );
	my $columnHeadID = $p->{'column'}->[ $checkColNum ];
	my $ID;
	my $colBlob;
	for( $ID = $columnHeadID; $ID != -1; $ID = $colBlob->{'above'} )
	{
		$colBlob = $blobs->[$ID];
		unless(  ( $colBlob->{'yPos'} >= ( $blob->{'yPos'} + 1000 ) )
			   ||
			     ( $blob->{'yPos'} >= ( $colBlob->{'yPos'} + 1000 ) ) 
		)
		{
			last;
		}
	}
	
	if( $ID == -1 )
	{
		return 0;
	}
	
	$adjust = ( $newX + 1000 ) - $colBlob->{'xPos'};
	$blob->{'newX'} = $newX - $adjust;
	return $adjust;
}

sub checkLeft
{
	my $p = shift;
	my $innerGame = shift;
	my $blob = shift;
	
	my $blobs = $innerGame->{'blobs'};
	my $adjust;
	
	my $oldX = $blob->{'xPos'};
	my $newX = $blob->{'newX'};
	if( ( $newX ) <= 0 )
	{
		$adjust = 0 - ( $newX );
		$blob->{'newX'} = $newX + $adjust;
		return $adjust;
	}
	
	my $checkColNum = int ( ( $newX ) / 1000 );
	my $columnHeadID = $p->{'column'}->[ $checkColNum ];
	my $ID;
	my $colBlob;
	for( $ID = $columnHeadID; $ID != -1; $ID = $colBlob->{'above'} )
	{
		$colBlob = $blobs->[$ID];
		unless(  ( $colBlob->{'yPos'} >= ( $blob->{'yPos'} + 1000 ) )
			   ||
			     ( $blob->{'yPos'} >= ( $colBlob->{'yPos'} + 1000 ) ) 
		)
		{
			last;
		}
	}
	
	if( $ID == -1 )
	{
		return 0;
	}
	
	$adjust = $colBlob->{'xPos'} - ( $newX - 1000 );
	$blob->{'newX'} = $newX + $adjust;
	return $adjust;
}

sub checkDown
{
	my $p = shift;
	my $innerGame = shift;
	my $blob = shift;
	
	my $blobs = $innerGame->{'blobs'};
	my $adjust;
	
	my $oldY = $blob->{'yPos'};
	my $newY = $blob->{'newY'};
	my $minY = { yPos => 15000 };
	
	my @collNums = ();
	
	push @collNums, int ( $blob->{'xPos'} / 1000 );
	unless( ( $blob->{'xPos'} / 1000 ) == int ( $blob->{'xPos'} / 1000 ) )
	{
		push @collNums, int ( ( $blob->{'xPos'} + 1000 ) / 1000 );
	}
	
	foreach my $columnNum ( @collNums )
	{
		my $columnHeadID = $p->{'column'}->[ $columnNum ];
		my $colBlob = $blobs->[$columnHeadID];
		while( $colBlob->{'above'} != -1 )
		{
			$colBlob = $blobs->[ $colBlob->{'above'} ];
		}
		
		$minY = $colBlob if $colBlob->{'yPos'} < $minY->{yPos};
	}
	
	if( ( $newY + 1000 ) >= $minY->{yPos} )
	{
		$adjust = ( $newY + 1000 ) - $minY->{yPos};
		$blob->{'newY'} = $newY - $adjust;
		return $adjust;
	}
	
	return 0;
}

sub moveRight
{
	my $p = shift;
	my $innerGame = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my $slaveID = $p->{'slave'};
	my $slave = $blobs->[$slaveID];
	
	my $masterID = $p->{'master'};
	my $master = $blobs->[$masterID];
	
	if( ( !$p->{'wantMoveRight'} ) && ( ( $master->{'xPos'} / 1000 ) == int ( $master->{'xPos'} / 1000 ) ) )
	{
		return 1;
	}
	
	$slave->{'newX'}  = $slave->{'xPos'}  + 500;
	$master->{'newX'} = $master->{'xPos'} + 500;
	
	my $adjust1 = checkRight( $p, $innerGame, $slave );
	
	$master->{'newX'} -= $adjust1;
	
	my $adjust2 = checkRight( $p, $innerGame, $master );
	
	$slave->{'newX'} -= $adjust2;
	
	$slave->{'xPos'}  = $slave->{'newX'};
	$master->{'xPos'} = $master->{'newX'};
	
	return 1 if( ( $master->{'xPos'} / 1000 ) == int ( $master->{'xPos'} / 1000 ) );
	
	return 0;
}

sub moveLeft
{
	my $p = shift;
	my $innerGame = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my $slaveID = $p->{'slave'};
	my $slave = $blobs->[$slaveID];
	
	my $masterID = $p->{'master'};
	my $master = $blobs->[$masterID];
	
	if( ( !$p->{'wantMoveLeft'} ) && ( ( $master->{'xPos'} / 1000 ) == int ( $master->{'xPos'} / 1000 ) ) )
	{
		return 1;
	}
	
	$slave->{'newX'}  = $slave->{'xPos'}  - 500;
	$master->{'newX'} = $master->{'xPos'} - 500;
	
	my $adjust1 = checkLeft( $p, $innerGame, $slave );
	
	$master->{'newX'} += $adjust1;
	
	my $adjust2 = checkLeft( $p, $innerGame, $master );
	
	$slave->{'newX'} += $adjust2;
	
	$slave->{'xPos'}  = $slave->{'newX'};
	$master->{'xPos'} = $master->{'newX'};
	
	return 1 if( ( $master->{'xPos'} / 1000 ) == int ( $master->{'xPos'} / 1000 ) );
	
	return 0;
}

sub moveDown
{
	my $p = shift;
	my $innerGame = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my $slaveID = $p->{'slave'};
	my $slave = $blobs->[$slaveID];
	
	my $masterID = $p->{'master'};
	my $master = $blobs->[$masterID];
	
	my $downSpeed = 100;
	$downSpeed = 500 if( $p->{'wantMoveDown'} );
	
	$slave->{'newY'}  = $slave->{'yPos'}  + $downSpeed;
	$master->{'newY'} = $master->{'yPos'} + $downSpeed;
	
	my $adjust1 = checkDown( $p, $innerGame, $slave );
	
	$master->{'newY'} -= $adjust1;
	
	my $adjust2 = checkDown( $p, $innerGame, $master );
	
	$slave->{'newY'} -= $adjust2;
	
	$slave->{'yPos'}  = $slave->{'newY'};
	$master->{'yPos'} = $master->{'newY'};
	
	if( $adjust1 || $adjust2 )
	{
		return 1;
	}
	
	return 0;
}

sub doMaster
{
	my $p = shift;
	my $innerGame = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	return if ( $p->{'master'} == -1 );
	
	$innerGame->{'update'}->{ $p->{'master'} } = 1;
	$innerGame->{'update'}->{ $p->{'slave'}  } = 1;
	
	$p->{'masterFrame'}++;
	$blobs->[ $p->{'master'} ]->{'frame'} = "glow" if $p->{'masterFrame'} == 5;
	if( $p->{'masterFrame'} == 10 )
	{
		$blobs->[ $p->{'master'} ]->{'frame'} = "normal";
		$p->{'masterFrame'} = 0;
	}
	
	$p->{'hadAction'} = 1;
	
	if( ( $p->{'canMove'} ) && ( !$p->{'rotating'} ) && ( $p->{'rotateCount'} ) )
	{
		$p->{'rotateCount'}--;
		$p->{'rotating'} = 1;
	}
	
	if( $p->{'rotating'} )
	{
		my $rotFrame = $rotateFrames[ $p->{'rotateFrame'} ];
		if( $rotFrame->[1]->( $p, $innerGame, $rotFrame->[0]) )
		{
			$p->{'rotateFrame'}++;
		}
		
		if(  ( $p->{'rotateFrame'} % 4 )  == 0 )
		{
			$p->{'rotating'} = 0;
		}
		
		$p->{'rotateFrame'} = 0 if $p->{'rotateFrame'} == 16;
	}
	
	if( ( $p->{'canMove'} ) && ( $p->{'wantMoveRight'} ) && ( !$p->{'movingLeft'} ))
	{
		$p->{'movingRight'} = 1;
	}
	
	if( $p->{'movingRight'} )
	{
		$p->{'movingRight'} = 0 if moveRight( $p, $innerGame );
	}
	
	if( ( $p->{'canMove'} ) && ( $p->{'wantMoveLeft'} ) && ( !$p->{'movingRight'} ) )
	{
		$p->{'movingLeft'} = 1;
	}
	
	if( $p->{'movingLeft'} )
	{
		$p->{'movingLeft'} = 0 if moveLeft( $p, $innerGame );
	}
	
	if( moveDown( $p, $innerGame ) )
	{
		$p->{'canMove'} = 0;
		unless( $p->{'movingLeft'} || $p->{'movingRight'} || $p->{'rotating'} )
		{
			addToFalling( $p, $innerGame, $p->{'slave'} );
			$p->{'slave'} = -1;
			addToFalling( $p, $innerGame, $p->{'master'} );
			$p->{'master'} = -1;
		}
	}
	else
	{
		$p->{'canMove'} = 1;
	}
}

sub addToFalling
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	
	my $blobs = $innerGame->{'blobs'};
	my $blob = $blobs->[$blobID];
	
	$blob->{'falling'} = 1;
	removeFromBlocking( $p, $innerGame, $blobID );
	
	$blob->{'frame'} = "normal";
	$innerGame->{'update'}->{ $blobID } = 1;
	
	$blob->{'blowGroupID'} = $blobID;
	$p->{'blowGroups'}->{ $blobID } = [ $blobID ];
	
	$blob->{'sides'} = {};
	
	### Insert into falling as in-order as possible to avoid complicated collision detection.
	my $index = 0;
	my $yPos = $blob->{'yPos'};
	
	my $falling = $p->{'falling'};
	
	foreach my $fallID ( @{ $falling } )
	{
		my $fallBlob = $blobs->[ $fallID ];
		if( $yPos < $fallBlob->{'yPos'} )
		{
			$index++;
		}
		else
		{
			last;
		}
	}
	
	splice @{ $falling }, $index, 0, $blobID;
	
	### make sure we are in a column.
	if( $blob->{'column'} == -1 )
	{
		addToColumn( $p, $innerGame, $blobID );
	}
}

sub keepFalling
{
	my $p = shift;
	my $innerGame = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my @backFalling = ();
	
	while ( my $blobID = shift @{ $p->{'falling'} } )
	{
		my $blob = $blobs->[$blobID];
		
		$innerGame->{'update'}->{ $blobID } = 1;
		
		my $pastY = $blob->{'yPos'};
		my $newY = $pastY + 750;
		
		$p->{'hadAction'} = 1;
		
		if( $newY > 14000 )
		{
			destroyBlob( $p, $innerGame, $blobID );
			next;
		}
		
		unless( $blob->{'below'} == -1 )
		{
			my $below = $blobs->[ $blob->{'below'} ];
			if( ( $newY + 1000 ) >= $below->{'yPos'} )
			{
				$blob->{'yPos'} = $below->{'yPos'} - 1000;
				$newY = $blob->{'yPos'};
				unless( $below->{'falling'} )
				{
					$blob->{'blockedBy'} = $blob->{'below'};
					$below->{'blocking'} = $blobID;
					my $moved = ( $pastY == $blob->{'yPos'} ) ? 0 : 1;
					addToSearching( $p, $innerGame, $blobID, $moved );
					next;
				}
			}
		}
		
		$blob->{'yPos'} = $newY;
		push @backFalling, $blobID;
	}
	
	$p->{'falling'} = \@backFalling;
}

sub removeColumn
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	my $blob = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my $aboveID = $blob->{'above'};
	my $belowID = $blob->{'below'};
	my $columnNum = $blob->{'column'};
	
	unless( $columnNum == -1 )
	{
		unless( $aboveID == -1 )
		{
			$blobs->[ $aboveID ]->{'below'} = $belowID;
		}
		
		if( $belowID == -1 )
		{
			$p->{'column'}->[ $columnNum ] = $aboveID;
		}
		else
		{
			$blobs->[ $belowID ]->{'above'} = $aboveID;
		}
		
		$blob->{'column'} = -1;
		
		removeFromBlocking( $p, $innerGame, $blobID );
	}
	
	$blob->{'below'} = -1;
	$blob->{'above'} = -1;
}

sub addToColumn
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	
	my $blobs = $innerGame->{'blobs'};
	my $blob = $blobs->[$blobID];
	
	my $columnNum = int( $blob->{'xPos'} / 1000 );
	my $columnHead = $p->{'column'}->[ $columnNum ];
	
	$blob->{'column'} = $columnNum;
	$blob->{'below'} = -1;
	$blob->{'above'} = -1;
	
	if( $columnHead == -1 )
	{
		$p->{'column'}->[ $columnNum ] = $blobID;
	}
	else
	{
		my $belowID = -1;
		my $aboveID = $columnHead;
		my $above;
		my $below;
		
		while( $aboveID != -1 )
		{
			$above = $blobs->[ $aboveID ];
			
			if( $above->{'yPos'} <= $blob->{'yPos'} )
			{
				last;
			}
			
			$below = $above;
			$belowID = $aboveID;
			$aboveID = $below->{'above'};
			$above = undef;
		}
		
		$blob->{'below'} = $belowID;
		$blob->{'above'} = $aboveID;
		
		$below->{'above'} = $blobID if defined $below;
		$above->{'below'} = $blobID if defined $above;
	}
}

sub removeFromBlocking
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	
	my $blobs = $innerGame->{'blobs'};
	my $blob = $blobs->[$blobID];
	
	unless( $blob->{'blockedBy'} == -1 )
	{
		$blobs->[ $blob->{'blockedBy'} ]->{'blocking'} = -1;
		$blob->{'blockedBy'} = -1;
	}
	
	unless( $blob->{'blocking'} == -1 )
	{
		my $blockingID = $blob->{'blocking'};
		my $blocking = $blobs->[ $blockingID ];
		$blocking->{'blockedBy'} = -1;
		$blob->{'blocking'} = -1;
		unless( $blocking->{'explodeFrame'} || $blocking->{'falling'} )
		{
			addToFalling( $p, $innerGame, $blockingID );
		}
	}
	
	my $blowGroup = $p->{'blowGroups'}->{ $blob->{'blowGroupID'} };
	$blowGroup = [] unless defined $blowGroup;
	my @blowBack = @{ $blowGroup };
	while ( my $memberID = shift @blowBack )
	{
		next if $memberID == $blobID;
		my $member = $blobs->[ $memberID ];
		unless( $member->{'explodeFrame'} || $member->{'falling'} )
		{
			addToFalling( $p, $innerGame, $memberID );
		}
	}
	
	removeFromGrid( $p->{'grid'}, $blob );
}

sub removeFromGrid
{
	my $grid = shift;
	my $blob = shift;
	
	if( $blob->{'gridX'} != -1 )
	{
		$grid->[ $blob->{'gridX'} ]->[ $blob->{'gridY'} ] = -1;
		
		$blob->{'gridX'} = -1;
		$blob->{'gridY'} = -1;
	}
}

sub addToGridBlind
{
	my $grid = shift;
	my $blobID = shift;
	my $blob = shift;
	
	$blob->{'gridX'} = int( $blob->{'xPos'} / 1000 );
	$blob->{'gridY'} = int( $blob->{'yPos'} / 1000 );
	
	$grid->[ $blob->{'gridX'} ]->[ $blob->{'gridY'} ] = $blobID;
}

sub addToSearching
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	my $moved = shift;
	
	my $blobs = $innerGame->{'blobs'};
	my $blob = $blobs->[$blobID];
	
	$blob->{'searchFrame'} = ( $moved ) ? 1 : 3;
	$blob->{'frame'} = $searchFrame{ $blob->{'searchFrame'} };
	$innerGame->{'update'}->{ $blobID } = 1;
	$blob->{'falling'} = 0;
	
	addToGridBlind( $p->{'grid'}, $blobID, $blob );
	
	push @{ $p->{'searching'} }, $blobID;
}

sub findMatches
{
	my $p = shift;
	my $innerGame = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my $grid = $p->{'grid'};
	
	my @backSearch = ();
	
	while ( my $blobID = shift @{ $p->{'searching'} } )
	{
		my $blob = $blobs->[$blobID];
		
		next if $blob->{'blockedBy'} == -1;
		
		$p->{'hadAction'} = 1;
		
		if( $blob->{'searchFrame'} == 3 )
		{
			next if $blob->{'color'} eq "black";
			
			gridSearch( $p, $innerGame, $blobID, $blob, $grid, $blob->{'color'} );
			next;
		}
		
		$blob->{'searchFrame'}++;
		
		$blob->{'frame'} = $searchFrame{ $blob->{'searchFrame'} };
		$innerGame->{'update'}->{ $blobID } = 1;
		
		push @backSearch, $blobID;
	}
	
	$p->{'searching'} = \@backSearch;
	
	preExplode( $p, $innerGame );
}

sub gridSearch
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	my $blob   = shift;
	my $grid   = shift;
	my $color  = shift;
	
	my $x = $blob->{'gridX'};
	my $y = $blob->{'gridY'};
	
	spotSearch( $p, $innerGame, $blobID, $blob, $grid, $color, $x + 1, $y, 'Right' ) if $x < 5;
	spotSearch( $p, $innerGame, $blobID, $blob, $grid, $color, $x - 1, $y, 'Left'  ) if $x > 0;
	spotSearch( $p, $innerGame, $blobID, $blob, $grid, $color, $x, $y + 1, 'Down'  ) if $y < 13;
	spotSearch( $p, $innerGame, $blobID, $blob, $grid, $color, $x, $y - 1, 'Up'    ) if $y > 0;
}

sub spotSearch
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	my $blob   = shift;
	my $grid   = shift;
	my $color  = shift;
	
	my $checkX = shift;
	my $checkY = shift;
	my $side   = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my $checkID = $grid->[ $checkX ]->[ $checkY ];
	
	return if $checkID == -1;
	
	my $checkBlob = $blobs->[$checkID];
	
	return if $checkBlob->{'color'} ne $color;
	
	return if $checkBlob->{'blowGroupID'} == $blob->{'blowGroupID'};
	
	my $savedCheckBlowGroupID = $checkBlob->{'blowGroupID'};
	my $checkBlowGroup = $p->{'blowGroups'}->{ $checkBlob->{'blowGroupID'} };
	
	my $blobBlowGroup = $p->{'blowGroups'}->{ $blob->{'blowGroupID'} };
	
	foreach my $member ( @{ $checkBlowGroup } )
	{
		push @{ $blobBlowGroup }, $member;
		
		$blobs->[ $member ]->{'blowGroupID'} = $blob->{'blowGroupID'};
	}
	
	delete $p->{'blowGroups'}->{ $savedCheckBlowGroupID };
	
	unless( $color eq "black")
	{
		delete $p->{'readyBlowGroups'}->{ $savedCheckBlowGroupID };
		
		if( @{ $blobBlowGroup } >= 4 )
		{
			$p->{'readyBlowGroups'}->{ $blob->{'blowGroupID'} } = $blobBlowGroup;
		}
	
		addSide( $innerGame, $blob, $blobID, $side );
		addSide( $innerGame, $checkBlob, $checkID, $compliment{ $side } );
	}
	
	return;
}

sub addSide
{
	my $innerGame = shift;
	my $blob = shift;
	my $blobID = shift;
	my $side = shift;
	
	$innerGame->{'update'}->{ $blobID } = 1;
	$blob->{'sides'}->{ $side } = 1;
	
	my $frameString = "join";
	
	foreach my $testSide ( "Right", "Left", "Up", "Down" )
	{
		next unless defined $blob->{'sides'}->{ $testSide };
		
		$frameString .= $testSide;
	}
	
	$blob->{'frame'} = $frameString;
}

sub preExplode
{
	my $p = shift;
	my $innerGame = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	foreach my $blowGroupID ( keys %{ $p->{'readyBlowGroups'} } )
	{
		my $blowGroup = $p->{'readyBlowGroups'}->{ $blowGroupID };
		
		delete $p->{'readyBlowGroups'}->{ $blowGroupID };
		
		my @blowBack = @{ $blowGroup };
		
		foreach my $blobID ( @blowBack )
		{
			my $blob = $blobs->[$blobID];
			gridSearch( $p, $innerGame, $blobID, $blob, $p->{'grid'}, "black" );
		}
		
		foreach my $blobID ( @{ $blowGroup } )
		{
			my $blob = $blobs->[$blobID];
			removeFromGrid( $p->{'grid'}, $blob );
			$blob->{'explodeFrame'} = 1;
		}
		
		push @{ $p->{'explode'} }, $blowGroup;
	}
}

sub animateExplosion
{
	my $p = shift;
	my $innerGame = shift;
	
	my $blobs = $innerGame->{'blobs'};
	
	my @backExplode = ();
	
	while ( my $blowGroup = shift @{ $p->{'explode'} } )
	{
		$p->{'hadAction'} = 1;
		
		foreach my $blobID ( @{ $blowGroup } )
		{
			my $blob = $blobs->[$blobID];
			
			next if $blob->{'explodeFrame'} == 8;
			
			$blob->{'explodeFrame'}++;
			$blob->{'frame'} = $blowFrame{ $blob->{'explodeFrame'} };
			$innerGame->{'update'}->{ $blobID } = 1;
			
			last if $blob->{'explodeFrame'} == 4;
		}
		
		if( $blobs->[ $blowGroup->[ -1 ] ]->{'explodeFrame'} == 8 )
		{
			my $lastID = pop @{ $blowGroup };
			$blobs->[$lastID]->{'blowGroupID'} = -1;
			
			my @blowBack = @{ $blowGroup };
			
			foreach my $blobID ( @blowBack )
			{
				destroyBlob( $p, $innerGame, $blobID );
			}
			
			if( $p->{'combos'} == 0 )
			{
				$p->{'combos'}++;
				destroyBlob( $p, $innerGame, $lastID );
			}
			else
			{
				makeOrb( $p, $innerGame, $lastID );
			}
		}
		else
		{
			push @backExplode, $blowGroup;
		}
	}
	
	$p->{'explode'} = \@backExplode;
}

sub makeOrb
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	
	removeFromBlocking( $p, $innerGame, $blobID );
	
	my $blobs = $innerGame->{'blobs'};
	my $blob = $blobs->[$blobID];
	my $orbNumFrames = 8;
	
	removeColumn( $p, $innerGame, $blobID, $blob );
	
	push @{ $p->{'orb'} }, $blobID;
	
	$blob->{'frame'} = 'orb';
	$innerGame->{'update'}->{ $blobID } = 1;
	
	my $xGoalDiff = $p->{'orbGoal'}->[0] - $blob->{'xPos'};
	my $yGoalDiff = $p->{'orbGoal'}->[1] - $blob->{'yPos'};
	
	$blob->{'xVel'} = int( $xGoalDiff / $orbNumFrames );
	$blob->{'yVel'} = int( $yGoalDiff / $orbNumFrames );
}

sub moveOrbs
{
	my $p = shift;
	my $innerGame = shift;
	my $side = shift;
	
	my $blobs = $innerGame->{'blobs'};
	my $xGoal = $p->{'orbGoal'}->[0];
	my $yGoal = $p->{'orbGoal'}->[1];
	
	my @backOrbs = ();
	
	while ( my $blobID = shift @{ $p->{'orb'} } )
	{
		$p->{'hadAction'} = 1;
		
		my $blob = $blobs->[$blobID];
		
		$blob->{'xPos'} += $blob->{'xVel'};
		$blob->{'yPos'} += $blob->{'yVel'};
		$blob->{'frame'} = ( $blob->{'frame'} eq "orb" ) ? "orbBig" : "orb";
		$innerGame->{'update'}->{ $blobID } = 1;
		
		if( ( $blob->{'yPos'} <= $yGoal ) && 
			(  ( $side eq "left" )  &&  ( $blob->{'xPos'} >= $xGoal )  )
			||
			(  ( $side eq "right" )  &&  ( $blob->{'xPos'} <= $xGoal )  )
		)
		{
			$p->{'combos'}++;
			destroyBlob( $p, $innerGame, $blobID );
			next;
		}
		
		push @backOrbs, $blobID;
	}
	
	$p->{'orb'} = \@backOrbs;
}

sub destroyBlob
{
	my $p = shift;
	my $innerGame = shift;
	my $blobID = shift;
	
	removeFromBlocking( $p, $innerGame, $blobID );
	
	my $blobs = $innerGame->{'blobs'};
	
	my $blob = $blobs->[$blobID];
	
	removeColumn( $p, $innerGame, $blobID, $blob );
	
	push @{ $innerGame->{'freeBlobIDs'} }, $blobID;
	$blob->{'frame'} = 'vanish';
	$innerGame->{'update'}->{ $blobID } = 1;
}

sub getFreeBlob
{
	my $innerGame = shift;
	my $side = shift;
	
	my $blob;
	
	my $blobID = shift @{ $innerGame->{'freeBlobIDs'} };
	
	unless( defined $blobID )
	{
		$innerGame->{'blobIDUpdate'} = 1;
		$blobID = $innerGame->{'blobID'}++;
		push @{ $innerGame->{'blobs'} }, {};
	}
	
	my %blob = (
		blocking      => -1,
		blockedBy     => -1,
		
		frame         =>  "vanish",
		color         =>  "black",
		side          => $side,
		
		explodeFrame  => 0,
		blowGroupID   => -1,
		searchFrame   => 0,
		falling       => 0,
		
		xPos    => -1,
		yPos    => -1,
		xVel    => 0,
		yVel    => 0,
		
		gridX   => -1,
		gridY   => -1,
		
		column  => -1,
		above   => -1,
		below   => -1,
		
		newX    => -1,
		newY    => -1,
	);
	
	$innerGame->{'blobs'}->[ $blobID ] = \%blob;
	$innerGame->{'update'}->{ $blobID } = 1;
	
	return $blobID;
}

1;
