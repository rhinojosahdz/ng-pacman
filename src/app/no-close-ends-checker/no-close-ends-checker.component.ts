import { Component, OnInit, Input, ViewChild, ElementRef, NgZone } from '@angular/core';
import { ModelService } from '../model.service';
import { UtilService } from '../util.service';
import { MovingObject } from '../moving-object';
import { IDirection } from '../i-direction';
import { environment } from '../../environments/environment';
import { ObservablesService } from '../observables.service';
import { IStartingGhostValues } from '../i-starting-ghost-values';
import { IBlock } from '../i-block';
import { Block } from '../block';
import * as _ from 'lodash';

@Component({
  selector: '[app-no-close-ends-checker]',
  templateUrl: './no-close-ends-checker.component.html',
  styleUrls: ['./no-close-ends-checker.component.scss']
})
export class NoCloseEndsCheckerComponent extends MovingObject implements OnInit {

  public alive = true;
  constructor(
    public modelService: ModelService,
    public utilService: UtilService,
    public observablesService: ObservablesService,
    private ngZone: NgZone,
  ) {
    super('ghost');
  }

  public ngOnInit() {
    this.observablesService.boardPossiblyReady$.subscribe(() => {
      this.x = 1;
      this.y = 1;
      this.direction = 'right';
      this.run();
    });
  }

  getTransform() {
    return `translate(${this.x}, ${this.y})`;
  }

  protected getCurrentBlock() {
    const iBlock: IBlock = {
      tl: { x: this.x, y: this.y },
      tr: { x: this.x + 10, y: this.y },
      bl: { x: this.x, y: this.y + 10 },
      br: { x: this.x + 10, y: this.y + 10 },
    };
  }

  protected move(direction: string) {
    const v = 10;
    const dir = { 'left': () => this.x -= v, 'right': () => this.x += v, 'up': () => this.y -= v, 'down': () => this.y += v };
    const fn = dir[direction];
    fn && fn();
  }

  run() {
    // TODO use a `while (maxMoves--)`
    let maxMoves = environment.checkerMaxMoves;
    const percentageOfAcceptableDots = .15;
    const i = setInterval(() => {
      maxMoves--;
      _.each(this.modelService.dots, d => {
        if (this.isTouchingDot(d.el)) {
          _.pull(this.modelService.dots, d);
          return false;
        }
      });
      this.direction = _.sample(this.getPossibleDirectionsExceptBack());
      this.move(this.direction);
      if (this.modelService.dots.length === 0) {
        clearInterval(i);
        this.observablesService.finishedCheckingBoard.next({ valid: true });
      } else {
        if (!maxMoves) {
          clearInterval(i);
          const numOfInitialDots = environment.boardWidth * environment.boardHeight / 100; // / 100 because each block is 10x10
          const percentage = this.modelService.dots.length / numOfInitialDots;
          if (percentage <= percentageOfAcceptableDots) {
            this.observablesService.finishedCheckingBoard.next({ valid: true, dotsToRemove: this.modelService.dots });
          } else {
            this.observablesService.finishedCheckingBoard.next({ valid: false });
          }
        }
      }
    });
  }

}
