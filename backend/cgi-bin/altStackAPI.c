#include <sys/types.h>
#include <sys/stat.h>
#include <sys/select.h>
#include <sys/time.h>
#include <sys/types.h>
#include <sys/socket.h>
#include <sys/un.h>
#include <fcntl.h>
#include <stdio.h>
#include <time.h>
#include <string.h>
#include <errno.h>
#include <unistd.h>
#include <stdlib.h>

#define LOG_FILE "/home/jfustos/EECS448/altStack/log.txt"
#define BIG_BUF_SIZE 64000
#define BUF_LIMIT ( BIG_BUF_SIZE - 1 )

#define SMALL_BUF_SIZE 256
#define SMALL_BUF_LIMIT ( SMALL_BUF_SIZE - 1 )

#define GAME_SOCK "/home/jfustos/EECS448/altStack/gameFiles/"

FILE * logger = NULL;
char errBuf[ BIG_BUF_SIZE ];
char logBuf[ BIG_BUF_SIZE ];
char inputBuf[ BIG_BUF_SIZE ];
char whereBuf[ BIG_BUF_SIZE ];
char * progname;
int sock = -1;
int sendBadGameToken = 0;

void printStopWatch( const char * message );
void earlyDie( const char * message );
void gameDie( const char * message );
void printBadHeader();
void unTaint( char * message );
void sendChunkedMessage( char * message );
void endChunkedTransmission();
char * logHead();

