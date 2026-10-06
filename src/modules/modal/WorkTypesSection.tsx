import React, { useMemo } from "react";
import WorkTypesForm from "../WorkTypesForm";
import { WorkTypes } from "../../components/createPages/AddTypes";

interface WorkTypesSectionProps {
  onChange: (data: WorkTypes[]) => void;
  serverWorkTypePeriodicity?: any[];
  searchType?: string;
  required?: boolean;
}

const WorkTypesSection: React.FC<WorkTypesSectionProps> = ({
  onChange,
  serverWorkTypePeriodicity,
  searchType,
  required = true,
}) => {
  const currentYear = new Date().getFullYear();

  const initialMonths = useMemo(() => {
    if (!serverWorkTypePeriodicity) return [];
    return serverWorkTypePeriodicity.flatMap((item: any) => ({
      codeId: item.codeId,
      workTypeId: item.workTypeId,
      startMonth: `${currentYear}-${String(item.startMonth).padStart(2, "0")}`,
    }));
  }, [serverWorkTypePeriodicity, currentYear]);

  return (
    <div className="d-flex gap-4 mb-4" style={{ overflow: "auto" }}>
      <WorkTypesForm
        onChange={onChange}
        searchType={searchType}
        initialMonths={initialMonths}
        required={required}
      />
    </div>
  );
};

export default React.memo(WorkTypesSection);
