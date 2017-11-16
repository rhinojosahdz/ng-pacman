import { IDirection } from '../i-direction';
import { MovingObjectService } from '../moving-object.service';
import { ObservablesService } from '../observables.service';
import { ModelService } from '../model.service';
import { environment } from './../../environments/environment';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: '[app-bottom-bar]',
  templateUrl: './bottom-bar.component.html',
  styleUrls: ['./bottom-bar.component.scss']
})
export class BottomBarComponent implements OnInit {

  constructor(
    public modelService: ModelService,
    public observablesService: ObservablesService,
    public movingObjectService: MovingObjectService,
  ) { }

  ngOnInit() { }

  getArrayOfLives() {
    return Array(this.modelService.pacman.lives).fill(0);
  }

  fruitsTransform() {
    return `translate(${environment.boardWidth},${0})`;
  }

  getArrowDirectionDeg(direction: IDirection) {
    const map = { up: 0, right: 90, down: 180, left: 270 };
    return map[direction];
  }
}
