import { configureStore } from "@reduxjs/toolkit";

import { userApi } from "./AllApi/UserApi";
import { uploadApi } from "./AllApi/UploadApi";
import authReducer from "./Slices/AuthSlice";

const store = configureStore({
    reducer: {
        auth: authReducer,
        [userApi.reducerPath]: userApi.reducer,
        [uploadApi.reducerPath]: uploadApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            userApi.middleware,
            uploadApi.middleware,
        ),
});

export default store;