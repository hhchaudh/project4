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
  messages: Message[] = [];
  gameToken = 0;

  constructor() {
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

  getUsers() {
    return this.users;
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

    this.messages.unshift(tempMessage);
  }

  sendMessage(messageText) {
    if(this.token === 0) {
      return;
    }

    let where = "0000000000";

    if(this.gameToken != 0) {
      where = this.gameToken.toString();
    }

    if(/\S/.test(messageText)) {
      let sendMessageData = JSON.stringify({"name":"sendMessage", "where":where, "userToken":this.token, "message":messageText});
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
    if(this.token === 0 || this.gameToken === 0) {
      return;
    }

    let logOffData = JSON.stringify({"name":"logOff", "where":this.gameToken, "userToken":this.token});
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

    if (jsonData.name === "gameToken") {
      this.updateGameToken(jsonData);
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
    let getStreamData = JSON.stringify({"name":"getGameStream", "where":where, "userToken":this.token });
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


  stopStreams() {
    this.keepStreamsGoing = false;
  }
}
