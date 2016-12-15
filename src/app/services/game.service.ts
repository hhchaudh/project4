import {Injectable} from '@angular/core';
import {User} from "../models/user";
import {Message} from "../models/message";
import {Subject, Observable} from "rxjs";


@Injectable()
export class GameService {

  GAME_WINDOW_WIDTH: number = 300;
  GAME_WINDOW_HEIGHT: number = 600;
  BLOB_WIDTH: number = this.GAME_WINDOW_WIDTH / 6;
  BLOB_HEIGHT: number = this.GAME_WINDOW_HEIGHT / 12;
  FACE_WIDTH: number = 100;
  FACE_HEIGHT: number = 100;
  QUE_WIDTH: number = 100;
  QUE_HEIGHT: number = 100;
  OFFSET: number = 0;

  userName: string = "";
  currentStatus: string = "";
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
  greenFaceCanvas: HTMLCanvasElement;
  redFaceCanvas: HTMLCanvasElement;
  leftQueCanvas: HTMLCanvasElement;
  rightQueCanvas: HTMLCanvasElement;

  contextLeft: CanvasRenderingContext2D;
  contextRight: CanvasRenderingContext2D;
  greenFaceContext: CanvasRenderingContext2D;
  redFaceContext: CanvasRenderingContext2D;
  leftQueContext: CanvasRenderingContext2D;
  rightQueContext: CanvasRenderingContext2D;

  orb: HTMLImageElement = new Image();
  orbBig: HTMLImageElement = new Image();

  greenFaceCrying: HTMLImageElement = new Image();
  greenFaceHappy: HTMLImageElement = new Image();
  greenFaceSerious: HTMLImageElement = new Image();
  greenFaceWorried: HTMLImageElement = new Image();

  redFaceCrying: HTMLImageElement = new Image();
  redFaceHappy: HTMLImageElement = new Image();
  redFaceSerious: HTMLImageElement = new Image();
  redFaceWorried: HTMLImageElement = new Image();

  blackNormalBlob: HTMLImageElement = new Image();
  blackBlow1Blob: HTMLImageElement = new Image();
  blackBlow2Blob: HTMLImageElement = new Image();
  blackBlow3Blob: HTMLImageElement = new Image();
  blackBlow4Blob: HTMLImageElement = new Image();
  blackBugEyeBlob: HTMLImageElement = new Image();

  blueNormalBlob: HTMLImageElement = new Image();
  blueBlow1Blob: HTMLImageElement = new Image();
  blueBlow2Blob: HTMLImageElement = new Image();
  blueBlow3Blob: HTMLImageElement = new Image();
  blueBlow4Blob: HTMLImageElement = new Image();
  blueBugEyeBlob: HTMLImageElement = new Image();
  blueJoinDownBlob: HTMLImageElement = new Image();
  blueJoinLeftBlob: HTMLImageElement = new Image();
  blueJoinLeftDownBlob: HTMLImageElement = new Image();
  blueJoinLeftUpBlob: HTMLImageElement = new Image();
  blueJoinLeftUpDownBlob: HTMLImageElement = new Image();
  blueJoinRightBlob: HTMLImageElement = new Image();
  blueJoinRightDownBlob: HTMLImageElement = new Image();
  blueJoinRightLeftBlob: HTMLImageElement = new Image();
  blueJoinRightLeftDownBlob: HTMLImageElement = new Image();
  blueJoinRightLeftUpBlob: HTMLImageElement = new Image();
  blueJoinRightLeftUpDownBlob: HTMLImageElement = new Image();
  blueJoinRightUpBlob: HTMLImageElement = new Image();
  blueJoinRightUpDownBlob: HTMLImageElement = new Image();
  blueJoinUpBlob: HTMLImageElement = new Image();
  blueJoinUpDownBlob: HTMLImageElement = new Image();
  blueSmushBlob: HTMLImageElement = new Image();
  blueVertSmushBlob: HTMLImageElement = new Image();
  blueGlowBlob: HTMLImageElement = new Image();

