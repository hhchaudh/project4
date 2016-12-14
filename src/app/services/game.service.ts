import {Injectable} from '@angular/core';
import {User} from "../models/user";
import {Message} from "../models/message";
import {Subject, Observable} from "rxjs";


@Injectable()
export class GameService {

  userName:string = "";
  currentStatus:string = "";
  currentStatusSubject: Subject<string> = new Subject<string>();
  keepStreamsGoing = true;
  times = 0;
  total = 0;
  jObj = {j_last_index: 0};
  token = 0;
  noSuchUser: boolean = false;
  userCreated: boolean = false;
  users: User[];
  players: User[];
  messages: Message[] = [];
  lastMessage: Message;
  gameToken = 0;
  blobs = [];
  gameFrame = -1;
  needsRendered = 0;
  countDown = 0;
  leftHappy = 0;
  rightHappy = 0;
  winner = "None";
  displayWinner = 0;
  p1wins = 0;
  p1losses = 0;
  p2wins = 0;
  p2losses = 0;
  newFrameRequest = 0;
  canvasLeft: HTMLCanvasElement;
  canvasRight: HTMLCanvasElement;
  contextLeft: CanvasRenderingContext2D;
  contextRight: CanvasRenderingContext2D;
  blackNormalBlob: HTMLImageElement = new Image();
  blueNormalBlob: HTMLImageElement = new Image();
  yellowNormalBlob: HTMLImageElement = new Image();
  redNormalBlob: HTMLImageElement = new Image();
  purpleNormalBlob: HTMLImageElement = new Image();
  greenNormalBlob: HTMLImageElement = new Image();

  constructor() {
    this.blackNormalBlob.src = "./assets/game-img/blob-boulder.png";
    this.blueNormalBlob.src = "./assets/game-img/blob-blue.png";
    this.yellowNormalBlob.src = "./assets/game-img/blob-yellow.png";
    this.redNormalBlob.src = "./assets/game-img/blob-red.png";
    this.purpleNormalBlob.src = "./assets/game-img/blob-purple.png";
    this.greenNormalBlob.src = "./assets/game-img/blob-green.png";
  }

  setUserName(name:string) {
    this.userName = name;
  }

  setCurrentStatus(status: string) {
    this.currentStatus = status;
    this.currentStatusSubject.next(status);
  }

  getCurrentStatus(): Observable<string> {
    return this.currentStatusSubject.asObservable();
  }

  setCanvas(gameCanvasLeft: HTMLCanvasElement, gameCanvasRight: HTMLCanvasElement) {
    this.canvasLeft = gameCanvasLeft;
    this.contextLeft = this.canvasLeft.getContext("2d");

    this.contextLeft.fillStyle = "black";
    this.contextLeft.fillRect(0, 0, 320, 240);

    this.canvasRight = gameCanvasRight;
    this.contextRight = this.canvasRight.getContext("2d");

    this.contextRight.fillStyle = "black";
    this.contextRight.fillRect(0, 0, 120, 240);
  }


  setReady() {
    if (this.gameToken === 0) {
      return;
    }

    let setReadyData = JSON.stringify({"name": "setReady", "where": this.gameToken, "userToken": this.token});
    this.sendCommand("setReady", setReadyData);
  }


  newGame() {
    if (this.gameToken === 0) {
      return;
    }

    let newGameData = JSON.stringify({"name": "newGame", "where": this.gameToken, "userToken": this.token});
    this.sendCommand("newGame", newGameData);
  }

  newFrame(jsonData) {
    if (!jsonData.frame) {
      console.log("Error: no frame received!!!");
      return;
    }

    this.gameFrame = jsonData.frame - 1;
    this.newFrameRequest = 0;
    this.blobs = [];

    this.updateFrame(jsonData);
  }

