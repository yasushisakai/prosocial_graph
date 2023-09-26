import p5 from "p5";
import { fetch_numbers, preProcess } from "./data_utils";
import {
  createCurves,
  drawCommunityMeeting,
  drawCurveSpanX,
  drawHorizontalLine,
  drawYears,
} from "./geometry";
import { Curves } from "./models";

let curves: Curves;

const sketch = (p: p5) => {
  p.preload = async () => {
    p.frameRate(60);
    let spreadSheetData = await fetch_numbers();
    const yearlyArea = preProcess(spreadSheetData);
    curves = createCurves(yearlyArea);
  };

  p.setup = () => {
    p.createCanvas(1920, 500);
  };

  p.draw = () => {
    p.background("#000000");
    drawHorizontalLine(p, 0.8);
    p.stroke("#ffffff");
    p.noFill();
    let t = (p.frameCount % 3600) / 3600.0;
    drawAxis(p);
    drawYears(p, t);

    p.push();
    p.stroke("#DB19F4");
    // office line
    drawCurveSpanX(p, curves.office, t, "office");
    p.pop();
    p.push();
    p.stroke("#FE0D00");
    // amenities line
    drawCurveSpanX(p, curves.amenities, t, "amenities");
    p.pop();

    drawResidential(p, curves, t);

    [2025, 2028, 2031, 2034, 2037, 2040].forEach((year) => {
      drawCommunityMeeting(p, year, t);
    });

  };
};

const drawResidential = (p: p5, curves: Curves, t: number) => {
  p.push();
  p.stroke("#E8DE3A");
  drawCurveSpanX(p, curves.residential.early, t, "early career");
  p.pop();

  p.push();
  p.stroke("#FFE14D");
  drawCurveSpanX(p, curves.residential.mid, t);
  p.pop();

  p.push();
  p.stroke("#F5C138");
  drawCurveSpanX(p, curves.residential.essential, t);
  p.pop();

  p.push();
  p.stroke("#FFB33A");
  drawCurveSpanX(p, curves.residential.executive, t, "executive");
  p.pop();

  p.push();
  p.stroke("#FFB33A");
  drawCurveSpanX(p, curves.residential.senior, t);
  p.pop();
};

const drawAxis = (p: p5) => {
  p.push();
  p.strokeWeight(3);
  let y = p.height - 50;
  let x = 50;
  p.line(50, y, p.width - 50, y);
  p.line(x, 50, x, p.height - 50);
  p.pop();
};

new p5(sketch);
