import { Component, OnInit } from '@angular/core';
import {Router} from "@angular/router";
import {GameService} from "../../services/game.service";

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  userDoesNotExist = false;

  constructor(private router: Router, private gameService:GameService) { }

  ngOnInit() {

  }

  onSubmit(formValue: any) {
    let loginData = JSON.stringify({"name":"login","where":"0000000000","userName":formValue.user, "password":formValue.pass});
    this.userDoesNotExist = false;
    this.gameService.userCreated = false;
    this.gameService.resetUserToken();
    console.log(formValue);
    this.gameService.sendCommand("login", loginData);

    window.setTimeout(() => {
      if(this.gameService.getUserToken() != 0) {
        this.router.navigate(['/lobby']);
      } else {
        this.userDoesNotExist = true;
      }
    }, 500);

    return false;
  }

  get userCreated(): boolean {
    return this.gameService.userCreated;
  }
}
