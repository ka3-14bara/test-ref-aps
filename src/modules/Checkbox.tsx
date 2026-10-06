import React, { useEffect, useRef, forwardRef } from 'react';

// Компонент, который управляет свойством indeterminate с помощью ссылки (ref)
const Checkbox = forwardRef<
  HTMLInputElement,
  { indeterminate?: boolean } & React.InputHTMLAttributes<HTMLInputElement>
>(({ indeterminate, ...rest }, ref) => {
  const defaultRef = useRef<HTMLInputElement>(null!);
  const resolvedRef = (ref || defaultRef) as React.MutableRefObject<HTMLInputElement>;

  useEffect(() => {
    resolvedRef.current.indeterminate = indeterminate ?? false;
  }, [resolvedRef, indeterminate]);

  return (
    <input
      type="checkbox"
      ref={resolvedRef}
      className="cursor-pointer"
      {...rest}
    />
  );
});

export default Checkbox;