import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  Loader2,
  ShieldCheck,
  GraduationCap,
  UserRound,
} from "lucide-react";

import AuthInput from "../components/AuthInput";
import authApi from "../../api/auth";
import { useAuth } from "../../context/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    role: "student",
    identifier: "",
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

    if (name === "role") {
      setForm((previous) => ({
        ...previous,
        role: value,
        identifier: "",
      }));
    }
  };

  const getIdentifierLabel = () => {
    if (form.role === "admin") {
      return "Admin ID";
    }

    if (form.role === "professor") {
      return "Professor ID";
    }

    return "Phone Number";
  };

  const getIdentifierPlaceholder = () => {
    if (form.role === "admin") {
      return "Enter Admin ID";
    }

    if (form.role === "professor") {
      return "Enter Professor ID";
    }

    return "Enter 10-digit phone number";
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const identifier = form.identifier.trim();
    const password = form.password;
    const role = form.role;

    // -----------------------------
    // VALIDATION
    // -----------------------------

    if (!role) {
      setError("Please select your account type.");
      return;
    }

    if (!identifier) {
      setError(`Please enter your ${getIdentifierLabel().toLowerCase()}.`);
      return;
    }

    // Student phone validation
    if (
      role === "student" &&
      !/^[0-9]{10}$/.test(identifier)
    ) {
      setError("Please enter a valid 10-digit phone number.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsSubmitting(true);

    try {
      // -----------------------------
      // LOGIN API
      // -----------------------------

      const loginData = {
        role,
        password,
      };

      // Student logs in with phone
      if (role === "student") {
        loginData.phone = identifier;
      }

      // Professor logs in with professor_id
      if (role === "professor") {
        loginData.professor_id = identifier;
      }

      // Admin logs in with admin_id
      if (role === "admin") {
        loginData.admin_id = identifier;
      }

      const response = await authApi.login(loginData);

      console.log("LOGIN RESPONSE:", response);

      // -----------------------------
      // CHECK TOKEN
      // -----------------------------

      if (!response?.access_token) {
        throw new Error(
          "Login successful, but access token was not received."
        );
      }

      // -----------------------------
      // USER DATA
      // -----------------------------

      const userData = response?.user || {
        role: response?.role || role,
      };

      const loggedInRole =
        userData?.role ||
        response?.role ||
        role;

      // -----------------------------
      // VERIFY ROLE
      // -----------------------------

      const allowedRoles = [
        "admin",
        "professor",
        "student",
      ];

      if (!allowedRoles.includes(loggedInRole)) {
        throw new Error(
          "Invalid account role. Please contact the administrator."
        );
      }

      // -----------------------------
      // SAVE LOGIN
      // -----------------------------

      login(
        {
          ...userData,
          role: loggedInRole,
        },
        response.access_token
      );

      // -----------------------------
      // GO TO DASHBOARD
      // -----------------------------

      navigate("/dashboard", {
        replace: true,
      });
    } catch (requestError) {
      console.error("LOGIN ERROR:", requestError);

      setError(
        requestError?.message ||
          "Login failed. Please check your account details and password."
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
          WELCOME BACK
        </span>

        <h2>Login</h2>

        <p>
          Sign in to manage attendance.
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
          LOGIN FORM
      ============================== */}

      <form onSubmit={handleSubmit}>
        <fieldset>
          <legend className="sr-only">
            Login Information
          </legend>

          {/* ==============================
              ACCOUNT TYPE
          ============================== */}

          <div className="mb-4">
            <label
              htmlFor="role"
              className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300"
            >
              Account Type
            </label>

            <div className="relative">
              <select
                id="role"
                name="role"
                value={form.role}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full appearance-none rounded-xl border border-slate-300 bg-white px-4 py-3 pr-10 text-sm text-slate-800 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
              >
                <option value="student">
                  Student
                </option>

                <option value="professor">
                  Professor
                </option>

                <option value="admin">
                  Admin
                </option>
              </select>

              <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                {form.role === "admin" ? (
                  <ShieldCheck className="h-5 w-5" />
                ) : form.role === "professor" ? (
                  <GraduationCap className="h-5 w-5" />
                ) : (
                  <UserRound className="h-5 w-5" />
                )}
              </div>
            </div>
          </div>

          {/* ==============================
              ROLE-BASED LOGIN ID
          ============================== */}

          <AuthInput
            label={getIdentifierLabel()}
            name="identifier"
            type={form.role === "student" ? "tel" : "text"}
            value={form.identifier}
            onChange={handleChange}
            placeholder={getIdentifierPlaceholder()}
            autoComplete={
              form.role === "student"
                ? "tel"
                : "username"
            }
          />

          {/* ==============================
              PASSWORD
          ============================== */}

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

        {/* ==============================
            ROLE INFORMATION
        ============================== */}

        <div className="mt-4 rounded-xl border border-indigo-200 bg-indigo-50 px-4 py-3 dark:border-indigo-900 dark:bg-indigo-950/30">
          <p className="text-sm font-semibold text-indigo-700 dark:text-indigo-300">
            {form.role === "admin"
              ? "Admin Login"
              : form.role === "professor"
              ? "Professor Login"
              : "Student Login"}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-600 dark:text-slate-400">
            {form.role === "admin"
              ? "Use your Admin ID and password."
              : form.role === "professor"
              ? "Use your Professor ID and password."
              : "Use your registered phone number and password."}
          </p>
        </div>

        {/* ==============================
            LOGIN BUTTON
        ============================== */}

        <button
          type="submit"
          className="auth-button group mt-5 flex items-center justify-center gap-2"
          disabled={isSubmitting}
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

      {/* ==============================
          FOOTER
      ============================== */}

      <footer className="auth-footer">
        <Link to="/forgot-password">
          Forgot password?
        </Link>

        <br />

        <span>
          Don't have an account?{" "}
        </span>

        <Link to="/signup">
          Create Student Account
        </Link>
      </footer>
    </article>
  );
}

export default Login;
// import { useState } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { ArrowRight, Loader2 } from "lucide-react";

// import AuthInput from "../components/AuthInput";
// import authApi from "../../api/auth";
// import { useAuth } from "../../context/AuthContext";

// function Login() {
//   const navigate = useNavigate();
//   const { login } = useAuth();

//   const [form, setForm] = useState({
//     phone: "",
//     password: "",
//   });

//   const [error, setError] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);

//   const handleChange = (event) => {
//     const { name, value } = event.target;

//     setForm((previous) => ({
//       ...previous,
//       [name]: value,
//     }));
//   };

//   const handleSubmit = async (event) => {
//     event.preventDefault();

//     setError("");

//     if (!form.phone.trim()) {
//       setError("Please enter your phone number.");
//       return;
//     }

//     if (!form.password) {
//       setError("Please enter your password.");
//       return;
//     }

//     setIsSubmitting(true);

//     try {
//       const response = await authApi.login({
//         phone: form.phone.trim(),
//         password: form.password,
//       });

//       console.log("LOGIN RESPONSE:", response);

//       if (!response?.access_token) {
//         throw new Error("Login successful, but access token was not received.");
//       }

//       // Save authentication data
//       login(
//         response.user,
//         response.access_token
//       );

//       // Always go to Dashboard after successful login
//       navigate("/dashboard", {
//         replace: true,
//       });
//     } catch (requestError) {
//       console.error("LOGIN ERROR:", requestError);

//       setError(
//         requestError?.message ||
//           "Login failed. Please check your phone number and password."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <article className="auth-border auth-card">
//       {/* ================= HEADER ================= */}
//       <header className="auth-header">
//         <span className="auth-label">
//           WELCOME BACK
//         </span>

//         <h2>Login</h2>

//         <p>
//           Sign in to manage attendance.
//         </p>
//       </header>

//       {/* ================= ERROR ================= */}
//       {error && (
//         <aside
//           className="auth-error"
//           role="alert"
//         >
//           {error}
//         </aside>
//       )}

//       {/* ================= FORM ================= */}
//       <form onSubmit={handleSubmit}>
//         <fieldset>
//           <legend className="sr-only">
//             Login Information
//           </legend>

//           {/* Phone */}
//           <AuthInput
//             label="Phone Number"
//             name="phone"
//             value={form.phone}
//             onChange={handleChange}
//             placeholder="Enter 10-digit phone number"
//             type="tel"
//           />

//           {/* Password */}
//           <AuthInput
//             label="Password"
//             name="password"
//             type="password"
//             value={form.password}
//             onChange={handleChange}
//             placeholder="Enter your password"
//           />
//         </fieldset>

//         {/* ================= LOGIN BUTTON ================= */}
//         <button
//           type="submit"
//           className="auth-button group flex items-center justify-center gap-2"
//           disabled={isSubmitting}
//         >
//           {isSubmitting ? (
//             <>
//               <Loader2 className="h-4 w-4 animate-spin" />
//               Signing In...
//             </>
//           ) : (
//             <>
//               Login
//               <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
//             </>
//           )}
//         </button>
//       </form>

//       {/* ================= FOOTER ================= */}
//       <footer className="auth-footer">
//         <Link to="/forgot-password">
//           Forgot password?
//         </Link>

//         <br />

//         <span>
//           Don't have an account?{" "}
//         </span>

//         <Link to="/signup">
//           Create one
//         </Link>
//       </footer>
//     </article>
//   );
// }

// export default Login;