import { forwardRef } from "react";
import clsx from "clsx";

export const Input = forwardRef(({ label, error, className, ...rest }, ref) => (
  <div>
    {label && <label className="label">{label}</label>}
    <input ref={ref} className={clsx("input", error && "border-rose-400 focus:ring-rose-500/20", className)} {...rest} />
    {error && <p className="field-error">{error}</p>}
  </div>
));
Input.displayName = "Input";

export const Textarea = forwardRef(({ label, error, className, rows = 4, ...rest }, ref) => (
  <div>
    {label && <label className="label">{label}</label>}
    <textarea
      ref={ref}
      rows={rows}
      className={clsx("input resize-y", error && "border-rose-400 focus:ring-rose-500/20", className)}
      {...rest}
    />
    {error && <p className="field-error">{error}</p>}
  </div>
));
Textarea.displayName = "Textarea";

export const Select = forwardRef(({ label, error, className, children, ...rest }, ref) => (
  <div>
    {label && <label className="label">{label}</label>}
    <select ref={ref} className={clsx("input", error && "border-rose-400 focus:ring-rose-500/20", className)} {...rest}>
      {children}
    </select>
    {error && <p className="field-error">{error}</p>}
  </div>
));
Select.displayName = "Select";
