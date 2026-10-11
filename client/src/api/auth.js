import api from "./axios";

export const authApi = {
  register: (payload) => api.post("/auth/register", payload).then((res) => res.data),
  login: (payload) => api.post("/auth/login", payload).then((res) => res.data),
  logout: () => api.post("/auth/logout").then((res) => res.data),
  me: () => api.get("/auth/me").then((res) => res.data),
};

export const userApi = {
  getProfile: () => api.get("/users/profile").then((res) => res.data),
  updateProfile: (payload) => api.put("/users/profile", payload).then((res) => res.data),
  changePassword: (payload) => api.put("/users/change-password", payload).then((res) => res.data),
  deleteAccount: () => api.delete("/users/profile").then((res) => res.data),
};
