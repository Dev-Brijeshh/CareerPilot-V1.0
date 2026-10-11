import { Link } from "react-router-dom";

const AuthCard = ({ title, subtitle, children, footerText, footerLinkText, footerLinkTo }) => (
  <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12">
    <div className="w-full max-w-md">
      <div className="mb-8 flex flex-col items-center">
        <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white">
          CP
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500">{subtitle}</p>}
      </div>

      <div className="card">{children}</div>

      {footerText && (
        <p className="mt-6 text-center text-sm text-slate-500">
          {footerText}{" "}
          <Link to={footerLinkTo} className="font-medium text-brand-600 hover:text-brand-700">
            {footerLinkText}
          </Link>
        </p>
      )}
    </div>
  </div>
);

export default AuthCard;
