import { MovingObject } from '../moving-object';
import { IXy } from '../i-xy';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModelService } from '../model.service';
import { ObservablesService } from '../observables.service';
import * as _ from 'lodash';
import { ILine } from '../i-line';
import { IBlock } from '../i-block';
import { Block } from '../block';
import { IDirection } from '../i-direction';
import { environment } from '../../environments/environment';
import { IDot } from '../i-dot';

@Component({
  selector: 'app-board',
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.scss'],
})
export class BoardComponent implements OnInit {
  @ViewChild('board') public board: ElementRef;

  public boardWidth = environment.boardWidth;
  public boardHeight = environment.boardHeight;
  public svgWidth = environment.boardWidth + environment.padding.left + environment.padding.right;
  public svgHeight = environment.boardHeight + environment.padding.top + environment.padding.bottom;
  public padding = environment.padding;
  private blueGhostsTimeAudio: HTMLAudioElement;
  public gameover = false;
  public starting = false;
  public ready = false;
  public flash = false;

  constructor(
    public modelService: ModelService,
    private observablesService: ObservablesService,
  ) { }

  getPath(path) {
    const d = `M ${path.path[0].x} ${path.path[0].y} L ${path.path[1].x} ${path.path[1].y}`;
    return d;
  }

  startGameover() {
    this.modelService.gameFrozen = true;
    this.gameover = true;
    this.setHighscoreIfItApplies();
    this.clearStorage();
    setTimeout(() => {
      location.reload();
    }, environment.timeBeforeWeRestartGame);
  }

  clearStorage() {
    localStorage.setItem('lvl', undefined);
    localStorage.setItem('lives', undefined);
    localStorage.setItem('currentScore', undefined);
  }

  setHighscoreIfItApplies() {
    if (this.modelService.topBar.currentScore > this.modelService.topBar.highScore) {
      localStorage.setItem('highScore', this.modelService.topBar.currentScore + '');
    }
  }

  // ignore
  private randomlyToggleWalls() {
    const wall = _.sample(this.modelService.paths);
    _.pull(this.modelService.paths);
    const i = setInterval(() => {
      this.modelService.paths.push(wall);
      clearInterval(i);
      // this.randomlyToggleWalls();
    }, _.sample([5000, 10000, 15000]));
  }

  ngOnInit() {
    this.modelService.board = this;
    this.chompAudioListener();
    if (environment.test) {
      this.test();
      this.startAnimation();
    } else {
      this.generateMaze();
    }
    this.observablesService.pacmanFinishedDying$.subscribe(() => {
      this.modelService.pacman.aboutToDie = false;
      if (this.modelService.pacman.lives === 0) {
        this.startGameover();
      } else {
        this.reset();
        this.startAnimation();
      }
    });
    this.observablesService.boardReady$.subscribe(() => {
      this.startAnimation();
    });
    this.observablesService.pacmanEatADot$.subscribe(() => {
      if (!this.modelService.dots.length) {
        this.won();
      }
    });
  }

  /**
   * @returns array of teleportable dots
   */
  private createMagicPortals(blocks: Block[]): IDot[] {
    const teleportableDots: IDot[] = [];
    const x = environment.boardWidth;
    const y = environment.boardHeight;
    const v = 10;
    const positions = [
      { side: 'up', xY: { x: x / 2 - v, y: 0 }, adjustment: (iXy: IXy) => { iXy.y -= 15; } },
      { side: 'left', xY: { x: 0, y: y / 2 - v }, adjustment: (iXy: IXy) => { iXy.x -= 15; } },
      { side: 'right', xY: { x: x - v, y: y / 2 - v }, adjustment: (iXy: IXy) => { iXy.x += 15; } },
      { side: 'down', xY: { x: x / 2 - v, y: y - v }, adjustment: (iXy: IXy) => { iXy.y += 15; } },
    ];
    _.each(positions, p => {
      const block = Block.findBlockAtXy(p.xY, blocks);
      block.removeAllWalls();
      const copyOfXy = _.cloneDeep(p.xY);
      p.adjustment(copyOfXy);
      const teleportableDot = {
        el: null,
        magic: false,
        teleportable: true,
        x: copyOfXy.x + 5,
        y: copyOfXy.y + 5,
      };
      teleportableDots.push(teleportableDot);
    });
    return teleportableDots;
  }

