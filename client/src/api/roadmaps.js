import api from "./axios";

export const roadmapApi = {
  generate: (payload) => api.post("/roadmaps/generate", payload).then((res) => res.data),
  list: () => api.get("/roadmaps").then((res) => res.data),
  getById: (id) => api.get(`/roadmaps/${id}`).then((res) => res.data),
  updateMilestone: (roadmapId, milestoneId, status) =>
    api
      .patch(`/roadmaps/${roadmapId}/milestones/${milestoneId}`, { status })
      .then((res) => res.data),
};
