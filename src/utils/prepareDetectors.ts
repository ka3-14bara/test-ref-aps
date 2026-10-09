import { SelectedDetector } from "../types/creation";

export interface DetectorPayload {
  detectorId: number;
  quantity: number;
}

export function prepareDetectorsPayload(
  detectors: SelectedDetector[],
): DetectorPayload[] {
  return detectors
    .filter(
      (item) => item.detector && item.detector.id != null && item.quantity > 0,
    )
    .map((item) => ({
      detectorId: item.detector!.id!,
      quantity: item.quantity,
    }));
}

export default prepareDetectorsPayload;