  updateFrame(jsonData) {
    if (!jsonData.frame) {
      console.log("Error: no frame received!!!");
      return;
    }

    let frame = jsonData.frame;

    if ((frame - 1) != this.gameFrame) {
      console.log("Error: out of sync!!!");
      this.getNewGameFrame();
      return;
    }

    this.gameFrame = frame;

    if (jsonData.countDown != undefined) {
      this.countDown = jsonData.countDown;
    }

    if (jsonData.player && jsonData.player.left && ( jsonData.player.left.happy != undefined )) {
      this.leftHappy = jsonData.player.left.happy;
    }
    if (jsonData.player && jsonData.player.right && ( jsonData.player.right.happy != undefined )) {
      this.rightHappy = jsonData.player.right.happy;
    }

    if (jsonData.winner != undefined) {
      this.winner = jsonData.winner;
    }

    if (jsonData.displayWinner != undefined) {
      this.displayWinner = jsonData.displayWinner
    }

    if (jsonData.blobs) {
      for (let i = 0; i < jsonData.blobs.length; i++) {
        let index = jsonData.blobs[i].id;
        //if( index == 1 )
        //{
        //console.log( "got blob 1 frame = " + jsonData.blobs[i].frame + " color is " + jsonData.blobs[i].color + " side is " + jsonData.blobs[i].side + " ypos " + jsonData.blobs[i].yPos + " xpos " + jsonData.blobs[i].xPos );
        //}
        this.blobs[index] = {};
        this.blobs[index].frame = jsonData.blobs[i].frame;
        this.blobs[index].color = jsonData.blobs[i].color;
        this.blobs[index].side = jsonData.blobs[i].side;
        this.blobs[index].yPos = jsonData.blobs[i].yPos;
        this.blobs[index].xPos = jsonData.blobs[i].xPos;
      }
    }

    this.needsRendered = 1;
  }

