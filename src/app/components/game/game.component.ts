import {Component, ViewChild, ElementRef, AfterViewInit, HostListener} from '@angular/core';
import {GameService} from "../../services/game.service";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";


@Component({
  selector: 'game-root',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})


export class GameComponent implements AfterViewInit {

  leftDown:number = 0;
  rightDown:number = 0;
  rotateDown:number = 0;
  downDown:number = 0;

  @ViewChild("gameCanvasLeft") canvasLeftRef: ElementRef;
  @ViewChild("gameCanvasRight") canvasRightRef: ElementRef;
  @ViewChild("greenFaceCanvas") greenFaceCanvasRef: ElementRef;
  @ViewChild("redFaceCanvas") redFaceCanvasRef: ElementRef;
  @ViewChild("leftQueueCanvas") leftQueueCanvasRef: ElementRef;
  @ViewChild("rightQueueCanvas") rightQueueCanvasRef: ElementRef;

  @HostListener('document:keydown', ['$event'])
  handleKeyDown(e: KeyboardEvent) {
    if( e.keyCode == 'A'.charCodeAt(0) && this.leftDown == 0 )
    {
      this.leftDown = 1;
      let keyDownData = JSON.stringify({"name":"keyDown", "where":this.gameService.gameToken, "userToken":this.gameService.token, "key":"left" });
      this.gameService.sendCommand( "keyDown", keyDownData );
    }
    else if( e.keyCode == 'D'.charCodeAt(0) && this.rightDown == 0 )
    {
      this.rightDown = 1;
      let keyDownData = JSON.stringify({"name":"keyDown", "where":this.gameService.gameToken, "userToken":this.gameService.token, "key":"right" });
      this.gameService.sendCommand( "keyDown", keyDownData );
    }
    else if( e.keyCode == 'S'.charCodeAt(0) && this.downDown == 0 )
    {
      this.downDown = 1;
      let keyDownData = JSON.stringify({"name":"keyDown", "where":this.gameService.gameToken, "userToken":this.gameService.token, "key":"down" });
      this.gameService.sendCommand( "keyDown", keyDownData );
    }
    else if( e.keyCode == 'P'.charCodeAt(0) && this.rotateDown == 0 )
    {
      this.rotateDown = 1;
      let keyDownData = JSON.stringify({"name":"keyDown", "where":this.gameService.gameToken, "userToken":this.gameService.token, "key":"rotate" });
      this.gameService.sendCommand( "keyDown", keyDownData );
    }
  }

  @HostListener('document:keyup', ['$event'])
  handleKeyUp(e: KeyboardEvent) {
    if( e.keyCode == 'A'.charCodeAt(0) )
    {
      this.leftDown = 0;
      let keyUpData = JSON.stringify({"name":"keyUp", "where":this.gameService.gameToken, "userToken":this.gameService.token, "key":"left" });
      this.gameService.sendCommand( "keyUp", keyUpData );
    }
    else if( e.keyCode == 'D'.charCodeAt(0) )
    {
      this.rightDown = 0;
      let keyUpData = JSON.stringify({"name":"keyUp", "where":this.gameService.gameToken, "userToken":this.gameService.token, "key":"right" });
      this.gameService.sendCommand( "keyUp", keyUpData );
    }
    else if( e.keyCode == 'S'.charCodeAt(0) )
    {
      this.downDown = 0;
      let keyUpData = JSON.stringify({"name":"keyUp", "where":this.gameService.gameToken, "userToken":this.gameService.token, "key":"down" });
      this.gameService.sendCommand( "keyUp", keyUpData );
    }
    else if( e.keyCode == 'P'.charCodeAt(0) )
    {
      this.rotateDown = 0;
      let keyUpData = JSON.stringify({"name":"keyUp", "where":this.gameService.gameToken, "userToken":this.gameService.token, "key":"rotate" });
      this.gameService.sendCommand( "keyUp", keyUpData );
    }
  }

  constructor(private gameService: GameService, private router: Router) {

  }

  ngAfterViewInit() {
    this.gameService.setCanvas(this.canvasLeftRef.nativeElement,
      this.canvasRightRef.nativeElement,
      this.greenFaceCanvasRef.nativeElement,
      this.redFaceCanvasRef.nativeElement,
      this.leftQueueCanvasRef.nativeElement,
      this.rightQueueCanvasRef.nativeElement);

    window.setTimeout(() => {
      this.gameService.getCurrentStatus().subscribe((status: string) => {
        if (status === "LOBBY") {
          this.router.navigate(["/lobby"]);
        }
      });
    }, 1000);
  }

  gameLogOut() {
    this.gameService.gameLogOff();
    this.router.navigate(["/lobby"]);
  }

  onSubmit(form: FormGroup) {
    let message: string = form.value.message;
    this.gameService.sendMessage(message);
    form.reset();
    return false;
  }

  get messages(): any {
    return this.gameService.getMessages();
  }

  get players(): any {
    return this.gameService.getPlayers();
  }

  get countDownTimer(): number {
    return this.gameService.countDown;
  }

  newGame() {
    this.gameService.newGame();
  }

  setReady() {
    this.gameService.setReady();
  }

}
