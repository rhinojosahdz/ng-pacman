import { IDirection } from './i-direction';

export interface IDirectionsMap<T = IDirection> {
  up: IDirection; down: IDirection; left: IDirection; right: IDirection;
  // [K in keyof T]: K[IDirection];
}
