import axiosBaseQuery from "@/Helper/axiosBaseQuery";
import { createApi } from '@reduxjs/toolkit/query/react';

export const templateApi = createApi({
    reducerPath: "templateApi",
    baseQuery: axiosBaseQuery,
    tagTypes: ['Template'],
    endpoints: (builder) => ({
        createTemplate: builder.mutation({
            query: (data) => ({
                url: "/api/v1/template",
                method: "POST",
                data,
            }),
            invalidatesTags: ['Template'],
        }),
        getTemplatesByCategory: builder.query({
            query: ({ categoryType, categoryReference }) => ({
                url: `/api/v1/template/category`,
                method: "GET",
                params: { categoryType, categoryReference }
            }),
            providesTags: ['Template'],
        }),
        getTemplateById: builder.query({
            query: (id) => ({
                url: `/api/v1/template/${id}`,
                method: "GET",
            }),
            providesTags: ['Template'],
        }),
        getAllTemplates: builder.query({
            query: () => ({
                url: "/api/v1/template",
                method: "GET",
            }),
            providesTags: ['Template'],
        }),
        updateTemplate: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/v1/template/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: ['Template'],
        })
    }),
});

export const {
    useCreateTemplateMutation,
    useGetTemplatesByCategoryQuery,
    useGetTemplateByIdQuery,
    useGetAllTemplatesQuery,
    useUpdateTemplateMutation
} = templateApi;
