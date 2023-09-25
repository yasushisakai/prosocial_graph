import { GeoJsonData, GeoJsonFeature, ReduceData } from "./models";
import * as data from "../data/cartodb-query.json";
import {
  AMENITY_GOAL,
  EARLY_YEAR_SHARE,
  END_YEAR,
  ESSENTIAL_SHARE,
  EXECUTIVE_SHARE,
  MID_CAREER_SHARE,
  RESIDENTIAL_GOAL,
  SENIOR_SHARE,
  START_YEAR,
  THIS_YEAR,
} from "./constants";

export const getGeoJsonData = () => {
  // FIXME: not the most smatest way
  let str_data = JSON.stringify(data);
  const json_data = JSON.parse(str_data) as GeoJsonData;
  return json_data;
};

export const preProcess = (data: GeoJsonData): ReduceData => {
  const features: GeoJsonFeature[] = data.features
    // .filter( (f) =>
    //     !(f.properties.a_visible == null && f.properties.a_invisible == null),
    // )
    .map((f) => {
      if (f.properties.a_visible == null) {
        f.properties.a_visible = 2030;
      }
      if (f.properties.a_invisible == null || f.properties.a_invisible == 0) {
        f.properties.a_invisible = 5000;
      }
      return f;
    });

  // checkAllGroups(features);
  // checkAges(features);

  let reduce = {};

  const office = "Office / R&D";
  const residence = "Residential / Residential with Retail";
  const amenities = [
    "Utility",
    "Retail",
    // "Government Operations",
    "Industrial",
    "Charitable / Religious",
  ];

  const resGrowAfterThisYear = RESIDENTIAL_GOAL / (END_YEAR - THIS_YEAR - 5);
  const ameGrowAfterThisYear = AMENITY_GOAL / (END_YEAR - THIS_YEAR - 5);

  for (let year = START_YEAR; year <= END_YEAR; year++) {
    reduce[`${year}`] = {};
    reduce[`${year}`]["office"] = 0;
    reduce[`${year}`]["residential"] = 0;
    reduce[`${year}`]["amenities"] = 0;

    for (let f of features) {
      if (!f.properties.a_lu_group) continue;
      if (!f.properties.a_chartarea) continue;

      let group = "";
      if (f.properties.a_lu_group === office) {
        group = "office";
      } else if (f.properties.a_lu_group === residence) {
        group = "residential";
      } else if (amenities.indexOf(f.properties.a_lu_group) > -1) {
        group = "amenities";
      } else {
        continue;
      }

      if (f.properties.a_visible <= year && f.properties.a_invisible >= year) {
        reduce[`${year}`][group] += f.properties.a_chartarea;
      }
    }

    if (year >= THIS_YEAR || year <= END_YEAR - 5) {
      let resGrow = resGrowAfterThisYear * (year - THIS_YEAR);
      let ameGrow = ameGrowAfterThisYear * (year - THIS_YEAR);

      reduce[`${year}`]["residential"] = Math.max(
        resGrow,
        reduce[`${year}`]["residential"],
      );
      reduce[`${year}`]["amenities"] = Math.max(
        ameGrow,
        reduce[`${year}`]["amenities"],
      );
    }

    if(year > END_YEAR - 10) {
        reduce[`${year}`]["amenities"] = AMENITY_GOAL;
        reduce[`${year}`]["residential"] = RESIDENTIAL_GOAL;
    }
  }
  return reduce;
};

const checkAllGroups = (features: GeoJsonFeature[]) => {
  let groups: string[] = [];
  features.forEach((f) => {
    if (groups.indexOf(f.properties.a_lu_group) === -1) {
      groups.push(f.properties.a_lu_group);
    }
  });
};

const checkAges = (features: GeoJsonFeature[]) => {
  let groups: string[] = [];
  // let minYear = 2050;
  // let maxYear = 0;
  features.forEach((f) => {
    const visible = f.properties.a_visible;
    const invisible = f.properties.a_invisible;
  });

  // seems there are 0, null, and a yearlike value for both a_visible and a_invisible
  // the tentative policy here is if the a_invisible is 0 or null, we assume that the building persists for ever?
};

export const divdeResidential = (residential: number): number[] => {
  const ratio = [
    [EARLY_YEAR_SHARE, jitter()],
    [MID_CAREER_SHARE, jitter()],
    [ESSENTIAL_SHARE, jitter()],
    [EXECUTIVE_SHARE, jitter()],
    [SENIOR_SHARE, jitter()]
  ];
  return ratio.map(([r, j]) => {
      const share = (residential * r) * 0.8 +  (residential * r) * 0.2 * j;
      return share; 
  });
};

export const jitter = () => {
  return Math.random() - 0.5;
};
