import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';

import { AppComponent } from './app.component';
import { LoginComponent } from './components/login/login.component';
import { LobbyComponent } from './components/lobby/lobby.component';
import { GameComponent } from './components/game/game.component';
import { NewUserFormComponent } from './components/new-user-form/new-user-form.component';
import {routing} from "./app.routes";
import {LocationStrategy, HashLocationStrategy} from "@angular/common";
import {GameService} from "./services/game.service";

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    LobbyComponent,
    GameComponent,
    NewUserFormComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    routing
  ],
  providers: [{provide: LocationStrategy, useClass: HashLocationStrategy},
  GameService],
  bootstrap: [AppComponent]
})
export class AppModule { }
