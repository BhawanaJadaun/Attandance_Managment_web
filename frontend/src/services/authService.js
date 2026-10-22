
import { apiPost } from "./api";

const authService = {
  signup: (data) => apiPost("/api/auth/signup", {
    full_name: String(data.full_name || data.name || "").trim(),
    phone: String(data.phone || "").trim(),
    email: String(data.email || "").trim().toLowerCase(),
    password: data.password || "",
  }),

  verifyOtp: (data) => apiPost("/api/auth/verify-otp", {
    phone: String(data.phone || "").trim(),
    otp: String(data.otp || "").trim(),
  }),

export const resendOtp = (phone) => {
  return apiPost("/api/auth/resend-otp", {
    phone: phone.trim(),
  });
};
  studentLogin: (data) => apiPost("/api/auth/student-login", {
    phone: String(data.phone || "").trim(),
    password: data.password || "",
  }),

  professorLogin: (data) => apiPost("/api/auth/professor-login", {
    email: String(data.email || "").trim().toLowerCase(),
    password: data.password || "",
  }),

  adminLogin: (data) => apiPost("/api/auth/admin-login", {
    email: String(data.email || "").trim().toLowerCase(),
    password: data.password || "",
  }),

  forgotPassword: (data) => apiPost("/api/auth/forgot-password", {
    phone: String(data.phone || "").trim(),
  }),

  resetPassword: (data) => apiPost("/api/auth/reset-password", {
    phone: String(data.phone || "").trim(),
    otp: String(data.otp || "").trim(),
    new_password: data.new_password || data.newPassword || "",
  }),
};

export default authService;