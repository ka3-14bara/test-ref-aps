import { FormDataObjectOS, SelectedDetector } from "../types/creation";
import { prepareDetectorsPayload } from "./prepareDetectors";

export function validateObjectOS(formData: FormDataObjectOS): string[] {
  const missing: string[] = [];

  if (formData.number == null) missing.push("Номер объекта");
  if (!formData.name?.trim()) missing.push("Наименование объекта");
  if (!formData.org?.id) missing.push("Организация");
  if (!formData.mteam?.id) missing.push("Обслуживающая бригада");

  return missing;
}

export function prepareObjectOSData(
  formData: FormDataObjectOS,
  detectors: SelectedDetector[] = [],
) {
  return {
    number: formData.number,
    name: formData.name || "",
    coordinates: formData.coordinates || "",
    phone: formData.phone || "",
    dateEntered: formData.dateEntered || null,
    dateAdjusted: formData.dateAdjusted || null,
    comment: formData.comment || "",
    deleted: false,
    stationId: formData.station?.id || null,
    adminStationId: formData.adminStation?.id || null,
    orgId: formData.org?.id || null,
    maintenanceTeamId: formData.mteam?.id || null,
    adminDocId: formData.adminDoc?.id || null,
    commissionDocId: formData.commissionDoc?.id || null,
    projectDocId: formData.projectDoc?.id || null,
    detectors: prepareDetectorsPayload(detectors),
  };
}
