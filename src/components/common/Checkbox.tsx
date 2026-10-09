import React from "react";

interface CheckboxProps {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  id?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  checked,
  onChange,
  disabled = false,
  id,
}) => {
  const inputId = id || `checkbox-${label.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <div className="form-check">
      <input
        className="form-check-input"
        type="checkbox"
        id={inputId}
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
      />
      <label className="form-check-label user-select-none" htmlFor={inputId}>
        {label}
      </label>
    </div>
  );
};

export default Checkbox;
