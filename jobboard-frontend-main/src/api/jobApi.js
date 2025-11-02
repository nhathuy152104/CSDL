import axiosClient from "./axiosClient";

const jobApi = {
  getAll: () => axiosClient.get("/job/"),
  getById: (id) => axiosClient.get(`/job/${id}`),
  create: (data) => axiosClient.post("/job/", data),
  update: (id, data) => axiosClient.put(`/job/${id}`, data),
  delete: (id) => axiosClient.delete(`/job/${id}`),
  apply: (id) => axiosClient.post(`/job/${id}/apply`),
};

export default jobApi;
