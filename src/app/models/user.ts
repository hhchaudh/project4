export class User {
  wins:number;
  losses:number;
  name:string;
  status:string;
  ready:boolean;

  constructor() {
    this.ready = false;
  }
}
