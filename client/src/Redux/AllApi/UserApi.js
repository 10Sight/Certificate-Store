import axiosBaseQuery from "@/Helper/axiosBaseQuery";
import { createApi } from '@reduxjs/toolkit/query/react';

export const userApi = createApi({
    reducerPath: "userApi",
    baseQuery: axiosBaseQuery,
    tagTypes: ['User', 'Auth'],
    endpoints: (builder) => ({
        /**
         * @desc Register a new user
         * @method POST
         */
        userRegister: builder.mutation({
            query: (body) => ({
                url: "/api/v1/users/register",
                method: "POST",
                data: body
            }),
            invalidatesTags: ['User'],
        }),

        /**
         * @desc Login user
         * @method POST
         */
        userLogin: builder.mutation({
            query: ({ email, password }) => ({
                url: "/api/v1/users/login",
                method: "POST",
                data: { email, password }
            }),
            invalidatesTags: ['User'],
        }),

        /**
         * @desc Update user details
         * @method PUT
         */
        userUpdate: builder.mutation({
            query: ({ id, body }) => ({
                url: `/api/v1/users/${id}`,
                method: "PUT",
                data: body
            }),
            invalidatesTags: ['User'],
        }),

        /**
         * @desc Get all users with pagination, search, and filtering
         * @method GET
         */
        getAllUsers: builder.query({
            query: (params) => ({
                url: "/api/v1/users",
                method: "GET",
                params: params // { page, limit, search, role, isActive }
            }),
            providesTags: ['User'],
        }),

        /**
         * @desc Get a single user by ID
         * @method GET
         */
        getUserById: builder.query({
            query: (id) => ({
                url: `/api/v1/users/${id}`,
                method: "GET",
            }),
            providesTags: (result, error, id) => [{ type: 'User', id }],
        }),

        /**
         * @desc Delete a single user by ID
         * @method DELETE
         */
        deleteUserById: builder.mutation({
            query: (id) => ({
                url: `/api/v1/users/${id}`,
                method: "DELETE",
            }),
            invalidatesTags: ['User'],
        }),

        /**
         * @desc Delete multiple users (bulk delete)
         * @method DELETE
         */
        deleteUsers: builder.mutation({
            query: (userIds) => ({
                url: "/api/v1/users",
                method: "DELETE",
                data: { userIds }
            }),
            invalidatesTags: ['User'],
        }),
    })
});

export const {
    useUserRegisterMutation,
    useUserLoginMutation,
    useUserUpdateMutation,
    useGetAllUsersQuery,
    useGetUserByIdQuery,
    useDeleteUserByIdMutation,
    useDeleteUsersMutation
} = userApi;