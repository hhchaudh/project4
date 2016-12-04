import {Component, OnInit} from '@angular/core';
import {GameService} from "../../services/game.service";
import {FormGroup} from "@angular/forms";

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.css']
})
export class LobbyComponent implements OnInit {


  constructor(private gameService: GameService) {

  }

  ngOnInit() {

  }

  get users(): any {
    return this.gameService.getUsers();
  }

  get messages(): any {
    return this.gameService.getMessages();
  }

  onSubmit(form:FormGroup) {
    let message:string = form.value.message;
    if(/\S/.test(message)) {
      let sendMessageData = JSON.stringify({
        "name": "sendMessage",
        "where": "0000000000",
        "userToken": this.gameService.token,
        "message": message
      });
      this.gameService.sendCommand("message", sendMessageData);
      form.reset();
    }

    return false;
  }
}
