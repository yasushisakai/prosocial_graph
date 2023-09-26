import {
  END_YEAR,
  GOOGLE_SHEETS_API_KEY,
  RANGE,
  RESIDENCE_TARGET_RATIO,
  SHEET_ID,
  SHEET_NAME,
  START_YEAR,
  THIS_YEAR,
} from "./constants";
import { ReduceData } from "./models";

// [0] office (sqf)
// [1] residential (sqf)
// [2] early carreer (%)
// [3] mid carreer (%)
// [4] essential (%)
// [5] executive (%)
// [6] senior (%)
// [7] amenities (sqf)  // will not be used
// [8] amenities override (%)
export const fetch_numbers = async (): Promise<number[][]> => {
  const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_NAME}!${RANGE}?key=${GOOGLE_SHEETS_API_KEY}`;
  const data = await fetch(url);
  const json = await data.json();
  console.log(json.values);
  return json.values.map((r: string[]) => r.map((v: string) => parseFloat(v)));
};

// returns the ratio of each element by year
export const preProcess = (spreadSheet: number[][]): ReduceData => {
  let result = initReduceData();

  const CurrentYearIndex = THIS_YEAR - START_YEAR;
  const ref = spreadSheet[0][CurrentYearIndex];

  for (let i = 0; i <= END_YEAR - START_YEAR; i++) {
    const office = spreadSheet[0][i];

    result.office[i] = office / (ref / 0.8);

    const targetResidentialToOffice = office * RESIDENCE_TARGET_RATIO;
    const fulfilled = (spreadSheet[1][i] / targetResidentialToOffice) * 0.8;

    result.residential.early[i] = fulfilled * spreadSheet[2][i];
    result.residential.mid[i] = fulfilled * spreadSheet[3][i];
    result.residential.essential[i] = fulfilled * spreadSheet[4][i];
    result.residential.executive[i] = fulfilled * spreadSheet[5][i];
    result.residential.senior[i] = fulfilled * spreadSheet[6][i];

    // we just overide amenities
    result.amenities[i] = spreadSheet[8][i];
  }

  return result;
};

// overkill
const initReduceData = (): ReduceData => {
  let l = END_YEAR - START_YEAR;
  let empty = (): number[] => new Array(l).fill(0);

  return {
    office: empty(),
    residential: {
      early: empty(),
      mid: empty(),
      essential: empty(),
      executive: empty(),
      senior: empty(),
    },
    amenities: empty(),
  };
};

export const jitter = () => {
  return Math.random() - 0.5;
};