  greenNormalBlob: HTMLImageElement = new Image();
  greenBlow1Blob: HTMLImageElement = new Image();
  greenBlow2Blob: HTMLImageElement = new Image();
  greenBlow3Blob: HTMLImageElement = new Image();
  greenBlow4Blob: HTMLImageElement = new Image();
  greenBugEyeBlob: HTMLImageElement = new Image();
  greenJoinDownBlob: HTMLImageElement = new Image();
  greenJoinLeftBlob: HTMLImageElement = new Image();
  greenJoinLeftDownBlob: HTMLImageElement = new Image();
  greenJoinLeftUpBlob: HTMLImageElement = new Image();
  greenJoinLeftUpDownBlob: HTMLImageElement = new Image();
  greenJoinRightBlob: HTMLImageElement = new Image();
  greenJoinRightDownBlob: HTMLImageElement = new Image();
  greenJoinRightLeftBlob: HTMLImageElement = new Image();
  greenJoinRightLeftDownBlob: HTMLImageElement = new Image();
  greenJoinRightLeftUpBlob: HTMLImageElement = new Image();
  greenJoinRightLeftUpDownBlob: HTMLImageElement = new Image();
  greenJoinRightUpBlob: HTMLImageElement = new Image();
  greenJoinRightUpDownBlob: HTMLImageElement = new Image();
  greenJoinUpBlob: HTMLImageElement = new Image();
  greenJoinUpDownBlob: HTMLImageElement = new Image();
  greenSmushBlob: HTMLImageElement = new Image();
  greenVertSmushBlob: HTMLImageElement = new Image();
  greenGlowBlob: HTMLImageElement = new Image();

  purpleNormalBlob: HTMLImageElement = new Image();
  purpleBlow1Blob: HTMLImageElement = new Image();
  purpleBlow2Blob: HTMLImageElement = new Image();
  purpleBlow3Blob: HTMLImageElement = new Image();
  purpleBlow4Blob: HTMLImageElement = new Image();
  purpleBugEyeBlob: HTMLImageElement = new Image();
  purpleJoinDownBlob: HTMLImageElement = new Image();
  purpleJoinLeftBlob: HTMLImageElement = new Image();
  purpleJoinLeftDownBlob: HTMLImageElement = new Image();
  purpleJoinLeftUpBlob: HTMLImageElement = new Image();
  purpleJoinLeftUpDownBlob: HTMLImageElement = new Image();
  purpleJoinRightBlob: HTMLImageElement = new Image();
  purpleJoinRightDownBlob: HTMLImageElement = new Image();
  purpleJoinRightLeftBlob: HTMLImageElement = new Image();
  purpleJoinRightLeftDownBlob: HTMLImageElement = new Image();
  purpleJoinRightLeftUpBlob: HTMLImageElement = new Image();
  purpleJoinRightLeftUpDownBlob: HTMLImageElement = new Image();
  purpleJoinRightUpBlob: HTMLImageElement = new Image();
  purpleJoinRightUpDownBlob: HTMLImageElement = new Image();
  purpleJoinUpBlob: HTMLImageElement = new Image();
  purpleJoinUpDownBlob: HTMLImageElement = new Image();
  purpleSmushBlob: HTMLImageElement = new Image();
  purpleVertSmushBlob: HTMLImageElement = new Image();
  purpleGlowBlob: HTMLImageElement = new Image();

  redNormalBlob: HTMLImageElement = new Image();
  redBlow1Blob: HTMLImageElement = new Image();
  redBlow2Blob: HTMLImageElement = new Image();
  redBlow3Blob: HTMLImageElement = new Image();
  redBlow4Blob: HTMLImageElement = new Image();
  redBugEyeBlob: HTMLImageElement = new Image();
  redJoinDownBlob: HTMLImageElement = new Image();
  redJoinLeftBlob: HTMLImageElement = new Image();
  redJoinLeftDownBlob: HTMLImageElement = new Image();
  redJoinLeftUpBlob: HTMLImageElement = new Image();
  redJoinLeftUpDownBlob: HTMLImageElement = new Image();
  redJoinRightBlob: HTMLImageElement = new Image();
  redJoinRightDownBlob: HTMLImageElement = new Image();
  redJoinRightLeftBlob: HTMLImageElement = new Image();
  redJoinRightLeftDownBlob: HTMLImageElement = new Image();
  redJoinRightLeftUpBlob: HTMLImageElement = new Image();
  redJoinRightLeftUpDownBlob: HTMLImageElement = new Image();
  redJoinRightUpBlob: HTMLImageElement = new Image();
  redJoinRightUpDownBlob: HTMLImageElement = new Image();
  redJoinUpBlob: HTMLImageElement = new Image();
  redJoinUpDownBlob: HTMLImageElement = new Image();
  redSmushBlob: HTMLImageElement = new Image();
  redVertSmushBlob: HTMLImageElement = new Image();
  redGlowBlob: HTMLImageElement = new Image();

