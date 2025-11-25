import axiosClient from "./axiosClient";

// small helper
const isFormData = (v) => typeof FormData !== "undefined" && v instanceof FormData;

const jobApi = {
  getAll: () => axiosClient.get("/job/"),
  getByCompany: () => axiosClient.get("/job/by-company/"),
  getById: (id) => axiosClient.get(`/job/${id}`),
  getInCompany: (company_id) => axiosClient.get(`job/by-company/${company_id}`),

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
  getBySkill: (skills) => {
    // skills là mảng [1,2,3] → serialize thành ?skills=1&skills=2&skills=3
    const params = new URLSearchParams();
    skills.forEach(s => params.append('skills', s));
    return axiosClient.get('/job/by-skill?' + params.toString());
  },
  getByFilter: ({ skills = [], location, min_salary, max_salary }) => {
    const params = new URLSearchParams();
    skills.forEach(s => params.append('skills', s));
    if (location) params.append('location', location);
    if (min_salary) params.append('min_salary', min_salary);
    if (max_salary) params.append('max_salary', max_salary);
    return axiosClient.get('/job/by-filter?' + params.toString());
  },
};

export default jobApi;