  renderFrame() {
    this.contextLeft.fillStyle = "grey";
    this.contextLeft.fillRect(0, 0, 320, 240);

    this.contextRight.fillStyle ="grey";
    this.contextRight.fillRect(0, 0, 120, 240);

    // this.contextLeft.fillStyle = "black";
    // // boarders
    // this.contextLeft.fillRect(120, 0, 3, 240);
    // this.contextLeft.fillRect(197, 0, 3, 240);
    //
    // // outter boxs next
    // this.contextLeft.fillRect(126, 95, 28, 50);
    // this.contextLeft.fillRect(166, 95, 28, 50);
    //
    // // outter boxes happy
    // this.contextLeft.fillRect(120, 40, 65, 35);
    //
    // this.contextLeft.fillStyle = "grey";
    // // inner boxes for next
    // this.contextLeft.fillRect(128, 97, 24, 46);
    // this.contextLeft.fillRect(168, 97, 24, 46);
    //
    // // inner boxes for happy
    // this.contextLeft.fillRect(123, 43, 59, 29);
    //
    // this.contextLeft.fillStyle = "black";
    // this.contextLeft.font = "20px Georgia";
    if (this.countDown > 0) {
      let countText = "";
      if (this.countDown == 1) {
        countText = "GO";
      }
      else {
        countText = " " + ( this.countDown - 1 );
      }

      // this.contextLeft.fillText(countText, 145, 200);
    }

    let happyText = "";
    if (this.leftHappy == 0) {
      happyText = "happy";
    }
    else if (this.leftHappy == 1) {
      happyText = "serious";
    }
    else if (this.leftHappy == 2) {
      happyText = "worried";
    }
    else {
      happyText = "crying";
    }

    if (( this.displayWinner )) {
      if (this.winner == "left") {
        happyText = "happy";
      }
      else {
        happyText = "crying";
      }
    }

    // this.contextLeft.fillText(happyText, 130, 60);

    if (this.rightHappy == 0) {
      happyText = "happy";
    }
    else if (this.rightHappy == 1) {
      happyText = "serious";
    }
    else if (this.rightHappy == 2) {
      happyText = "worried";
    }
    else {
      happyText = "crying";
    }

    if (( this.displayWinner )) {
      if (this.winner == "right") {
        happyText = "happy";
      }
      else {
        happyText = "crying";
      }
    }

    // this.contextLeft.fillText(happyText, 130, 180);


    for (let i = 0; i < this.blobs.length; i++) {
      let blob = this.blobs[i];
      if (blob && blob.frame != "vanish") {
        let context:CanvasRenderingContext2D = this.contextLeft;
        if (blob.side == "right") {
          context = this.contextRight;
        }

        let xPos = (   blob.xPos * 20 ) / 1000;
        let yPos = ( ( blob.yPos - 2000 ) * 20 ) / 1000;
        let color = blob.color;

        if (blob.frame == "normal") {
          this.drawBlobNormal(context, xPos, yPos, color);
        }
        else if (blob.frame == "smushed") {
          this.drawBlobSmushed(context, xPos, yPos, color);
        }
        else if (blob.frame == "vertSmushed") {
          this.drawBlobVertSmushed(context, xPos, yPos, color);
        }
        else if (blob.frame == "bugEye") {
          this.drawBugEye(context, xPos, yPos, color);
        }
        else if (blob.frame == "blow1") {
          this.drawBlow(context, xPos, yPos, color, 1);
        }
        else if (blob.frame == "blow2") {
          this.drawBlow(context, xPos, yPos, color, 2);
        }
        else if (blob.frame == "blow3") {
          this.drawBlow(context, xPos, yPos, color, 3);
        }
        else if (blob.frame == "blow4") {
          this.drawBlow(context, xPos, yPos, color, 4);
        }
        else if (blob.frame == "orb") {
          this.drawOrb(context, xPos, yPos);
        }
        else if (blob.frame == "orbBig") {
          this.drawOrbBig(context, xPos, yPos);
        }
        else if (blob.frame == "joinRight") {
          this.drawJoin(context, xPos, yPos, color, "joinRight");
        }
        else if (blob.frame == "joinRightLeft") {
          this.drawJoin(context, xPos, yPos, color, "joinRightLeft");
        }
        else if (blob.frame == "joinRightUp") {
          this.drawJoin(context, xPos, yPos, color, "joinRightUp");
        }
        else if (blob.frame == "joinRightDown") {
          this.drawJoin(context, xPos, yPos, color, "joinRightDown");
        }
        else if (blob.frame == "joinRightLeftUp") {
          this.drawJoin(context, xPos, yPos, color, "joinRightLeftUp");
        }
        else if (blob.frame == "joinRightLeftDown") {
          this.drawJoin(context, xPos, yPos, color, "joinRightLeftDown");
        }
        else if (blob.frame == "joinRightUpDown") {
          this.drawJoin(context, xPos, yPos, color, "joinRightUpDown");
        }
        else if (blob.frame == "joinRightLeftUpDowm") {
          this.drawJoin(context, xPos, yPos, color, "joinRightLeftUpDowm");
        }
        else if (blob.frame == "joinLeft") {
          this.drawJoin(context, xPos, yPos, color, "joinLeft");
        }
        else if (blob.frame == "joinLeftUp") {
          this.drawJoin(context, xPos, yPos, color, "joinLeftUp");
        }
        else if (blob.frame == "joinLeftDown") {
          this.drawJoin(context, xPos, yPos, color, "joinLeftDown");
        }
        else if (blob.frame == "joinLeftUpDown") {
          this.drawJoin(context, xPos, yPos, color, "joinLeftUpDown");
        }
        else if (blob.frame == "joinUp") {
          this.drawJoin(context, xPos, yPos, color, "joinUp");
        }
        else if (blob.frame == "joinUpDown") {
          this.drawJoin(context, xPos, yPos, color, "joinUpDown");
        }
        else if (blob.frame == "joinDown") {
          this.drawJoin(context, xPos, yPos, color, "joinDown");
        }
        // else if (blob.frame == "que1") {
        //   if (blob.side == "left") {
        //     this.drawBlobNormal(this.contextLeft, 130, 120, color);
        //   }
        //   else {
        //     this.drawBlobNormal(this.contextLeft, 170, 120, color);
        //   }
        // }
        // else if (blob.frame == "que2") {
        //   if (blob.side == "left") {
        //     this.drawBlobNormal(this.contextLeft, 130, 100, color);
        //   }
        //   else {
        //     this.drawBlobNormal(this.contextLeft, 170, 100, color);
        //   }
        // }
      }

      if (this.displayWinner) {
        // this.contextLeft.fillStyle = "black";
        // this.contextLeft.font = "20px Georgia";

        let winText = "Loser!!!";
        if (this.winner == "left") {
          winText = "Winner!!!";
        }
        // this.contextLeft.fillText(winText, 40, 40);
        // this.contextLeft.fillText(this.p1wins + " - " + this.p1losses, 40, 70);

        winText = "Loser!!!";
        if (this.winner == "right") {
          winText = "Winner!!!";
        }
        // this.contextLeft.fillText(winText, 240, 40);
        // this.contextLeft.fillText(this.p2wins + " - " + this.p2losses, 240, 70);
      }

      this.needsRendered = 0;
    }
  }