  private reset() {
    this.modelService.gameFrozen = true;
    _.each(this.modelService.ghosts, g => {
      g.resetPosition();
    });
    this.modelService.pacman.resetPosition();
  }

  startAnimation() {
    this.observablesService.startStateStarted.next();
    this.starting = true;
    this.modelService.pacman.dying = false;
    setTimeout(() => {
      this.modelService.gameFrozen = false;
      this.starting = false;
      this.observablesService.startStateFinished.next();
    }, environment.timeStartAnimation);
  }

  private test() {
    const blocks = this.getPossibleMazeBlocks();
    const copyOfBlocks = _.cloneDeep(blocks);
    this.addBlocksQuickly(copyOfBlocks);
    this.addDotsQuickly();
    setTimeout(() => {
      this.setDotsAndPathsEls();
      this.observablesService.boardReady.next();
    });
  }

  private generateMaze() {
    const blocks = this.getPossibleMazeBlocks();
    const copyOfBlocks = _.cloneDeep(blocks);
    this.addBlocksQuickly(copyOfBlocks);
    this.addDotsQuickly();
    this.observablesService.finishedCheckingBoard$.first().subscribe(data => {
      if (data.valid) {
        const copyOfBlocks = _.cloneDeep(blocks);
        this.createMagicPortals(copyOfBlocks);
        this.modelService.paths = [];
        this.modelService.checkerAlive = false;
        this.playSoundOnce('beginning');
        this.animate(copyOfBlocks, data.dotsToRemove);
        // this.randomlyToggleWalls();
      } else {
        this.generateMaze();
      }
    });
    setTimeout(() => {
      this.setDotsAndPathsEls();
      this.observablesService.boardPossiblyReady.next();
    });
  }

  setDotsAndPathsEls() {
    const boardEl: HTMLElement = this.board.nativeElement;
    _.each(this.modelService.paths, (p, idx) => {
      const pathEl = boardEl.getElementsByClassName(`path-${idx}`);
      p.el = pathEl[0];
    });
    _.each(this.modelService.dots, (d, idx) => {
      const dotEl = boardEl.getElementsByClassName(`dot-${idx}`);
      d.el = dotEl[0];
    });
  }
  /**
   * first we generate the outsideBlocks because we know what walls
   * they must have, then we generate the insideBlocks with random
   * walls and making sure they don't add a 3rd wall to any of the
   * blocks that are up, down, left or right of each of them
   */
  private getPossibleMazeBlocks() {
    const blocks: Block[] = [];
    this.addStartingBlocks(blocks);
    // outside blocks first
    for (let x = 0; x < this.boardWidth; x += 10) {
      for (let y = 0; y < this.boardHeight; y += 10) {
        const block: Block = new Block({
          tl: { x: x, y: y },
          br: { x: x + 10, y: y + 10 },
          bl: { x: x, y: y + 10 },
          tr: { x: x + 10, y: y },
        });
        if (block.isOutsideBlock()) {
          block.generateWalls();
          blocks.push(block);
        }
      }
    }
    // inside blocks last
    for (let x = 0; x < this.boardWidth; x += 10) {
      for (let y = 0; y < this.boardHeight; y += 10) {
        const block: Block = new Block({
          tl: { x: x, y: y },
          br: { x: x + 10, y: y + 10 },
          bl: { x: x, y: y + 10 },
          tr: { x: x + 10, y: y },
        });
        block.setBlocks(blocks); // they need information about other blocks
        if (!block.alreadyExistsAtXy(x, y)) {
          block.generateWalls();
          blocks.push(block);
        }
      }
    }
    return blocks;
  }

