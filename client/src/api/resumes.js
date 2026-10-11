import api from "./axios";

export const resumeApi = {
  upload: (file, onUploadProgress) => {
    const formData = new FormData();
    formData.append("resume", file);
    return api
      .post("/resumes/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress,
      })
      .then((res) => res.data);
  },
  list: () => api.get("/resumes").then((res) => res.data),
  getById: (id) => api.get(`/resumes/${id}`).then((res) => res.data),
  remove: (id) => api.delete(`/resumes/${id}`).then((res) => res.data),
};
