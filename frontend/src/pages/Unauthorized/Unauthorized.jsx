import { Link } from "react-router-dom";

function Unauthorized() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-6 dark:bg-slate-950">
      <div className="text-center">
        <h1 className="text-6xl font-extrabold text-red-600">
          403
        </h1>

        <h2 className="mt-4 text-2xl font-bold text-slate-900 dark:text-white">
          Access Denied
        </h2>

        <p className="mt-2 text-slate-500 dark:text-slate-400">
          You do not have permission to access this page.
        </p>

        <Link
          to="/dashboard"
          className="mt-6 inline-flex rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
        >
          Back to Dashboard
        </Link>
      </div>
    </div>
  );
}

export default Unauthorized;