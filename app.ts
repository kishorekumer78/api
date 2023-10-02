import express, { NextFunction, Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import morgan from 'morgan';
// internal import
import { errorHandler } from './middlewares/error-middleware';
import userRouter from './routes/user.routes';

const app = express();
// body parser important for cloudinary
app.use(express.json({ limit: '50mb' }));

app.use(morgan('dev'));

// cookie parser
app.use(cookieParser());

// cors
app.use(
	cors({
		origin: process.env.ORIGIN,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH ']
	})
);

app.use('/api/v1', userRouter);

// unknown route handle
app.all('*', (req: Request, _res: Response, next: NextFunction) => {
	const error = new Error(`Route ${req.originalUrl} not found`) as any;
	error.statusCode = 404;
	next(error);
});
app.use(errorHandler);
export default app;
