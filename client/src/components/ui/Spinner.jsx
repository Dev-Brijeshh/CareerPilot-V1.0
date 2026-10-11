import { Loader2 } from "lucide-react";
import clsx from "clsx";

const Spinner = ({ className, size = 20 }) => (
  <Loader2 className={clsx("animate-spin", className || "text-brand-600")} size={size} />
);

export default Spinner;
