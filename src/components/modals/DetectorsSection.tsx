import React from "react";
import SearchableInput from "../common/SearchableInput";
import { SelectedDetector, DetectorItem } from "../../types/creation";

interface DetectorsSectionProps {
  selectedDetectors: SelectedDetector[];
  onAdd: () => void;
  onRemove: (rowId: number) => void;
  onQuantityChange: (rowId: number, value: string) => void;
  onDetectorSelect: (rowId: number, detector: DetectorItem) => void;
}

export const DetectorsSection: React.FC<DetectorsSectionProps> = ({
  selectedDetectors,
  onAdd,
  onRemove,
  onQuantityChange,
  onDetectorSelect,
}) => {
  return (
    <div className="border rounded p-3 mb-3 bg-light">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h6 className="mb-0 fw-semibold">
          <i className="bi bi-broadcast me-2"></i> Установленные датчики (
          {selectedDetectors.length})
        </h6>
        <button
          type="button"
          className="btn btn-outline-success btn-sm d-flex align-items-center gap-1"
          onClick={onAdd}
        >
          <i className="bi bi-plus-lg"></i> Добавить датчик
        </button>
      </div>

      {selectedDetectors.length === 0 ? (
        <p className="text-muted small mb-0">Датчики не привязаны</p>
      ) : (
        selectedDetectors.map((item, index) => (
          <div key={item.rowId} className="row g-2 align-items-end mb-2">
            <div className="col-md-7">
              <label
                htmlFor={`detector-row-${item.rowId}`}
                className="form-label small text-muted mb-1"
              >
                Датчик #{index + 1}
              </label>
              <SearchableInput<DetectorItem>
                endpoint="/detectors/all"
                onItemSelected={(data) => onDetectorSelect(item.rowId, data)}
                inputId={`detector-row-${item.rowId}`}
                showAfterReload={item.detector?.title || ""}
              />
            </div>
            <div className="col-md-3">
              <label
                htmlFor={`qty-row-${item.rowId}`}
                className="form-label small text-muted mb-1"
              >
                Количество
              </label>
              <input
                type="number"
                id={`qty-row-${item.rowId}`}
                className="form-control"
                min="1"
                value={item.quantity === 0 ? "" : item.quantity}
                onChange={(e) => onQuantityChange(item.rowId, e.target.value)}
              />
            </div>
            <div className="col-md-2 d-flex">
              <button
                type="button"
                className="btn btn-outline-danger w-100"
                onClick={() => onRemove(item.rowId)}
                title="Удалить строку"
              >
                <i className="bi bi-trash"></i>
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default React.memo(DetectorsSection);
