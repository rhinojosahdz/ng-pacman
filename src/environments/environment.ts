import { IDirectionsMap } from './../app/i-directions-map';
// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
import { IDirection } from '../app/i-direction';

export const environment = {
  production: false,
  test: false,
  boardWidth: 40,
  boardHeight: 40,
  speedMultiplierPerLvl: 10,
  boardMultiplierPerLvl: 20,
  pacmanSpeed: 50,
  ghostSpeed: 70,
  pacmanSpeed1: 40,
  pacmanSpeed2: 35,
  pacmanSpeed3: 30,
  pacmanFastestsSpeedAllowed: 25,
  ghostSpeed1: 60,
  ghostSpeed2: 50,
  pacmanStartingLives: 3,
  ghostSpeed3: 40,
  ghostFastestsSpeedAllowed: 25,
  padding: {
    top: 15,
    bottom: 10,
    left: 10,
    right: 10,
  },
  maxNumOfLives: 5,
  everyThisManyPointsGoOneLifeUp: 1000,
  points: {
    dot: 1,
    magicDot: 10,
    ghost: {
      0: 20,
      1: 40,
      2: 100,
      3: 200,
    }
  },
  checkerMaxMoves: 700,
  timeBeforePacmanDyingAnimation: 2000,
  timeStartAnimation: 2200, // TODO match with the game-started music
  timeBeforeWeRestartGame: 5000,
  disableTeleportableDots: true,
  intervalPacmanDyingAnimation: 80,
  directions: <[IDirection, IDirection, IDirection, IDirection]>['up', 'down', 'left', 'right'],
  oppositeDirections: <IDirectionsMap>{ up: 'down', down: 'up', left: 'right', right: 'left' },
  nextDirectionsRight: <IDirectionsMap>{ up: 'right', right: 'down', down: 'left', left: 'up' },
  nextDirectionsLeft: <IDirectionsMap>{ up: 'left', left: 'down', down: 'right', right: 'up' },
  nextDirectionsSideways: <IDirectionsMap>{ up: 'right', left: 'right', down: 'left', right: 'left' },
  nextDirectionsUpAndDown: <IDirectionsMap>{ up: 'down', left: 'up', down: 'up', right: 'down' },
};
