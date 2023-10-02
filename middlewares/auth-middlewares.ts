import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';

//internal imports
import { redis } from '../db/redis';
import { CustomError } from '../utils/CustomError';

export const isAuthenticated = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		// get access token from cookies
		const accessToken = req.cookies['access_token'];

		if (!accessToken) {
			return next(new CustomError('Access token not found', 401));
		}
		// get user id from access token by decoding
		const decoded = jwt.verify(accessToken, process.env.ACCESS_TOKEN!) as JwtPayload;
		// decoded = {id: "user_id",iat=56674444322}
		if (!decoded) {
			return next(new CustomError('Invalid access token', 401));
		}

		// get user from redis
		const user = await redis.get(decoded.id);
		if (!user) {
			return next(new CustomError('Invalid access token', 401));
		}
		req.user = JSON.parse(user);
		next();
	}
);

export const authorizedRoles = (...roles: string[]) => {
	return (req: Request, res: Response, next: NextFunction) => {
		console.log('roles', roles);
		if (!roles.includes(req.user?.role!)) {
			return next(
				new CustomError(
					`Role ${req.user?.role} is not authorized to access this resource.`,
					403
				)
			);
		}

		// if authorized
		next();
	};
};
