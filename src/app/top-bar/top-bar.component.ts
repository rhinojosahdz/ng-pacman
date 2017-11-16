import { ObservablesService } from '../observables.service';
import { ModelService } from '../model.service';
import { environment } from './../../environments/environment';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: '[app-top-bar]',
  templateUrl: './top-bar.component.html',
  styleUrls: ['./top-bar.component.scss']
})
export class TopBarComponent implements OnInit {

  paddingTop = environment.padding.top;
  width = environment.boardWidth + environment.padding.left + environment.padding.right
  highScore = +localStorage.getItem('highScore') || 0;
  currentScore = +localStorage.getItem('currentScore') || 0;

  constructor(
    public modelService: ModelService,
    public observablesService: ObservablesService,
  ) { }

  ngOnInit() {
    this.modelService.topBar = this;
    this.observablesService.pacmanEatADot$.subscribe(dot => {
      const prevCurrentScore = this.currentScore;
      if (dot.magic) {
        this.modelService.board.startBlueGhostsTime();
        this.currentScore += environment.points.dot;
      } else {
        this.modelService.pacman.playChopSound();
        this.currentScore += environment.points.magicDot;
      }
      this.observablesService.currentScoreWentUp.next({ prevCurrentScore, currentScore: this.currentScore });
    });
    this.observablesService.pacmanEatAGhost$.subscribe(d => {
      const prevCurrentScore = this.currentScore;
      this.currentScore += environment.points.ghost[d.multiplier];
      this.observablesService.currentScoreWentUp.next({ prevCurrentScore, currentScore: this.currentScore });
    });
    this.observablesService.currentScoreWentUp$.subscribe(data => {
      const n = environment.everyThisManyPointsGoOneLifeUp;
      if ((data.prevCurrentScore % n) > (data.currentScore % n)) {
        if (this.modelService.lives <= environment.maxNumOfLives) {
          this.modelService.pacman.lives++;
        }
      }
    });
  }

  highScoreTransform() {
    return `translate(${0},${0})`;
  }

  currentScoreTransform() {
    return `translate(${environment.boardWidth},${0})`;
  }

  highScoreLabelTransform() {
    return `translate(${0},${0})`;
  }

  currentScoreLabelTransform() {
    return `translate(${environment.boardWidth},${0})`;
  }

  bottomCenterLabelTransform() {
    return `translate(${environment.boardWidth / 2},${0})`;
  }
}
