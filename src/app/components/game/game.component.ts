import {Component, OnInit} from '@angular/core';

class boardSpot {
  marked: boolean;
  marker: string;

  constructor() {
    this.marked = false;
    this.marker = "blank";
  }
}

@Component({
  selector: 'game-root',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
  providers: [boardSpot]
})


export class GameComponent implements OnInit {
  keepStreamsGoing = true;
  times = 0;
  total = 0;
  jObj = {j_last_index: 0};
  playerTurn: string = "No One";
  currentPlayer: string = "P2";
  victoryMsg: string;
  boardSpots: boardSpot[][];

  constructor() {
  }

  ngOnInit() {
    this.boardSpots = [];

    for (let i: number = 0; i < 3; i++) {
      this.boardSpots[i] = [];
      for (let j: number = 0; j < 3; j++) {
        this.boardSpots[i][j] = new boardSpot();
      }
    }
  }

  changeIcon(player) {
    // this.currentPlayer = player;
    if (player === 'P2') {
      for (let i: number = 0; i < 3; i++) {
        for (let j: number = 0; j < 3; j++) {
          if (!this.boardSpots[i][j].marked) {
            this.boardSpots[i][j].marker = "O";
          }
        }
      }
    } else {
      for (let i: number = 0; i < 3; i++) {
        for (let j: number = 0; j < 3; j++) {
          if (!this.boardSpots[i][j].marked) {
            this.boardSpots[i][j].marker = "X";
          }
        }
      }
    }
    console.log(this.currentPlayer);
  }

  startGame = function () {
    this.resetBoard();
    return JSON.stringify({"name": "startGame", "player": this.currentPlayer});
  };

  getStreamData = function () {
    return JSON.stringify({"name": "getGameStream", "player": this.currentPlayer});
  };

  resetBoard() {
    for (let i: number = 0; i < 3; i++) {
      for (let j: number = 0; j < 3; j++) {
        this.boardSpots[i][j].marked = false;
        this.boardSpots[i][j].marker = "blank";
      }
    }

    this.changeIcon(this.currentPlayer);
  }

  getTimeString() {
    let d = new Date();
    let ret = d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + ":" + d.getMilliseconds();
    return ret;
  }

  error(jsonData) {
    if (!jsonData.message) {
      console.log("Error: an error command needs to have a message!!!");
      return;
    }

    console.log("Error from server says: |" + jsonData.message + "|");
  }

  // newMessage(jsonData) {
  //   if (!jsonData.message) {
  //     console.log("Error: a message command needs to have a message!!!");
  //     return;
  //   }
  //
  //   if (!jsonData.player) {
  //     console.log("Error: a message command needs to have a player!!!");
  //     return;
  //   }
  //
  //   console.log("MESSAGE from |" + jsonData.player + "| says |" + jsonData.message + "|");
  // }

  updateGameInfo(jsonData) {

    if (jsonData["whosTurn"]) {
      this.playerTurn = jsonData["whosTurn"];
      if (this.playerTurn == "P1") {
        this.playerTurn = "Player 1";
      } else if (this.playerTurn == "P2") {
        this.playerTurn = "Player 2";
      } else {
        this.playerTurn = "No One";
      }
    }
    else {
      console.log("Error: no whosTurn field this update!!!");
    }

    if (jsonData["winner"] && jsonData["status"] === "gameOver") {
      let theVictor = jsonData["winner"];

      if (theVictor === "P1") {
        this.victoryMsg = "Player 1 Wins!";
      } else if (theVictor === "P2") {
        this.victoryMsg = "Player 2 Wins!";
      }
    }
    else if (jsonData["status"] !== "gameOver") {
      this.victoryMsg = "";
    }
    else {
      console.log("Error: no winner field this update!!!");
    }

    if (jsonData["board"]) {
      let board = jsonData["board"];
      if (jsonData["status"]) {
        this.updateBoard(board);
      }
    }
    else {
      console.log("Did not find board!!!");
    }
    //
    console.log("got update");
    return;
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
    // if (jsonData.name == "newMessage") {
    //   newMessage(jsonData);
    //   return;
    // }

    if (jsonData.name == "updateGameInfo") {
      this.updateGameInfo(jsonData);
      return;
    }
  }

  sendCommand(stream_name, postData) {
    let d = new Date();
    let xhttp = new XMLHttpRequest();
    //xhttp.open("POST", "https://people.eecs.ku.edu/~jfustos/cgi-bin/ticTacToeCommand.cgi", true);
    xhttp.open("POST", "https://people.eecs.ku.edu/~jfustos/cgi-bin/ticTacToeCommand.cgi", true);
    this.jObj.j_last_index = 0;
    let j_stream_name = stream_name;
    let packetStart = d.getTime();

    xhttp.onprogress = (event) => {
      let last_index = this.jObj.j_last_index;

      let curr_index = xhttp.responseText.length;

      if (last_index >= curr_index) return;

      let gameDataFormat = /<==(.*?)==>/;
      let curr_response = xhttp.responseText.substring(last_index, curr_index);
      console.log(curr_response);
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

        if (j_stream_name == "stream1" || j_stream_name == "stream2") {
          if (this.keepStreamsGoing) {
            this.sendCommand(j_stream_name, this.getStreamData());
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


  sendMove(row, col) {
    if (!this.boardSpots[row][col].marked) {
      let sendMoveData = JSON.stringify({"name": "move", "player": this.currentPlayer, "row": row, "col": col});
      this.sendCommand("moveStream", sendMoveData);
    }
  }

  startStreams() {
    this.keepStreamsGoing = true;
    this.sendCommand("stream1", this.getStreamData());
    this.sendCommand("stream2", this.getStreamData());
  }

  updateBoard(board) {
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === 'X') {
          this.boardSpots[i][j].marker = 'X';
          this.boardSpots[i][j].marked = true;
        } else if (board[i][j] === 'O') {
          this.boardSpots[i][j].marker = 'O';
          this.boardSpots[i][j].marked = true;
        } else {
          this.boardSpots[i][j].marker = 'blank';
          this.boardSpots[i][j].marked = false;
        }
      }
    }
  }

  stopStreams() {
    this.keepStreamsGoing = false;
  }
}
