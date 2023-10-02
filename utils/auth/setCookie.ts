import { Response } from 'express';
import { IUser } from '../../models/user.model';
import { CookieOptions } from '../types';
import { redis } from '../../db/redis';

const accessTokenExpire = parseInt(process.env.ACCESS_TOKEN_EXPIRE || '5', 10);
const refreshTokenExpire = parseInt(process.env.REFRESH_TOKEN_EXPIRE || '3', 10);

// options for cookies
export const accessTokenOptions: CookieOptions = {
	expires: new Date(Date.now() + accessTokenExpire * 60 * 1000),
	maxAge: accessTokenExpire * 60 * 1000,
	httpOnly: true,
	secure: process.env.NODE_ENV === 'production' ? true : false,
	sameSite: 'lax'
};

export const refreshTokenOptions: CookieOptions = {
	expires: new Date(Date.now() + refreshTokenExpire * 24 * 60 * 60 * 1000),
	maxAge: refreshTokenExpire * 24 * 60 * 60 * 1000,
	httpOnly: true,
	sameSite: 'lax'
};

export const setCookies = (user: IUser, statusCode: number, res: Response) => {
	const accessToken = user.signAccessToken();
	const refreshToken = user.signRefreshToken();
	// convert user into object, remove password, and stringify and upload to redis
	const userObj = user.toObject();
	userObj['password'] = undefined;
	const jsonObj = JSON.stringify(userObj);

	redis.set(user._id, jsonObj);

	res.cookie('access_token', accessToken, accessTokenOptions);
	res.cookie('refresh_token', refreshToken, refreshTokenOptions);

	res.status(statusCode).json({
		success: true,
		message: 'User logged in successfully',
		data: { accessToken: accessToken, user: JSON.parse(jsonObj) }
	});
};
