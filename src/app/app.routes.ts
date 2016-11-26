import {RouterModule, Routes} from "@angular/router";
import {NewUserFormComponent} from "./components/new-user-form/new-user-form.component";
import {LoginComponent} from "./components/login/login.component";
import {LobbyComponent} from "./components/lobby/lobby.component";

const APP_ROUTES: Routes = [
  {path: '', redirectTo: 'login', pathMatch: 'full'},
  {path: 'NewUser', component: NewUserFormComponent},
  {path: 'login', component: LoginComponent},
  {path: 'lobby', component: LobbyComponent},
  {path: '**', redirectTo: 'login', pathMatch: 'full'}
];

export const routing = RouterModule.forRoot(APP_ROUTES);
