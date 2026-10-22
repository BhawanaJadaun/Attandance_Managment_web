const API_BASE_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"
).replace(/\/+$/, "");

export const getAuthToken = () =>
  localStorage.getItem("attendanceToken") ||
  localStorage.getItem("access_token");

export const apiRequest = async (endpoint, options = {}) => {
  const token = getAuthToken();

  const headers = {
    ...(options.body instanceof FormData
      ? {}
      : { "Content-Type": "application/json" }),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    const detail = data?.detail;
    const message =
      typeof detail === "string"
        ? detail
        : Array.isArray(detail)
          ? detail
              .map(
                (item) =>
                  `${item?.loc?.at(-1) || "field"}: ${item?.msg || "Invalid value"}`,
              )
              .join(", ")
          : typeof data === "string" && data
            ? data
            : "Request failed.";

    throw new Error(message);
  }

  return data;
};

export const apiGet = (endpoint) => apiRequest(endpoint, { method: "GET" });

export const apiPost = (endpoint, body) =>
  apiRequest(endpoint, {
    method: "POST",
    body: JSON.stringify(body),
  });

export const apiPut = (endpoint, body) =>
  apiRequest(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });

export const apiPatch = (endpoint, body) =>
  apiRequest(endpoint, {
    method: "PATCH",
    body: JSON.stringify(body),
  });

export const apiDelete = (endpoint) =>
  apiRequest(endpoint, { method: "DELETE" });

export default apiRequest;
