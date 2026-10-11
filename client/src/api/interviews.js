import api from "./axios";

export const interviewApi = {
  generate: (payload) => api.post("/interviews/generate", payload).then((res) => res.data),
  list: () => api.get("/interviews").then((res) => res.data),
  getById: (id) => api.get(`/interviews/${id}`).then((res) => res.data),
  answerQuestion: (interviewId, questionId, answer) =>
    api
      .patch(`/interviews/${interviewId}/questions/${questionId}`, { answer })
      .then((res) => res.data),
  complete: (interviewId) =>
    api.patch(`/interviews/${interviewId}/complete`).then((res) => res.data),
};
