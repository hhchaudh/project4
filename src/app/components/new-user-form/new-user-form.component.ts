import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";
import {Response, Headers, Http} from "@angular/http";
import 'rxjs/add/operator/map';
import {GameService} from "../../services/game.service";

@Component({
  selector: 'app-new-user-form',
  templateUrl: './new-user-form.component.html',
  styleUrls: ['./new-user-form.component.css']
})
export class NewUserFormComponent implements OnInit {

  private showPassWarning: boolean;
  private showUserDuplicateWarning: boolean;
  private newUserRequestObj = {"name":"createUser", "where":"0000000000",  "userName":"", "password":"" };

  constructor(private router: Router, private http: Http, private gameService:GameService) {
    this.showPassWarning = false;
    this.showUserDuplicateWarning = false;
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    this.showPassWarning = false;
    this.showUserDuplicateWarning = false;
    console.log(formValue);
    if(formValue.pass === formValue.passConfirm) {
      this.newUserRequestObj["userName"] = formValue.user;
      this.newUserRequestObj["password"] = formValue.pass;
      this.sendNewUserRequest();
      this.showPassWarning = false;
    } else {
      this.showPassWarning = true;
    }

    return false;
  }

  sendNewUserRequest() {
    this.dataResource(this.newUserRequestObj)
      .subscribe(
        data => {
          console.log(data);
          let gameDataFormat = /<==(.*?)==>/;
          let match = gameDataFormat.exec(data["_body"]);
          let jsonData;

          if(match != null && match[1]) {
            try {
              jsonData = JSON.parse(match[1]);
              console.log(jsonData);
            } catch (err) {
              console.log("Error with parsing the data");
              return;
            }
          }

          if(jsonData && jsonData.display === 1) {
            this.showUserDuplicateWarning = true;
            console.log("The user name exists");
          } else {
            this.router.navigate(['/login']);
            this.showUserDuplicateWarning = false;
            this.gameService.userCreated = true;
          }
        }
      );
  }

  dataResource(user:any) {
    const body = JSON.stringify(user);
    const headers = new Headers();
    headers.append('Content-Type', 'application/json');
    return this.http.post('https://people.eecs.ku.edu/~jfustos/cgi-bin/myTest.cgi', body, {
      headers: headers
    })
      .map((data: Response) => data)
    // .catch(this.handleError);
  }
}
