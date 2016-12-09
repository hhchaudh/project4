import {Component, OnInit} from '@angular/core';
import {GameService} from "../../services/game.service";
import {FormGroup} from "@angular/forms";
import {User} from "../../models/user";
import {Router} from "@angular/router";

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {

  selectedPlayer: string = "";
  joinableGame: boolean = false;

  constructor(private gameService: GameService, private router: Router) {

  }

  ngOnInit() {

  }

  get users(): any {
    return this.gameService.getUsers();
  }

  get messages(): any {
    return this.gameService.getMessages();
  }

  onSubmit(form: FormGroup) {
    let message: string = form.value.message;
    this.gameService.sendMessage(message);
    form.reset();

    return false;
  }

  logOff() {
    this.gameService.logOff();
    this.router.navigate(["/login"]);
  }

  createGame() {
    this.gameService.createGame();
    this.gameService.resetMessages();
    this.router.navigate(["/game"]);
  }

  setSelectedPlayer(player: User) {
    this.selectedPlayer = player.name;
    this.joinableGame = (player.status === "JOINABLE");
  }
}
