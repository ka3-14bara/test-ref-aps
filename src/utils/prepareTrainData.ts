// utils.ts
import { FormDataTrain, SelectedDetector } from "../components/createPages/AddTypes";

export const prepareFinalData = (
  formData: FormDataTrain,
  detectors: SelectedDetector[],
  //workTypes: WorkTypes[] | null,
) => {
  return {
    number: formData.number,
    sectionNumber: formData.sectionNumber || null,
    location: formData.location || null,
    coordinates: formData.coordinates || null,
    length: formData.length || null,
    //trainLaboriousness: formData.trainLaboriousness || null,
    dateEntered: formData.dateEntered || null,
    dateAdjusted: formData.dateAdjusted || null,
    comment: formData.comment || null,
    deleted: false,
    stationNumberValue: formData.stationNumberValue
      ? Number(formData.stationNumberValue)
      : null,
    stationNameValue: formData.stationNameValue || null,
    orgId: formData.org?.id || null,
    stationId: formData.stationId || null,
    maintenanceTeamId: formData.mteam?.id || null,
    hidden: formData?.hidden || null,
    commissionDocId: formData.commissionDoc?.id
      ? formData.commissionDoc.id
      : null,
    projectDocId: formData.projectDoc?.id ? formData.projectDoc.id : null,
    adminDocId: formData.adminDoc?.id ? formData.adminDoc.id : null,
    detectors:
      detectors.length > 0
        ? detectors
            .filter((item) => item.detector)
            .map((item) => ({
              detectorId: item.detector?.id,
              quantity: item.quantity,
            }))
        : null,
    /* workTypePeriodicity: workTypes
      ? [
          {
            workTypeId: workTypes[0].workType?.id || null,
            codeId: workTypes[0].typeMonth[0]?.code?.id || null,
            startMonth: workTypes[0].typeMonth[0]?.startMonth || null,
          },
          {
            workTypeId: workTypes[0].workType?.id || null,
            codeId: workTypes[0].typeMonth[1]?.code?.id || null,
            startMonth: workTypes[0].typeMonth[1]?.startMonth || null,
          },
        ]
      : null, */
  };
};

export const validateRequiredFields = (formData: FormDataTrain): string[] => {
  const missing: string[] = [];
  if (!formData.stationId || !formData.stationNumberValue)
    missing.push("номер станции");
  if (!formData.org?.id) missing.push("организация/подразделение");
  if (!formData.mteam?.id) missing.push("обслуживающая бригада");
  if (formData.number === null || formData.number === undefined)
    missing.push("номер шлейфа");
  return missing;
};