  getNewGameFrame() {
    if (this.gameToken === 0) {
      console.log("Requested a new game frame but there is no game!!!");
      return;
    }

    if (this.newFrameRequest != 0) {
      return;
    }

    let sendGetNewGameFrameData = JSON.stringify({
      "name": "getNewGameFrame",
      "where": this.gameToken,
      "userToken": this.token
    });
    this.sendCommand("newGameFrame", sendGetNewGameFrameData);
    this.newFrameRequest = 1;
  }

  updateUserToken(jsonData) {
    console.log("Logged in Successfully!!!");
    if (!jsonData.token) {
      console.log("Error: we did not get back a user token though!!!");
      return;
    }

    this.token = jsonData.token;

    this.startStreams("0000000000");
  }

  updateGameToken(jsonData) {
    console.log("Game Created!");
    if (!jsonData.token) {
      console.log("No game token found!");
      return;
    }

    this.gameToken = jsonData.token;

    this.gameFrame = -1;

    this.startStreams(this.gameToken);
  }

  resetGameToken() {
    this.gameToken = 0;
  }

  updateLobby(jsonData) {
    if (!jsonData.users) {
      console.log("Error: no users found!");
      return;
    }

    let tempUserArray = [];
    for (let user of jsonData.users) {
      let tempUser: User = new User();
      tempUser.totalWins = user.totalWins;
      tempUser.totalLosses = user.totalLosses;
      tempUser.status = user.status;
      tempUser.name = user.name;
      if(tempUser.name === this.userName) {
        this.setCurrentStatus(tempUser.status);
      }
      tempUserArray.push(tempUser);
    }

    if (this.users == null || (tempUserArray.length != this.users.length)) {
      this.users = tempUserArray;
    } else {
      for (let newUser of tempUserArray) {
        let sameUsersAndStatus: boolean = false;

        for (let user of this.users) {
          if (user.name === newUser.name) {
            if (user.status === newUser.status) {
              sameUsersAndStatus = true;
            }
          }
        }

        if (!sameUsersAndStatus) {
          this.users = tempUserArray;
          break;
        }
      }
    }
  }

  updatePlayerInfo(jsonData) {
    if (!jsonData.users) {
      console.log("Error: no users found!");
      return;
    }

    let tempUserArray = [];
    for (let user of jsonData.users) {
      let tempUser: User = new User();
      tempUser.wins = user.wins;
      tempUser.losses = user.losses;
      tempUser.status = user.status;
      tempUser.name = user.name;
      tempUser.ready = user.ready;
      tempUserArray.push(tempUser);
    }

    // if (this.players == null || (tempUserArray.length != this.players.length)) {
    //   this.players = tempUserArray;
    // } else {
    //   for (let newUser of tempUserArray) {
    //     let sameUsersAndStatus: boolean = false;
    //
    //     for (let currentUser of this.players) {
    //       if (currentUser.name === newUser.name && currentUser.status === newUser.status) {
    //         if (currentUser.status === newUser.status) {
    //           if (currentUser.ready === newUser.ready) {
    //             sameUsersAndStatus = true;
    //           }
    //         }
    //       }
    //     }
    //     if (!sameUsersAndStatus) {
    //       this.players = tempUserArray;
    //       this.p1wins = this.players[0].wins;
    //       this.p1losses = this.players[0].losses;
    //       this.p2wins = this.players[1].wins;
    //       this.p2losses = this.players[1].losses;
    //       break;
    //     }
    //   }
    // }

    this.players = tempUserArray;
    this.p1wins = this.players[0].wins;
    this.p1losses = this.players[0].losses;
    this.p2wins = this.players[1].wins;
    this.p2losses = this.players[1].losses;
  }

  getUsers() {
    return this.users;
  }

  getPlayers() {
    return this.players;
  }

  getMessages() {
    return this.messages;
  }

  resetMessages() {
    this.messages = [];
  }

  createGame() {
    if (this.token === 0) {
      return 0;
    }

    let createGameData = JSON.stringify({"name": "createGame", "where": "0000000000", "userToken": this.token});
    this.sendCommand("createGame", createGameData);
    this.resetMessages();
  }

