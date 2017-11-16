import {IXy} from './i-xy';
import { ElementRef, HostListener, HostBinding, ReflectiveInjector, ViewChild, Input, OnInit } from '@angular/core';
import { ModelService } from './model.service';
import { UtilService } from './util.service';
import { GhostComponent } from './ghost/ghost.component';
import { IDirection } from './i-direction';
import { ObservablesService } from './observables.service';
import { environment } from '../environments/environment';
import * as _ from 'lodash';

export abstract class MovingObject {

  @ViewChild('elementRef') public elementRef: ElementRef;
  @Input() protected id: string;
  public x: number;
  public y: number;
  public color: string;
  public moving = false;
  public r = 4;
  public direction: IDirection;
  protected keyboardMap: { [iDirection: string]: IDirection } = {
    'ArrowLeft': 'left',
    'ArrowRight': 'right',
    'ArrowDown': 'down',
    'ArrowUp': 'up'
  };
  public modelService: ModelService;
  public utilService: UtilService;
  private _observablesService: ObservablesService;
  public bufferedMove: IDirection;
  public intervalId;
  constructor(
    public type: 'ghost' | 'pacman',
  ) {
    const injector = ReflectiveInjector.resolveAndCreate([ModelService, UtilService, ObservablesService]);
    this.modelService = injector.get(ModelService);
    this.utilService = injector.get(UtilService);
    this._observablesService = injector.get(ObservablesService);
  }

  protected getPossibleDirections() {
    const possibleDirections = [];
    _.each(['up', 'down', 'left', 'right'], d => {
      (!this.wouldTouchThisWallNextStep(<any>d)) && possibleDirections.push(d);
    });
    return possibleDirections;
  }

  abstract run();

  /**
   * @returns false if false and the direction if true
   */
  private canOnlyGoIntoOneDirectionNextStep(): false | IDirection {
    const dirs = this.getPossibleDirections();
    if (dirs.length === 2) {
      _.pull(dirs, this.getOppositeDirection());
      return dirs[0];
    } else {
      return false;
    }
  }

  protected isAtIntersection() {
    return ((this.x - 1) % 10 === 0 && (this.y - 1) % 10 === 0);
  }

  protected isGoingToTouchWallNextStep() {
    return !_.includes(this.getPossibleDirections(), this.direction);
  }

  protected canGoIntoMultipleDirectionsNextStep() {
    return this.getPossibleDirectionsExceptBack().length >= 2;
  }

  protected getPossibleDirectionsExceptBack() {
    return _.without(this.getPossibleDirections(), this.getOppositeDirection());
  }

  private getPossibleDirectionsExceptBackAndForward() {
    return _.without(this.getPossibleDirections(), this.getOppositeDirection(), this.direction);
  }

  protected getOppositeDirection() {
    return environment.oppositeDirections[this.direction];
  }

  private canOnlyContinueStraightNextStep(): boolean {
    return this.canOnlyGoIntoOneDirectionNextStep() === this.getOppositeDirection();
  }

  // private isTouchingGhost(movingObject: MovingObject) {
  //   return _.some(this.modelService.ghosts, g => {
  //     return this.utilService.svgChildrenColliding(movingObject.elementRef.nativeElement, g.el);
  //   });
  // }

  protected isTouchingDot(dot) {
    return this.utilService.svgChildrenColliding(this.elementRef.nativeElement, dot);
  }

  private isTouchingWall() {
    return _.some(this.modelService.paths, p => {
      return this.utilService.svgChildrenColliding(this.elementRef.nativeElement, p.el, 'wall');
    });
  }

  protected isOutside() {
    if (this.x < 0 || this.y < 0) {
      return true;
    }
    if (this.x > environment.boardWidth || this.y > environment.boardHeight) {
      return true;
    }
  }

  protected teleportToOtherSide() {
    const side = this.getOutsideSide();
    const adjustment = 5;
    const map = {
      'up': (iXy: IXy) => {
        return { x: iXy.x, y: iXy.y + environment.boardHeight + adjustment };
      },
      'down': (iXy: IXy) => {
        return { x: iXy.x, y: iXy.y - environment.boardHeight - adjustment };
      },
      'left': (iXy: IXy) => {
        return { y: iXy.y, x: iXy.x + environment.boardWidth + adjustment };
      },
      'right': (iXy: IXy) => {
        return { y: iXy.y, x: iXy.x - environment.boardWidth - adjustment };
      },
    };
    const newIXy = map[side]({ x: this.x, y: this.y });
    this.x = newIXy.x;
    this.y = newIXy.y;
  }

  private getOutsideSide(): IDirection {
    if (this.x < 0) {
      return 'left';
    }
    if (this.y < 0) {
      return 'up';
    }
    if (this.x > environment.boardWidth) {
      return 'right';
    }
    if (this.y > environment.boardWidth) {
      return 'down';
    }
  }

  protected wouldTouchThisWallNextStep(direction: IDirection) {
    return _.some(this.modelService.paths, p => {
      return this.utilService.svgChildrenColliding(this.elementRef.nativeElement, p.el, 'futureWall', <any>direction);
    });
  }

  protected move(direction: string) {
    if (!this.moving || this.modelService.gameFrozen) {
      return;
    }
    if (this.type === 'pacman' && this.modelService.pacman.dying) {
      return;
    }
    const dir = { 'left': () => this.x--, 'right': () => this.x++, 'up': () => this.y--, 'down': () => this.y++ };
    const fn = dir[direction];
    fn && fn();
  }

}
