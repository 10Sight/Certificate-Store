import axiosInstance from "./axiosInstance.js";

const axiosBaseQuery = async ({ url, method, data, params, responseHandler }) => {
    try {
        const response = await axiosInstance({
            url,
            method,
            data,
            params,
            responseType: responseHandler ? 'blob' : 'json'
        })

        if (responseHandler) {
            return { data: responseHandler(response) }
        }

        return { data: response.data }
    } catch (error) {
        console.error('API Error:', error);

        let errorMessage = 'An unexpected error occurred';
        let errorStatus = 500;

        if (error.response) {
            errorStatus = error.response.status;
            errorMessage = error.response.data?.message || error.response.data?.error || `Server error: ${errorStatus}`;
        } else if (error.request) {
            errorMessage = 'Network error: Unable to connect to server';
            errorStatus = 0;
        } else {
            errorMessage = error.message || errorMessage;
        }

        return {
            error: {
                status: {
                    status: errorStatus,
                    message: errorMessage,
                    data: error.response?.data
                }
            }
        }
    }
}

export default axiosBaseQuery;