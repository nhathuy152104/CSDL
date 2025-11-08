import axiosClient from "./axiosClient";

const ApplicationApi = {
    Companies_GetApplicationList: () => {
        axiosClient.get("")
    },
}
export default ApplicationApi;