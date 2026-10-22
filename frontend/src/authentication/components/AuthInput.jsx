import { useState } from "react";
import {
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";

function AuthInput({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  required = true,
  autoComplete,
}) {
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const inputType =
    isPassword && showPassword ? "text" : type;

  return (
    <div className="space-y-2">
      <label
        htmlFor={name}
        className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-200"
      >
        <span>{label}</span>

        {value && name !== "password" && name !== "confirmPassword" && (
          <CheckCircle2 className="h-4 w-4 text-emerald-500" />
        )}
      </label>

      <div className="relative">
        <input
          id={name}
          name={name}
          type={inputType}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          autoComplete={
            autoComplete ||
            (isPassword
              ? "new-password"
              : name)
          }
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3.5 text-sm text-slate-900 outline-none transition-all duration-200 placeholder:text-slate-400 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-500 dark:hover:border-blue-500"
        />

        {isPassword && (
          <button
            type="button"
            onClick={() =>
              setShowPassword((previous) => !previous)
            }
            className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-blue-600 dark:hover:bg-slate-800"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
          >
            {showPassword ? (
              <EyeOff className="h-5 w-5" />
            ) : (
              <Eye className="h-5 w-5" />
            )}
          </button>
        )}
      </div>
    </div>
  );
}

export default AuthInput;