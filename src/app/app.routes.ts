import {RouterModule, Routes} from "@angular/router";
import {NewUserFormComponent} from "./components/new-user-form/new-user-form.component";
import {LoginComponent} from "./components/login/login.component";
import {LobbyComponent} from "./components/lobby/lobby.component";
import {GameComponent} from "./components/game/game.component";

const APP_ROUTES: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'NewUser', component: NewUserFormComponent},
  {path: 'login', component: LoginComponent},
  {path: 'lobby', component: LobbyComponent},
  {path: 'game', component: GameComponent},
  {path: '**', redirectTo: 'login', pathMatch: 'full'}
];

export const routing = RouterModule.forRoot(APP_ROUTES);