  yellowNormalBlob: HTMLImageElement = new Image();
  yellowBlow1Blob: HTMLImageElement = new Image();
  yellowBlow2Blob: HTMLImageElement = new Image();
  yellowBlow3Blob: HTMLImageElement = new Image();
  yellowBlow4Blob: HTMLImageElement = new Image();
  yellowBugEyeBlob: HTMLImageElement = new Image();
  yellowJoinDownBlob: HTMLImageElement = new Image();
  yellowJoinLeftBlob: HTMLImageElement = new Image();
  yellowJoinLeftDownBlob: HTMLImageElement = new Image();
  yellowJoinLeftUpBlob: HTMLImageElement = new Image();
  yellowJoinLeftUpDownBlob: HTMLImageElement = new Image();
  yellowJoinRightBlob: HTMLImageElement = new Image();
  yellowJoinRightDownBlob: HTMLImageElement = new Image();
  yellowJoinRightLeftBlob: HTMLImageElement = new Image();
  yellowJoinRightLeftDownBlob: HTMLImageElement = new Image();
  yellowJoinRightLeftUpBlob: HTMLImageElement = new Image();
  yellowJoinRightLeftUpDownBlob: HTMLImageElement = new Image();
  yellowJoinRightUpBlob: HTMLImageElement = new Image();
  yellowJoinRightUpDownBlob: HTMLImageElement = new Image();
  yellowJoinUpBlob: HTMLImageElement = new Image();
  yellowJoinUpDownBlob: HTMLImageElement = new Image();
  yellowSmushBlob: HTMLImageElement = new Image();
  yellowVertSmushBlob: HTMLImageElement = new Image();
  yellowGlowBlob: HTMLImageElement = new Image();

