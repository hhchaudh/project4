import {Injectable} from '@angular/core';
import {User} from "../models/user";
import {Message} from "../models/message";

@Injectable()
export class GameService {
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
  canvas: HTMLCanvasElement;
  gameContext: CanvasRenderingContext2D;
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

  constructor() {
  }

  setCanvas(gameCanvas: HTMLCanvasElement) {
    this.canvas = gameCanvas;
    this.gameContext = this.canvas.getContext("2d");

    this.gameContext.fillStyle = "black";
    this.gameContext.fillRect(0, 0, 320, 240);
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
    this.gameContext.fillStyle = "grey";
    this.gameContext.fillRect(0, 0, 320, 240);

    this.gameContext.fillStyle = "black";
    // boarders
    this.gameContext.fillRect(120, 0, 3, 240);
    this.gameContext.fillRect(197, 0, 3, 240);

    // outter boxs next
    this.gameContext.fillRect(126, 95, 28, 50);
    this.gameContext.fillRect(166, 95, 28, 50);

    // outter boxes happy
    this.gameContext.fillRect(120, 40, 65, 35);

    this.gameContext.fillStyle = "grey";
    // inner boxes for next
    this.gameContext.fillRect(128, 97, 24, 46);
    this.gameContext.fillRect(168, 97, 24, 46);

    // inner boxes for happy
    this.gameContext.fillRect(123, 43, 59, 29);

    this.gameContext.fillStyle = "black";
    this.gameContext.font = "20px Georgia";
    if (this.countDown > 0) {
      let countText = "";
      if (this.countDown == 1) {
        countText = "GO";
      }
      else {
        countText = " " + ( this.countDown - 1 );
      }

      this.gameContext.fillText(countText, 145, 200);
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

    this.gameContext.fillText(happyText, 130, 60);

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

    this.gameContext.fillText(happyText, 130, 180);


    for (let i = 0; i < this.blobs.length; i++) {
      let blob = this.blobs[i];
      if (blob && blob.frame != "vanish") {
        let offset = 0;
        if (blob.side == "right") {
          offset = 200;
        }

        let xPos = (   blob.xPos * 20 ) / 1000;
        let yPos = ( ( blob.yPos - 2000 ) * 20 ) / 1000;
        let color = blob.color;
        xPos += offset;

        if (blob.frame == "normal") {
          this.drawBlobNormal(this.gameContext, xPos, yPos, color);
        }
        else if (blob.frame == "smushed") {
          this.drawBlobSmushed(this.gameContext, xPos, yPos, color);
        }
        else if (blob.frame == "vertSmushed") {
          this.drawBlobVertSmushed(this.gameContext, xPos, yPos, color);
        }
        else if (blob.frame == "bugEye") {
          this.drawBugEye(this.gameContext, xPos, yPos, color);
        }
        else if (blob.frame == "blow1") {
          this.drawBlow(this.gameContext, xPos, yPos, color, 1);
        }
        else if (blob.frame == "blow2") {
          this.drawBlow(this.gameContext, xPos, yPos, color, 2);
        }
        else if (blob.frame == "blow3") {
          this.drawBlow(this.gameContext, xPos, yPos, color, 3);
        }
        else if (blob.frame == "blow4") {
          this.drawBlow(this.gameContext, xPos, yPos, color, 4);
        }
        else if (blob.frame == "orb") {
          this.drawOrb(this.gameContext, xPos, yPos);
        }
        else if (blob.frame == "orbBig") {
          this.drawOrbBig(this.gameContext, xPos, yPos);
        }
        else if (blob.frame == "joinRight") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinRight");
        }
        else if (blob.frame == "joinRightLeft") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinRightLeft");
        }
        else if (blob.frame == "joinRightUp") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinRightUp");
        }
        else if (blob.frame == "joinRightDown") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinRightDown");
        }
        else if (blob.frame == "joinRightLeftUp") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinRightLeftUp");
        }
        else if (blob.frame == "joinRightLeftDown") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinRightLeftDown");
        }
        else if (blob.frame == "joinRightUpDown") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinRightUpDown");
        }
        else if (blob.frame == "joinRightLeftUpDowm") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinRightLeftUpDowm");
        }
        else if (blob.frame == "joinLeft") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinLeft");
        }
        else if (blob.frame == "joinLeftUp") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinLeftUp");
        }
        else if (blob.frame == "joinLeftDown") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinLeftDown");
        }
        else if (blob.frame == "joinLeftUpDown") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinLeftUpDown");
        }
        else if (blob.frame == "joinUp") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinUp");
        }
        else if (blob.frame == "joinUpDown") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinUpDown");
        }
        else if (blob.frame == "joinDown") {
          this.drawJoin(this.gameContext, xPos, yPos, color, "joinDown");
        }
        else if (blob.frame == "que1") {
          if (blob.side == "left") {
            this.drawBlobNormal(this.gameContext, 130, 120, color);
          }
          else {
            this.drawBlobNormal(this.gameContext, 170, 120, color);
          }
        }
        else if (blob.frame == "que2") {
          if (blob.side == "left") {
            this.drawBlobNormal(this.gameContext, 130, 100, color);
          }
          else {
            this.drawBlobNormal(this.gameContext, 170, 100, color);
          }
        }
      }

      if (this.displayWinner) {
        this.gameContext.fillStyle = "black";
        this.gameContext.font = "20px Georgia";

        let winText = "Loser!!!";
        if (this.winner == "left") {
          winText = "Winner!!!";
        }
        this.gameContext.fillText(winText, 40, 40);
        this.gameContext.fillText(this.p1wins + " - " + this.p1losses, 40, 70);

        winText = "Loser!!!";
        if (this.winner == "right") {
          winText = "Winner!!!";
        }
        this.gameContext.fillText(winText, 240, 40);
        this.gameContext.fillText(this.p2wins + " - " + this.p2losses, 240, 70);
      }

      this.needsRendered = 0;
    }
  }

  getNewGameFrame() {
    if(this.gameToken === 0) {
      console.log("Requested a new game frame but there is no game!!!");
      return;
    }

    if(this.newFrameRequest != 0) {
      return;
    }

    let sendGetNewGameFrameData = JSON.stringify({"name":"getNewGameFrame", "where":this.gameToken, "userToken":this.token});
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
      tempUser.wins = user.wins;
      tempUser.losses = user.losses;
      tempUser.status = user.status;
      tempUser.name = user.name;
      tempUserArray.push(tempUser);
    }

    if (this.users == null || (tempUserArray.length != this.users.length)) {
      this.users = tempUserArray;
    } else {
      for (let newUser of tempUserArray) {
        let sameUsersAndStatus: boolean = false;

        for (let currentUser of this.users) {
          if (currentUser.name === newUser.name) {
            if (currentUser.status === newUser.status) {
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
      tempUserArray.push(tempUser);
    }

    if (this.players == null || (tempUserArray.length != this.players.length)) {
      this.players = tempUserArray;
    } else {
      for (let newUser of tempUserArray) {
        let sameUsersAndStatus: boolean = false;

        for (let currentUser of this.players) {
          if (currentUser.name === newUser.name) {
            if (currentUser.status === newUser.status) {
              sameUsersAndStatus = true;
            }
          }
        }

        if (!sameUsersAndStatus) {
          this.players = tempUserArray;
          break;
        }
      }
    }
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

  startGame = function () {
    return JSON.stringify({"name": "startGame", "player": this.currentPlayer});
  };

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

    let joinGameData = JSON.stringify({
      "name": "joinGame",
      "where": "0000000000",
      "userToken": this.token,
      "userName": opposingPlayer
    });
    this.sendCommand("joinGame", joinGameData);
    this.resetMessages();
  }

  getTimeString() {
    let d = new Date();
    let ret = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
    return ret;
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

  // onSubmit(form:FormGroup) {
  //   let message:string = form.value.message;
  //   if(/\S/.test(message)) {
  //     let sendMessageData = JSON.stringify({
  //       "name": "sendMessage",
  //       "where": "0000000000",
  //       "userToken": this.gameService.token,
  //       "message": message
  //     });
  //     this.gameService.sendCommand("message", sendMessageData);
  //     form.reset();
  //   }
  //
  //   return false;
  // }

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
    xhttp.open("POST", "https://people.eecs.ku.edu/~jfustos/cgi-bin/myTest.cgi", true);
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

    xhttp.onreadystatechange = (event) => {
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
    myContext.fillStyle = color;
    myContext.fillRect(xPos + 2, yPos + 2, 16, 16);
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