int main ( int argc, char ** argv)
{
	char * REQUEST_METHOD = NULL;
	char * CONTENT_LENGTH = NULL;
	int contentLength = 0;
	int bytesRead = 0;
	int curBytesRead = 0;
	int bytesReadLeft = 0;
	int timeOut;
	char * curBytesReadPos = 0;
	fd_set rfds;
	fd_set wfds;
	struct timeval tv;
	struct sockaddr_un addr;
	int inputBufLength;
	char * inputLeft;
	char * inputMore;
	char * findWhere;
	char * findWhereLimit;
	int numBytesWrote;
	int foundWhere = 0;
	
	progname = argv[0];
	printStopWatch( "Initialize Stop Watch!!! Should not print!!!" );
	
	// make output non buffered so things are flushed immediately.
	setbuf( stdout, NULL );
	
	// make sure error buff ends with NUL terminator just in case.
	errBuf[ BUF_LIMIT ] = '\0';
	
	// open log file or die
	logger = fopen( LOG_FILE, "a" );
	if( logger == NULL )
	{
		snprintf( errBuf, BUF_LIMIT, "Could not open log file says:|%s|!!!", strerror( errno ));
		earlyDie( errBuf );
		return 1;
	}
	
	setbuf( logger, NULL );
	
	// log file is set up, print starting
	fprintf( logger, "%s Starting.\n\n", logHead() );
	
	// make sure the request method is POST
	REQUEST_METHOD = getenv( "REQUEST_METHOD" );
	if( ( REQUEST_METHOD == NULL ) || ( strcmp( REQUEST_METHOD, "POST" ) != 0 ) )
	{
		snprintf( errBuf, BUF_LIMIT, "ERROR :: Request must be POST!!" );
		earlyDie( errBuf );
		return 1;
	}
	
	// make sure there is a request in STDIN
	CONTENT_LENGTH = getenv( "CONTENT_LENGTH" );
	if( CONTENT_LENGTH == NULL )
	{
		snprintf( errBuf, BUF_LIMIT, "ERROR :: Could not find content length!!" );
		earlyDie( errBuf );
		return 1;
	}
	
	contentLength = atoi( CONTENT_LENGTH );
	if(   ( contentLength <= 0 )  ||  ( contentLength >= BUF_LIMIT )   )
	{
		snprintf( errBuf, BUF_LIMIT, "ERROR :: Content length was not valid, was |%s|!!", CONTENT_LENGTH );
		earlyDie( errBuf );
		return 1;	
	}
	
	// make STDIN nonblocking..
	if ( fcntl(0, F_SETFL, fcntl(0, F_GETFL) | O_NONBLOCK) == -1 )
	{
		snprintf( errBuf, BUF_LIMIT, "Could not change stdin to nonblocking, says |%s|!!!", strerror( errno ));
		earlyDie( errBuf );
		return 1;
	}
	
	// read in the request.
	curBytesReadPos = inputBuf;
	bytesReadLeft = contentLength;
	timeOut = 5;
	inputBuf[0] = '\0';
	while( 1 )
	{
		if( timeOut-- <= 0 )
		{
			snprintf( errBuf, BUF_LIMIT, "ERROR :: Timed out trying to read stdin, only got |%s|!!", inputBuf );
			earlyDie( errBuf );
			return 1;
		}
		
		curBytesRead = read( 0, curBytesReadPos, bytesReadLeft );
		
		if( curBytesRead == 0 )
		{
			snprintf( errBuf, BUF_LIMIT, "ERROR :: stdin closed before read in entire input, only got |%s|!!", inputBuf );
			earlyDie( errBuf );
			return 1;
		}
		else if( curBytesRead == -1 )
		{
			if(  ( errno == EAGAIN ) || ( errno == EWOULDBLOCK ) || ( errno == EINTR )  )
			{
				// recoverable error go again.
			}
			else
			{
				snprintf( errBuf, BUF_LIMIT, "ERROR :: Unrecoverable error, was |%s|!!!", strerror( errno ) );
				earlyDie( errBuf );
				return 1;
			}
		}
		else
		{
			curBytesReadPos[ curBytesRead ] = '\0';
			curBytesReadPos += curBytesRead;
			bytesReadLeft -= curBytesRead;
			fprintf( logger, "%s Got more bytes back, buffer is now |%s|.\n\n", logHead(), inputBuf );
			
			if( bytesReadLeft <= 0 )
			{
				fprintf( logger, "%s Got complete message.\n\n", logHead() );
				break;
			}
		}
		
		FD_ZERO(&rfds);
		FD_SET(0, &rfds);
		tv.tv_sec = 0;
		tv.tv_usec = 100000;
		select( 0 + 1, &rfds, NULL, NULL, &tv);
	}
	
	// find out which socket file to send it to.
	findWhere = inputBuf;
	findWhereLimit = ( inputBuf + strlen( inputBuf ) ) - 20;
	while( findWhere < findWhereLimit)
	{
		if( findWhere[ 0] == '"' && 
			findWhere[ 1] == 'w' && 
			findWhere[ 2] == 'h' && 
			findWhere[ 3] == 'e' && 
			findWhere[ 4] == 'r' && 
			findWhere[ 5] == 'e' && 
			findWhere[ 6] == '"' && 
			findWhere[ 7] == ':' && 
			findWhere[ 8] == '"' && 
			findWhere[ 9] >= '0' && findWhere[ 9] <= '9' && 
			findWhere[10] >= '0' && findWhere[10] <= '9' && 
			findWhere[11] >= '0' && findWhere[11] <= '9' && 
			findWhere[12] >= '0' && findWhere[12] <= '9' && 
			findWhere[13] >= '0' && findWhere[13] <= '9' && 
			findWhere[14] >= '0' && findWhere[14] <= '9' && 
			findWhere[15] >= '0' && findWhere[15] <= '9' && 
			findWhere[16] >= '0' && findWhere[16] <= '9' && 
			findWhere[17] >= '0' && findWhere[17] <= '9' && 
			findWhere[18] >= '0' && findWhere[18] <= '9' &&
			findWhere[19] == '"')
		{
			findWhere += 9;
			foundWhere = 1;
			break;
		}
		
		findWhere++;
	}
	
	if( foundWhere == 0 )
	{
		snprintf( errBuf, BUF_LIMIT, "ERROR :: Could not find a valid 'where' field!!!", strerror( errno ) );
		earlyDie( errBuf );
		return 1;
	}
	
	findWhere[10] = '\0';
	snprintf( whereBuf, BUF_LIMIT, "%s%s", GAME_SOCK, findWhere );
	findWhere[10] = '"';
	
	// should have a complete request for the game, open up the socket to pass it on.
	sock = socket( AF_UNIX, SOCK_STREAM | SOCK_NONBLOCK, 0);
	if( sock < 0 )
	{
		snprintf( errBuf, BUF_LIMIT, "ERROR :: Could not open socket, says: |%s|!!!", strerror( errno ) );
		sendBadGameToken = 1;
		earlyDie( errBuf );
		return 1;
	}
	
	memset( &addr, 0, sizeof( struct sockaddr_un ) );
	addr.sun_family = AF_UNIX;
	strncpy( addr.sun_path, whereBuf, sizeof( addr.sun_path ) - 1 );
	
	if ( connect( sock, ( struct sockaddr *)&addr, sizeof( struct sockaddr_un ) ) == -1 )
	{
		snprintf( errBuf, BUF_LIMIT, "ERROR :: Could not connect to socket |%s|, says: |%s|!!!", whereBuf, strerror( errno ) );
		sendBadGameToken = 1;
		earlyDie( errBuf );
		return 1;
	}
	
	//printStopWatch( "Start test" );
	
	// print the http headers for the response
	printf("Status: 200 OK\r\n");
	printf("Content-Type: application/json; charset=ISO-8859-1\r\n");
	printf("Transfer-Encoding: chunked\r\n");
	printf("\r\n");
	
	// get the request ready to send to the game
	unTaint( inputBuf );
	
	inputBufLength = strlen( inputBuf );
	inputBuf[ inputBufLength++ ] = '\n';
	inputBuf[ inputBufLength   ] = '\0';
	
	fprintf( logger, "%s Trying to send |%s|.\n\n", logHead(), inputBuf );
	
	// send the request
	timeOut = 5;
	inputLeft = inputBuf;
	
	while( 1 )
	{
		if( timeOut-- <= 0 )
		{
			snprintf( errBuf, BUF_LIMIT, "ERROR :: Timed out trying to send |%s|. Was not completely sent. Dieing.", inputLeft );
			gameDie( errBuf );
			return 1;
		}
		
		numBytesWrote = write( sock, inputLeft, inputBufLength );
		
		if( numBytesWrote == 0 )
		{
			snprintf( errBuf, BUF_LIMIT, "ERROR :: Unrecoverable error or pipe closed trying to send |%s|.", inputLeft );
			gameDie( errBuf );
			return 1;
		}
		else if( numBytesWrote == -1 )
		{
			if(  ( errno == EAGAIN ) || ( errno == EWOULDBLOCK ) || ( errno == EINTR )  )
			{
				fprintf( logger, "%s Trying to send |%s| again, error was |%s|.\n\n", logHead(), inputLeft, strerror( errno ) );
			}
			else
			{
				snprintf( errBuf, BUF_LIMIT, "ERROR :: Unrecoverable error, was |%s|!!!", strerror( errno ) );
				gameDie( errBuf );
				return 1;
			}
		}
		else
		{
			if( numBytesWrote >= inputBufLength )
			{
				fprintf( logger, "%s Successfully sent |%s|. Message complete.\n\n", logHead(), inputBuf );
				break;
			}
			
			inputLeft += numBytesWrote;
			inputBufLength -= numBytesWrote;
			timeOut = 5;
			fprintf( logger, "%s Successfully sent |%d| bytes trying to send rest |%s|.\n\n", logHead(), numBytesWrote, inputLeft );
		}
		
		FD_ZERO( &wfds );
		FD_SET( sock, &wfds );
		tv.tv_sec = 0;
		tv.tv_usec = 100000;
		select( 0 + sock, NULL, &wfds, NULL, &tv);
	}
	
	fprintf( logger, "%s Waiting for responses.\n\n", logHead() );
	
	inputBuf[ 0 ] = '\0';
	inputMore = inputBuf;
	inputBufLength = 0;
	timeOut = 200;
	
	while( 1 )
	{
		if( timeOut-- <= 0 )
		{
			snprintf( errBuf, BUF_LIMIT, "ERROR :: Timed out trying to get a full message from game. Only got |%s|.", inputBuf );
			gameDie( errBuf );
			return 1;
		}
		
		curBytesRead = read( sock, inputMore, BUF_LIMIT - inputBufLength );
		
		if( curBytesRead == 0 )
		{
			fprintf( logger, "%s Pipe closed. End this transmission.\n\n", logHead() );
			break;
		}
		else if( curBytesRead == -1 )
		{
			if(  ( errno == EAGAIN ) || ( errno == EWOULDBLOCK ) || ( errno == EINTR )  )
			{
				// recoverable error
			}
			else
			{
				fprintf( logger, "%s Unrecoverable error, was |%s|. End this transmission.\n\n", logHead(), strerror( errno ) );
				break;
			}
		}
		else
		{
			inputMore += curBytesRead;
			inputBufLength += curBytesRead;
			*inputMore = '\0';
			fprintf( logger, "%s Got more bytes back, buffer is now |%s|.\n\n", logHead(), inputBuf );
			
			inputLeft = inputBuf;
			while( inputLeft < inputMore )
			{
				if( *inputLeft == '\n' )
				{
					*inputLeft = '\0';
					fprintf( logger, "%s Got back complete commmand from server |%s|.\n\n", logHead(), inputBuf );
					sendChunkedMessage( inputBuf );
					timeOut = 200;
					
					inputMore = inputBuf;
					inputLeft++;
					inputBufLength = 0;
					while( *inputLeft != '\0')
					{
						*inputMore++ = *inputLeft++;
						inputBufLength++;
					}
					
					*inputMore = '\0';
					inputLeft = inputBuf;
				}
				
				inputLeft++;
			}
			
			if( inputBufLength == BUF_LIMIT )
			{
				snprintf( errBuf, BUF_LIMIT, "ERROR :: Buffer out of space!!!" );
				gameDie( errBuf );
				return 1;
			}
		}
		
		FD_ZERO( &rfds );
		FD_SET( sock, &rfds );
		tv.tv_sec = 0;
		tv.tv_usec = 100000;
		select( sock + 1, &rfds, NULL, NULL, &tv );
	}
	
	// end the response
	endChunkedTransmission();
	
	//printStopWatch( "Done with test" );
	
	close( sock );
	return 0;
}

