import axiosBaseQuery from "@/Helper/axiosBaseQuery";
import { createApi } from '@reduxjs/toolkit/query/react';

export const uploadApi = createApi({
    reducerPath: "uploadApi",
    baseQuery: axiosBaseQuery,
    tagTypes: ['Upload', 'User'],
    endpoints: (builder) => ({
        /**
         * @desc Upload skill file
         * @method POST
         */
        uploadSkillFile: builder.mutation({
            query: (formData) => ({
                url: "/api/v1/upload/skill-file",
                method: "POST",
                data: formData,
                headers: {
                    // Content-Type is handled automatically by browser for FormData
                }
            }),
            invalidatesTags: ['User'], // Invalidate User cache to refresh skill matrix
        }),
        /**
         * @desc Upload certificate
         * @method POST
         */
        uploadCertificate: builder.mutation({
            query: (formData) => ({
                url: "/api/v1/upload/certificate",
                method: "POST",
                data: formData,
            }),
        }),
    })
});

export const {
    useUploadSkillFileMutation,
    useUploadCertificateMutation
} = uploadApi;
