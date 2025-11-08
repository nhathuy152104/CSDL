import axiosClient from "./axiosClient";

const skillApi = {
  searchCatalog: (q) =>
    axiosClient.get("/skills", { params: q ? { query: q, format: "object" } : { format: "object" } }),

};

export default skillApi;
