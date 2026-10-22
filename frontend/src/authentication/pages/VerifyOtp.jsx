import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import OtpInput from "../components/OtpInput";
import authApi from "../../api/auth.js";

const OTP_EXPIRY_SECONDS = 5 * 60;

function VerifyOtp() {
  const navigate = useNavigate();

  const email = (sessionStorage.getItem("signupEmail") || "")
    .trim()
    .toLowerCase();

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");
  const [resendError, setResendError] = useState("");
  const [secondsLeft, setSecondsLeft] = useState(OTP_EXPIRY_SECONDS);

  // Countdown until the OTP expires.
  useEffect(() => {
    if (secondsLeft <= 0) return undefined;

    const timer = setInterval(() => {
      setSecondsLeft((previous) => Math.max(0, previous - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft]);

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds,
    ).padStart(2, "0")}`;
  };

  const getErrorMessage = (requestError) =>
    requestError?.response?.data?.detail ||
    requestError?.detail ||
    requestError?.message ||
    "Something went wrong. Please try again.";

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResendMessage("");
    setResendError("");

    if (!email) {
      setError("Signup email not found. Please sign up again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the complete 6-digit OTP.");
      return;
    }

    if (secondsLeft <= 0) {
      setError("OTP expired. Please request a new OTP.");
      return;
    }

    setIsSubmitting(true);

    try {
      await authApi.verifyOtp({
        email,
        otp: otp.trim(),
      });

      sessionStorage.removeItem("signupEmail");
      sessionStorage.removeItem("signupOtp");

      // Signup verification does not log the user in.
      navigate("/login", { replace: true });
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email || resending || secondsLeft > 0) return;

    setResending(true);
    setResendMessage("");
    setResendError("");
    setError("");

    try {
      const response = await authApi.resendOtp({ email });

      setOtp("");
      setSecondsLeft(OTP_EXPIRY_SECONDS);

      setResendMessage(
        response?.message || "A new OTP has been sent to your email.",
      );
    } catch (requestError) {
      setResendError(getErrorMessage(requestError));
    } finally {
      setResending(false);
    }
  };

  return (
    <article className="auth-border overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-blue-900/10 dark:border-slate-800 dark:bg-slate-900">
      <div className="px-6 py-8 sm:px-8">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400">
          <Mail className="h-7 w-7" />
        </div>

        <header className="mt-5 text-center">
          <span className="text-xs font-bold tracking-[0.18em] text-blue-600 dark:text-blue-400">
            VERIFY ACCOUNT
          </span>

          <h2 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-white">
            Enter verification code
          </h2>

          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            We sent a 6-digit OTP to
          </p>

          <p className="mt-1 break-all font-bold text-slate-800 dark:text-slate-200">
            {email || "your email address"}
          </p>
        </header>

        {error && (
          <div
            role="alert"
            className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex justify-center">
            <OtpInput value={otp} onChange={setOtp} length={6} />
          </div>

          <p className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
            {secondsLeft > 0 ? (
              <>
                OTP expires in{" "}
                <span className="font-bold text-blue-600 dark:text-blue-400">
                  {formatTime(secondsLeft)}
                </span>
              </>
            ) : (
              <span className="font-semibold text-red-600 dark:text-red-400">
                OTP expired. Request a new code.
              </span>
            )}
          </p>

          <button
            type="submit"
            disabled={
              isSubmitting || !email || otp.length !== 6 || secondsLeft <= 0
            }
            className="group mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-0.5 hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                Verify Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          {resendMessage && (
            <p
              role="status"
              className="mb-3 text-sm font-medium text-green-600 dark:text-green-400"
            >
              {resendMessage}
            </p>
          )}

          {resendError && (
            <p
              role="alert"
              className="mb-3 text-sm font-medium text-red-600 dark:text-red-400"
            >
              {resendError}
            </p>
          )}

          <button
            type="button"
            onClick={handleResendOtp}
            disabled={!email || secondsLeft > 0 || resending}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-bold text-blue-600 hover:text-blue-700 disabled:cursor-not-allowed disabled:opacity-40 dark:text-blue-400"
          >
            {resending && <Loader2 className="h-4 w-4 animate-spin" />}

            {resending
              ? "Sending new OTP..."
              : secondsLeft > 0
                ? `Resend OTP in ${formatTime(secondsLeft)}`
                : "Resend OTP"}
          </button>

          <div className="mt-3">
            <Link
              to="/signup"
              className="text-sm font-semibold text-slate-500 hover:text-blue-600 dark:text-slate-400"
            >
              Back to signup
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

export default VerifyOtp;
