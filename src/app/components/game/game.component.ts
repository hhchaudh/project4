import {Component, ViewChild, ElementRef, AfterViewInit} from '@angular/core';
import {GameService} from "../../services/game.service";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";


@Component({
  selector: 'game-root',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.css'],
})


export class GameComponent implements AfterViewInit {
  @ViewChild("gameCanvasLeft") canvasLeftRef:ElementRef;
  @ViewChild("gameCanvasRight") canvasRightRef:ElementRef;

  constructor(private gameService:GameService, private router:Router) {

  }

  ngAfterViewInit() {
    this.gameService.setCanvas(this.canvasLeftRef.nativeElement, this.canvasRightRef.nativeElement);
    window.setTimeout(() => {
      this.gameService.getCurrentStatus().subscribe((status: string) => {
        if(status === "LOBBY") {
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
