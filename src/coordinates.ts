import { END_YEAR, HEIGHT, LEFT_MARGIN, RIGHT_MARGIN, START_YEAR, VERTICAL_MARGIN, WIDTH } from "./constants";
import { Point } from "./models";

export const normalizeXAxis = (index: number) => {
  let t = index / (END_YEAR - START_YEAR - 1);
  return t;
};

// converts parameter x,y values to actual (screen) coordinates
export const normalizedToCoordinates = (nx: number, ny: number): Point => {
  const width = WIDTH - LEFT_MARGIN - RIGHT_MARGIN;
  const height = HEIGHT - VERTICAL_MARGIN * 2;
  const x = width * nx + LEFT_MARGIN;
  const y = height * (1.0 - ny) + VERTICAL_MARGIN;
  return { x, y };
};

export const toScreenCoordinates = (year_index: number, ny: number): Point => {
  const nx = normalizeXAxis(year_index);
  return normalizedToCoordinates(nx, ny);
};
