import {Component, OnInit} from '@angular/core';
import {Router} from "@angular/router";

@Component({
  selector: 'app-new-user-form',
  templateUrl: './new-user-form.component.html',
  styleUrls: ['./new-user-form.component.css']
})
export class NewUserFormComponent implements OnInit {

  private showPassWarning: boolean;

  constructor(private router: Router) {
    this.showPassWarning = false;
  }

  ngOnInit() {
  }

  onSubmit(formValue: any) {
    console.log(formValue);
    if(formValue.pass === formValue.passConfirm) {
      this.showPassWarning = false;
      this.router.navigate(['/lobby']);
    } else {
      this.showPassWarning = true;
    }

    return false;
  }
}