  joinGame(opposingPlayer) {
    if (this.token === 0) {
      return 0;
    }

    let joinGameData = JSON.stringify({"name": "joinGame", "where": "0000000000", "userToken": this.token, "userName": opposingPlayer});
    this.sendCommand("joinGame", joinGameData);
    this.resetMessages();
  }

  getTimeString() {
    let d = new Date();
    return (d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds());
  }

  getUserToken() {
    return this.token;
  }

  resetUserToken() {
    this.token = 0;
  }

  error(jsonData) {
    if (!jsonData.message) {
      console.log("Error: an error command needs to have a message!!!");
      return;
    }

    if (jsonData.display) {
      this.noSuchUser = true;
    }
    console.log("Error from server says: |" + jsonData.message + "|");
  }

  newMessage(jsonData) {
    if (!jsonData.message) {
      console.log("Error: a message command needs to have a message!!!");
      return;
    }

    if (!jsonData.userName) {
      console.log("Error: a message command needs to have a player!!!");
      return;
    }

    let tempMessage: Message = new Message();
    tempMessage.message = jsonData.message;
    tempMessage.userName = jsonData.userName;

    if (this.messages.length === 0) {
      this.messages.unshift(tempMessage);
    } else if (this.messages.length > 0 && (tempMessage.userName != this.lastMessage.userName || tempMessage.message != this.lastMessage.message)) {
      this.messages.unshift(tempMessage);
    }

    this.lastMessage = new Message();
    this.lastMessage.message = tempMessage.message;
    this.lastMessage.userName = tempMessage.userName;
    console.log(this.messages);
  }

  sendMessage(messageText) {
    if (this.token === 0) {
      return;
    }

    let where = "0000000000";

    if (this.gameToken != 0) {
      where = this.gameToken.toString();
    }

    if (/\S/.test(messageText)) {
      let sendMessageData = JSON.stringify({
        "name": "sendMessage",
        "where": where,
        "userToken": this.token,
        "message": messageText
      });
      this.sendCommand("message", sendMessageData);
    }
  }

  logOff() {
    if (this.token == 0) {
      return;
    }

    let logOffData = JSON.stringify({"name": "logOff", "where": "0000000000", "userToken": this.token});
    this.sendCommand("logOff", logOffData);
    this.resetUserToken();
    this.resetMessages();
  }

  gameLogOff() {
    if (this.token === 0 || this.gameToken === 0) {
      return;
    }

    let logOffData = JSON.stringify({"name": "logOff", "where": this.gameToken, "userToken": this.token});
    this.sendCommand("logOff", logOffData);
    this.resetMessages();
    this.resetGameToken();
  }

  stream_process(streamName, data) {
    let jsonData;

    try {
      jsonData = JSON.parse(data);
    }
    catch (err) {
      console.log(streamName + " : Could not convert data to JSON : |" + data + "| : " + this.getTimeString());
      return;
    }

    //console.log( streamName + " : |" + data + "| : " + getTimeString() );

    if (!jsonData.name) {
      console.log("Error: command needs to have a name!!!");
      return;
    }

    if (jsonData.name == "ERROR") {
      this.error(jsonData);
      return;
    }

    if (jsonData.name == "newMessage") {
      this.newMessage(jsonData);
      return;
    }

    // if (jsonData.name == "updateGameInfo") {
    //   this.updateGameInfo(jsonData);
    //   return;
    // }

    if (jsonData.name == "userToken") {
      this.updateUserToken(jsonData);
      return;
    }

    if (jsonData.name === "updateLobbyInfo") {
      this.updateLobby(jsonData);
      return;
    }

    if (jsonData.name === "updatePlayerInfo") {
      this.updatePlayerInfo(jsonData);
      return;
    }

    if (jsonData.name === "gameToken") {
      this.updateGameToken(jsonData);
      return;
    }

    if (jsonData.name === "newFrame") {
      this.newFrame(jsonData);
    }

    if (jsonData.name === "updateFrame") {
      this.updateFrame(jsonData);
      return;
    }
  }

