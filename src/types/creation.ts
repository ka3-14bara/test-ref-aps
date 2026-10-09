export interface Organization {
  id?: number | null;
  title: string;
  shortTitle: string;
  responsible: string;
  jobTitle: string;
  comment: string;
  deleted: boolean;
}

export interface MaintenanceTeam {
  id?: number | null;
  title: string;
  orgShortTitle?: string;
  comment: string;
  deleted: boolean;
}

export interface Document {
  id?: number | null;
  title: string;
  filePath: string;
  documentType: string;
  documentTypeDisplayValue?: string;
  comment: string;
  deleted: boolean;
}

export interface Code {
  id?: number | null;
  workTypeValue?: number;
  codeId: number;
  periodicity: number;
}

export interface TypeMonth {
  code: Code;
  startMonth: number;
}

export interface WorkType {
  id?: number | null;
  title: string;
  codes: Code[];
  comment: string;
  workTypeFor: string;
  workTypeForValue: string;
  deleted: boolean;
  codesPeriodicity?: Record<string, any>;
  codesPeriodicityValue?: Record<string, any>;
}

export interface WorkTypes {
  workType: WorkType;
  typeMonth: TypeMonth[];
}

export interface DetectorItem {
  id?: number | null;
  title: string;
  laboriousness: number;
  purpose: string;
  type: {
    id?: number | null;
    title: string;
    comment: string;
    deleted: boolean;
  };
  comment: string;
  deleted: boolean;
}

export interface SelectedDetector {
  rowId: number;
  detector: DetectorItem | null;
  quantity: number;
}

export interface FormDataStation {
  id?: number | null;
  name: MaintenanceTeam;
  type: string;
  typeDisplayValue: string;
  number: number | null;
  capacity: number | null;
  objectsNumberFrom: number | null;
  objectsNumberTo: number | null;
  objectsNumbers: string | null;
  inventoryNumber: string;
  installationLocation: string;
  dateEntered: string | null;
  dateAdjusted: string | null;
  normative: number | null;
  comment: string;
  sound: number | null;
  light: number | null;
  voice: number | null;
  lightSound: number | null;
  commissionDoc: Document["id"] | null;
  projectDoc: Document["id"] | null;
  adminDoc: Document["id"] | null;
  supplyFireAlarmQuantity: number | null;
  supplyWarningEvacuationControlQuantity: number | null;
  workTypes:
    | {
        workType: WorkType["id"] | Record<string, any>;
        typeMonth: TypeMonth[];
      }[]
    | null;
  deleted: boolean;
  objectsNumbersValue?: string;
  stationTypesValue?: Record<string, any>;
  mteam: MaintenanceTeam["id"] | null;
}

export interface FormDataTrain {
  id?: number | null;
  org: Organization;
  number: string | null;
  sectionNumber: number | null;
  location: string;
  coordinates: string;
  length: number | null;
  trainLaboriousness: number | null;
  dateEntered: string;
  dateAdjusted: string;
  comment: string;
  adminDoc: Document | null;
  commissionDoc: Document | null;
  projectDoc: Document | null;
  deleted: boolean;
  trainTypesValue?: Record<string, any>;
  detectorsValue?: Record<string, any>;
  stationNumberValue: string;
  mteam: MaintenanceTeam;
  stationNameValue: string;
  stationId: number | null;
  hidden?: boolean;
}

export interface FormDataObjectOS {
  id?: number | null;
  org: Organization;
  number: number | null;
  name: string;
  coordinates: string;
  phone: string;
  dateEntered: string;
  dateAdjusted: string;
  comment: string;
  adminDoc: Document | null;
  commissionDoc: Document | null;
  projectDoc: Document | null;
  station: FormDataStation | null;
  adminStation: FormDataStation | null;
  deleted: boolean;
  mteam: MaintenanceTeam;
}

export interface MassCreationForm<T> {
  id: number;
  formData: T;
  selectedDetectors: SelectedDetector[];
  status: "pending" | "submitting" | "success" | "error";
  errorMessage?: string;
}

export interface RequestCustom {
  endPoint: string;
}
