import axiosClient from "./axiosClient";

const companyApi = {
  // friendly aliases used by the component
  get: (id) => axiosClient.get(`/company/${id}`),
  create: (data) => axiosClient.post("/company", data),
  update: (id, data) => axiosClient.put(`/company/update/${id}`, data),

  // other useful endpoints (keep if your backend provides them)
  mycompany: () => axiosClient.get("/mycompany"),
  list: (params) => axiosClient.get("/company", { params }),
  detail: (id) => axiosClient.get(`/company/${id}`), // same as get()
  mine: () => axiosClient.get("/company/mine"),
};

export default companyApi;
