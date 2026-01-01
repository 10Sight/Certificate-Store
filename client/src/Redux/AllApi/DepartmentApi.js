import axiosBaseQuery from "@/Helper/axiosBaseQuery";
import { createApi } from '@reduxjs/toolkit/query/react';

export const departmentApi = createApi({
    reducerPath: "departmentApi",
    baseQuery: axiosBaseQuery,
    tagTypes: ["Department"],
    endpoints: (builder) => ({
        createDepartment: builder.mutation({
            query: (data) => ({
                url: "/api/v1/department",
                method: "POST",
                data,
            }),
            invalidatesTags: ["Department"],
        }),
        getAllDepartments: builder.query({
            query: () => ({
                url: "/api/v1/department",
                method: "GET",
            }),
            providesTags: ["Department"],
        }),
        getDepartmentById: builder.query({
            query: (id) => ({
                url: `/api/v1/department/${id}`,
                method: "GET",
            }),
            providesTags: ["Department"],
        }),
        updateDepartment: builder.mutation({
            query: ({ id, ...data }) => ({
                url: `/api/v1/department/${id}`,
                method: "PUT",
                data,
            }),
            invalidatesTags: ["Department"],
        }),
        deleteDepartment: builder.mutation({
            query: (id) => ({
                url: `/api/v1/department/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ["Department"],
        }),
    }),
});

export const {
    useCreateDepartmentMutation,
    useGetAllDepartmentsQuery,
    useGetDepartmentByIdQuery,
    useUpdateDepartmentMutation,
    useDeleteDepartmentMutation,
} = departmentApi;
