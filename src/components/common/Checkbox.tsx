import React, { useEffect, useRef } from "react";

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  indeterminate?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
  id?: string;
  className?: string;
}

export const Checkbox: React.FC<CheckboxProps> = ({
  label = "",
  checked = false,
  indeterminate = false,
  onChange,
  disabled = false,
  id,
  className = "",
}) => {
  const ref = useRef<HTMLInputElement>(null);
  const inputId =
    id ||
    (label
      ? `checkbox-${label.replace(/\s+/g, "-").toLowerCase()}`
      : undefined);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = Boolean(indeterminate);
    }
  }, [indeterminate]);

  return (
    <div
      className={`form-check d-flex align-items-center justify-content-center m-0 p-0 ${className}`}
    >
      <input
        ref={ref}
        className="form-check-input m-0 cursor-pointer"
        type="checkbox"
        id={inputId}
        checked={checked}
        disabled={disabled}
        onChange={onChange}
      />
      {label && (
        <label
          className="form-check-label user-select-none ms-2"
          htmlFor={inputId}
        >
          {label}
        </label>
      )}
    </div>
  );
};

export default Checkbox;
