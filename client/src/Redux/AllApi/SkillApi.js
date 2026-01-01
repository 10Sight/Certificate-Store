import axiosBaseQuery from "@/Helper/axiosBaseQuery";
import { createApi } from '@reduxjs/toolkit/query/react';

export const skillApi = createApi({
    reducerPath: "skillApi",
    baseQuery: axiosBaseQuery,
    tagTypes: ['Skill'],
    endpoints: (builder) => ({
        /**
         * @desc Create a new skill entry
         * @method POST
         */
        createSkill: builder.mutation({
            query: (body) => ({
                url: "/api/v1/skill",
                method: "POST",
                data: body
            }),
            invalidatesTags: ['Skill'],
        }),

        /**
         * @desc Get all skill entries
         * @method GET
         */
        getAllSkills: builder.query({
            query: (departmentId) => ({
                url: departmentId ? `/api/v1/skill?department=${departmentId}` : "/api/v1/skill",
                method: "GET",
            }),
            providesTags: ['Skill'],
        }),

        /**
         * @desc Get skill by ID
         * @method GET
         */
        getSkillById: builder.query({
            query: (id) => ({
                url: `/api/v1/skill/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: 'Skill', id }],
        }),

        /**
         * @desc Update skill entry
         * @method PUT
         */
        updateSkill: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/api/v1/skill/${id}`,
                method: "PUT",
                data: body
            }),
            invalidatesTags: ['Skill'],
        }),

        /**
         * @desc Delete skill entry
         * @method DELETE
         */
        deleteSkill: builder.mutation({
            query: (id) => ({
                url: `/api/v1/skill/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['Skill'],
        }),
        /**
         * @desc Get skills by Department ID
         * @method GET
         */
        getSkillsByDepartment: builder.query({
            query: (departmentId) => ({
                url: `/api/v1/skill/department/${departmentId}`,
                method: "GET",
            }),
            providesTags: ['Skill'],
        }),
    })
});

export const {
    useCreateSkillMutation,
    useGetAllSkillsQuery,
    useGetSkillByIdQuery,
    useUpdateSkillMutation,
    useDeleteSkillMutation,
    useGetSkillsByDepartmentQuery
} = skillApi;
