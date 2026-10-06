import { SelectedDetector } from "../components/createPages/AddTypes";

/**
 * Подготавливает массив датчиков для отправки на сервер:
 * - убирает строки без выбранного датчика
 * - исключает записи с неположительным количеством
 * - возвращает только необходимые поля
 */
export const prepareDetectorsPayload = (
  detectors: SelectedDetector[],
): { detectorId: number; quantity: number }[] => {
  return detectors
    .filter(
      (d): d is SelectedDetector & { detector: { id: number } } =>
        d.detector != null && d.detector.id != null && d.quantity > 0,
    )
    .map((d) => ({
      detectorId: d.detector.id,
      quantity: d.quantity,
    }));
};
