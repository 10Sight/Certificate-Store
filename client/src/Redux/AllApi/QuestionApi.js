import axiosBaseQuery from "@/Helper/axiosBaseQuery";
import { createApi } from '@reduxjs/toolkit/query/react';

export const questionApi = createApi({
    reducerPath: "questionApi",
    baseQuery: axiosBaseQuery,
    tagTypes: ["Question"],
    endpoints: (builder) => ({
        createQuestion: builder.mutation({
            query: (data) => ({
                url: "/api/v1/question",
                method: "POST",
                data,
            }),
            invalidatesTags: ["Question"],
        }),
        getAllQuestions: builder.query({
            query: (params) => ({
                url: "/api/v1/question",
                method: "GET",
                params,
            }),
            providesTags: ["Question"],
        }),
        updateQuestion: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/v1/question/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: ["Question"],
        }),
        deleteQuestion: builder.mutation({
            query: (id) => ({
                url: `/api/v1/question/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Question"],
        }),
    }),
});

export const {
    useCreateQuestionMutation,
    useGetAllQuestionsQuery,
    useUpdateQuestionMutation,
    useDeleteQuestionMutation,
} = questionApi;
