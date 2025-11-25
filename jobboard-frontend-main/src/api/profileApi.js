import axiosClient from "./axiosClient";

const profileApi = {
    getMe: () => axiosClient.get("/profile/me"),

    update: (data) => axiosClient.put("/profile/me", data),

    listMine: () => axiosClient.get("/profile/skills"),

    upsertMine: (skillId, data) =>
        axiosClient.post(`/profile/skills/${skillId}`, data),
    removeMine: (skillId) =>
        axiosClient.delete(`/profile/skills/${skillId}`),
    getCV: () => axiosClient.get("/api/profile/cv"),

}

export default profileApi;