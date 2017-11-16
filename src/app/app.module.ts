import { BrowserModule } from '@angular/platform-browser';
import { NgModule, NO_ERRORS_SCHEMA } from '@angular/core';

import { AppComponent } from './app.component';
import { PacmanComponent } from './pacman/pacman.component';

import { ModelService } from './model.service';
import { UtilService } from './util.service';
import { ObservablesService } from './observables.service';
import { MovingObjectService } from './moving-object.service';

import { BoardComponent } from './board/board.component';
import { GhostComponent } from './ghost/ghost.component';
import { NoCloseEndsCheckerComponent } from './no-close-ends-checker/no-close-ends-checker.component';
import { PacmanDyingComponent } from './pacman-dying/pacman-dying.component';
import { TopBarComponent } from './top-bar/top-bar.component';
import { BottomBarComponent } from './bottom-bar/bottom-bar.component';

@NgModule({
  declarations: [
    AppComponent,
    PacmanComponent,
    BoardComponent,
    GhostComponent,
    NoCloseEndsCheckerComponent,
    PacmanDyingComponent,
    TopBarComponent,
    BottomBarComponent,
  ],
  imports: [
    BrowserModule,
  ],
  providers: [
    ModelService,
    UtilService,
    ObservablesService,
    MovingObjectService,
  ],
  bootstrap: [
    AppComponent,
  ],
  schemas: [
    NO_ERRORS_SCHEMA
  ],
})
export class AppModule { }
