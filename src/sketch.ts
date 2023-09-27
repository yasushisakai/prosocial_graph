import p5 from "p5";
import { fetch_numbers, preProcess } from "./data_utils";
import {
  createCurves,
  drawCommunityMeeting,
  drawCurve,
  drawCurveLabels,
  drawHorizontalLine,
  drawLabel,
  drawYears,
} from "./geometry";
import { Curves } from "./models";
import {
  AMENITIES_COLOR,
  EARLY_COLOR,
  ESSENTIAL_COLOR,
  EXECUTIVE_COLOR,
  LEFT_MARGIN,
  MID_COLOR,
  OFFICE_COLOR,
  RIGHT_MARGIN,
  SENIOR_COLOR,
  TEXT_SIZE,
  VERTICAL_MARGIN,
} from "./constants";

let curves: Curves;
let loadTimeOffset = 0;

const sketch = (p: p5) => {
  p.preload = async () => {
    p.frameRate(60);
    let spreadSheetData = await fetch_numbers();
    const yearlyArea = preProcess(spreadSheetData);
    curves = createCurves(yearlyArea);
  };

  p.setup = () => {
    p.createCanvas(1920, 500);
    p.textSize(TEXT_SIZE);
    p.strokeCap(p.SQUARE);
  };

  p.draw = () => {
    if (!curves) {
      loadTimeOffset = p.frameCount;
      return;
    }

    p.background("#000000");
    drawHorizontalLine(p, 0.9);
    p.stroke("#ffffff");
    p.noFill();

    let t = ((p.frameCount - loadTimeOffset) % 3600) / 3600.0;
    drawYears(p, t);

    let curveLabels = [];

    const oep = drawCurve(p, curves.office, t, OFFICE_COLOR, 4);
    curveLabels.push([oep.y, "OFFICE / R&D", OFFICE_COLOR]);

    drawLabel(p, 150, oep.y - 10, "URBAN EQUILIBRIUM", 320);
    drawHorizontalLine(p, oep.y);

    const aep = drawCurve(p, curves.amenities, t, AMENITIES_COLOR);
    curveLabels.push([aep.y, "AMENITIES & SERVICES", AMENITIES_COLOR]);

    const eaep = drawCurve(p, curves.residential.early, t, EARLY_COLOR);
    curveLabels.push([eaep.y, "EARLY CAREER HOUSING", EARLY_COLOR]);

    const mep = drawCurve(p, curves.residential.mid, t, MID_COLOR);
    curveLabels.push([mep.y, "MID CAREER HOUSING", MID_COLOR]);

    const esep = drawCurve(p, curves.residential.essential, t, ESSENTIAL_COLOR);
    curveLabels.push([esep.y, "ESSENTIAL HOUSING", ESSENTIAL_COLOR]);

    const exep = drawCurve(p, curves.residential.executive, t, EXECUTIVE_COLOR);
    curveLabels.push([exep.y, "EXECUTIVE HOUSING", EXECUTIVE_COLOR]);

    const sep = drawCurve(p, curves.residential.senior, t, SENIOR_COLOR);
    curveLabels.push([sep.y, "SENIOR HOUSING", SENIOR_COLOR]);

    drawCurveLabels(p, sep.x, curveLabels);

    [2025, 2028, 2031, 2034, 2037, 2040].forEach((year) => {
      drawCommunityMeeting(p, year, t);
    });

    drawAxis(p);
  };
};

const drawAxis = (p: p5) => {
  p.push();
  p.strokeCap(p.PROJECT);
  p.strokeWeight(3);
  let y = p.height - VERTICAL_MARGIN;
  p.line(LEFT_MARGIN, y, p.width - RIGHT_MARGIN, y);
  p.line(LEFT_MARGIN, VERTICAL_MARGIN, LEFT_MARGIN, p.height - VERTICAL_MARGIN);
  p.pop();
};

new p5(sketch);
