import clsx from "clsx";

const Card = ({ children, className, ...rest }) => (
  <div className={clsx("card", className)} {...rest}>
    {children}
  </div>
);

export default Card;
