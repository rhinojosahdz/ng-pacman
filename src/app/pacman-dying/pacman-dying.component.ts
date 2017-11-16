import { ObservablesService } from '../observables.service';
import { Component, ViewChild, OnInit, Input } from '@angular/core';
import { ModelService } from '../model.service';
import * as _ from 'lodash';
import { IDirection } from '../i-direction';
import { environment } from '../../environments/environment';
import { MovingObjectService } from '../moving-object.service';

@Component({
  selector: '[app-pacman-dying]',
  templateUrl: './pacman-dying.component.html',
  styleUrls: ['./pacman-dying.component.scss']
})
export class PacmanDyingComponent implements OnInit {

  /**
   * this is so we can use this as a moving-object with the moving-object
   * service (as this component needs to rotate to match pacman's direction)
   */
  public direction: IDirection;
  @Input() isALife: boolean;
  private map = {
    left: {
      high: {
        xA: -4,
        xOptA: '++',
        yA: 4,
        yOptA: '--',
        xB: 4,
        xOptB: '++',
        yB: -4,
        yOptB: '++',
      },
      low: {
        xA: -4,
        xOptA: '++',
        yA: 4,
        yOptA: '++',
        xB: 4,
        xOptB: '++',
        yB: 12,
        yOptB: '--',
      },
    },
    up: {
      high: { // left
        xA: 4,
        xOptA: '--',
        yA: -4,
        yOptA: '++',
        xB: -4,
        xOptB: '++',
        yB: 4,
        yOptB: '++',
      },
      low: {
        xA: 4,
        xOptA: '++',
        yA: -4,
        yOptA: '++',
        xB: 12,
        xOptB: '--',
        yB: 4,
        yOptB: '++',
      },
    },
    right: {
      high: { // left
        xA: 12,
        xOptA: '--',
        yA: 4,
        yOptA: '--',
        xB: 4,
        xOptB: '--',
        yB: -4,
        yOptB: '++',
      },
      low: {
        xA: 12,
        xOptA: '--',
        yA: 4,
        yOptA: '++',
        xB: 4,
        xOptB: '--',
        yB: 12,
        yOptB: '--',
      },
    },
    down: {
      high: { // right
        xA: 4,
        xOptA: '++',
        yA: 12,
        yOptA: '--',
        xB: 12,
        xOptB: '--',
        yB: 4,
        yOptB: '--',
      },
      low: {
        xA: 4,
        xOptA: '--',
        yA: 12,
        yOptA: '--',
        xB: -4,
        xOptB: '++',
        yB: 4,
        yOptB: '--',
      },
    },
  };

  // TODO make this xHigh xLow variables less verbose (map?)
  private xHighA: number;
  private yHighA: number;
  private xHighB: number;
  private yHighB: number;

  private xLowA: number;
  private yLowA: number;
  private xLowB: number;
  private yLowB: number;

  private speedForwardTimesAAnimationThisNumOfTimes = 3;
  private timesA = 8 - this.speedForwardTimesAAnimationThisNumOfTimes;
  private timesB = 8;
  private extraLine = false;
  private intervalTime = environment.intervalPacmanDyingAnimation;

  constructor(
    public modelService: ModelService,
    public movingObjectService: MovingObjectService,
    private observablesService: ObservablesService,
  ) { }

  d() {
    return this.modelService.pacman.direction;
  }

  ngOnInit() {
    this.xHighA = this.map[this.d()].high.xA;
    this.yHighA = this.map[this.d()].high.yA;
    this.xHighB = this.map[this.d()].high.xB;
    this.yHighB = this.map[this.d()].high.yB;

    this.xLowA = this.map[this.d()].low.xA;
    this.yLowA = this.map[this.d()].low.yA;
    this.xLowB = this.map[this.d()].low.xB;
    this.yLowB = this.map[this.d()].low.yB;

    const m = this.map[this.d()];
    const timesAAnimation = () => {
      this.map[this.d()].high.xOptA === '++' ? this.xHighA++ : this.xHighA--;
      this.map[this.d()].high.yOptA === '++' ? this.yHighA++ : this.yHighA--;
      this.map[this.d()].high.xOptB === '++' ? this.xLowA++ : this.xLowA--;
      this.map[this.d()].high.yOptB === '++' ? this.yLowA++ : this.yLowA--;
    };
    _.times(this.speedForwardTimesAAnimationThisNumOfTimes, timesAAnimation);
    !this.isALife && this.modelService.board.playSoundOnce('death');
    let i = setInterval(() => {
      if (--this.timesA < 0) {
        clearInterval(i);
        this.extraLine = true;
        const secondIntervalFn = () => {
          if (--this.timesB < 0) {
            clearInterval(i);
            !this.isALife && this.observablesService.pacmanFinishedDying.next();
          } else {
            this.map[this.d()].low.xOptA === '++' ? this.xHighB++ : this.xHighB--;
            this.map[this.d()].low.yOptA === '++' ? this.yHighB++ : this.yHighB--;
            this.map[this.d()].low.xOptB === '++' ? this.xLowB++ : this.xLowB--;
            this.map[this.d()].low.yOptB === '++' ? this.yLowB++ : this.yLowB--;
          }
        };
        secondIntervalFn();
        i = setInterval(secondIntervalFn, this.intervalTime);
      } else {
        timesAAnimation();
      }
    }, this.intervalTime);
  }

  getPathHigh() {
    // tslint:disable-next-line:max-line-length
    return `M 4,4 L ${this.map[this.d()].high.xA} ${this.map[this.d()].high.yA} L ${this.xHighA} ${this.yHighA}${this.extraLine ? ` L ${this.xHighB} ${this.yHighB}` : ''}`;
  }

  getPathLow() {
    // tslint:disable-next-line:max-line-length
    return `M 4,4 L ${this.map[this.d()].high.xA} ${this.map[this.d()].high.yA} L ${this.xLowA} ${this.yLowA}${this.extraLine ? ` L ${this.xLowB} ${this.yLowB}` : ''}`;
  }
}
