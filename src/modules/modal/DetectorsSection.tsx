import React from "react";
import SearchableInput from "../SearchableInput";
import { SelectedDetector, DetectorItem } from "../../components/createPages/AddTypes";

interface DetectorsSectionProps {
  selectedDetectors: SelectedDetector[];
  onAdd: () => void;
  onRemove: (rowId: number) => void;
  onQuantityChange: (rowId: number, value: string) => void;
  onDetectorSelect: (rowId: number, detector: DetectorItem) => void;
}

const DetectorsSection: React.FC<DetectorsSectionProps> = ({
  selectedDetectors,
  onAdd,
  onRemove,
  onQuantityChange,
  onDetectorSelect,
}) => {
  return (
    <div className="container-fluid">
      <div className="row mb-3">
        <div className="col-auto">
          <label htmlFor="addDetector" className="form-label">
            Добавить датчик
          </label>
        </div>
        <div className="col-auto">
          <button
            type="button"
            className="btn btn-outline-success"
            id="addDetector"
            name="addDetector"
            onClick={onAdd}
          >
            +
          </button>
        </div>
      </div>

      {selectedDetectors.map((item, index) => (
        <div key={item.rowId} className="row mb-3 align-items-end gx-2">
          <div className="col-auto">
            <label htmlFor={`title-${item.rowId}`} className="form-label">
              Датчик [№ {index + 1}]
            </label>
            <SearchableInput
              endpoint="/detectors/all"
              onItemSelected={(data) =>
                onDetectorSelect(item.rowId, data as DetectorItem)
              }
              inputId={`title-${item.rowId}`}
              showAfterReload={item.detector?.title || ""}
              style={{ height: "50px" }}
            />
          </div>
          <div className="col-auto d-flex align-items-end">
            <div className="me-2">
              <label
                htmlFor={`quantity-${item.rowId}`}
                className="form-label"
              >
                Количество:
              </label>
              <input
                type="number"
                id={`quantity-${item.rowId}`}
                value={item.quantity === 0 ? "" : item.quantity}
                onChange={(e) =>
                  onQuantityChange(item.rowId, e.target.value)
                }
                className="form-control"
                min="1"
                style={{ width: "80px", height: "50px" }}
              />
            </div>
            <button
              type="button"
              className="btn btn-danger"
              style={{ height: "50px" }}
              onClick={() => onRemove(item.rowId)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default React.memo(DetectorsSection);