export class User {
  wins:number;
  losses:number;
  name:string;
  status:string;
  ready:boolean;
  totalWins:number;
  totalLosses:number;

  constructor() {
    this.ready = false;
    this.totalLosses = 0;
    this.totalWins = 0;
  }
}
