import api from "./axios";

export const analysisApi = {
  analyze: (resumeId, jobDescription) =>
    api.post(`/resume/analyze/${resumeId}`, { jobDescription }).then((res) => res.data),
  history: () => api.get("/resume/analyze/history").then((res) => res.data),
  getById: (analysisId) => api.get(`/resume/analyze/${analysisId}`).then((res) => res.data),
};
