import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import App from "./App.jsx";

import { AuthProvider } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import { ThemeProvider } from "./context/ThemeContext";
import { StudentProvider } from "./context/StudentContext";
import { SubjectProvider } from "./context/SubjectContext";
import { ProfessorsProvider } from "./context/ProfessorsContext";
import { AttendanceProvider } from "./context/AttendanceContext";
import { LectureProvider } from "./context/LectureContext";
import "./index.css";
import "./styles/variables.css";
import "./styles/global.css";
import "./styles/authentication.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <AppProvider>
          <ThemeProvider>
            <StudentProvider>
              <SubjectProvider>
                <ProfessorsProvider>
                  <AttendanceProvider>
                    <LectureProvider>
                      <Toaster
                        position="top-right"
                        reverseOrder={false}
                        gutter={8}
                        toastOptions={{
                          duration: 3000,
                          style: {
                            borderRadius: "12px",
                            background: "#ffffff",
                            color: "#0f172a",
                            padding: "14px 16px",
                            boxShadow: "0 8px 24px rgba(15, 23, 42, 0.12)",
                          },
                          success: {
                            iconTheme: {
                              primary: "#16a34a",
                              secondary: "#ffffff",
                            },
                          },
                          error: {
                            duration: 4000,
                            iconTheme: {
                              primary: "#dc2626",
                              secondary: "#ffffff",
                            },
                          },
                        }}
                      />
                      <App />
                    </LectureProvider>
                  </AttendanceProvider>
                </ProfessorsProvider>
              </SubjectProvider>
            </StudentProvider>
          </ThemeProvider>
        </AppProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