  sendCommand(stream_name, postData) {
    let d = new Date();
    let xhttp = new XMLHttpRequest();
    //xhttp.open("POST", "https://people.eecs.ku.edu/~jfustos/cgi-bin/ticTacToeCommand.cgi", true);
    xhttp.open("POST", "https://people.eecs.ku.edu/~jfustos/cgi-bin/altStackAPI.cgi", true);
    this.jObj.j_last_index = 0;
    let j_stream_name = stream_name;
    let packetStart = d.getTime();

    xhttp.onprogress = (event) => {
      let last_index = this.jObj.j_last_index;

      let curr_index = xhttp.responseText.length;

      if (last_index >= curr_index) return;

      let gameDataFormat = /<==(.*?)==>/;
      let curr_response = xhttp.responseText.substring(last_index, curr_index);
      let match: any;

      while (match = gameDataFormat.exec(curr_response)) {
        // This is a valid data member comming back from the server, do stuff with it.
        this.stream_process(j_stream_name, match[1]);

        // The browser might have combined more than  1 response, so don't miss it, try for more.

        let step = match.index + match[0].length;
        curr_response = curr_response.substring(step);
        this.jObj.j_last_index += step;
      }

      if (this.needsRendered) {
        this.renderFrame();
      }
    };

    xhttp.onreadystatechange = () => {
      if (xhttp.readyState == 4 && xhttp.status == 200) {
        let d = new Date();
        console.log("Connection died OK though!!!" + " : " + this.getTimeString());
        this.times++;
        let totalTime = d.getTime() - packetStart;
        this.total += totalTime;
        let average = this.total / this.times;
        console.log("took: " + totalTime + " average: " + average);

        if (j_stream_name === "stream1" || j_stream_name === "stream2" || j_stream_name === "stream3" || j_stream_name === "stream4") {
          if (this.gameToken === 0 && (j_stream_name === "stream3" || j_stream_name === "stream4")) {
            return;
          }

          if (this.token === 0) {
            return;
          }

          if (this.keepStreamsGoing) {
            this.sendCommand(j_stream_name, postData);
          }
        }
      }
      else if (xhttp.readyState == 4 && xhttp.status == 503) {
        console.log("Problem with game " + " : " + xhttp.responseText + " : " + this.getTimeString());
      }
    };

    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(postData);
  }

  startStreams(where) {
    let getStreamData = JSON.stringify({"name": "getGameStream", "where": where, "userToken": this.token});
    this.keepStreamsGoing = true;

    if (where === "0000000000") {
      this.sendCommand("stream1", getStreamData);
      this.sendCommand("stream2", getStreamData);
    } else {
      console.log(getStreamData);
      this.sendCommand("stream3", getStreamData);
      this.sendCommand("stream4", getStreamData);
    }

  }

  getNewFrame() {
    if (this.gameToken == 0) {
      console.log("Requested a new game frame but there is no game!!!");
      return;
    }

    if (this.newFrameRequest != 0) {
      return;
    }

    let sendGetNewGameFrameDatat = JSON.stringify({
      "name": "getNewGameFrame",
      "where": this.gameToken,
      "userToken": this.token
    });
    this.sendCommand("newGameFrame", sendGetNewGameFrameDatat);
    this.newFrameRequest = 1;
  }

  drawOrb(myContext, xPos, yPos) {
    myContext.fillStyle = "white";
    myContext.fillRect(xPos + 4, yPos + 4, 12, 12);
  }

  drawOrbBig(myContext, xPos, yPos) {
    myContext.fillStyle = "white";
    myContext.fillRect(xPos, yPos, 20, 20);
  }

  drawBugEye(myContext, xPos, yPos, color) {
    myContext.fillStyle = color;
    myContext.fillRect(xPos, yPos, 20, 20);
    myContext.fillStyle = "white";
    myContext.fillRect(xPos + 1, yPos + 2, 8, 10);
    myContext.fillRect(xPos + 11, yPos + 2, 8, 10);
    myContext.fillStyle = "black";
    myContext.fillRect(xPos + 3, yPos + 6, 4, 4);
    myContext.fillRect(xPos + 13, yPos + 6, 4, 4);
  }

