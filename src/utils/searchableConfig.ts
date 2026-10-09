export interface SearchableConfigItem {
  endpoint: string;
  searchAndShowParam: string;
  commentParam: string | ((item: any) => string);
}

export const searchableConfigs = {
  maintenanceTeam: {
    endpoint: "/maintenance_teams/all",
    searchAndShowParam: "title",
    commentParam: "orgShortTitle",
  },
  stationName: {
    endpoint: "/station_names/all",
    searchAndShowParam: "title",
    commentParam: "comment",
  },
  org: {
    endpoint: "/orgs/all",
    searchAndShowParam: "title",
    commentParam: "shortTitle",
  },
  station: {
    endpoint: "/stations/all",
    searchAndShowParam: "number",
    commentParam: (item: any) => item?.name?.title ?? "Без названия",
  },
  adminStation: {
    endpoint: "/stations/all",
    searchAndShowParam: "number",
    commentParam: (item: any) => item?.name?.title ?? "Без названия",
  },
  stationNumberValue: {
    endpoint: "/stations/all",
    searchAndShowParam: "number",
    commentParam: (item: any) => item?.name?.title ?? "Без названия",
  },
  detectors: {
    endpoint: "/detectors/all",
    searchAndShowParam: "title",
    commentParam: "comment",
  },
  detectorType: {
    endpoint: "/detector_types/all",
    searchAndShowParam: "title",
    commentParam: "comment",
  },
  adminDoc: {
    endpoint: "/documents/admin",
    searchAndShowParam: "title",
    commentParam: "comment",
  },
  commissionDoc: {
    endpoint: "/documents/comission",
    searchAndShowParam: "title",
    commentParam: "comment",
  },
  projectDoc: {
    endpoint: "/documents/project",
    searchAndShowParam: "title",
    commentParam: "comment",
  },
} as const;

export type SearchableKey = keyof typeof searchableConfigs;
export type SearchableType<K extends SearchableKey> = any;

export const DATE = ["dateEntered", "dateAdjusted"];
export const DETECTORS = ["detectors", "detectorsValue"];
export const INT_INPUTS = [
  "capacity",
  "sectionNumber",
  "sound",
  "light",
  "voice",
  "lightSound",
];
export const FLOAT_INPUTS = [
  "normative",
  "laboriousness",
  "trainLaboriousness",
];
