import axiosClient from "./axiosClient";

const LocationApi = {
  searchCatalog: (q) =>
    axiosClient.get("/location", { params: q ? { query: q, format: "object" } : { format: "object" } }),

};

export default LocationApi;
