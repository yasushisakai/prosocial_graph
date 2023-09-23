import { Curve } from "./geometry"


export interface GeoJsonData {
    type: string,
    features: GeoJsonFeature[]
}

export interface GeoJsonFeature {
    type: string,
    geometry: any,
    properties: {
        a_yearbuild: string,
        a_visible: number,
        a_invisible: number | null,
        footprint: number | null,
        a_lu_group: string,
        a_lu_detail: string | null,
        a_openspace: string | null,
        a_chartarea: number | null,
    }
}

export interface ReduceData {
    [year: string] : SingleYearReduceData
};

export interface SingleYearReduceData {
    [type: string]: number
}

export interface Curves {
    office: Curve, 
    residential: {
        early: Curve,
        mid: Curve,
        essential: Curve,
        executive: Curve,
        senior: Curve
    },
    amenities: Curve
}
