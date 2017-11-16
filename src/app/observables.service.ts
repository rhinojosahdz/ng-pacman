import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs/Rx';
import { IDot } from './i-dot';

@Injectable()
export class ObservablesService {
  public chompSound = new Subject();
  public chompSound$ = this.chompSound.asObservable();
  public blueGhostsTimeSound = new Subject<{ play: boolean }>();
  public blueGhostsTimeSound$ = this.blueGhostsTimeSound.asObservable();
  public boardReady = new Subject();
  public boardReady$ = this.boardReady.asObservable();
  public boardPossiblyReady = new Subject();
  public boardPossiblyReady$ = this.boardPossiblyReady.asObservable();
  public finishedCheckingBoard = new Subject<{ valid: boolean, dotsToRemove?: IDot[] }>();
  public finishedCheckingBoard$ = this.finishedCheckingBoard.asObservable();
  public pacmanStartedDying = new Subject();
  public pacmanStartedDying$ = this.pacmanStartedDying.asObservable();
  public pacmanFinishedDying = new Subject();
  public pacmanFinishedDying$ = this.pacmanFinishedDying.asObservable();
  public pacmanEatADot = new Subject<IDot>();
  public pacmanEatADot$ = this.pacmanEatADot.asObservable();
  public pacmanEatAGhost = new Subject<{ multiplier: number }>();
  public pacmanEatAGhost$ = this.pacmanEatAGhost.asObservable();
  public appComponentReady = new Subject();
  public appComponentReady$ = this.appComponentReady.asObservable();
  public currentScoreWentUp = new Subject<{ prevCurrentScore: number, currentScore: number }>();
  public currentScoreWentUp$ = this.currentScoreWentUp.asObservable();
  public startStateStarted = new Subject();
  public startStateStarted$ = this.startStateStarted.asObservable();
  public startStateFinished = new Subject();
  public startStateFinished$ = this.startStateFinished.asObservable();
  constructor() { }

}
