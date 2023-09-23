import { EARLY_YEAR_SHARE, END_YEAR, ESSENTIAL_SHARE, EXECUTIVE_SHARE, HEIGHT, MARGIN_PIXEL, MID_CAREER_SHARE, RESIDENCE_TARGET_RATIO, SENIOR_SHARE, START_YEAR, WIDTH } from "./constants";
import { divdeResidential } from "./data_utils";
import { Point } from "./geometry";

export const normalizeYear = (year: number) => {
  let n = (year - START_YEAR * 1.0) / (END_YEAR - START_YEAR);
  n = Math.max(n, 0.0);
  n = Math.min(n, 1.0);
  return n;
};

export const normalizedToCoordinates = (nx: number, ny: number): Point => {
  const width = WIDTH - MARGIN_PIXEL * 2;
  const height = HEIGHT - MARGIN_PIXEL * 2;
  const x = width * nx + MARGIN_PIXEL;
  const y = height * (1.0 - ny) + MARGIN_PIXEL;
  return { x, y };
};

// markus's idea
const OFFICE_2024 = 27000000;

export const officeToCoordinate = (year: number, office: number): Point => {
  const nx = normalizeYear(year);
  const ny = office / OFFICE_2024;
  return normalizedToCoordinates(nx, ny);
};

export const residentialToCoordinates = (year: number, residential: number, office: number) => {

    const [early, mid, essential, executive, senior] = divdeResidential(residential);

    const ep = officeRelativeToCoordinate(year, early, office, RESIDENCE_TARGET_RATIO * EARLY_YEAR_SHARE);
    const mp = officeRelativeToCoordinate(year, mid, office, RESIDENCE_TARGET_RATIO * MID_CAREER_SHARE);
    const esp = officeRelativeToCoordinate(year, essential, office, RESIDENCE_TARGET_RATIO * ESSENTIAL_SHARE);
    const exp = officeRelativeToCoordinate(year, executive, office, RESIDENCE_TARGET_RATIO * EXECUTIVE_SHARE);
    const sp = officeRelativeToCoordinate(year, senior, office, RESIDENCE_TARGET_RATIO * SENIOR_SHARE);
    
    return { ep, mp, esp, exp, sp }
}

export const officeRelativeToCoordinate = (
  year: number,
  use: number,
  office: number,
  targetRatio: number,
): Point => {
  let target = office * targetRatio;
  let rateFulfilled = use / target; // ny
  const nx = normalizeYear(year);
  return normalizedToCoordinates(nx, rateFulfilled);
};