  drawBlow(myContext, xPos, yPos, color, frame) {
    myContext.fillStyle = color;
    if (frame == 1) {
      myContext.fillRect(xPos + 5, yPos + 5, 10, 10);
    }
    else if (frame == 2) {
      myContext.fillRect(xPos, yPos, 8, 8);
      myContext.fillRect(xPos + 12, yPos, 8, 8);
      myContext.fillRect(xPos, yPos + 12, 8, 8);
      myContext.fillRect(xPos + 12, yPos + 12, 8, 8);
    }
    else if (frame == 3) {
      myContext.fillRect(xPos - 3, yPos - 3, 5, 5);
      myContext.fillRect(xPos + 19, yPos - 3, 5, 5);
      myContext.fillRect(xPos - 3, yPos + 19, 5, 5);
      myContext.fillRect(xPos + 19, yPos + 19, 5, 5);
    }
    else if (frame == 4) {
      myContext.fillRect(xPos - 6, yPos - 6, 3, 3);
      myContext.fillRect(xPos + 23, yPos - 6, 3, 3);
      myContext.fillRect(xPos - 6, yPos + 23, 3, 3);
      myContext.fillRect(xPos + 23, yPos + 23, 3, 3);
    }
  }

  drawBlobNormal(myContext, xPos, yPos, color) {
    if(color === "black") {
      myContext.drawImage(this.blackNormalBlob, xPos + 2, yPos + 2, 16, 16);
    } else if(color === "yellow") {
      myContext.drawImage(this.yellowNormalBlob, xPos + 2, yPos + 2, 16, 16);
    } else if(color === "blue") {
      myContext.drawImage(this.blueNormalBlob, xPos + 2, yPos + 2, 16, 16);
    } else if(color === "red") {
      myContext.drawImage(this.redNormalBlob, xPos + 2, yPos + 2, 16, 16);
    } else if(color === "purple") {
      myContext.drawImage(this.purpleNormalBlob, xPos + 2, yPos + 2, 16, 16);
    } else if(color === "green") {
      myContext.drawImage(this.greenNormalBlob, xPos + 2, yPos + 2, 16, 16);
    } else {
      myContext.fillStyle = color;
      myContext.fillRect(xPos + 2, yPos + 2, 16, 16);
    }
  }

  drawBlobSmushed(myContext, xPos, yPos, color) {
    myContext.fillStyle = color;
    myContext.fillRect(xPos, yPos + 8, 20, 12);
  }

  drawBlobVertSmushed(myContext, xPos, yPos, color) {
    myContext.fillStyle = color;
    myContext.fillRect(xPos + 4, yPos, 12, 20);
  }

  drawJoin(myContext, xPos, yPos, color, name) {
    myContext.fillStyle = color;
    this.drawBlobNormal(myContext, xPos, yPos, color);

    if (name == "joinRight") {
      myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
    }
    else if (name == "joinRightLeft") {
      myContext.fillRect(xPos, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
    }
    else if (name == "joinRightUp") {
      myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 7, yPos, 6, 2);
    }
    else if (name == "joinRightDown") {
      myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
    }
    else if (name == "joinRightLeftUp") {
      myContext.fillRect(xPos, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 7, yPos, 6, 2);
    }
    else if (name == "joinRightLeftDown") {
      myContext.fillRect(xPos, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
    }
    else if (name == "joinRightUpDown") {
      myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 7, yPos, 6, 2);
      myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
    }
    else if (name == "joinRightLeftUpDown") {
      myContext.fillRect(xPos, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 7, yPos, 6, 2);
      myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
    }
    else if (name == "joinLeft") {
      myContext.fillRect(xPos, yPos + 7, 2, 6);
    }
    else if (name == "joinLeftUp") {
      myContext.fillRect(xPos, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 7, yPos, 6, 2);
    }
    else if (name == "joinLeftDown") {
      myContext.fillRect(xPos, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
    }
    else if (name == "joinLeftUpDown") {
      myContext.fillRect(xPos, yPos + 7, 2, 6);
      myContext.fillRect(xPos + 7, yPos, 6, 2);
      myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
    }
    else if (name == "joinUp") {
      myContext.fillRect(xPos + 7, yPos, 6, 2);
    }
    else if (name == "joinUpDown") {
      myContext.fillRect(xPos + 7, yPos, 6, 2);
      myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
    }
    else if (name == "joinDown") {
      myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
    }
  }


  stopStreams() {
    this.keepStreamsGoing = false;
  }
}
