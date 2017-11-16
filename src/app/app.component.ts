import { ObservablesService } from './observables.service';
import { ModelService } from './model.service';
import { environment } from '../environments/environment';
import { Component, HostListener } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  constructor(
    private observablesService: ObservablesService,
    private modelService: ModelService, // needed so it bootstaps at the beginning
  ) {
    const lvl = +localStorage.getItem('lvl') || 1;
    this.modelService.boardSize = <any>((lvl % 3 === 0) ? 3 : (lvl % 3)); // it can only be 1 | 2 | 3
    this.lvlDifficultyStuff(lvl);
    this.makeResponsive();
    this.observablesService.appComponentReady.next();
  }

  lvlDifficultyStuff(lvl) {
    let boardSize = this.modelService.boardSize;
    if (lvl >= 7) {
      boardSize = <any>(lvl - 3);
      boardSize = 2;
      this.modelService.boardSize = 3;
      if (lvl >= 10) {
        boardSize = <any>4;
        environment.pacmanSpeed1 = environment.pacmanSpeed2 = environment.pacmanSpeed3 = environment.pacmanFastestsSpeedAllowed = 0;
        environment.ghostSpeed1 = environment.ghostSpeed2 = environment.ghostSpeed3 = environment.ghostFastestsSpeedAllowed = 0;
        environment.checkerMaxMoves = 1000;
      }
    }
    environment.boardHeight = environment.boardHeight + (boardSize * environment.boardMultiplierPerLvl);
    environment.boardWidth = environment.boardWidth + (boardSize * environment.boardMultiplierPerLvl);
  }

  makeResponsive() {
    const padding = environment.padding;
    const pageWidth = environment.boardWidth + padding.left + padding.right;
    const pageHeight = environment.boardHeight + padding.top + padding.bottom;
    const windowWidth = window.innerWidth,
      newScaleWidth = windowWidth / pageWidth;
    const windowHeight = window.innerHeight,
      newScaleHeight = windowHeight / pageHeight;
    const newZoom = Math.min(newScaleWidth, newScaleHeight);
    (<any>document).body.style.zoom = Math.floor(newZoom);
  }
}
