
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  LockKeyhole,
  ArrowRight,
  Loader2,
} from "lucide-react";
import AuthInput from "../components/AuthInput";
import OtpInput from "../components/OtpInput";
import authApi from "../../api/auth";

function ResetPassword() {
  const navigate = useNavigate();

  const email = (
    sessionStorage.getItem("resetEmail") || ""
  ).trim().toLowerCase();

  const [form, setForm] = useState({
    otp: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!email) {
      setError(
        "Reset email not found. Please request a password reset again."
      );
      return;
    }

    if (form.otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    if (form.newPassword.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.resetPassword({
        email,
        otp: form.otp.trim(),
        new_password: form.newPassword,
      });

      sessionStorage.removeItem("resetEmail");
      sessionStorage.removeItem("resetOtp");

      navigate("/login", {
        replace: true,
      });
    } catch (requestError) {
      console.error("RESET PASSWORD ERROR:", requestError);

      setError(
        requestError?.response?.data?.detail ||
          requestError?.detail ||
          requestError?.message ||
          "Unable to reset your password. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="auth-border overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-blue-900/10 dark:border-slate-800 dark:bg-slate-900">
      <div className="px-6 py-8 sm:px-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <LockKeyhole className="h-7 w-7" />
        </div>

        <header className="mt-5">
          <span className="text-xs font-bold tracking-[0.18em] text-blue-600 dark:text-blue-400">
            ACCOUNT RECOVERY
          </span>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            Create new password
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Reset the password for{" "}
            <span className="break-all font-semibold text-slate-700 dark:text-slate-200">
              {email || "your account"}
            </span>
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >
          <div>
            <label className="mb-3 block text-sm font-semibold text-slate-700 dark:text-slate-200">
              One-Time Password
            </label>

            <OtpInput
              value={form.otp}
              onChange={(value) =>
                setForm((previous) => ({
                  ...previous,
                  otp: value,
                }))
              }
              length={6}
            />
          </div>

          <AuthInput
            label="New Password"
            name="newPassword"
            type="password"
            value={form.newPassword}
            onChange={handleChange}
            placeholder="Create a new password"
            autoComplete="new-password"
          />

          <AuthInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your new password"
            autoComplete="new-password"
          />

          <button
            type="submit"
            disabled={
              isSubmitting ||
              !email ||
              form.otp.length !== 6
            }
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Resetting...
              </>
            ) : (
              <>
                Reset Password
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <footer className="mt-6 text-center">
          <Link
            to="/forgot-password"
            className="mr-4 text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400"
          >
            Request new OTP
          </Link>

          <Link
            to="/login"
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400"
          >
            Back to login
          </Link>
        </footer>
      </div>
    </article>
  );
}

export default ResetPassword;

