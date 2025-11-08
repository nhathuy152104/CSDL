import axiosClient from "./axiosClient";

// small helper
const isFormData = (v) => typeof FormData !== "undefined" && v instanceof FormData;

const jobApi = {
  getAll: () => axiosClient.get("/job/"),
  getByCompany: () => axiosClient.get("/job/by-company/"),
  getById: (id) => axiosClient.get(`/job/${id}`),

  // IMPORTANT: let the browser set multipart boundary automatically
  create: (data) =>
    isFormData(data)
      ? axiosClient.post("/job/add", data)                   
      : axiosClient.post("/job/add", data),                   

  update: (id, data) =>
    isFormData(data)
      ? axiosClient.put(`/job/${id}`, data)                   
      : axiosClient.put(`/job/${id}`, data),

  delete: (id) => axiosClient.delete(`/job/${id}`),
  apply: (id) => axiosClient.post(`/job/${id}/apply`),
};

export default jobApi;
