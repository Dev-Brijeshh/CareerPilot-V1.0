import clsx from "clsx";

const variantClass = {
  neutral: "bg-slate-100 text-slate-700",
  brand: "bg-brand-50 text-brand-700",
  success: "bg-emerald-50 text-emerald-700",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-rose-50 text-rose-700",
};

const Badge = ({ children, variant = "neutral", className }) => (
  <span className={clsx("badge", variantClass[variant] || variantClass.neutral, className)}>
    {children}
  </span>
);

export default Badge;
