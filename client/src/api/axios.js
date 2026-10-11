import axios from "axios";

const TOKEN_KEY = "careerpilot_token";

export const tokenStorage = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (token) => localStorage.setItem(TOKEN_KEY, token),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach the JWT (if we have one) to every outgoing request.
// Exported standalone so it can be unit-tested without spinning up
// a real request.
export const attachAuthToken = (config) => {
  const token = tokenStorage.get();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
};

api.interceptors.request.use(attachAuthToken);

// Centralize the "session expired / invalid token" flow: whenever the
// backend responds 401, wipe the stored token and bounce to /login
// (unless we're already there) instead of making every page handle it.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const isAuthRoute =
      error.config?.url?.includes("/auth/login") ||
      error.config?.url?.includes("/auth/register");

    if (status === 401 && !isAuthRoute) {
      tokenStorage.clear();
      if (typeof window !== "undefined" && !window.location.pathname.startsWith("/login")) {
        window.location.assign("/login?sessionExpired=1");
      }
    }

    return Promise.reject(error);
  },
);

// Normalizes both Axios/network failures and backend error payloads
// into a single readable string components can show in a toast.
export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (error?.response?.data?.message) return error.response.data.message;
  if (error?.message === "Network Error") return "Can't reach the server. Is the backend running?";
  return error?.message || fallback;
};

export default api;
