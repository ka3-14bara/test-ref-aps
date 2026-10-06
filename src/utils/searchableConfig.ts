// searchableConfig.ts
import {
  Document,
  Organization,
  MaintenanceTeam,
  FormDataStation,
  MaintenanceTeam as Station,
} from "../components/createPages/AddTypes";

export const searchableConfigs = {
  stationName: {
    endpoint: "/station_names/all",
    searchAndShowParam: "title" as const,
    commentParam: "comment"
  },
  name: {
    endpoint: "/station_names/all",
    searchAndShowParam: "title" as const,
    commentParam: "comment"
  },
  maintenanceTeam: {
    endpoint: "/maintenance_teams/all",
    searchAndShowParam: "title" as const,
    commentParam: "orgShortTitle"
  },
  mTeam: {
    endpoint: "/maintenance_teams/all",
    searchAndShowParam: "title" as const,
    commentParam: "orgShortTitle"
  },
  type:{
    endpoint: "/detector_types/all",
    searchAndShowParam: "title" as const,
    commentParam: "comment"
  },
  station: {
    endpoint: "/stations/all",
    searchAndShowParam: "number" as const,
    commentParam: "name.title"
  },
  stationNumberValue: {
    endpoint: "/stations/all",
    searchAndShowParam: "number" as const,
    commentParam: "name.title"
  },
  adminStation: {
    endpoint: "/stations/all",
    searchAndShowParam: "number" as const,
    commentParam: "name.title"
  },
  org: {
    endpoint: "/orgs/all",
    searchAndShowParam: "title" as const,
    commentParam: "shortTitle"
  },
  orgShortTitle: {
    endpoint: "/orgs/all",
    searchAndShowParam: "shortTitle" as const,
    commentParam: "title" as const
  },
  commissionDoc: {
    endpoint: "/documents/comission",
    searchAndShowParam: "title" as const,
    commentParam: "comment"
  },
  adminDoc: {
    endpoint: "/documents/admin",
    searchAndShowParam: "title" as const,
    commentParam: "comment"
  },
  projectDoc: {
    endpoint: "/documents/project",
    searchAndShowParam: "title" as const,
    commentParam: "comment"
  },
} as const;

export const SEARCHABLE = Object.keys(
  searchableConfigs,
) as (keyof typeof searchableConfigs)[];
export const DATE = ["dateAdjusted", "dateEntered"] as const;
export const DETECTORS = ["detectorsValue"] as const;
export const INT_INPUTS = [
  "capacity",
  "inventoryNumber",
  "sound",
  "lightSound",
  "voice",
  "light",
  "supplyFireAlarmQuantity",
  "supplyWarningEvacuationControlQuantity",
  "length",
  "sectionNumber",
  "phone",
] as const;
export const FLOAT_INPUTS = [
  "normative",
  //"trainLaboriousness",
  //"trainLaboriousness",
  //"laboriousness"
] as const;

export type SearchableConfigMap = typeof searchableConfigs;

export type SearchableType<K extends keyof SearchableConfigMap> =
  K extends "stationName" | "name"
    ? Station
    : K extends "station" | "adminStation" | "stationNumberValue"
      ? FormDataStation
      : K extends "maintenanceTeam" | "mTeam" | "type"
        ? MaintenanceTeam
        : K extends "org" | "orgShortTitle"
          ? Organization
          : K extends "commissionDoc" | "adminDoc" | "projectDoc" 
            ? Document
            : never;
