// src/utils/prepareObjectOSData.ts
import { FormDataObjectOS, SelectedDetector } from '../components/createPages/AddTypes';

export function prepareObjectOSData(
  formData: FormDataObjectOS,
  selectedDetectors: SelectedDetector[]
) {
  return {
    number: formData.number,
    name: formData.name,
    coordinates: formData.coordinates || null,
    phone: formData.phone || null,
    dateEntered: formData.dateEntered || null,
    dateAdjusted: formData.dateAdjusted || null,
    comment: formData.comment || null,
    orgId: formData.org?.id || null,
    maintenanceTeamId: formData.mteam?.id || null,
    stationId: formData.station?.id || null,
    adminStationId: formData.adminStation?.id || null,
    adminDocId: formData.adminDoc?.id || null,
    commissionDocId: formData.commissionDoc?.id || null,
    projectDocId: formData.projectDoc?.id || null,
    detectors: selectedDetectors
      .filter((item) => item.detector)
      .map((item) => ({
        detectorId: item.detector?.id,
        quantity: item.quantity,
      })),
  };
}

export function validateObjectOS(formData: FormDataObjectOS): string[] {
  const missing: string[] = [];
  if (!formData.org?.id) missing.push('организация');
  if (!formData.mteam?.id) missing.push('обслуживающая бригада');
  if (formData.number == null) missing.push('номер объекта');
  if (!formData.name) missing.push('наименование');
  return missing;
}