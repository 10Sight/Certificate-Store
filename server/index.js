import express from 'express';
import cors from 'cors';
import logger from './logger/winston.logger.js';
import ENV from './configs/env.config.js';
import userRouter from './routes/user.route.js';
import uploadRouter from './routes/upload.route.js';
import connectDB from './db/connectDB.js';

const app = express();

const PORT = ENV.PORT || 3000;

const corsOptions = {
    origin: ["http://localhost:5173"],
    credentials: true,
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// app.use(morganMiddleware());

app.use("/api/v1/users", userRouter);
app.use("/api/v1/upload", uploadRouter);

app.get('/', (req, res) => {
    res.send('This is message');
});

try {
    app.listen(PORT, async () => {
        await connectDB();
        logger.http(`http://localhost:${PORT}`);
    });
} catch (error) {
    logger.error("MONGO db connection failed !!! ", error);
}