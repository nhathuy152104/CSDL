import axiosClient from "./axiosClient";

const userApi = {
    login: (data) => {
        return axiosClient.post("/user/login", data);
    },
    getprofile:() => {
        return axiosClient.get("/user/profile");
    },
    updateprofile: (data) => {
        return axiosClient.put("/user/profile/", data);
    },
    register: (data) =>{
        return axiosClient.post("/user/register",  data);
    },
    getSkills: (q) => axiosClient.get("/user/skills", { params: q ? { query: q } : {} }),


};

export default userApi;