  constructor() {
    this.BLOB_WIDTH = this.GAME_WINDOW_WIDTH / 6;
    this.BLOB_WIDTH = this.GAME_WINDOW_HEIGHT / 12;

    this.orb.src = "./assets/game-img/orb.png";
    this.orbBig.src = "./assets/game-img/orbBig.png";

    this.greenFaceCrying.src = "./assets/game-img/face1-crying.png";
    this.greenFaceHappy.src = "./assets/game-img/face1-happy.png";
    this.greenFaceSerious.src = "./assets/game-img/face1-serious.png";
    this.greenFaceWorried.src = "./assets/game-img/face1-worried.png";

    this.redFaceCrying.src = "./assets/game-img/face2-crying.png";
    this.redFaceHappy.src = "./assets/game-img/face2-happy.png";
    this.redFaceSerious.src = "./assets/game-img/face2-serious.png";
    this.redFaceWorried.src = "./assets/game-img/face2-worried.png";

    this.blackNormalBlob.src = "./assets/game-img/blob-boulder.png";
    this.blackBlow1Blob.src = "./assets/game-img/blow1-black.png";
    this.blackBlow2Blob.src = "./assets/game-img/blow2-black.png";
    this.blackBlow3Blob.src = "./assets/game-img/blow3-black.png";
    this.blackBlow4Blob.src = "./assets/game-img/blow4-black.png";
    this.blackBugEyeBlob.src = "./assets/game-img/bugEye-black.png";

    this.blueNormalBlob.src = "./assets/game-img/blob-blue.png";
    this.blueBlow1Blob.src = "./assets/game-img/blow1-blue.png";
    this.blueBlow2Blob.src = "./assets/game-img/blow2-blue.png";
    this.blueBlow3Blob.src = "./assets/game-img/blow3-blue.png";
    this.blueBlow4Blob.src = "./assets/game-img/blow4-blue.png";
    this.blueBugEyeBlob.src = "./assets/game-img/bugEye-blue.png";
    this.blueJoinDownBlob.src = "./assets/game-img/joinDown-blue.png";
    this.blueJoinLeftBlob.src = "./assets/game-img/joinLeft-blue.png";
    this.blueJoinLeftDownBlob.src = "./assets/game-img/joinLeftDown-blue.png";
    this.blueJoinLeftUpBlob.src = "./assets/game-img/joinLeftUp-blue.png";
    this.blueJoinLeftUpDownBlob.src = "./assets/game-img/joinLeftUpDown-blue.png";
    this.blueJoinRightBlob.src = "./assets/game-img/joinRight-blue.png";
    this.blueJoinRightDownBlob.src = "./assets/game-img/joinRightDown-blue.png";
    this.blueJoinRightLeftBlob.src = "./assets/game-img/joinRightLeft-blue.png";
    this.blueJoinRightLeftDownBlob.src = "./assets/game-img/joinRightLeftDown-blue.png";
    this.blueJoinRightLeftUpBlob.src = "./assets/game-img/joinRightLeftUp-blue.png";
    this.blueJoinRightLeftUpDownBlob.src = "./assets/game-img/joinRightLeftUpDown-blue.png";
    this.blueJoinRightUpBlob.src = "./assets/game-img/joinRightUp-blue.png";
    this.blueJoinRightUpDownBlob.src = "./assets/game-img/joinRightUpDown-blue.png";
    this.blueJoinUpBlob.src = "./assets/game-img/joinUp-blue.png";
    this.blueJoinUpDownBlob.src = "./assets/game-img/joinUpDown-blue.png";
    this.blueSmushBlob.src = "./assets/game-img/smush-blue.png";
    this.blueVertSmushBlob.src = "./assets/game-img/vertSmush-blue.png";
    this.blueGlowBlob.src = "./assets/game-img/glow-blue.png";

    this.greenNormalBlob.src = "./assets/game-img/blob-green.png";
    this.greenBlow1Blob.src = "./assets/game-img/blow1-green.png";
    this.greenBlow2Blob.src = "./assets/game-img/blow2-green.png";
    this.greenBlow3Blob.src = "./assets/game-img/blow3-green.png";
    this.greenBlow4Blob.src = "./assets/game-img/blow4-green.png";
    this.greenBugEyeBlob.src = "./assets/game-img/bugEye-green.png";
    this.greenJoinDownBlob.src = "./assets/game-img/joinDown-green.png";
    this.greenJoinLeftBlob.src = "./assets/game-img/joinLeft-green.png";
    this.greenJoinLeftDownBlob.src = "./assets/game-img/joinLeftDown-green.png";
    this.greenJoinLeftUpBlob.src = "./assets/game-img/joinLeftUp-green.png";
    this.greenJoinLeftUpDownBlob.src = "./assets/game-img/joinLeftUpDown-green.png";
    this.greenJoinRightBlob.src = "./assets/game-img/joinRight-green.png";
    this.greenJoinRightDownBlob.src = "./assets/game-img/joinRightDown-green.png";
    this.greenJoinRightLeftBlob.src = "./assets/game-img/joinRightLeft-green.png";
    this.greenJoinRightLeftDownBlob.src = "./assets/game-img/joinRightLeftDown-green.png";
    this.greenJoinRightLeftUpBlob.src = "./assets/game-img/joinRightLeftUp-green.png";
    this.greenJoinRightLeftUpDownBlob.src = "./assets/game-img/joinRightLeftUpDown-green.png";
    this.greenJoinRightUpBlob.src = "./assets/game-img/joinRightUp-green.png";
    this.greenJoinRightUpDownBlob.src = "./assets/game-img/joinRightUpDown-green.png";
    this.greenJoinUpBlob.src = "./assets/game-img/joinUp-green.png";
    this.greenJoinUpDownBlob.src = "./assets/game-img/joinUpDown-green.png";
    this.greenSmushBlob.src = "./assets/game-img/smush-green.png";
    this.greenVertSmushBlob.src = "./assets/game-img/vertSmush-green.png";
    this.greenGlowBlob.src = "./assets/game-img/glow-green.png";

    this.purpleNormalBlob.src = "./assets/game-img/blob-purple.png";
    this.purpleBlow1Blob.src = "./assets/game-img/blow1-purple.png";
    this.purpleBlow2Blob.src = "./assets/game-img/blow2-purple.png";
    this.purpleBlow3Blob.src = "./assets/game-img/blow3-purple.png";
    this.purpleBlow4Blob.src = "./assets/game-img/blow4-purple.png";
    this.purpleBugEyeBlob.src = "./assets/game-img/bugEye-purple.png";
    this.purpleJoinDownBlob.src = "./assets/game-img/joinDown-purple.png";
    this.purpleJoinLeftBlob.src = "./assets/game-img/joinLeft-purple.png";
    this.purpleJoinLeftDownBlob.src = "./assets/game-img/joinLeftDown-purple.png";
    this.purpleJoinLeftUpBlob.src = "./assets/game-img/joinLeftUp-purple.png";
    this.purpleJoinLeftUpDownBlob.src = "./assets/game-img/joinLeftUpDown-purple.png";
    this.purpleJoinRightBlob.src = "./assets/game-img/joinRight-purple.png";
    this.purpleJoinRightDownBlob.src = "./assets/game-img/joinRightDown-purple.png";
    this.purpleJoinRightLeftBlob.src = "./assets/game-img/joinRightLeft-purple.png";
    this.purpleJoinRightLeftDownBlob.src = "./assets/game-img/joinRightLeftDown-purple.png";
    this.purpleJoinRightLeftUpBlob.src = "./assets/game-img/joinRightLeftUp-purple.png";
    this.purpleJoinRightLeftUpDownBlob.src = "./assets/game-img/joinRightLeftUpDown-purple.png";
    this.purpleJoinRightUpBlob.src = "./assets/game-img/joinRightUp-purple.png";
    this.purpleJoinRightUpDownBlob.src = "./assets/game-img/joinRightUpDown-purple.png";
    this.purpleJoinUpBlob.src = "./assets/game-img/joinUp-purple.png";
    this.purpleJoinUpDownBlob.src = "./assets/game-img/joinUpDown-purple.png";
    this.purpleSmushBlob.src = "./assets/game-img/smush-purple.png";
    this.purpleVertSmushBlob.src = "./assets/game-img/vertSmush-purple.png";
    this.purpleGlowBlob.src = "./assets/game-img/glow-purple.png";

    this.redNormalBlob.src = "./assets/game-img/blob-red.png";
    this.redBlow1Blob.src = "./assets/game-img/blow1-red.png";
    this.redBlow2Blob.src = "./assets/game-img/blow2-red.png";
    this.redBlow3Blob.src = "./assets/game-img/blow3-red.png";
    this.redBlow4Blob.src = "./assets/game-img/blow4-red.png";
    this.redBugEyeBlob.src = "./assets/game-img/bugEye-red.png";
    this.redJoinDownBlob.src = "./assets/game-img/joinDown-red.png";
    this.redJoinLeftBlob.src = "./assets/game-img/joinLeft-red.png";
    this.redJoinLeftDownBlob.src = "./assets/game-img/joinLeftDown-red.png";
    this.redJoinLeftUpBlob.src = "./assets/game-img/joinLeftUp-red.png";
    this.redJoinLeftUpDownBlob.src = "./assets/game-img/joinLeftUpDown-red.png";
    this.redJoinRightBlob.src = "./assets/game-img/joinRight-red.png";
    this.redJoinRightDownBlob.src = "./assets/game-img/joinRightDown-red.png";
    this.redJoinRightLeftBlob.src = "./assets/game-img/joinRightLeft-red.png";
    this.redJoinRightLeftDownBlob.src = "./assets/game-img/joinRightLeftDown-red.png";
    this.redJoinRightLeftUpBlob.src = "./assets/game-img/joinRightLeftUp-red.png";
    this.redJoinRightLeftUpDownBlob.src = "./assets/game-img/joinRightLeftUpDown-red.png";
    this.redJoinRightUpBlob.src = "./assets/game-img/joinRightUp-red.png";
    this.redJoinRightUpDownBlob.src = "./assets/game-img/joinRightUpDown-red.png";
    this.redJoinUpBlob.src = "./assets/game-img/joinUp-red.png";
    this.redJoinUpDownBlob.src = "./assets/game-img/joinUpDown-red.png";
    this.redSmushBlob.src = "./assets/game-img/smush-red.png";
    this.redVertSmushBlob.src = "./assets/game-img/vertSmush-red.png";
    this.redGlowBlob.src = "./assets/game-img/glow-red.png";

    this.yellowNormalBlob.src = "./assets/game-img/blob-yellow.png";
    this.yellowBlow1Blob.src = "./assets/game-img/blow1-yellow.png";
    this.yellowBlow2Blob.src = "./assets/game-img/blow2-yellow.png";
    this.yellowBlow3Blob.src = "./assets/game-img/blow3-yellow.png";
    this.yellowBlow4Blob.src = "./assets/game-img/blow4-yellow.png";
    this.yellowBugEyeBlob.src = "./assets/game-img/bugEye-yellow.png";
    this.yellowJoinDownBlob.src = "./assets/game-img/joinDown-yellow.png";
    this.yellowJoinLeftBlob.src = "./assets/game-img/joinLeft-yellow.png";
    this.yellowJoinLeftDownBlob.src = "./assets/game-img/joinLeftDown-yellow.png";
    this.yellowJoinLeftUpBlob.src = "./assets/game-img/joinLeftUp-yellow.png";
    this.yellowJoinLeftUpDownBlob.src = "./assets/game-img/joinLeftUpDown-yellow.png";
    this.yellowJoinRightBlob.src = "./assets/game-img/joinRight-yellow.png";
    this.yellowJoinRightDownBlob.src = "./assets/game-img/joinRightDown-yellow.png";
    this.yellowJoinRightLeftBlob.src = "./assets/game-img/joinRightLeft-yellow.png";
    this.yellowJoinRightLeftDownBlob.src = "./assets/game-img/joinRightLeftDown-yellow.png";
    this.yellowJoinRightLeftUpBlob.src = "./assets/game-img/joinRightLeftUp-yellow.png";
    this.yellowJoinRightLeftUpDownBlob.src = "./assets/game-img/joinRightLeftUpDown-yellow.png";
    this.yellowJoinRightUpBlob.src = "./assets/game-img/joinRightUp-yellow.png";
    this.yellowJoinRightUpDownBlob.src = "./assets/game-img/joinRightUpDown-yellow.png";
    this.yellowJoinUpBlob.src = "./assets/game-img/joinUp-yellow.png";
    this.yellowJoinUpDownBlob.src = "./assets/game-img/joinUpDown-yellow.png";
    this.yellowSmushBlob.src = "./assets/game-img/smush-yellow.png";
    this.yellowVertSmushBlob.src = "./assets/game-img/vertSmush-yellow.png";
    this.yellowGlowBlob.src = "./assets/game-img/glow-yellow.png";
  }

