import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, ShieldCheck } from "lucide-react";

import AuthInput from "../components/AuthInput";
import authApi from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

function AdminLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    email: "",
    password: "",
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

    const email = form.email.trim().toLowerCase();
    const password = form.password;

    // -----------------------------
    // FRONTEND VALIDATION
    // -----------------------------
    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authApi.adminLogin({
        email,
        password,
      });

      console.log("ADMIN LOGIN RAW RESPONSE:", result);

      const response = result?.data?.data ?? result?.data ?? result;

      console.log("ADMIN LOGIN PARSED RESPONSE:", response);

      const accessToken = response?.access_token ?? response?.token;

      const user = response?.user;

      if (!accessToken) {
        throw new Error(
          "Login response received, but access_token is missing.",
        );
      }

      if (!user) {
        throw new Error(
          "Login response received, but administrator information is missing.",
        );
      }

      const userData = {
        ...user,
        role: "admin",
      };

      login(userData, accessToken);

      console.log("ADMIN AUTHENTICATED:", userData);

      navigate("/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      console.error("ADMIN LOGIN ERROR:", requestError);

      setError(
        requestError?.message ||
          "Admin login failed. Please check your email and password.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="auth-border auth-card">
      <header className="auth-header">
        <span className="auth-label">ADMINISTRATION</span>

        <h2>Admin Login</h2>

        <p>Sign in to manage the Attendance Management System.</p>
      </header>

      {/* ERROR MESSAGE */}
      {error && (
        <aside className="auth-error" role="alert">
          {error}
        </aside>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend className="sr-only">Admin Login Information</legend>

          {/* EMAIL */}
          <AuthInput
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter administrator email"
            autoComplete="email"
          />

          {/* PASSWORD */}
          <AuthInput
            label="Password"
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
        </fieldset>

        {/* ADMIN INFORMATION */}
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-900 dark:bg-amber-950/30">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-amber-600 dark:text-amber-400" />

            <p className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              Administrator Account
            </p>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            Only authorized administrators can access this section.
          </p>
        </div>

        {/* LOGIN BUTTON */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="auth-button group mt-5 flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Signing In...
            </>
          ) : (
            <>
              Login
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>

      {/* FOOTER LINKS */}
      <footer className="auth-footer">
        <Link to="/forgot-password">Forgot password?</Link>

        <br />

        <Link to="/student-login">Student Login</Link>

        {" · "}

        <Link to="/professor-login">Professor Login</Link>
      </footer>
    </article>
  );
}

export default AdminLogin;
