package Conf;

use strict;
use warnings;

my %conf = (
	logFile		=> "/home/jfustos/EECS448/puyoPuyo/log.txt",
	fileDir     => "/home/jfustos/EECS448/puyoPuyo/gameFiles",
	socketFile  => "/home/jfustos/EECS448/puyoPuyo/gameFiles/0000000000",
	userInfo    => "/home/jfustos/EECS448/puyoPuyo/gameFiles/userInfo",
	dieFile	 	=> "/home/jfustos/EECS448/puyoPuyo/gameFiles/die",
);

sub get
{
	return \%conf;
}

1;
