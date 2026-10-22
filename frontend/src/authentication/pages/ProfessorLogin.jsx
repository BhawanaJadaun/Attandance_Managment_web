import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  GraduationCap,
} from "lucide-react";
import AuthInput from "../components/AuthInput";
import authApi from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

function ProfessorLogin() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    full_name: "",
    email: "",
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

    const full_name = form.full_name.trim();
    const email = form.email.trim().toLowerCase();

    if (!full_name) {
      setError("Please enter your professor name.");
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

    setIsSubmitting(true);

    try {
      const response = await authApi.professorLogin({
        full_name,
        email,
      });

      if (!response?.access_token) {
        throw new Error(
          "Login response did not include an access token."
        );
      }

      if (!response?.user) {
        throw new Error(
          "Professor information was not received."
        );
      }

      login(
        {
          ...response.user,
          role: "professor",
        },
        response.access_token
      );

      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      console.error("PROFESSOR LOGIN ERROR:", requestError);

      setError(
        requestError?.response?.data?.detail ||
          requestError?.detail ||
          requestError?.message ||
          "Professor name or email does not match our records."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="auth-border auth-card">
      <header className="auth-header">
        <span className="auth-label">FACULTY PORTAL</span>

        <h2>Professor Login</h2>

        <p>
          Sign in to manage subjects, lectures and attendance.
        </p>
      </header>

      {error && (
        <aside className="auth-error" role="alert">
          {error}
        </aside>
      )}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend className="sr-only">
            Professor Login Information
          </legend>

          <AuthInput
            label="Professor Name"
            name="full_name"
            type="text"
            value={form.full_name}
            onChange={handleChange}
            placeholder="Enter your registered full name"
            autoComplete="name"
          />

          <AuthInput
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your registered email"
            autoComplete="email"
          />
        </fieldset>

        <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 dark:border-emerald-900 dark:bg-emerald-950/30">
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />

            <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
              Professor Account
            </p>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            Enter the name and email registered by your administrator.
          </p>
        </div>

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

      <footer className="auth-footer">
        <Link to="/student-login">Student Login</Link>
        {" · "}
        <Link to="/admin-login">Admin Login</Link>
      </footer>
    </article>
  );
}

export default ProfessorLogin;