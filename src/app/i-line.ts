interface Point {
  x: number;
  y: number;
}

export interface ILine {
  path: [Point, Point];
  el?: Element; // gets assigned later
}
