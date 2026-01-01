import { configureStore } from "@reduxjs/toolkit";

import { userApi } from "./AllApi/UserApi";
import { uploadApi } from "./AllApi/UploadApi";
import { knowledgeApi } from "./AllApi/KnowledgeApi";
import { skillApi } from "./AllApi/SkillApi";
import { departmentApi } from "./AllApi/DepartmentApi";
import { questionApi } from "./AllApi/QuestionApi";
import authReducer from "./Slices/AuthSlice";

import { templateApi } from "./AllApi/TemplateApi";
import { assessmentResultApi } from "./AllApi/AssessmentResultApi";

const store = configureStore({
    reducer: {
        auth: authReducer,
        [userApi.reducerPath]: userApi.reducer,
        [uploadApi.reducerPath]: uploadApi.reducer,
        [knowledgeApi.reducerPath]: knowledgeApi.reducer,
        [skillApi.reducerPath]: skillApi.reducer,
        [departmentApi.reducerPath]: departmentApi.reducer,
        [questionApi.reducerPath]: questionApi.reducer,
        [templateApi.reducerPath]: templateApi.reducer,
        [assessmentResultApi.reducerPath]: assessmentResultApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(
            userApi.middleware,
            uploadApi.middleware,
            knowledgeApi.middleware,
            skillApi.middleware,
            departmentApi.middleware,
            questionApi.middleware,
            templateApi.middleware,
            assessmentResultApi.middleware,
        ),
});

export default store;