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
  documentTypeDisplayValue: string;
  comment: string;
  deleted: boolean;
}

export interface TypeMonth {
  code: Code;
  startMonth: number;
}

export interface Code {
  id?: number | null;
  workTypeValue?: number;
  codeId: number; // Теперь number
  periodicity: number;
}

export interface WorkType {
  id?: number | null;
  title: string;
  codes: Code[];
  comment: string;
  workTypeFor: string;
  workTypeForValue: string;
  deleted: boolean;
  codesPeriodicity: {};
  codesPeriodicityValue: {};
}

export interface WorkTypes {
  workType: WorkType;
  typeMonth: TypeMonth[] | [];
}

export interface RequestCustom {
  endPoint: string;
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
  rowId: number; // Внутренний ID для ключей React
  detector: DetectorItem | null; // Сюда запишется объект с сервера
  quantity: number; // Количество
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
  commissionDoc: Document['id'] | null;
  projectDoc: Document['id'] | null;
  adminDoc: Document['id'] | null;
  supplyFireAlarmQuantity: number | null;
  supplyWarningEvacuationControlQuantity: number | null;
  workTypes:  {workType: WorkType['id'] | {}, typeMonth: TypeMonth[] | []}[] | null;
  deleted: boolean;
  objectsNumbersValue: string;
  stationTypesValue: {};
  mteam: MaintenanceTeam['id'] | null;
}

export interface FormDataTrain {
  id?: number | null
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
  adminDoc: Document  | null;
  commissionDoc: Document  | null;
  projectDoc: Document  | null;
  //workTypes: WorkTypes[] | null;
  deleted: boolean;
  trainTypesValue: {};
  detectorsValue: {};
  stationNumberValue: string;
  mteam: MaintenanceTeam;
  stationNameValue: string;
  stationId: number | null;
  hidden?: boolean;
}

export interface FormDataObjectOS {
  id?: number | null;
  org: Organization;
  number: number | null;          // номер объекта
  name: string;                   // наименование
  coordinates: string;
  phone: string;
  dateEntered: string;
  dateAdjusted: string;
  comment: string;
  adminDoc: Document | null;
  commissionDoc: Document | null;
  projectDoc: Document | null;
  station: FormDataStation | null;      // номер прибора на объекте
  adminStation: FormDataStation | null; // номер станции
  deleted: boolean;
  mteam: MaintenanceTeam;
}

// Общий тип для формы в массовом создании (параметризуется типом данных формы)
export interface MassCreationForm<T> {
  id: number;
  formData: T;
  selectedDetectors: SelectedDetector[];
  // resultData: WorkTypes[] | null; // если нужны типы работ – раскомментируем
  status: 'pending' | 'submitting' | 'success' | 'error';
  errorMessage?: string;
}