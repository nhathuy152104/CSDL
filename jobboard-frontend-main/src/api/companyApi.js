import axiosClient from "./axiosClient";

const companyApi = {
  list: (params) => axiosClient.get("/company", { params }),
  detail: (id) => axiosClient.get(`/company/${id}`),
  mine: () => axiosClient.get("/company/mine"),
  update: (id, data) => axiosClient.put(`/company/${id}`, data),
};
export default companyApi;