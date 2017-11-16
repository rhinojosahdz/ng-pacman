import {IXy} from './i-xy';
import {IDirection} from './i-direction';
export interface IPacmanStartingPosition {
  side: IDirection;
  direction: IDirection;
  xY: IXy;
}
