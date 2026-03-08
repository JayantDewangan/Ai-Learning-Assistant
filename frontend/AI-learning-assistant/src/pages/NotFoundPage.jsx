import React from "react";
import { useNavigate } from "react-router-dom";
import { Home, FileQuestion, ArrowLeft, LogIn } from "lucide-react";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="mt-10 h-full flex items-center justify-center bg-slate-50 px-6">
      <div className="max-w-xl w-full text-center">

        {/* Icon */}
        <div className="w-20 h-20 mx-auto rounded-2xl bg-indigo-100 flex items-center justify-center mb-6">
          <FileQuestion className="w-10 h-10 text-indigo-500" strokeWidth={1.5} />
        </div>

        {/* 404 */}
        <h1 className="text-6xl font-extrabold text-slate-900 mb-2">
          404
        </h1>

        {/* Title */}
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Page Not Found
        </h2>

        {/* Description */}
        <p className="text-slate-500 text-sm mb-8">
          The page you are looking for does not exist or may have been moved.
        </p>

        {/* Buttons */}
        <div className="flex flex-wrap items-center justify-center gap-3">

          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Go Back
          </button>

          <button
            onClick={() => navigate("/dashboard")}
            className="flex items-center gap-2 px-5 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            <Home className="w-4 h-4" />
            Dashboard
          </button>

          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 px-5 py-2.5 border border-indigo-200 text-indigo-600 hover:bg-indigo-50 font-semibold rounded-xl transition-colors text-sm"
          >
            <LogIn className="w-4 h-4" />
            Login
          </button>

        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;