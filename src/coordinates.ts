import { END_YEAR, HEIGHT, MARGIN_PIXEL, START_YEAR, WIDTH } from "./constants";
import { Point } from "./models";

export const normalizeXAxis = (index: number) => {
  let t = index / (END_YEAR - START_YEAR - 1);
  return t;
};

// converts parameter x,y values to actual (screen) coordinates
export const normalizedToCoordinates = (nx: number, ny: number): Point => {
  const width = WIDTH - MARGIN_PIXEL * 2;
  const height = HEIGHT - MARGIN_PIXEL * 2;
  const x = width * nx + MARGIN_PIXEL;
  const y = height * (1.0 - ny) + MARGIN_PIXEL;
  return { x, y };
};

export const toScreenCoordinates = (year_index: number, ny: number): Point => {
  const nx = normalizeXAxis(year_index);
  return normalizedToCoordinates(nx, ny);
};
