
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  KeyRound,
  ArrowRight,
  Loader2,
} from "lucide-react";

import AuthInput from "../components/AuthInput";
import authApi from "../../api/auth";

function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.forgotPassword({
        email: normalizedEmail,
      });

      // Store the email for the Reset Password page.
      sessionStorage.setItem("resetEmail", normalizedEmail);

      // Do not store or display the OTP in the frontend.
      sessionStorage.removeItem("resetOtp");

      navigate("/reset-password", { replace: true });
    } catch (requestError) {
      console.error("FORGOT PASSWORD ERROR:", requestError);

      setError(
        requestError?.response?.data?.detail ||
          requestError?.detail ||
          requestError?.message ||
          "Unable to send password reset OTP. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="auth-border overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-blue-900/10 dark:border-slate-800 dark:bg-slate-900">
      <div className="px-6 py-8 sm:px-8">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <KeyRound className="h-7 w-7" />
        </div>

        <header className="mt-5">
          <span className="text-xs font-bold tracking-[0.18em] text-blue-600 dark:text-blue-400">
            ACCOUNT RECOVERY
          </span>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            Forgot password?
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Enter your registered email address and we'll
            send you an OTP to reset your password.
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
          <AuthInput
            label="Email Address"
            name="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Enter your registered email"
            autoComplete="email"
          />

          <button
            type="submit"
            disabled={isSubmitting}
            className="group flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                Send OTP
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <footer className="mt-6 text-center">
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

export default ForgotPassword;

