package Conf;

use strict;
use warnings;

my %conf = (
	logFile		=> "/home/jfustos/EECS448/altStack/log.txt",
	fileDir     => "/home/jfustos/EECS448/altStack/gameFiles",
	socketFile  => "/home/jfustos/EECS448/altStack/gameFiles/0000000000",
	userInfo    => "/home/jfustos/EECS448/altStack/gameFiles/userInfo",
	dieFile	 	=> "/home/jfustos/EECS448/altStack/gameFiles/die",
);

sub get
{
	return \%conf;
}

1;
