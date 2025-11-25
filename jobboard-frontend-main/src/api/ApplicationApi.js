// src/api/ApplicationApi.js
import axiosClient from "./axiosClient";


const applyWithCV = (jobId, file) => {
  const fd = new FormData();
  // backend expects field named 'cv'
  fd.append('cv', file);
  // job_id is in URL path so no need to append job_id unless backend needs it
  return axiosClient.post(`/application/apply/${jobId}`, fd, {
    // DO NOT set Content-Type. Browser will set multipart boundary
    headers: { Accept: 'application/json' }
  });
};

const ApplicationApi = {
  apply: (id) => axiosClient.post(`/application/apply/${id}`, {}), 
  applyWithCV,

  getApplicationList: () => axiosClient.get("/application/application_list"),

  getCandidateList: (jobId) =>
    axiosClient.get(`/application/candicate_list/${jobId}`),
  updateStatus: (applicationId, action) =>
    axiosClient.post(`/application/fkoff/${applicationId}/${action}`),
};

export default ApplicationApi;
