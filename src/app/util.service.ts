import { Injectable, ElementRef } from '@angular/core';
import { IDirection } from './i-direction'
@Injectable()
export class UtilService {
  private oppositeDirection: { [iDirection: string]: IDirection } = { 'left': 'right', 'right': 'left', 'up': 'down', 'down': 'up' };
  constructor() { }

  svgChildrenColliding(c1: any, c2: any, type?: 'wall' | 'futureWall' | 'ghost-touching-pacman' | 'pacman-touching-dot', subType?: string) {
    const bcr1 = c1.getBoundingClientRect();
    const bcr2 = c2.getBoundingClientRect();

    const r1 = { left: bcr1.left, right: bcr1.right, up: bcr1.top, down: bcr1.bottom };
    const r2 = { left: bcr2.left, right: bcr2.right, up: bcr2.top, down: bcr2.bottom };

    switch (type) {
      case 'wall':
        r1.left--;
        r1.right++;
        r1.up--;
        r1.down++;
        break;
      // r1 = pacman, r2 = wall
      case 'futureWall':
        // TODO refactor
        switch (subType) {
          case 'up':
          case 'left':
            r1[subType] -= 2;
            r1[this.oppositeDirection[subType]] -= 2;
            break;
          case 'down':
          case 'right':
            r1[subType] += 2;
            r1[this.oppositeDirection[subType]] += 2;
            break;
        }
        break;
    }
    const diff = Math.abs(r1.left - r2.left) + Math.abs(r1.right - r2.right) + Math.abs(r1.up - r2.up) + Math.abs(r1.down - r2.down);
    let collapse = !(r2.left >= r1.right ||
      r2.right <= r1.left ||
      r2.up >= r1.down ||
      r2.down <= r1.up);

    if (collapse && type === 'ghost-touching-pacman') {
      // `diff` only works accurately if both r1 and r2 have the same size (or almost the same size)
      collapse = !(diff > 5);
    }

    return collapse;
  }

}
