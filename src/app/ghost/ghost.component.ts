import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { ModelService } from '../model.service';
import { UtilService } from '../util.service';
import { MovingObject } from '../moving-object';
import { IDirection } from '../i-direction';
import { environment } from '../../environments/environment';
import { ObservablesService } from '../observables.service';
import { IStartingGhostValues } from '../i-starting-ghost-values';
import * as _ from 'lodash';
import { MovingObjectService } from '../moving-object.service';

@Component({
  selector: '[app-ghost]',
  templateUrl: './ghost.component.html',
  styleUrls: ['./ghost.component.scss']
})
export class GhostComponent extends MovingObject implements OnInit {

  public iStartingGhostValues: IStartingGhostValues;
  public stunned = false;
  public visible = true;
  private flashingIntervalId: any;
  public degree = 0;
  constructor(
    public modelService: ModelService,
    public utilService: UtilService,
    public observablesService: ObservablesService,
    public movingObjectService: MovingObjectService,
  ) {
    super('ghost');
    setInterval(() => {
      this.degree = _.random(360);
    }, 100);
  }

  public ngOnInit() {
    this.iStartingGhostValues = _.find(this.modelService.startingGhostPositions, { id: this.id });
    this.x = this.iStartingGhostValues.x;
    this.y = this.iStartingGhostValues.y;
    this.color = this.id;
    this.modelService.ghosts.push(this);
    this.direction = this.iStartingGhostValues.direction;
    this.observablesService.boardReady$.subscribe(() => {
      this.moving = true;
      this.run();
    });
  }

  whereIsPacman(): ['left' | 'right', 'up' | 'down'] {
    const p = this.modelService.pacman;
    return [p.x > this.x ? 'right' : 'left', p.y > this.y ? 'down' : 'up'];
  }

  public startFlashing() {
    this.stopFlashing();
    this.flashingIntervalId = setInterval(() => {
      this.visible = !this.visible;
    }, 100);
  }

  public stopFlashing() {
    clearInterval(this.flashingIntervalId);
    this.visible = true;
  }

  // TODO @bug if we eat the ghost it doesn't flash while it is stunned
  private stun() {
    const originalDirection = this.direction;
    this.stunned = true;
    const randomEyeDirections = _.sample([
      environment.nextDirectionsLeft,
      environment.nextDirectionsRight,
      environment.nextDirectionsSideways,
      environment.nextDirectionsUpAndDown
    ]);
    this.startFlashing();
    const i2 = setInterval(() => {
      this.direction = randomEyeDirections[this.direction];
    }, 200);
    setTimeout(() => {
      clearInterval(i2);
      this.stunned = false;
      this.stopFlashing();
      this.direction = originalDirection;
    }, 5000);
  }

  run() {
    let speed = environment.ghostSpeed - (this.modelService.lvl * environment.speedMultiplierPerLvl);
    speed = environment[`ghostSpeed${this.modelService.boardSize}`];
    if (this.modelService.lvl >= 4) {
      speed -= ((this.modelService.lvl - 3) * 7);
    }
    if (speed < environment.ghostFastestsSpeedAllowed) {
      speed = environment.ghostFastestsSpeedAllowed;
    }
    this.intervalId = setInterval(() => {
      if (!this.modelService.gameFrozen) {
        if (this.isTouchingPacman() && !this.stunned) {
          const ghost = this;
          if (ghost.color === 'blue') {
            // ghost.resetPosition();
            this.modelService.board.playSoundOnce('eat-ghost');
            this.observablesService.pacmanEatAGhost.next({ multiplier: this.modelService.ghostMultiplier++ });
            this.stun();
          } else {
            this.modelService.pacman.die();
          }
        }
        if (this.isAtIntersection() && !this.stunned) {
          if (!this.isOutside()) {
            if (this.canGoIntoMultipleDirectionsNextStep()) {
              if (_.random(4) === 4) {
                this.direction = _.sample(this.getPossibleDirectionsExceptBack());
              } else {
                const pd = this.getPossibleDirectionsExceptBack();
                const pacPos = this.whereIsPacman();
                const inter = _.intersection(pd, pacPos);
                this.direction = _.sample(inter.length ? inter : pd);
              }
            } else {
              if (_.random(8) === 8) {
                this.direction = this.getOppositeDirection();
              } else {
                this.direction = _.sample(this.getPossibleDirectionsExceptBack());
              }
            }
          } else {
            this.teleportToOtherSide();
          }
        }
        !this.stunned && this.move(this.direction);
      }
    }, speed);
  }

  public startRunningAway() {
    // @here
  }

  public resetPosition() {
    this.x = this.iStartingGhostValues.x;
    this.y = this.iStartingGhostValues.y;
    this.color = this.iStartingGhostValues.id;
    // TODO the direction doesn't seem to be reseted
    this.direction = this.iStartingGhostValues.direction;
  }

  getEyeIrisPosition(eye: 'left' | 'right', c: 'cx' | 'cy') {
    // center: left: {cx: 4, cy: 7}, right: {cx: 12, cy: 7}, radius = 8
    const obj = {
      left: {
        left: { cx: 1, cy: 3.5 },
        right: { cx: 5, cy: 3.5 },
      },
      right: {
        left: { cx: 3, cy: 3.5 },
        right: { cx: 7, cy: 3.5 },
      },
      up: {
        left: { cx: 2, cy: 2.5 },
        right: { cx: 6, cy: 2.5 },
      },
      down: {
        left: { cx: 2, cy: 4.5 },
        right: { cx: 6, cy: 4.5 },
      },
    };
    return obj[this.direction][eye][c];
  }

  private isTouchingPacman() {
    // tslint:disable-next-line:max-line-length
    return this.utilService.svgChildrenColliding(this.elementRef.nativeElement, this.modelService.pacman.elementRef.nativeElement, 'ghost-touching-pacman');
  }

}
