import p5 from "p5";
import { Curves, ReduceData } from "./models";
import {
  normalizeYear,
  normalizedToCoordinates,
  officeRelativeToCoordinate,
  officeToCoordinate,
  residentialToCoordinates,
} from "./coordinates";
import {
  AMENITIES_TARGET_RATIO,
  EARLY_YEAR_SHARE,
  END_YEAR,
  RESIDENCE_TARGET_RATIO,
  START_YEAR,
  THIS_YEAR,
} from "./constants";
import { divdeResidential, jitter } from "./data_utils";

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

export const curveLength = (points: Point[]): number => {
  let length = 0.0;
  for (let i = 1; i < points.length; i++) {
    let segLength = Math.sqrt(
      Math.pow(points[i].x - points[i - 1].x, 2) +
        Math.pow(points[i].y - points[i - 1].y, 2),
    );
    length += segLength;
  }
  return length;
};

export const curveBbox = (points: Point[]) => {
  let minX = 1000000000000;
  let maxX = -1000000000000;
  let minY = 1000000000000;
  let maxY = -1000000000000;

  points.forEach((p) => {
    minX = minX < p.x ? minX : p.x;
    maxX = maxX > p.x ? maxX : p.x;
    minY = minY < p.y ? minY : p.y;
    maxY = maxY > p.y ? maxY : p.y;
  });

  return { sp: { x: minX, y: minY }, ep: { x: maxX, y: maxY } };
};

export const createCurves = (annual: ReduceData): Curves => {
  let officePoints: Point[] = [];
  // let residentialPoints: Point[] = [];
  let earlyPoints: Point[] = [];
  let midPoints: Point[] = [];
  let essentialPoints: Point[] = [];
  let executivePoints: Point[] = [];
  let seniorPoints: Point[] = [];

  let amenitiesPoints: Point[] = [];
  for (let key of Object.keys(annual)) {
    const year = parseInt(key);
    const office = annual[year]["office"];
    const residential = annual[year]["residential"];
    const amenities = annual[year]["amenities"];
    officePoints.push(officeToCoordinate(year, office));
    const { ep, mp, esp, exp, sp } = residentialToCoordinates(
      year,
      residential,
      office,
    );
    earlyPoints.push(ep);
    midPoints.push(mp);
    essentialPoints.push(esp);
    executivePoints.push(exp);
    seniorPoints.push(sp);
    const amePoint = officeRelativeToCoordinate(
      year,
      amenities,
      office,
      AMENITIES_TARGET_RATIO,
    );
    amenitiesPoints.push(amePoint);
  }

  return {
    office: createCurve(officePoints),
    residential: {
      early: createCurve(earlyPoints),
      mid: createCurve(midPoints),
      essential: createCurve(essentialPoints),
      executive: createCurve(executivePoints),
      senior: createCurve(seniorPoints),
    },
    amenities: createCurve(amenitiesPoints),
  };
};

export const createCurve = (points: Point[]): Curve => {
  let length = curveLength(points);
  let bbox = curveBbox(points);
  return { points, length, bbox };
};

export const drawCurve = (p: p5, curve: Curve, t: number) => {
  const targetLength = t * curve.length;
  let currentLength = 0;

  p.beginShape();
  p.vertex(curve.points[0].x, curve.points[0].y);
  for (let i = 1; i < curve.points.length; i++) {
    let segLength = Math.sqrt(
      Math.pow(curve.points[i].x - curve.points[i - 1].x, 2) +
        Math.pow(curve.points[i].y - curve.points[i - 1].y, 2),
    );

    if (currentLength + segLength >= targetLength) {
      const q = (targetLength - currentLength) / segLength;
      const tx =
        curve.points[i - 1].x + q * (curve.points[i].x - curve.points[i - 1].x);
      const ty =
        curve.points[i - 1].y + q * (curve.points[i].y - curve.points[i - 1].y);
      p.vertex(tx, ty);
      break;
    } else {
      const { x, y } = curve.points[i];
      currentLength += segLength;
      p.vertex(x, y);
    }
  }
  p.endShape();
};

export const drawCurveSpanX = (
  p: p5,
  curve: Curve,
  t: number,
  label: string = "",
) => {
  const targetX = t * (curve.bbox.ep.x - curve.bbox.sp.x);
  let currentX = 0;
  let endPoint: Point;

  p.beginShape();
  p.vertex(curve.points[0].x, curve.points[0].y);
  for (let i = 1; i < curve.points.length; i++) {
    let deltaX = curve.points[i].x - curve.points[i - 1].x;

    if (currentX + deltaX >= targetX) {
      const q = (targetX - currentX) / deltaX;
      const tx =
        curve.points[i - 1].x + q * (curve.points[i].x - curve.points[i - 1].x);
      const ty =
        curve.points[i - 1].y + q * (curve.points[i].y - curve.points[i - 1].y);
      p.vertex(tx, ty);
      endPoint = { x: tx, y: ty };
      break;
    } else {
      const { x, y } = curve.points[i];
      currentX += deltaX;
      p.vertex(x, y);
    }
  }
  p.endShape();

  p.push();
  p.textAlign(p.LEFT, p.CENTER);
  p.text(label, endPoint.x + 5, endPoint.y);
  p.pop();
};

export const drawVerticaLine = (
  p: p5,
  year: number,
  label: string = "",
  labelOpacity: number = 255,
) => {
  let n = normalizeYear(year);
  let sp = normalizedToCoordinates(n, 0.0);
  let ep = normalizedToCoordinates(n, 1.0);
  p.line(sp.x, sp.y, ep.x, ep.y);
  p.push();
  p.noStroke();
  p.fill(255, labelOpacity);
  p.textAlign(p.CENTER);
  p.text(label, sp.x, sp.y + 20);
  p.pop();
};

export const drawYears = (p: p5, t: number) => {
  for (let year = START_YEAR; year < END_YEAR; year++) {
    let nStart = normalizeYear(year - 7);
    let nYear = normalizeYear(year);
    let nt = t - nStart;
    let ny = nYear - nStart;
    let ar = nt / ny;
    ar = ar < 1.0 ? ar : 1.0;
    ar = ar > 0.0 ? ar : 0.0;

    p.push();
    if (year === THIS_YEAR) {
      p.stroke(255, 255);
      p.strokeWeight(3);
      drawVerticaLine(p, year, `${THIS_YEAR}`);
    } else {
      p.strokeWeight(1);
      p.stroke(255, 100 * ar);
      let label = "";
      if (year % 5 === 3) {
        label = `${year}`;
      }
      drawVerticaLine(p, year, label, 255 * ar);
    }
    p.pop();
  }
};

export const drawCommunityMeeting = (p: p5, year: number, t: number) => {
  let nStart = normalizeYear(year - 1);
  let nYear = normalizeYear(year);
  let nt = t - nStart;
  let ny = nYear - nStart;
  let ar = nt / ny;
  ar = ar < 1.0 ? ar : 1.0;
  ar = ar > 0.0 ? ar : 0.0;

  p.push();
  p.strokeWeight(10);
  p.stroke(255, 255, 0, 100 * ar);
  drawVerticaLine(p, year);
  p.pop();
};

export const drawHorizontalLine = (p: p5, rate: number) => {
  const sp = normalizedToCoordinates(0.0, rate);
  const ep = normalizedToCoordinates(1.0, rate);
  p.line(sp.x, sp.y, ep.x, ep.y);
};
