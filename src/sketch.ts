import p5 from "p5";
import { fetch_numbers, preProcess } from "./data_utils";
import {
  createCurves,
  drawCommunityMeeting,
  drawCurve,
  drawHorizontalLine,
  drawLabel,
  drawYears,
} from "./geometry";
import { Curves } from "./models";

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
    p.textSize(14);
    p.strokeCap(p.SQUARE);
  };

  p.draw = () => {
    if (!curves) {
      loadTimeOffset = p.frameCount;
      return;
    }

    p.background("#000000");
    drawLabel(p, 0.0625, 0.93, "URBAN EQUILIBRIUM");
    drawHorizontalLine(p, 0.9);
    p.stroke("#ffffff");
    p.noFill();

    let t = ((p.frameCount - loadTimeOffset) % 3600) / 3600.0;
    drawYears(p, t);

    drawCurve(p, curves.office, t, "OFFICE / R&D", "#E82BFF", 3.0, true);
    drawCurve(p, curves.amenities, t, "AMENITIES & SERVICES", "#FE0D00");

    drawCurve(p, curves.residential.early, t, "EARLY CAREER HOUSING", "#FFF409");
    drawCurve(p, curves.residential.mid, t, "MID CAREER HOUSING", "#F6E44B");
    drawCurve(p, curves.residential.essential, t, "ESSENTIAL HOUSING", "#FAD401");
    drawCurve(p, curves.residential.executive, t, "EXECUTIVE HOUSING", "#FFD752");
    drawCurve(p, curves.residential.senior, t, "SENIOR HOUSING", "#FFC40C");

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
  let y = p.height - 50;
  let x = 50;
  p.line(50, y, p.width - 50, y);
  p.line(x, 50, x, p.height - 50);
  p.pop();
};

new p5(sketch);
