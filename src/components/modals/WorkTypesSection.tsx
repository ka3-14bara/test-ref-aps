import React from "react";
import WorkTypesForm from "../creation/WorkTypesForm";
import { WorkTypes } from "../../types/creation";

interface WorkTypesSectionProps {
  onChange: (data: WorkTypes[]) => void;
  serverWorkTypePeriodicity?: any;
  required?: boolean;
}

export const WorkTypesSection: React.FC<WorkTypesSectionProps> = ({
  onChange,
  serverWorkTypePeriodicity,
  required = false,
}) => {
  return (
    <div className="border rounded p-3 mb-3 bg-light">
      <h6 className="fw-semibold mb-3">
        <i className="bi bi-calendar2-check me-2"></i> Регламентные работы и
        периодичность
      </h6>
      <WorkTypesForm
        onChange={onChange}
        required={required}
        serverWorkTypePeriodicity={serverWorkTypePeriodicity}
      />
    </div>
  );
};

export default React.memo(WorkTypesSection);
