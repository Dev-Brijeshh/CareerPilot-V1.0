import clsx from "clsx";
import Spinner from "./Spinner";

const variantClass = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  danger: "btn-danger",
  ghost: "btn-ghost",
};

const Button = ({
  children,
  variant = "primary",
  loading = false,
  disabled = false,
  className,
  type = "button",
  icon: Icon,
  ...rest
}) => (
  <button
    type={type}
    disabled={disabled || loading}
    className={clsx(variantClass[variant] || variantClass.primary, className)}
    {...rest}
  >
    {loading ? <Spinner size={16} className="text-current" /> : Icon ? <Icon size={16} /> : null}
    {children}
  </button>
);

export default Button;
