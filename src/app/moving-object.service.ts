import { Injectable } from '@angular/core';
import { MovingObject } from './moving-object';
import { IDirection } from './i-direction';

@Injectable()
export class MovingObjectService {

  getTranslate(x, y) {
    return `translate(${x}, ${y})`;
    // return `translate(${this.x}, ${this.y})`; // scale(.1)
  }

  getRotate(direction: IDirection, radius: number, overrideDeg?: number) {
    return `rotate(${overrideDeg || this.getDirectionDeg(direction)}, ${radius}, ${radius})`;
    // return `rotate(${this.getDirectionDeg()}, 125, 125)`;
  }

  private getDirectionDeg(direction) {
    const map = { left: 180, right: 0, down: 90, up: 270 };
    return map[direction];
  }

}
