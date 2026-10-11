import { AlertTriangle } from "lucide-react";

export const PageHeader = ({ title, description, action }) => (
  <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
    <div>
      <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
      {description && <p className="mt-1 text-sm text-slate-500">{description}</p>}
    </div>
    {action}
  </div>
);

export const ErrorBanner = ({ message = "Something went wrong.", onRetry }) => (
  <div className="flex items-start gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
    <AlertTriangle size={18} className="mt-0.5 shrink-0" />
    <div className="flex-1">
      <p>{message}</p>
      {onRetry && (
        <button onClick={onRetry} className="mt-2 font-semibold underline underline-offset-2">
          Try again
        </button>
      )}
    </div>
  </div>
);
