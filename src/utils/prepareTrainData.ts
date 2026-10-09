import { FormDataTrain, SelectedDetector } from "../types/creation";
import { prepareDetectorsPayload } from "./prepareDetectors";

export function validateRequiredFields(formData: FormDataTrain): string[] {
  const missing: string[] = [];

  if (!formData.number?.trim()) missing.push("Номер шлейфа");
  if (!formData.stationId && !formData.stationNumberValue)
    missing.push("Номер станции");
  if (!formData.org?.id) missing.push("Организация");
  if (!formData.mteam?.id) missing.push("Обслуживающая бригада");

  return missing;
}

export function prepareFinalData(
  formData: FormDataTrain,
  detectors: SelectedDetector[] = [],
) {
  return {
    number: formData.number ? formData.number.replace(/\*+$/, "") : "",
    sectionNumber: formData.sectionNumber || null,
    location: formData.location || "",
    coordinates: formData.coordinates || "",
    length: formData.length || 0,
    dateEntered: formData.dateEntered || null,
    dateAdjusted: formData.dateAdjusted || null,
    comment: formData.comment || "",
    deleted: false,
    hidden: Boolean(formData.hidden),
    orgId: formData.org?.id || null,
    stationId: formData.stationId || null,
    maintenanceTeamId: formData.mteam?.id || null,
    commissionDocId: formData.commissionDoc?.id || null,
    projectDocId: formData.projectDoc?.id || null,
    adminDocId: formData.adminDoc?.id || null,
    detectors: prepareDetectorsPayload(detectors),
  };
}
