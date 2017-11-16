import { ObservablesService } from './observables.service';
import { Injectable } from '@angular/core';
import { PacmanComponent } from './pacman/pacman.component';
import { GhostComponent } from './ghost/ghost.component';
import { BoardComponent } from './board/board.component';
import { IStartingGhostValues } from './i-starting-ghost-values';
import { ILine } from './i-line';
import { IDot } from './i-dot';
import { Block } from './block';
import { environment } from '../environments/environment';
import * as _ from 'lodash';
import { TopBarComponent } from './top-bar/top-bar.component';

@Injectable()
export class ModelService {

  public pacman: PacmanComponent;
  public ghosts: GhostComponent[] = [];
  public board: BoardComponent;
  public topBar: TopBarComponent;

  public boardHeight: number;
  public boardWidth: number;
  public highScore: number;
  public currentScore: number;
  public lvl: number;
  public lives: number;

  public gameFrozen = true;
  public blueGhostsTimeTime = 5000;
  public checkerAlive = true;
  public ghostMultiplier = 0;
  public boardSize: 1 | 2 | 3;
  public paths: ILine[] = [

  ];
  public startingLines: ILine[] = [
    // {
    //   path: [
    //     { x: (environment.boardWidth / 2) - 10, y: (environment.boardWidth / 2) - 10 },
    //     { x: (environment.boardWidth / 2) - 10, y: (environment.boardHeight / 2) + 10 },
    //   ],
    //   el: undefined,
    //   walls: ['left'],
    //   iBlock: Block.iBlockFromTlXl((environment.boardWidth / 2) - 10, (environment.boardWidth / 2) - 10),
    // },
    // {
    //   path: [
    //     { x: (environment.boardWidth / 2) - 10, y: (environment.boardHeight / 2) + 10 },
    //     { x: (environment.boardWidth / 2) + 10, y: (environment.boardHeight / 2) + 10 },
    //   ],
    //   el: undefined,
    //   wall: 'down',
    //   iBlock: Block.iBlockFromTlXl((environment.boardWidth / 2) - 10, (environment.boardWidth / 2) + 10),
    // },
    // {
    //   path: [
    //     { x: (environment.boardWidth / 2) + 10, y: (environment.boardHeight / 2) + 10 },
    //     { x: (environment.boardWidth / 2) + 10, y: (environment.boardHeight / 2) - 10 },
    //   ],
    //   el: undefined,
    //   wall: 'right',
    // },
    // {
    //   path: [
    //     { x: (environment.boardWidth / 2) + 10, y: (environment.boardHeight / 2) - 10 },
    //     { x: (environment.boardWidth / 2) - 10, y: (environment.boardWidth / 2) - 10 },
    //   ],
    //   el: undefined,
    //   wall: 'up',
    // },
  ];
  public startingBlocks: Block[] = [];

  public startingGhostPositions: IStartingGhostValues[];

  public dots: IDot[] = [];

  constructor(
    private observablesService: ObservablesService,
  ) {
    this.currentScore = +localStorage.getItem('currentScore') || 0;
    this.highScore = +localStorage.getItem('highScore') || 0;
    this.lives = +localStorage.getItem('lives') || environment.pacmanStartingLives;
    this.lvl = +localStorage.getItem('lvl') || 1;
    this.observablesService.appComponentReady$.subscribe(() => {
      this.startingGhostPositions = [
        { id: 'red', x: 1, y: 1, timeInBox: 3000, direction: 'right' },
        { id: 'pink', x: environment.boardWidth - 9, y: 1, timeInBox: 1000, direction: 'down' },
        { id: 'orange', x: 1, y: environment.boardHeight - 9, timeInBox: 3000, direction: 'right' },
        { id: 'green', x: environment.boardWidth - 9, y: environment.boardHeight - 9, timeInBox: 5000, direction: 'up' },
        { id: 'purple', x: 1, y: 1, timeInBox: 3000, direction: 'right' },
        { id: 'brown', x: environment.boardWidth - 9, y: 1, timeInBox: 1000, direction: 'down' },
        { id: 'blue', x: 1, y: environment.boardHeight - 9, timeInBox: 3000, direction: 'right' },
        { id: 'black', x: environment.boardWidth - 9, y: environment.boardHeight - 9, timeInBox: 5000, direction: 'up' },
      ];
    });
  }

  private getGhostsBox(): Block[] {
    // top left of ghost box
    let x = (environment.boardWidth / 2) - 10;
    let y = (environment.boardWidth / 2) - 10;
    const topLeft = new Block(Block.iBlockFromTlXl(x, y), ['left', 'up'], true);
    x += 10;
    const topCenter = new Block(Block.iBlockFromTlXl(x, y), ['up'], true);
    x += 10;
    const topRight = new Block(Block.iBlockFromTlXl(x, y), ['right', 'up'], true);
    y += 10;
    const bottomRight = new Block(Block.iBlockFromTlXl(x, y), ['right', 'down'], true);
    x -= 10;
    const centerRight = new Block(Block.iBlockFromTlXl(x, y), ['down'], true);
    x -= 10;
    const bottomLeft = new Block(Block.iBlockFromTlXl(x, y), ['down', 'left'], true);
    return [topLeft, topCenter, topRight, bottomRight, centerRight, bottomLeft];
  }
}
