import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2 } from "lucide-react";

import AuthInput from "../components/AuthInput";
import authApi from "../../api/auth";

function Signup() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ==========================================
  // HANDLE INPUT CHANGE
  // ==========================================
  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  // ==========================================
  // SUBMIT SIGNUP
  // ==========================================
  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const fullName = form.fullName.trim();
  
    const email = form.email.trim();

    // ==========================================
    // VALIDATION
    // ==========================================
    if (!fullName) {
      setError("Please enter your full name.");
      return;
    }

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!form.password) {
      setError("Please create a password.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (!form.confirmPassword) {
      setError("Please confirm your password.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Password and Confirm Password do not match.");
      return;
    }

    setIsSubmitting(true);

    // ==========================================
    // API REQUEST
    // ==========================================
   
try {
  const response = await authApi.signup({
    full_name: fullName,
    email: email.trim().toLowerCase(),
    password: form.password,
  });

  console.log("SIGNUP RESPONSE:", response);

  // Save email for the verification page
  sessionStorage.setItem(
    "signupEmail",
    email.trim().toLowerCase()
  );

  // Backend sends the OTP by email
  sessionStorage.removeItem("signupOtp");

  navigate("/verify-otp", { replace: true });
} catch (requestError) {
  console.error("SIGNUP ERROR:", requestError);

  setError(
    requestError?.message || "Signup failed. Please try again."
  );
} finally {
  setIsSubmitting(false);
}
  };

  return (
    <article className="auth-border auth-card">
      {/* ==============================
          HEADER
      ============================== */}
      <header className="auth-header">
        <span className="auth-label">
          GET STARTED
        </span>

        <h2>Create Student Account</h2>

        <p>
          Create your student account to manage attendance.
        </p>
      </header>

      {/* ==============================
          ERROR
      ============================== */}
      {error && (
        <aside
          className="auth-error"
          role="alert"
        >
          {error}
        </aside>
      )}

      {/* ==============================
          SIGNUP FORM
      ============================== */}
      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend className="sr-only">
            Student Account Information
          </legend>

          {/* FULL NAME */}
          <AuthInput
            label="Full Name"
            name="fullName"
            type="text"
            value={form.fullName}
            onChange={handleChange}
            placeholder="Enter your full name"
            autoComplete="name"
          />

          {/* EMAIL */}
          <AuthInput
            label="Email"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your email address"
            autoComplete="email"
          />

          {/* PASSWORD */}
          <AuthInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Create a password"
            autoComplete="new-password"
          />

          {/* CONFIRM PASSWORD */}
          <AuthInput
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange}
            placeholder="Confirm your password"
            autoComplete="new-password"
          />
        </fieldset>

        {/* ==============================
            ACCOUNT TYPE INFORMATION
        ============================== */}
        <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-900 dark:bg-blue-950/30">
          <p className="text-sm font-medium text-blue-700 dark:text-blue-300">
            Account Type
          </p>

          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Public registration is available for students only.
            Admin and Professor accounts are created by an
            authorized Admin.
          </p>
        </div>

        {/* ==============================
            SIGNUP BUTTON
        ============================== */}
        <button
          type="submit"
          className="auth-button group mt-5 flex items-center justify-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating Account...
            </>
          ) : (
            <>
              Create Student Account & Send OTP

              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      {/* ==============================
          FOOTER
      ============================== */}
      <footer className="auth-footer">
        <span>Already have an account?</span>{" "}
        <Link to="/login">
          Login
        </Link>
      </footer>
    </article>
  );
}

export default Signup;
