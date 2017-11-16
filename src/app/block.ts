import { IXy } from './i-xy';
import { IBlock } from './i-block';
import * as _ from 'lodash';
import { environment } from '../environments/environment';
import { IDirection } from './i-direction';
import { ILine } from './i-line';

export class Block {
  private iBlock: IBlock;
  private blocks: Block[];
  private walls: IDirection[] = [];
  private isGhostBoxBlock: boolean;
  public el: any;
  public x: number;
  public y: number;

  constructor(iBlock: IBlock, walls?: IDirection[], isGhostBoxBlock = false) {
    this.isGhostBoxBlock = isGhostBoxBlock;
    this.iBlock = iBlock;
    this.x = iBlock.tl.x;
    this.y = iBlock.tl.y;
    _.each(walls, w => {
      this.addWall(w);
    });
  }

  public static findBlockAtXy(iXy: IXy, blocks: Block[]) {
    const iBlock = Block.iBlockFromTlXl(iXy.x, iXy.y);
    const b = new Block(iBlock);
    b.setBlocks(blocks);
    return b.findBlock(iBlock);
  }

  public static iLineToBlock(iLine: ILine) {
    const block = new Block({
      tl: { x: iLine.path[0].x, y: iLine.path[0].y },
      tr: { x: iLine.path[0].x + 10, y: iLine.path[0].y },
      bl: { x: iLine.path[1].x, y: iLine.path[1].y + 10 },
      br: { x: iLine.path[1].x + 10, y: iLine.path[1].y + 10 },
    });
    return block;
  }

  public static iBlockFromTlXl(x: number, y: number): IBlock {
    return {
      tl: { x: x, y: y },
      tr: { x: x + 10, y: y },
      bl: { x: x, y: y + 10 },
      br: { x: x + 10, y: y + 10 },
    };
  }

  private removeWall(wall: IDirection) {
    _.pull(this.walls, wall);
  }

  public removeAllWalls() {
    _.each(this.getWalls(), w => {
      this.removeWall(w);
    });
  }

  /**
   * ignore, this is an attemp to remove ILine all together
   * and manage each block as a path with 4 possible walls but
   * I believe we would need to change the collision logic from
   * lines to block (path with 1 line to path with 4 possible lines),
   * basically we would need to check the block ahead and see which walls
   * it has and see if moving-object would face a block ahead as well as
   * top left right bottom to see if the moving-object could turn that way
   */
  getPath() {
    let d = 'M ';
    const x = this.x;
    const y = this.y;
    const map = {
      left: [
        { x: x, y: y },
        { x: x, y: y + 10 },
      ],
      right: [
        { x: x + 10, y: y },
        { x: x + 10, y: y + 10 },
      ],
      up: [
        { x: x, y: y },
        { x: x + 10, y: y },
      ],
      down: [
        { x: x, y: y + 10 },
        { x: x + 10, y: y + 10 },
      ],
    };
    _.each(this.walls, w => {
      d += ` ${map[w][0].x} ${map[w][0].y} L ${map[w][1].x} ${map[w][1].y} `;
    });
    return `${d}`;
  }

  public alreadyExistsAtXy(x: number, y: number) {
    return !!this.getBlockAtXy(x, y);
  }

  public getBlockAtXy(x: number, y: number) {
    const iBlock: IBlock = {
      tl: { x: x, y: y },
      tr: { x: x + 10, y: y },
      bl: { x: x, y: y + 10 },
      br: { x: x + 10, y: y + 10 },
    };
    return this.findBlock(iBlock);
  }

  public generateWalls() {
    if (this.isOutsideBlock()) {
      if (this.isTopBlock()) {
        this.addWall('up');
      }
      if (this.isBottomBlock()) {
        this.addWall('down');
      }
      if (this.isLeftBlock()) {
        this.addWall('left');
      }
      if (this.isRightBlock()) {
        this.addWall('right');
      }
    } else {
      let possibleWalls = this.getAdjacentBlocksWithLessThan2Lines();
      const sharedWalls = this.getSharedWalls();
      this.walls = sharedWalls;
      possibleWalls = _.pullAllBy(possibleWalls, sharedWalls);
      while (this.walls.length < 2) {
        const newWall = _.sample(possibleWalls);
        _.pull(possibleWalls, newWall);
        this.walls.push(newWall);
      }
    }
  }

  public getSharedWalls() {
    const walls: IDirection[] = [];
    _.each(environment.directions, (d: IDirection) => {
      const b = this.getBlockAt(d);
      b && _.includes(b.getWalls(), environment.oppositeDirections[d]) && walls.push(d);
    });
    return walls;
  }

  public getBlockAt(iDirection: IDirection): Block {
    switch (iDirection) {
      case 'up':
        return this.getTopBlock();
      case 'down':
        return this.getBottomBlock();
      case 'left':
        return this.getLeftBlock();
      case 'right':
        return this.getRightBlock();
    }
  }

  public setBlocks(blocks: Block[]) {
    this.blocks = blocks;
  }

  public isInsideBlock() {
    const values = _.flatMap(_.map(<any>this.iBlock), (v: any) => [v.x, v.y]);
    // TODO this logic doesn't work if board.width and board.height are different
    const cannotHaveThisValues = [0, environment.boardWidth, environment.boardHeight];
    return !_.intersection(cannotHaveThisValues, values).length;
  }

  public isOutsideBlock(): boolean {
    return !this.isInsideBlock();
  }