void printStopWatch( const char * message )
{
	static long lastTime = 0;
	struct timespec tms;
	long microsec = 0;
	long thisTime = 0;
	
	// try to get the time or return.
	if (  clock_gettime( CLOCK_REALTIME,&tms )  ) 
	{
		return;
	}
	
	thisTime = tms.tv_sec * 1000000;
	thisTime += tms.tv_nsec/1000;
	
	if( lastTime == 0 )
	{
		lastTime = thisTime;
		return;
	}
	
	microsec = thisTime - lastTime;
	
	fprintf( logger, "%s %s took |%ld|us\n\n", logHead(), message, microsec );
	
	lastTime = thisTime;
	
	return;
}

char * logHead()
{
	static char logHead[ SMALL_BUF_SIZE ];
	
	time_t rawtime;
	struct tm *info;
	
	int offset = 0;
	logHead[0] = '\0';
	logHead[ SMALL_BUF_LIMIT ] = '\0';
	
	time( &rawtime );
	
	info = localtime( &rawtime );
	
	offset = strftime( logHead , SMALL_BUF_LIMIT, "%F %T", info);
	
	snprintf( logHead + offset, SMALL_BUF_LIMIT, " :: %d :: %s ::", getpid(), progname );
	
	return logHead;
}

void printBadHeader()
{
	printf( "Status: 503 Game might be down\r\n" );
    printf( "Content-Type: application/json; charset=ISO-8859-1\r\n" );
    printf( "Transfer-Encoding: chunked\r\n" );
    printf( "\r\n" );
}

