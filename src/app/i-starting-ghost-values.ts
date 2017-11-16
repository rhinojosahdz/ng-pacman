import { IDirection } from './i-direction';
export interface IStartingGhostValues {
  id: string;
  x: number;
  y: number;
  timeInBox: number;
  direction: IDirection;
}
