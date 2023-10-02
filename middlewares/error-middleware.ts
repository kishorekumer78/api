import { NextFunction, Request, Response } from 'express';
import { CustomError } from '../utils/CustomError';

export const errorHandler = (err: any, _req: Request, res: Response, _next: NextFunction) => {
	let statusCode: number;
	if (err instanceof CustomError) {
		statusCode = err.statusCode;
	} else {
		statusCode = 500;
	}

	const errMessage = err.message || 'Internal Server Error';
	if (process.env.NODE_ENV === 'production') {
		res.status(statusCode).json({
			success: 'false',
			message: errMessage
		});
	} else {
		res.status(statusCode).json({
			success: false,
			message: errMessage,
			data: {
				stack: err?.stack
			}
		});
	}
};
