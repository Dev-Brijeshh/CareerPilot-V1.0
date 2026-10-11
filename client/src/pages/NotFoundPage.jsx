import { Link } from "react-router-dom";
import { Compass } from "lucide-react";

const NotFoundPage = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
      <Compass size={28} />
    </div>
    <h1 className="text-3xl font-bold text-slate-900">Page not found</h1>
    <p className="mt-2 max-w-sm text-sm text-slate-500">
      The page you're looking for doesn't exist or may have been moved.
    </p>
    <Link to="/" className="btn-primary mt-6">
      Back to home
    </Link>
  </div>
);

export default NotFoundPage;
