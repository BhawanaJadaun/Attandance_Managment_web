import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

// =========================================================
// AUTHENTICATION
// =========================================================

import AuthLayout from "./authentication/components/AuthLayout";

import ForgotPassword from "./authentication/pages/ForgotPassword";

import StudentLogin from "./authentication/pages/StudentLogin";

import ProfessorLogin from "./authentication/pages/ProfessorLogin";

import AdminLogin from "./authentication/pages/AdminLogin";

import ResetPassword from "./authentication/pages/ResetPassword";

import Signup from "./authentication/pages/Signup";

import VerifyOtp from "./authentication/pages/VerifyOtp";

import Unauthorized from "./pages/Unauthorized/Unauthorized";

import ProtectedRoute from "./components/ProtectedRoute";


// =========================================================
// LAYOUT
// =========================================================

import DashboardLayout from "./components/layout/DashboardLayout";

import Dashboard from "./pages/Dashboard/Dashboard";


// =========================================================
// STUDENT PAGES
// =========================================================

import StudentList from "./pages/Students/StudentList";

import AddStudent from "./pages/Students/AddStudent";

import StudentDetails from "./pages/Students/StudentDetails";

import EditStudent from "./pages/Students/EditStudent";


// =========================================================
// PROFESSOR PAGES
// =========================================================

import ProfessorList from "./pages/Professors/ProfessorList";

import AddProfessor from "./pages/Professors/AddProfessor";

import ProfessorDetail from "./pages/Professors/ProfessorDetail";

import EditProfessor from "./pages/Professors/EditProfessor";


// =========================================================
// SUBJECTS
// =========================================================

import SubjectList from "./pages/Subjects/SubjectList";

import AddSubject from "./pages/Subjects/AddSubject";

import SubjectDetails from "./pages/Subjects/SubjectDetail";

import EditSubject from "./pages/Subjects/EditSubject";


// =========================================================
// ATTENDANCE
// =========================================================

import TakeAttendance from "./pages/Attendance/TakeAttendance";

import AttendanceList from "./pages/Attendance/AttendanceList";

import AttendanceHistory from "./pages/Attendance/AttendanceHistory";


// =========================================================
// REPORTS
// =========================================================

import Reports from "./pages/Reports/Reports";


// =========================================================
// PROFILE
// =========================================================

import Profile from "./pages/Profile/Profile";


// =========================================================
// SETTINGS
// =========================================================

import Settings from "./pages/Settings/Settings";


// =========================================================
// ABOUT
// =========================================================

import About from "./pages/About/About";


function App() {
  return (
    <Routes>

      {/* ===================================================
          AUTHENTICATION
          =================================================== */}

      <Route element={<AuthLayout />}>

        {/* Student Signup */}
        <Route
          path="/signup"
          element={<Signup />}
        />

        {/* Student Login */}
        <Route
          path="/student-login"
          element={<StudentLogin />}
        />

        {/* Professor Login */}
        <Route
          path="/professor-login"
          element={<ProfessorLogin />}
        />

        {/* Admin Login */}
        <Route
          path="/admin-login"
          element={<AdminLogin />}
        />

        {/* OTP Verification */}
        <Route
          path="/verify-otp"
          element={<VerifyOtp />}
        />

        {/* Forgot Password */}
        <Route
          path="/forgot-password"
          element={<ForgotPassword />}
        />

        {/* Reset Password */}
        <Route
          path="/reset-password"
          element={<ResetPassword />}
        />

        {/* Unauthorized */}
        <Route
          path="/unauthorized"
          element={<Unauthorized />}
        />

      </Route>


      {/* ===================================================
          ABOUT
          =================================================== */}

      <Route
        path="/about"
        element={<About />}
      />


      {/* ===================================================
          ALL AUTHENTICATED USERS
          =================================================== */}

      <Route element={<ProtectedRoute />}>

        {/* =================================================
            DASHBOARD LAYOUT
            ================================================= */}

        <Route element={<DashboardLayout />}>

          {/* =================================================
              DASHBOARD
              ================================================= */}

          <Route
            path="/dashboard"
            element={<Dashboard />}
          />


          {/* =================================================
              STUDENTS
              ================================================= */}

          <Route
            path="/students"
            element={<StudentList />}
          />

          <Route
            path="/students/add"
            element={<AddStudent />}
          />

          <Route
            path="/students/:id"
            element={<StudentDetails />}
          />

          <Route
            path="/students/edit/:id"
            element={<EditStudent />}
          />


          {/* =================================================
              PROFESSORS
              ================================================= */}

          <Route
            path="/professors"
            element={<ProfessorList />}
          />

          <Route
            path="/professors/add"
            element={<AddProfessor />}
          />

          <Route
            path="/professors/:id"
            element={<ProfessorDetail />}
          />

          <Route
            path="/professors/edit/:id"
            element={<EditProfessor />}
          />


          {/* =================================================
              SUBJECTS
              ================================================= */}

          <Route
            path="/subjects"
            element={<SubjectList />}
          />

          <Route
            path="/subjects/add"
            element={<AddSubject />}
          />

          <Route
            path="/subjects/:id"
            element={<SubjectDetails />}
          />

          <Route
            path="/subjects/edit/:id"
            element={<EditSubject />}
          />


          {/* =================================================
              ATTENDANCE
              ================================================= */}

          <Route
            path="/attendance"
            element={<AttendanceList />}
          />

          <Route
            path="/attendance/take"
            element={<TakeAttendance />}
          />

          <Route
            path="/attendance/history"
            element={<AttendanceHistory />}
          />


          {/* =================================================
              REPORTS
              ================================================= */}

          <Route
            path="/reports"
            element={<Reports />}
          />


          {/* =================================================
              PROFILE
              ================================================= */}

          <Route
            path="/profile"
            element={<Profile />}
          />


          {/* =================================================
              SETTINGS
              ================================================= */}

          <Route
            path="/settings"
            element={<Settings />}
          />

        </Route>

      </Route>


      {/* ===================================================
          DEFAULT ROUTE
          =================================================== */}

      <Route
        path="*"
        element={
          <Navigate
            to="/student-login"
            replace
          />
        }
      />

    </Routes>
  );
}


export default App;