  private getAdjacentBlocksWithLessThan2Lines(): IDirection[] {
    const dirs: IDirection[] = [];
    const surroundingBlocks: { dir: IDirection, block: Block }[] = [
      {
        dir: 'up', block: this.getTopBlock(),
      },
      {
        dir: 'down', block: this.getBottomBlock(),
      },
      {
        dir: 'left', block: this.getLeftBlock(),
      },
      {
        dir: 'right', block: this.getRightBlock(),
      },
    ];
    _.each(surroundingBlocks, sb => {
      (!sb.block || sb.block.getWalls().length < 2) && dirs.push(sb.dir);
    });
    return dirs;
  }

  // TODO @maybe rename this to upBlock?
  public isTheTopLeftBlock() {
    return this.isTopBlock() && this.isLeftBlock();
  }

  public isTheTopRightBlock() {
    return this.isTopBlock() && this.isRightBlock();
  }

  public isTheBottomLeftBlock() {
    return this.isBottomBlock() && this.isLeftBlock();
  }

  public isTheBottomRightBlock() {
    return this.isBottomBlock() && this.isRightBlock();
  }

  public isTopBlock() {
    return this.iBlock.tl.y === 0;
  }

  public isBottomBlock() {
    return this.iBlock.bl.y === environment.boardHeight;
  }

  public isLeftBlock() {
    return this.iBlock.tl.x === 0;
  }

  public isRightBlock() {
    return this.iBlock.tr.x === environment.boardWidth;
  }

  public getTopBlock() {
    const iBlock: IBlock = {
      tl: { x: this.iBlock.tl.x, y: this.iBlock.tl.y - 10 },
      tr: { x: this.iBlock.tr.x, y: this.iBlock.tr.y - 10 },
      bl: { x: this.iBlock.bl.x, y: this.iBlock.bl.y - 10 },
      br: { x: this.iBlock.br.x, y: this.iBlock.br.y - 10 },
    };
    return this.findBlock(iBlock);
  }

  public getLeftBlock() {
    const iBlock: IBlock = {
      tl: { x: this.iBlock.tl.x - 10, y: this.iBlock.tl.y },
      tr: { x: this.iBlock.tr.x - 10, y: this.iBlock.tr.y },
      bl: { x: this.iBlock.bl.x - 10, y: this.iBlock.bl.y },
      br: { x: this.iBlock.br.x - 10, y: this.iBlock.br.y },
    };
    return this.findBlock(iBlock);
  }

  public getRightBlock() {
    const iBlock: IBlock = {
      tl: { x: this.iBlock.tl.x + 10, y: this.iBlock.tl.y },
      br: { x: this.iBlock.br.x + 10, y: this.iBlock.br.y },
      bl: { x: this.iBlock.bl.x + 10, y: this.iBlock.bl.y },
      tr: { x: this.iBlock.tr.x + 10, y: this.iBlock.tr.y },
    };
    return this.findBlock(iBlock);
  }

  public getBottomBlock() {
    const iBlock: IBlock = {
      tl: { x: this.iBlock.tl.x, y: this.iBlock.tl.y + 10 },
      tr: { x: this.iBlock.tr.x, y: this.iBlock.tr.y + 10 },
      bl: { x: this.iBlock.bl.x, y: this.iBlock.bl.y + 10 },
      br: { x: this.iBlock.br.x, y: this.iBlock.br.y + 10 },
    };
    return this.findBlock(iBlock);
  }

  private findBlock(iBlock: IBlock) {
    return _.find(this.blocks, (b: Block) => {
      // TODO see if there's an easier way to deep search objects with lodash, maybe using _.difference?
      return (
        _.isEqual(b.iBlock.tl, { x: iBlock.tl.x, y: iBlock.tl.y })

        &&

        _.isEqual(b.iBlock.tr, { x: iBlock.tr.x, y: iBlock.tr.y })

        &&

        _.isEqual(b.iBlock.bl, { x: iBlock.bl.x, y: iBlock.bl.y })

        &&

        _.isEqual(b.iBlock.br, { x: iBlock.br.x, y: iBlock.br.y })
      );
    });
  }

  public addWall(iDirection: IDirection) {
    /**
     * because for ex the top-left block is both a top-left block and a top block,
     * so we could probably add the same wall twice
     */
    if (!_.includes(this.walls, iDirection)) {
      this.walls.push(iDirection);
    }
  }

  public getWalls() {
    return this.walls;
  }

  public getILines(): ILine[] {
    return _.map(this.getWalls(), w => this.getILine(w));
  }

  private getILine(wall: IDirection) {
    const obj: { [iDirection: string]: ILine } = {
      up: {
        path: [
          { x: this.iBlock.tl.x, y: this.iBlock.tl.y },
          { x: this.iBlock.tr.x, y: this.iBlock.tr.y },
        ]
      },
      down: {
        path: [
          { x: this.iBlock.bl.x, y: this.iBlock.bl.y },
          { x: this.iBlock.br.x, y: this.iBlock.br.y },
        ]
      },

      left: {
        path: [
          { x: this.iBlock.tl.x, y: this.iBlock.tl.y },
          { x: this.iBlock.bl.x, y: this.iBlock.bl.y },
        ]
      },
      right: {
        path: [
          { x: this.iBlock.tr.x, y: this.iBlock.tr.y },
          { x: this.iBlock.br.x, y: this.iBlock.br.y },
        ]
      },
    };
    return obj[wall];
  }

}
