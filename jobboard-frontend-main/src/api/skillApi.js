import axiosClient from "./axiosClient";

const skillApi = {
  searchCatalog: (q) =>
    axiosClient.get("/skills", { params: q ? { query: q, format: "object" } : { format: "object" } }),

  listMine: () => axiosClient.get("/user/skills"),

  upsertMine: (skillId, data) =>
    axiosClient.post(`/user/skills/${skillId}`, data),

  removeMine: (skillId) =>
    axiosClient.delete(`/user/skills/${skillId}`),
};

export default skillApi;
