import { createApi } from '@reduxjs/toolkit/query/react';
import axiosBaseQuery from '@/Helper/axiosBaseQuery';

export const assessmentResultApi = createApi({
    reducerPath: "assessmentResultApi",
    baseQuery: axiosBaseQuery,
    tagTypes: ["AssessmentResult"],
    endpoints: (builder) => ({
        createAssessmentResult: builder.mutation({
            query: (data) => ({
                url: "/api/v1/assessment-result/create",
                method: "POST",
                data,
            }),
            invalidatesTags: ["AssessmentResult"],
        }),
        getLastAssessmentResult: builder.query({
            query: (userId) => ({
                url: `/api/v1/assessment-result/latest/${userId}`,
                method: "GET",
            }),
            providesTags: ["AssessmentResult"],
        }),
        getAllAssessmentResultsByUser: builder.query({
            query: (userId) => ({
                url: `/api/v1/assessment-result/user/${userId}`,
                method: "GET",
            }),
            providesTags: ["AssessmentResult"],
        }),
        getAssessmentByTemplate: builder.query({
            query: ({ templateId, userId }) => ({
                url: `/api/v1/assessment-result/template/${templateId}/user/${userId}`,
                method: "GET",
            }),
            providesTags: ["AssessmentResult"],
        }),
        updateAssessmentResult: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/v1/assessment-result/update/${id}`,
                method: "PATCH",
                data,
            }),
            invalidatesTags: ["AssessmentResult"],
        }),
    }),
});

export const {
    useCreateAssessmentResultMutation,
    useGetLastAssessmentResultQuery,
    useGetAllAssessmentResultsByUserQuery,
    useGetAssessmentByTemplateQuery,
    useUpdateAssessmentResultMutation
} = assessmentResultApi;
