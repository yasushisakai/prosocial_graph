import p5 from "p5";
import { Curve, Curves, Point, ReduceData } from "./models";
import {
  normalizeXAxis,
  normalizedToCoordinates,
  toScreenCoordinates,
} from "./coordinates";
import {
  AMENITIES_TARGET_RATIO,
  END_YEAR,
  START_YEAR,
  THIS_YEAR,
} from "./constants";

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
  const convert = (rate: number, i: number) => toScreenCoordinates(i, rate);

  const officePoints = annual.office.map(convert);
  const earlyPoints = annual.residential.early.map(convert);
  const midPoints = annual.residential.mid.map(convert);
  const executivePoints = annual.residential.executive.map(convert);
  const essentialPoints = annual.residential.essential.map(convert);
  const seniorPoints = annual.residential.senior.map(convert);
  const amenitiesPoints = annual.amenities.map(convert);

  return {
    office: createCurve(officePoints),
    residential: {
      early: createCurve(earlyPoints, true),
      mid: createCurve(midPoints, true),
      essential: createCurve(essentialPoints, true),
      executive: createCurve(executivePoints, true),
      senior: createCurve(seniorPoints, true),
    },
    amenities: createCurve(amenitiesPoints, true),
  };
};

export const createCurve = (
  points: Point[],
  noise: boolean = false,
): Curve => {
  if (noise) {
    points = points.map((p) => {
      let y = (Math.random() - 0.5) * 5 + p.y;
      y = Math.max(0, y);
      return {
        x: p.x,
        y,
      };
    });
  }

  const length = curveLength(points);
  const bbox = curveBbox(points);
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
  nx: number,
  label: string = "",
  labelOpacity: number = 255,
) => {
  let sp = normalizedToCoordinates(nx, 0.0);
  let ep = normalizedToCoordinates(nx, 1.0);
  p.line(sp.x, sp.y, ep.x, ep.y);
  p.push();
  p.noStroke();
  p.fill(255, labelOpacity);
  p.textAlign(p.CENTER);
  p.text(label, sp.x, sp.y + 20);
  p.pop();
};

export const drawYears = (p: p5, t: number) => {
  for (let i = 0; i < END_YEAR - START_YEAR; i++) {
    let nStart = normalizeXAxis(i - 7);
    let nYear = normalizeXAxis(i);
    let nt = t - nStart;
    let ny = nYear - nStart;
    let ar = nt / ny;
    ar = ar < 1.0 ? ar : 1.0;
    ar = ar > 0.0 ? ar : 0.0;

    p.push();
    if (i === THIS_YEAR - START_YEAR) {
      p.stroke(255, 255);
      p.strokeWeight(3);
      drawVerticaLine(p, nYear, `${THIS_YEAR}`);
    } else {
      p.strokeWeight(1);
      p.stroke(255, 100 * ar);
      let label = "";
      if (i % 5 === 3) {
        label = `${i + START_YEAR}`;
      }
      drawVerticaLine(p, nYear, label, 255 * ar);
    }
    p.pop();
  }
};

export const drawCommunityMeeting = (p: p5, year: number, t: number) => {
  let yearIndex = year - START_YEAR;
  let nStart = normalizeXAxis(yearIndex - 1);
  let nYear = normalizeXAxis(yearIndex);
  let nt = t - nStart;
  let ny = nYear - nStart;
  let ar = nt / ny;
  ar = ar < 1.0 ? ar : 1.0;
  ar = ar > 0.0 ? ar : 0.0;

  p.push();
  p.strokeWeight(10);
  p.strokeCap(p.SQUARE);
  p.stroke(255, 255, 0, 100 * ar);
  drawVerticaLine(p, nYear);
  p.pop();
};

export const drawHorizontalLine = (p: p5, rate: number) => {
  const sp = normalizedToCoordinates(0.0, rate);
  const ep = normalizedToCoordinates(1.0, rate);
  p.line(sp.x, sp.y, ep.x, ep.y);
};
