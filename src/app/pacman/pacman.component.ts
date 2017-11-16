import { IXy } from '../i-xy';
import { environment } from './../../environments/environment';
import { Component, HostListener, HostBinding, Input, ViewChild, ElementRef, OnInit } from '@angular/core';
import { ModelService } from '../model.service';
import { UtilService } from '../util.service';
import { MovingObject } from '../moving-object';
import * as _ from 'lodash';
import { IDirection } from '../i-direction';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { ObservablesService } from '../observables.service';
import { MovingObjectService } from '../moving-object.service';
import { IPacmanStartingPosition } from '../i-pacman-starting-position';

@Component({
  selector: '[app-pacman]',
  templateUrl: './pacman.component.html',
  styleUrls: ['./pacman.component.scss'],
})
export class PacmanComponent extends MovingObject implements OnInit {

  @HostBinding('class.moving') public moving = false;
  public lives = +localStorage.getItem('lives') || environment.pacmanStartingLives;
  public startingPositions = this.getRandomStartingPosition();
  public dying = false;
  public aboutToDie = false;
  @Input() public isALife: boolean;

  constructor(
    public modelService: ModelService,
    public utilService: UtilService,
    private observablesService: ObservablesService,
    public movingObjectService: MovingObjectService,
  ) {
    super('pacman');
  }

  ngOnInit() {
    if (!this.isALife) {
      this.resetPosition();
      this.modelService.pacman = this;
    }
    this.observablesService.boardReady$.subscribe(() => {
      this.moving = true;
      this.run();
    });
    this.observablesService.startStateFinished$.subscribe(() => {
      this.moving = true;
    });
  }

  resetPosition() {
    const pos = this.getRandomStartingPosition();
    this.x = pos.xY.x;
    this.y = pos.xY.y;
    this.direction = pos.direction;
  }

  private getRandomStartingPosition() {
    const x = environment.boardWidth;
    const y = environment.boardHeight;
    const v = 9;
    const positions: IPacmanStartingPosition[] = [
      { side: 'up', xY: { x: x / 2 - v, y: 1 }, direction: 'right' },
      { side: 'left', xY: { x: 1, y: y / 2 - v }, direction: 'down' },
      { side: 'right', xY: { x: x - v, y: y / 2 - v }, direction: 'up' },
      { side: 'down', xY: { x: x / 2 - v, y: y - v }, direction: 'left' },
    ];
    return _.sample(positions);
  }

  die() {
    this.bufferedMove = undefined;
    this.aboutToDie = true;
    this.modelService.board.stopBlueGhostsTimeSound();
    this.modelService.gameFrozen = true;
    setTimeout(() => {
      this.dying = true;
      this.observablesService.pacmanStartedDying.next();
      this.lives--;
    }, environment.timeBeforePacmanDyingAnimation);
  }

  run() {
    let speed = environment.pacmanSpeed - (this.modelService.lvl * environment.speedMultiplierPerLvl);
    speed = environment[`pacmanSpeed${this.modelService.boardSize}`];
    if (this.modelService.lvl >= 4) {
      speed -= ((this.modelService.lvl - 3) * 5);
    }
    if (speed < environment.pacmanFastestsSpeedAllowed) {
      speed = environment.pacmanFastestsSpeedAllowed;
    }
    console.log(speed);
    this.intervalId = setInterval(() => {
      if (!this.modelService.gameFrozen) {
        _.each(this.modelService.dots, d => {
          if (this.isTouchingDot(d.el)) {
            _.pull(this.modelService.dots, d);
            this.observablesService.pacmanEatADot.next(d);
            return false; // otherwise we get a `Cannot read property 'el' of undefined`
          }
        });

        if (this.isAtIntersection()) {
          if (!this.isOutside() && this.bufferedMove !== undefined && !this.wouldTouchThisWallNextStep(this.bufferedMove)) {
            this.direction = this.bufferedMove;
            delete this.bufferedMove;
          }
          if (this.isGoingToTouchWallNextStep()) {
            this.moving = false;
            delete this.bufferedMove;
          }
          if (this.isOutside()) {
            this.teleportToOtherSide();
          }
        }
        this.move(this.direction);
      }
    }, speed);
  }



  playChopSound() {
    this.observablesService.chompSound.next({ play: true });
    setTimeout(() => {
      this.observablesService.chompSound.next({ play: false });
    }, 300);
  }

  getMouthD() {
    return `M${this.r} ${this.r} L ${this.r * 2} 0 L ${this.r * 2} ${this.r * 2}`;
  }

  getUpperLipD() {
    return `M${this.r} ${this.r} L 0 0 L ${this.r * 2} 0`;
  }

  getBottomLipD() {
    return `M${this.r} ${this.r} L 0 ${this.r * 2} L ${this.r * 2} ${this.r * 2}`;
  }


  @HostListener('document:touchend', ['$event'])
  touchend(event: TouchEvent) {
    const first = this.firstTouch.touches[0];
    const last = event.changedTouches[0];
    const diffX = Math.abs(first.clientX - last.clientX);
    const diffY = Math.abs(first.clientY - last.clientY);
    let dir: IDirection;
    if (diffX > diffY) {
      // left-right
      first.clientX > last.clientX ? dir = 'left' : dir = 'right';
    } else {
      // up-down
      first.clientY > last.clientY ? dir = 'up' : dir = 'down';
    }
    this.changeDir(dir);
  }

  // tslint:disable-next-line:member-ordering
  private firstTouch: TouchEvent;
  @HostListener('document:touchstart', ['$event'])
  touchstart(event: TouchEvent) {
    this.firstTouch = event;
  }

  @HostListener('document:keydown', ['$event'])
  keydown(event: KeyboardEvent) {
    this.changeDir(this.keyboardMap[event.code]);
  }

  private changeDir(direction: IDirection) {
    if (this.dying || this.aboutToDie) { // this.modelService.gameFrozen
      return;
    }
    // gameFrozen so he can change to any direction while the startAnimation is 'starting' (startAnimationStarted)
    if (direction === super.getOppositeDirection() || this.modelService.gameFrozen) {
      this.direction = direction;
      delete this.bufferedMove;
      this.moving = true;
    } else {
      this.bufferedMove = direction;
      this.moving = true;
    }
  }

}
