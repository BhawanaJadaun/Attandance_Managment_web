
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, Loader2, UserRound } from "lucide-react";
import AuthInput from "../components/AuthInput";
import authApi from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

function StudentLogin() {
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
      const response = await authApi.studentLogin({
        email,
        password,
      });

      if (!response?.access_token) {
        throw new Error("Access token was not received.");
      }

      if (!response?.user) {
        throw new Error("Student information was not received.");
      }

      login(
        {
          ...response.user,
          role: "student",
        },
        response.access_token
      );

      navigate("/dashboard", { replace: true });
    } catch (requestError) {
      console.error("STUDENT LOGIN ERROR:", requestError);

      setError(
        requestError?.message ||
          "Student login failed. Please check your email and password."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <article className="auth-border auth-card">
      <header className="auth-header">
        <span className="auth-label">STUDENT PORTAL</span>

        <h2>Student Login</h2>

        <p>
          Sign in to view your attendance and academic information.
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
            Student Login Information
          </legend>

          <AuthInput
            label="Email Address"
            name="email"
            type="email"
            value={form.email}
            onChange={handleChange}
            placeholder="Enter your registered email"
            autoComplete="email"
          />

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

        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-900 dark:bg-indigo-950/30">
          <div className="flex items-center gap-2">
            <UserRound className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />

            <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              Student Account
            </p>
          </div>

          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            Use the registered email address and password associated
            with your student account.
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
        <Link to="/forgot-password">Forgot password?</Link>
        <br />

        <span>Don't have an account? </span>
        <Link to="/signup">Create Student Account</Link>
        <br />

        <Link to="/professor-login">Professor Login</Link>
        {" · "}
        <Link to="/admin-login">Admin Login</Link>
      </footer>
    </article>
  );
}

export default StudentLogin;

