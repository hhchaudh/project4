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

  login = function (userName:any, password:any) {
    return JSON.stringify({"name":"login","where":"0000000000","userName":userName, "password":password });
  };

  onSubmit(formValue: any) {
    this.userDoesNotExist = false;
    this.gameService.resetUserToken();
    console.log(formValue);
    this.gameService.sendCommand("login", this.login(formValue.user, formValue.pass));

    window.setTimeout(() => {
      if(this.gameService.getUserToken() != 0) {
        this.router.navigate(['/lobby']);
      } else {
        this.userDoesNotExist = true;
      }
    }, 500);

    return false;
  }
}