void earlyDie( const char * message )
{
	printBadHeader();
	
	gameDie( message );
}

void gameDie( const char * message )
{
	char buffer[BIG_BUF_SIZE];
	
	if( logger != NULL )
	{
		fprintf( logger, "%s %s\n\n", logHead(), message );
	}
	
	// close the socket if it is open
	if( sock >= 0 )
	{
		close( sock );
	}
	
	// format a JSON error message
	snprintf( buffer, BUF_LIMIT, "{\"name\":\"ERROR\",\"display\":0,\"message\":\"%s\"}", message );
	
	// make sure it got NULL terminated
	buffer[ BUF_LIMIT ] = '\0';
	
	sendChunkedMessage( buffer );
	
	if( sendBadGameToken )
	{
		snprintf( buffer, BUF_LIMIT, "{\"name\":\"badGameToken\"}" );
		buffer[ BUF_LIMIT ] = '\0';
		sendChunkedMessage( buffer );
	}
	
	endChunkedTransmission();
	
	return;
}

void unTaint( char * message)
{
	unsigned int length = strlen( message );
	
	for( unsigned int i = 0; i < length; i++ )
	{
		if( message[i] == '\n' )
		{
			message[i] = '*';
		}
		// change <== to <*= and ==> to =*>
		else if( ( i >= 2 ) && ( message[i - 1] == '=' ) )
		{
			if( ( message[i - 2] == '<' ) && ( message[i] == '=' ) )
			{
				message[i - 1] = '*';
			}
			else if( ( message[i - 2] == '=' ) && ( message[i] == '>' ) )
			{
				message[i - 1] = '*';
			}
		}
	}
	
	return;
}

void sendChunkedMessage( char * message )
{
	unTaint( message );
	
	unsigned int length = strlen( message ) + 6;
	
	printf( "%x\r\n<==%s==>\r\n", length, message );
	
	return;
}

void endChunkedTransmission()
{
	printf( "0\r\n\r\n" );
	
	return;
}
