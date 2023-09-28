import p5 from "p5";
import { Curve, Curves, Point, ReduceData } from "./models";
import {
  normalizeXAxis,
  normalizedToCoordinates,
  toScreenCoordinates,
} from "./coordinates";
import {
  END_YEAR,
  LEFT_MARGIN,
  RIGHT_MARGIN,
  START_YEAR,
  TEXT_SIZE,
  THIS_YEAR,
  WIDTH,
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

export const createCurve = (points: Point[], noise: boolean = false): Curve => {
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

export const drawCurve = (
  p: p5,
  curve: Curve,
  t: number,
  color: string = "#FFFFFF",
  strokeWeight: number = 1.0,
): Point => {
  const targetX = t * (curve.bbox.ep.x - curve.bbox.sp.x);
  let currentX = 0;
  let endPoint: Point;

  p.push();
  p.stroke(color);

  p.beginShape();
  p.strokeWeight(strokeWeight);
  p.vertex(curve.points[0].x, curve.points[0].y);
  for (let i = 1; i < curve.points.length; i++) {
    let deltaX = curve.points[i].x - curve.points[i - 1].x;
    endPoint = curve.points[i];

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
  p.pop();

  return endPoint;
};

export const drawCurveLabels = (
  p: p5,
  x: number,
  curveLabels: [number, string, string][],
) => {
  //sort the labels
  const sorted = curveLabels.sort((a, b) => b[0] - a[0]);
  const first = sorted[0];
  drawCurveLabel(p, x, first[0], first[1], first[2]);
  let lastY = first[0];

  for (let i = 1; i < sorted.length; i++) {
    const [y, text, color] = sorted[i];
    if (lastY - y < TEXT_SIZE) {
      const newY = lastY - TEXT_SIZE;
      drawCurveLabel(p, x, newY, text, color);
      lastY = newY;
    } else {
      drawCurveLabel(p, x, y, text, color);
      lastY = y;
    }
  }
};

const drawCurveLabel = (
  p: p5,
  x: number,
  y: number,
  text: string,
  color: string,
) => {
  p.push();
  p.noStroke();
  p.fill(color);
p.textStyle(p.BOLD);
  p.textAlign(p.LEFT, p.BOTTOM);
  p.text(text, x + 5, y + 2);
  p.pop();
};

export const drawVerticaLine = (
  p: p5,
  nx: number,
  label: string = "",
  labelOpacity: number = 255,
  spt: number = 0.0,
) => {
  let sp = normalizedToCoordinates(nx, spt);
  let ep = normalizedToCoordinates(nx, 1.0);
  p.line(sp.x, sp.y, ep.x, ep.y);
  p.push();
  p.noStroke();
  p.fill(255, labelOpacity);
  p.textAlign(p.LEFT);
  p.text(label, sp.x, sp.y + 20);
  p.pop();
};

export const drawYears = (p: p5, t: number) => {
  const length = END_YEAR - START_YEAR;
  for (let i = 0; i < length; i++) {
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
      drawVerticaLine(p, nYear, `${THIS_YEAR}`, 255, -0);
    } else {
      p.strokeWeight(1);
      p.stroke(255, 100 * ar);
      let label = "";
      if (i % 5 === 3 || i === 0 || i === length - 1) {
        label = `${i + START_YEAR}`;
        drawVerticaLine(p, nYear, label, 255 * ar, -0.02);
      } else {
        drawVerticaLine(p, nYear, label, 255 * ar);
      }
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
  p.stroke(255, 255, 0, 100 * ar);
  drawVerticaLine(p, nYear);
  p.pop();
};

export const drawLabel = (
  p: p5,
  nx: number,
  ny: number,
  text: string,
  appearAt: number = 0,
) => {
  if (ny < appearAt) {
    // const pt = normalizedToCoordinates(nx, ny);
    p.push();
    p.textAlign(p.CENTER, p.CENTER);
    p.textStyle(p.BOLD);
    p.fill("white");
    p.noStroke();
    p.text(text, nx, ny);
    p.pop();
  }
};

export const drawHorizontalLine = (p: p5, y: number) => {
  p.line(LEFT_MARGIN, y, WIDTH - RIGHT_MARGIN, y);
};
