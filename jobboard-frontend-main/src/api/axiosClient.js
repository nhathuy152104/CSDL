import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
  withCredentials: true,
  // DON'T set a global JSON content-type here
});

// Ensure we don't clobber FormData requests
axiosClient.interceptors.request.use((config) => {
  const isFD = typeof FormData !== "undefined" && config.data instanceof FormData;

  if (isFD) {
    // Let the browser set: multipart/form-data; boundary=...
    if (config.headers) {
      delete config.headers["Content-Type"];
    }
  } else {
    // JSON fallback for non-FormData requests
    if (config.headers && !config.headers["Content-Type"]) {
      config.headers["Content-Type"] = "application/json";
    }
  }
  return config;
});

export default axiosClient;
