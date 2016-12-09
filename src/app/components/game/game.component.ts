import {Component} from '@angular/core';
import {GameService} from "../../services/game.service";
import {Router} from "@angular/router";
import {FormGroup} from "@angular/forms";

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


export class GameComponent {
  playerTurn: string = "No One";
  currentPlayer: string = "P2";
  victoryMsg: string;

  constructor(private gameService:GameService, private router:Router) {
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
}