  private addStartingBlocks(blocks: Block[]) {
    // _.each(this.modelService.paths, p => {
    //   const b = Block.iLineToBlock(p);
    //   blocks.push(b);
    // });
    blocks.push(...this.modelService.startingBlocks);
  }

  private animate(blocks: Block[], dotsToRemove?: IDot[]) {
    const dotsPromise: Promise<any> = this.addDots(this.getDots(), dotsToRemove);
    const blocksPromise: Promise<any> = this.addBlocks(blocks);
    Promise.all([dotsPromise, blocksPromise]).then(() => {
      setTimeout(() => {
        this.setDotsAndPathsEls();
        this.observablesService.boardReady.next();
        this.ready = true;
      });
    });
  }

  private addBlock(blocksCopy: Block[]) {
    const randomBlock = _.sample(blocksCopy);
    _.pull(blocksCopy, randomBlock);
    this.modelService.paths = this.modelService.paths.concat(randomBlock.getILines());
  }

  private addDotsQuickly() {
    this.modelService.dots = [];
    this.modelService.dots = this.getDots();
  }

  private addBlocksQuickly(blocks: Block[]) {
    this.modelService.paths = [];
    _.each(blocks, b => {
      this.modelService.paths = this.modelService.paths.concat(b.getILines());
    });
  }

  private addBlocks(blocksCopy: Block[]): Promise<any> {
    const p = new Promise((resolve, reject) => {
      const i = setInterval(() => {
        if (blocksCopy.length) {
          this.addBlock(blocksCopy);
        } else {
          clearInterval(i);
          resolve();
        }
      }, 20);
    });
    return p;
  }

  private addDot(iDots: IDot[], dotsToRemove?: IDot[]) {
    const randomIDot = _.sample(iDots);
    _.pull(iDots, randomIDot);
    if (!(dotsToRemove && _.some(dotsToRemove, d => d.x === randomIDot.x && d.y === randomIDot.y))) {
      this.modelService.dots.push(randomIDot);
    }
  }

  private addDots(iDots: IDot[], dotsToRemove?: IDot[]): Promise<any> {
    this.modelService.dots = [];
    const p = new Promise((resolve, reject) => {
      const i = setInterval(() => {
        if (iDots.length) {
          this.addDot(iDots, dotsToRemove);
        } else {
          clearInterval(i);
          resolve();
        }
      }, 20);
    });
    return p;
  }

  private getCorners() {
    const corners: ILine[] = [
      {
        path: [
          { x: 0, y: 0 },
          { x: 0, y: 10 },
        ],
      },
      {
        path: [
          { x: 0, y: 0 },
          { x: 10, y: 0 },
        ],
      },

      {
        path: [
          { x: 0, y: this.boardHeight },
          { x: 0, y: this.boardHeight - 10 },
        ],
      },
      {
        path: [
          { x: 0, y: this.boardHeight },
          { x: 10, y: this.boardHeight },
        ],
      },

      {
        path: [
          { x: this.boardWidth, y: 0 },
          { x: this.boardWidth - 10, y: 0 },
        ],
      },
      {
        path: [
          { x: this.boardWidth, y: 0 },
          { x: this.boardWidth, y: 10 },
        ],
      },

      {
        path: [
          { x: this.boardWidth, y: this.boardHeight },
          { x: this.boardWidth - 10, y: this.boardHeight },
        ],
      },
      {
        path: [
          { x: this.boardWidth, y: this.boardHeight },
          { x: this.boardWidth, y: this.boardHeight - 10 },
        ],
      },
    ];
    return corners;
  }

  private getDots() {
    const iDots: IDot[] = [];
    for (let i = 10; i < this.boardWidth * 2; i += 20) {
      for (let j = 10; j < this.boardHeight * 2; j += 20) {
        const obj: IDot = {
          el: null,
          magic: false,
          x: i / 2, // this could be done using * 2 and we don't need to have the `i < this.width * 2` above but the result is the same
          y: j / 2,
        };
        iDots.push(obj);
      }
    }
    this.addRandomMagicDots(iDots);
    return iDots;
  }

