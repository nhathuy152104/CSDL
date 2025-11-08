import axiosClient from "./axiosClient";

const userApi = {
    login: (data) => {
        return axiosClient.post("/user/login", data);
    },
    register: (data) =>{
        return axiosClient.post("/user/register",  data);
    },


};

export default userApi;