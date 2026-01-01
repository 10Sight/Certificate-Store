import express from 'express';
import cors from 'cors';
import logger from './logger/winston.logger.js';
import ENV from './configs/env.config.js';
import userRouter from './routes/user.route.js';
import uploadRouter from './routes/upload.route.js';
import skillRouter from './routes/skill.route.js';
import departmentRouter from './routes/department.route.js';
import questionRouter from './routes/question.route.js';
import knowledgeRouter from './routes/knowledge.route.js';
import connectDB from './db/connectDB.js';
import templateRouter from './routes/template.route.js';
import assessmentResultRouter from './routes/assessmentResult.route.js';
import { errorHandler } from './middlewares/error.middleware.js';

const app = express();

const PORT = ENV.PORT || 3000;

const corsOptions = {
    origin: ["https://certificate-store.onrender.com", "http://localhost:5173"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(morganMiddleware());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/upload", uploadRouter);
app.use("/api/v1/skill", skillRouter);
app.use("/api/v1/department", departmentRouter);
app.use("/api/v1/question", questionRouter);
app.use("/api/v1/knowledge", knowledgeRouter);
app.use("/api/v1/template", templateRouter);

app.use("/api/v1/assessment-result", assessmentResultRouter);
app.use(errorHandler);


app.get('/', (req, res) => {
    res.send('This is message');
});

try {
    app.listen(PORT, async () => {
        logger.http(`http://localhost:${PORT}`);
        await connectDB();
    });
} catch (error) {
    logger.error("MONGO db connection failed !!! ", error);
}