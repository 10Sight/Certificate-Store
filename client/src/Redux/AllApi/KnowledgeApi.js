import axiosBaseQuery from "@/Helper/axiosBaseQuery";
import { createApi } from '@reduxjs/toolkit/query/react';

export const knowledgeApi = createApi({
    reducerPath: "knowledgeApi",
    baseQuery: axiosBaseQuery,
    tagTypes: ['Knowledge'],
    endpoints: (builder) => ({
        /**
         * @desc Create a new knowledge entry
         * @method POST
         */
        createKnowledge: builder.mutation({
            query: (body) => ({
                url: "/api/v1/knowledge",
                method: "POST",
                data: body
            }),
            invalidatesTags: ['Knowledge'],
        }),

        /**
         * @desc Get all knowledge entries
         * @method GET
         */
        getAllKnowledge: builder.query({
            query: (departmentId) => ({
                url: departmentId ? `/api/v1/knowledge?department=${departmentId}` : "/api/v1/knowledge",
                method: "GET",
            }),
            providesTags: ['Knowledge'],
        }),
        /**
         * @desc Get knowledge by ID
         * @method GET
         */
        getKnowledgeById: builder.query({
            query: (id) => ({
                url: `/api/v1/knowledge/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: 'Knowledge', id }],
        }),

        /**
         * @desc Update knowledge entry
         * @method PUT
         */
        updateKnowledge: builder.mutation({
            query: ({ id, ...body }) => ({
                url: `/api/v1/knowledge/${id}`,
                method: "PUT",
                data: body
            }),
            invalidatesTags: ['Knowledge'],
        }),

        /**
         * @desc Delete knowledge entry
         * @method DELETE
         */
        deleteKnowledge: builder.mutation({
            query: (id) => ({
                url: `/api/v1/knowledge/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['Knowledge'],
        }),
    })
});

export const {
    useCreateKnowledgeMutation,
    useGetAllKnowledgeQuery,
    useGetKnowledgeByIdQuery,
    useUpdateKnowledgeMutation,
    useDeleteKnowledgeMutation
} = knowledgeApi;
