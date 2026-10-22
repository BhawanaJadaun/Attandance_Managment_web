const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// =========================================================
// COMMON REQUEST FUNCTION
// =========================================================

const request = async (endpoint, options = {}) => {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,

    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  let data = {};

  try {
    data = await response.json();
  } catch {
    data = {};
  }

  console.log("API RESPONSE:", data);

  // =======================================================
  // ERROR HANDLING
  // =======================================================

  if (!response.ok) {
    let message = "Something went wrong.";

    // FastAPI normal error
    if (typeof data?.detail === "string") {
      message = data.detail;
    }

    // FastAPI validation errors
    else if (Array.isArray(data?.detail)) {
      message = data.detail
        .map((item) => {
          const field = item?.loc?.[item.loc.length - 1] || "field";

          return `${field}: ${item?.msg || "Invalid value"}`;
        })
        .join(", ");
    }

    throw new Error(message);
  }

  return data;
};

// =========================================================
// AUTH API
// =========================================================

const authApi = {
  // STUDENT SIGNUP
  signup: async (data) => {
    return request("/api/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        full_name: String(data.full_name || "").trim(),
        email: String(data.email || "")
          .trim()
          .toLowerCase(),
        password: data.password || "",
      }),
    });
  },

  // VERIFY SIGNUP EMAIL OTP
  verifyOtp: async (data) => {
    return request("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify({
        email: String(data.email || "")
          .trim()
          .toLowerCase(),
        otp: String(data.otp || "").trim(),
      }),
    });
  },

  // RESEND SIGNUP OTP
  resendOtp: async (data) => {
    return request("/api/auth/resend-otp", {
      method: "POST",
      body: JSON.stringify({
        email: String(data.email || "")
          .trim()
          .toLowerCase(),
      }),
    });
  },

  // STUDENT LOGIN
  studentLogin: async (data) => {
    return request("/api/auth/student-login", {
      method: "POST",
      body: JSON.stringify({
        email: String(data.email || "")
          .trim()
          .toLowerCase(),
        password: data.password || "",
      }),
    });
  },

    // PROFESSOR LOGIN
  professorLogin: async (data) => {
    return request("/api/auth/professor-login", {
      method: "POST",
      body: JSON.stringify({
        full_name: String(data?.full_name || "").trim(),
        email: String(data?.email || "")
          .trim()
          .toLowerCase(),
      }),
    });
  },

  // ADMIN LOGIN
  adminLogin: async (data) => {
    return request("/api/auth/admin-login", {
      method: "POST",
      body: JSON.stringify({
        email: String(data.email || "")
          .trim()
          .toLowerCase(),
        password: data.password || "",
      }),
    });
  },

  // FORGOT PASSWORD
  forgotPassword: async (data) => {
    return request("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({
        email: String(data.email || "")
          .trim()
          .toLowerCase(),
      }),
    });
  },

  // RESET PASSWORD
  resetPassword: async (data) => {
    return request("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({
        email: String(data.email || "")
          .trim()
          .toLowerCase(),
        otp: String(data.otp || "").trim(),
        new_password: data.new_password || "",
      }),
    });
  },
};

// =========================================================
// EXPORT
// =========================================================

export default authApi;