  private addRandomMagicDots(iDots: IDot[]) {
    const numOfRandomDots = Math.floor(iDots.length * .05);
    const randomDots = _.sampleSize(iDots, numOfRandomDots);
    _.each(randomDots, d => d.magic = true);
  }

  // tslint:disable-next-line:member-ordering
  private blueGhostsSubscription: Subscription;
  // tslint:disable-next-line:member-ordering
  private blueGhostsFlashingIntervalId: any;
  public startBlueGhostsTime() {
    this.blueGhostsSubscription && this.blueGhostsSubscription.unsubscribe();
    this.playBlueGhostsTimeSound();
    this.modelService.board.flash = true;
    _.each(this.modelService.ghosts, g => {
      g.stopFlashing();
      g.color = 'blue';
    });
    this.blueGhostsFlashingIntervalId = setTimeout(() => {
      _.each(this.modelService.ghosts, g => g.startFlashing());
    }, this.modelService.blueGhostsTimeTime - 3000);
    this.blueGhostsSubscription = Observable.of('').delay(this.modelService.blueGhostsTimeTime).subscribe(() => {
      this.stopBlueGhostsTimeSound();
      _.each(this.modelService.ghosts, g => {
        g.color = g.iStartingGhostValues.id;
        g.stopFlashing();
        this.modelService.board.flash = false;
      });
      this.modelService.ghostMultiplier = 0;
    });
  }

  private won() {
    this.modelService.gameFrozen = true;
    this.startFlashing();
    const movingObjects: MovingObject[] = this.modelService.ghosts.concat(<any>this.modelService.pacman);
    _.each(movingObjects, o => clearInterval(o.intervalId));
    setTimeout(() => {
      this.stopFlashing();
      // this.modelService.paths = [];
      setTimeout(() => {
        localStorage.setItem('lvl', ++this.modelService.lvl + '');
        localStorage.setItem('currentScore', this.modelService.topBar.currentScore + '');
        localStorage.setItem('lives', this.modelService.pacman.lives + '');
        this.setHighscoreIfItApplies();
        location.reload();
        // environment.boardHeight *= environment.boardMultiplierPerLvl;
        // environment.boardWidth *= environment.boardMultiplierPerLvl;
        // this.modelService.checkerAlive = true;
        // this.generateMaze();
        // _.each(movingObjects, o => o.run());
      });
    }, 2000);
  }

  private startFlashing() {
    this.flash = true;
  }

  private stopFlashing() {
    this.flash = false;
  }

  stopBlueGhostsTimeSound() {
    try {
      this.blueGhostsTimeAudio.pause();
      this.blueGhostsTimeAudio.remove();
      delete this.blueGhostsTimeAudio;
    } catch (e) { } // it may have been removed already
  }

  private playBlueGhostsTimeSound() {
    this.stopBlueGhostsTimeSound();
    this.blueGhostsTimeAudio = new Audio('assets/pacman-blue-ghosts-time.mp3');
    this.blueGhostsTimeAudio.play();
  }

  playSoundOnce(sound: 'beginning' | 'death' | 'eat-ghost' | 'eat-fruit') {
    const audio = new Audio(`assets/pacman-${sound}.wav`);
    audio.play();
  }

  // tslint:disable-next-line:member-ordering
  private chompAudioSubscription: Subscription;
  private chompAudioListener() {
    const myAudio = new Audio('assets/pacman-chomp.wav');
    const mute = () => {
      myAudio.muted = true;
    };
    mute();
    myAudio.play();
    this.observablesService.chompSound$.subscribe(() => {
      myAudio.muted = false;
      this.chompAudioSubscription && this.chompAudioSubscription.unsubscribe();
      this.chompAudioSubscription = Observable.of('').delay(500).subscribe(mute);
    });
    myAudio.addEventListener('ended', () => {
      myAudio.currentTime = 100;
      myAudio.play();
    });
  }

}