  setUserName(name: string) {
    this.userName = name;
  }

  setCurrentStatus(status: string) {
    this.currentStatus = status;
    this.currentStatusSubject.next(status);
  }

  getCurrentStatus(): Observable<string> {
    return this.currentStatusSubject.asObservable();
  }

  setCanvas(gameCanvasLeft: HTMLCanvasElement,
            gameCanvasRight: HTMLCanvasElement,
            canvasGreenFace: HTMLCanvasElement,
            canvasRedFace: HTMLCanvasElement,
            canvasLeftQueue: HTMLCanvasElement,
            canvasRightQueue: HTMLCanvasElement) {
    this.canvasLeft = gameCanvasLeft;
    this.contextLeft = this.canvasLeft.getContext("2d");
    this.contextLeft.fillStyle = "black";
    this.contextLeft.fillRect(0, 0, this.GAME_WINDOW_WIDTH, this.GAME_WINDOW_HEIGHT);

    this.canvasRight = gameCanvasRight;
    this.contextRight = this.canvasRight.getContext("2d");
    this.contextRight.fillStyle = "black";
    this.contextRight.fillRect(0, 0, this.GAME_WINDOW_WIDTH, this.GAME_WINDOW_HEIGHT);

    this.greenFaceCanvas = canvasGreenFace;
    this.greenFaceContext = this.greenFaceCanvas.getContext("2d");

    this.redFaceCanvas = canvasRedFace;
    this.redFaceContext = this.redFaceCanvas.getContext("2d");

    this.leftQueCanvas = canvasLeftQueue;
    this.leftQueContext = this.leftQueCanvas.getContext("2d");
    this.leftQueContext.fillStyle = "grey";
    this.leftQueContext.fillRect(0, 0, this.QUE_WIDTH, this.QUE_HEIGHT);

    this.rightQueCanvas = canvasRightQueue;
    this.rightQueContext = this.rightQueCanvas.getContext("2d");
    this.rightQueContext.fillStyle = "grey";
    this.rightQueContext.fillRect(0, 0, this.QUE_WIDTH, this.QUE_HEIGHT);
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
    this.contextLeft.fillRect(0, 0, this.GAME_WINDOW_WIDTH, this.GAME_WINDOW_HEIGHT);

    this.contextRight.fillStyle = "grey";
    this.contextRight.fillRect(0, 0, this.GAME_WINDOW_WIDTH, this.GAME_WINDOW_HEIGHT);

    // this.contextLeft.fillStyle = "black";
    // // boarders
    // this.contextLeft.fillRect(this.GAME_WINDOW_WIDTH, 0, 3, this.GAME_WINDOW_HEIGHT);
    // this.contextLeft.fillRect(197, 0, 3, this.GAME_WINDOW_HEIGHT);
    //
    // // outter boxs next
    // this.contextLeft.fillRect(126, 95, 28, 50);
    // this.contextLeft.fillRect(166, 95, 28, 50);
    //
    // // outter boxes happy
    // this.contextLeft.fillRect(this.GAME_WINDOW_WIDTH, 40, 65, 35);
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
      this.greenFaceContext.drawImage(this.greenFaceHappy, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
    }
    else if (this.leftHappy == 1) {
      this.greenFaceContext.drawImage(this.greenFaceSerious, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
    }
    else if (this.leftHappy == 2) {
      this.greenFaceContext.drawImage(this.greenFaceWorried, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
    }
    else {
      this.greenFaceContext.drawImage(this.greenFaceCrying, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
    }

    if (( this.displayWinner )) {
      if (this.winner == "left") {
        this.greenFaceContext.drawImage(this.greenFaceHappy, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
      }
      else {
        this.greenFaceContext.drawImage(this.greenFaceCrying, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
      }
    }

    // this.contextLeft.fillText(happyText, 130, 60);

    if (this.rightHappy == 0) {
      this.redFaceContext.drawImage(this.redFaceHappy, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
    }
    else if (this.rightHappy == 1) {
      this.redFaceContext.drawImage(this.redFaceSerious, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
    }
    else if (this.rightHappy == 2) {
      this.redFaceContext.drawImage(this.redFaceWorried, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
    }
    else {
      this.redFaceContext.drawImage(this.redFaceCrying, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
    }

    if (( this.displayWinner )) {
      if (this.winner == "right") {
        this.redFaceContext.drawImage(this.redFaceSerious, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
      }
      else {
        this.redFaceContext.drawImage(this.redFaceCrying, 0, 0, this.FACE_WIDTH, this.FACE_HEIGHT);
      }
    }

    // this.contextLeft.fillText(happyText, 130, 180);


    for (let i = 0; i < this.blobs.length; i++) {
      let blob = this.blobs[i];
      if (blob && blob.frame != "vanish") {
        let context: CanvasRenderingContext2D = this.contextLeft;
        if (blob.side == "right") {
          context = this.contextRight;
        }

        let xPos = (   blob.xPos * this.BLOB_WIDTH ) / 1000;
        let yPos = ( ( blob.yPos - 2000 ) * this.BLOB_HEIGHT ) / 1000;
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
        else if (blob.frame == "glow") {
          this.drawGlow(context, xPos, yPos, color);
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
        else if (blob.frame == "que2") {
          if (blob.side == "left") {
            this.drawBlobNormal(this.leftQueContext, ((this.QUE_WIDTH) / 2) - (this.BLOB_WIDTH / 2), 0, color);
          }
          else {
            this.drawBlobNormal(this.rightQueContext, ((this.QUE_WIDTH) / 2) - (this.BLOB_WIDTH / 2), 0, color);
          }
        }
        else if (blob.frame == "que1") {
          if (blob.side == "left") {
            this.drawBlobNormal(this.leftQueContext, ((this.QUE_WIDTH) / 2) - (this.BLOB_WIDTH / 2), this.QUE_HEIGHT / 2, color);
          }
          else {
            this.drawBlobNormal(this.rightQueContext, ((this.QUE_WIDTH) / 2) - (this.BLOB_WIDTH / 2), this.QUE_HEIGHT / 2, color);
          }
        }
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
        // this.contextLeft.fillText(winText, this.GAME_WINDOW_HEIGHT, 40);
        // this.contextLeft.fillText(this.p2wins + " - " + this.p2losses, this.GAME_WINDOW_HEIGHT, 70);
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
      if (tempUser.name === this.userName) {
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
    this.setCurrentStatus("LOGIN");
  }

  gameLogOff() {
    if (this.token === 0 || this.gameToken === 0) {
      return;
    }

    let logOffData = JSON.stringify({"name": "logOff", "where": this.gameToken, "userToken": this.token});
    this.sendCommand("logOff", logOffData);
    this.resetMessages();
    this.resetGameToken();
    this.setCurrentStatus("LOBBY");
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
    // myContext.fillStyle = "white";
    // myContext.fillRect(xPos + 4, yPos + 4, 12, 12);
    myContext.drawImage(this["orb"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
  }

  drawGlow(myContext, xPos, yPos, color) {
    myContext.drawImage(this[color + "GlowBlob"], xPos, yPos, this.BLOB_WIDTH, this.BLOB_HEIGHT);
  }

  drawOrbBig(myContext, xPos, yPos) {
    // myContext.fillStyle = "white";
    // myContext.fillRect(xPos, yPos, 20, 20);
    myContext.drawImage(this["orbBig"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
  }

  drawBugEye(myContext, xPos, yPos, color) {
    // myContext.fillStyle = color;
    // myContext.fillRect(xPos, yPos, 20, 20);
    // myContext.fillStyle = "white";
    // myContext.fillRect(xPos + 1, yPos + 2, 8, 10);
    // myContext.fillRect(xPos + 11, yPos + 2, 8, 10);
    // myContext.fillStyle = "black";
    // myContext.fillRect(xPos + 3, yPos + 6, 4, 4);
    // myContext.fillRect(xPos + 13, yPos + 6, 4, 4);
    myContext.drawImage(this[color + "BugEyeBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
  }

  drawBlow(myContext, xPos, yPos, color, frame) {
    myContext.fillStyle = color;
    if (frame == 1) {
      // myContext.fillRect(xPos + 5, yPos + 5, 10, 10);
      myContext.drawImage(this[color + "Blow1Blob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (frame == 2) {
      // myContext.fillRect(xPos, yPos, 8, 8);
      // myContext.fillRect(xPos + 12, yPos, 8, 8);
      // myContext.fillRect(xPos, yPos + 12, 8, 8);
      // myContext.fillRect(xPos + 12, yPos + 12, 8, 8);
      myContext.drawImage(this[color + "Blow2Blob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (frame == 3) {
      // myContext.fillRect(xPos - 3, yPos - 3, 5, 5);
      // myContext.fillRect(xPos + 19, yPos - 3, 5, 5);
      // myContext.fillRect(xPos - 3, yPos + 19, 5, 5);
      // myContext.fillRect(xPos + 19, yPos + 19, 5, 5);
      myContext.drawImage(this[color + "Blow3Blob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (frame == 4) {
      // myContext.fillRect(xPos - 6, yPos - 6, 3, 3);
      // myContext.fillRect(xPos + 23, yPos - 6, 3, 3);
      // myContext.fillRect(xPos - 6, yPos + 23, 3, 3);
      // myContext.fillRect(xPos + 23, yPos + 23, 3, 3);
      myContext.drawImage(this[color + "Blow4Blob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
  }

  drawBlobNormal(myContext, xPos, yPos, color) {
    if (color === "black") {
      myContext.drawImage(this.blackNormalBlob, xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    } else if (color === "yellow") {
      myContext.drawImage(this.yellowNormalBlob, xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    } else if (color === "blue") {
      myContext.drawImage(this.blueNormalBlob, xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    } else if (color === "red") {
      myContext.drawImage(this.redNormalBlob, xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    } else if (color === "purple") {
      myContext.drawImage(this.purpleNormalBlob, xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    } else if (color === "green") {
      myContext.drawImage(this.greenNormalBlob, xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    } else {
      myContext.fillStyle = color;
      myContext.fillRect(xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
  }

  drawBlobSmushed(myContext, xPos, yPos, color) {
    // myContext.fillStyle = color;
    // myContext.fillRect(xPos, yPos + 8, 20, 12);
    if (color === "black") {
      myContext.drawImage(this["blackNormalBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    } else {
      myContext.drawImage(this[color + "SmushBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
  }

  drawBlobVertSmushed(myContext, xPos, yPos, color) {
    // myContext.fillStyle = color;
    // myContext.fillRect(xPos + 4, yPos, 12, 20);
    if (color === "black") {
      myContext.drawImage(this["blackNormalBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    } else {
      myContext.drawImage(this[color + "VertSmushBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
  }

  drawJoin(myContext, xPos, yPos, color, name) {
    myContext.fillStyle = color;

    if (name == "joinRight") {
      // myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      myContext.drawImage(this[color + "JoinRightBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinRightLeft") {
      // myContext.fillRect(xPos, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      myContext.drawImage(this[color + "JoinRightLeftBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinRightUp") {
      // myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 7, yPos, 6, 2);
      myContext.drawImage(this[color + "JoinRightUpBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinRightDown") {
      // myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
      myContext.drawImage(this[color + "JoinRightDownBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinRightLeftUp") {
      // myContext.fillRect(xPos, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 7, yPos, 6, 2);
      myContext.drawImage(this[color + "JoinRightLeftUpBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinRightLeftDown") {
      // myContext.fillRect(xPos, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
      myContext.drawImage(this[color + "JoinRightLeftDownBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinRightUpDown") {
      // myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 7, yPos, 6, 2);
      // myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
      myContext.drawImage(this[color + "JoinRightUpDownBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinRightLeftUpDown") {
      // myContext.fillRect(xPos, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 18, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 7, yPos, 6, 2);
      // myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
      myContext.drawImage(this[color + "JoinRightLeftUpDownBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinLeft") {
      // myContext.fillRect(xPos, yPos + 7, 2, 6);
      myContext.drawImage(this[color + "JoinLeftBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinLeftUp") {
      // myContext.fillRect(xPos, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 7, yPos, 6, 2);
      myContext.drawImage(this[color + "JoinLeftUpBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinLeftDown") {
      // myContext.fillRect(xPos, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
      myContext.drawImage(this[color + "JoinLeftDownBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinLeftUpDown") {
      // myContext.fillRect(xPos, yPos + 7, 2, 6);
      // myContext.fillRect(xPos + 7, yPos, 6, 2);
      // myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
      myContext.drawImage(this[color + "JoinLeftUpDownBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinUp") {
      // myContext.fillRect(xPos + 7, yPos, 6, 2);
      myContext.drawImage(this[color + "JoinUpBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinUpDown") {
      // myContext.fillRect(xPos + 7, yPos, 6, 2);
      // myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
      myContext.drawImage(this[color + "JoinUpDownBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
    else if (name == "joinDown") {
      // myContext.fillRect(xPos + 7, yPos + 18, 6, 2);
      myContext.drawImage(this[color + "JoinDownBlob"], xPos + this.OFFSET, yPos + this.OFFSET, this.BLOB_WIDTH, this.BLOB_HEIGHT);
    }
  }


  stopStreams() {
    this.keepStreamsGoing = false;
  }
}
