// geometry
export interface Point {
  x: number;
  y: number;
}

export interface BoundingBox {
  sp: Point;
  ep: Point;
}

export interface Curve {
  points: Point[];
  length: number;
  bbox: BoundingBox;
}

// meant to save rates
export interface ReduceData {
  office: number[];
  residential: {
    early: number[];
    mid: number[];
    essential: number[];
    executive: number[];
    senior: number[];
  };
  amenities: number[];
}

export interface Curves {
  office: Curve;
  residential: {
    early: Curve;
    mid: Curve;
    essential: Curve;
    executive: Curve;
    senior: Curve;
  };
  amenities: Curve;
}
