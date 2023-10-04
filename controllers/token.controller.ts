import asyncHandler from 'express-async-handler';
import { Request, Response, NextFunction } from 'express';
import { CustomError } from '../utils/CustomError';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { redis } from '../db/redis';
import { accessTokenOptions, refreshTokenOptions } from '../utils/auth/setCookie';

// update access token
export const updateAccessToken = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			// get refresh token
			const refreshToken = req.cookies['refresh_token'];
			if (!refreshToken) {
				return next(new CustomError('Refresh token not found', 401));
			}
			// get user id from refresh token by decoding
			const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN!) as JwtPayload;

			if (!decoded) {
				return next(new CustomError('Invalid refresh token', 401));
			}
			// get user from redis
			const session = await redis.get(decoded.id);
			if (!session) {
				return next(new CustomError('Invalid refresh token', 401));
			}

			const user = JSON.parse(session);
			// create new access token
			const newAccessToken = jwt.sign({ id: user._id }, process.env.ACCESS_TOKEN!, {
				expiresIn: '5m'
			});
			const newRefreshToken = jwt.sign({ id: user._id }, process.env.REFRESH_TOKEN!, {
				expiresIn: '3d'
			});

			//req.user = user; //TODO: Not required

			// set cookies to response
			res.cookie('access_token', newAccessToken, accessTokenOptions);
			res.cookie('refresh_token', newRefreshToken, refreshTokenOptions);

			res.status(200).json({
				success: true,
				message: 'Access token updated successfully',
				data: newAccessToken
			});
		} catch (error: any) {
			throw new Error(error);
		}
	}
);
