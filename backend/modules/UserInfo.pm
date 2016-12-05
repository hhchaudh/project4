package UserInfo;

use strict;
use warnings;

use JSON;

my $fileName;

sub setUserInfoFile { $fileName = shift; }

sub get
{
	my $reporter = shift;
	my $userInfoFile;
	
	unless (   open( $userInfoFile, "<", $fileName )   )
	{
		$reporter->{'log'}->( "Cannot open userInfo file |$fileName|: $!" );
		return {};
	}
	
	my $encodedUsers = <$userInfoFile>;
	my $userInfo;
	eval{   $userInfo = decode_json( $encodedUsers );    };
	if ( $@ )
	{
		$reporter->{'log'}->( "Problem decoding JSON string from infoFile, says:\n$@", "ERROR" );
		return {};
	}
	
	return $userInfo;
}

sub store
{
	my $userInfo = shift;
	my $reporter = shift;
	my $userInfoFile;
	
	unless (   open( $userInfoFile, ">", $fileName )   )
	{
		$reporter->{'log'}->( "Cannot open userInfo file |$fileName|: $!" );
		return;
	}
	
	my $encodedOut;
	eval {   $encodedOut = encode_json ( $userInfo );   };
	if( $@ )
	{
		$reporter->{'log'}->( "Problem encoding JSON for infoFile, says: |$@|", "ERROR" );
		return;
	}
	
	print $userInfoFile $encodedOut;
	return;
}

1;
