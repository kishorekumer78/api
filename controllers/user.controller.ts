import asyncHandler from 'express-async-handler';
import path from 'path';
import { NextFunction, Request, Response } from 'express';
import ejs from 'ejs';
// internal import
import User from '../models/user.model';
import { createActivationToken, decodeJwtToken } from '../utils/auth/jwt';
import {
	ActivationDetails,
	ActivationRequest,
	EmailOptions,
	LoginBody,
	RegisterBody
} from '../utils/types';
import { sendMail } from '../utils/sendMail';
import { setCookies } from '../utils/auth/setCookie';
import { CustomError } from '../utils/CustomError';
import { redis } from '../db/redis';
import { getUserInfoSvc } from '../services/user.service';

// User registration
export const registerUser = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { name, email, password } = req.body;
			// check user exists searching with email
			const existingUser = await User.findOne({ email });
			if (existingUser) {
				throw new Error('User already exists');
			}
			const newUser: RegisterBody = {
				name,
				email,
				password
			};
			const activationObj: ActivationDetails = createActivationToken(newUser);
			const { activationCode } = activationObj;

			const data = {
				user: { name: newUser.name },
				activationCode
			};

			await ejs.renderFile(path.join(__dirname, '../mails/activation-mail.ejs'), data);
			const emailOptions: EmailOptions = {
				email: newUser.email,
				subject: 'Activate your account',
				templateFileName: 'activation-mail.ejs',
				data
			};
			await sendMail(emailOptions);
			res.status(201).json({
				success: true,
				message: `Please check your your email ${newUser.email} to activate your account`,
				data: { activationToken: activationObj.token }
			});
			/*
			sample of decoded activation token{
				user: {
					name: 'John Doe',
					email: 'johndoe@gmail.com',
					password: 'Test@123'
				},
				activationCode: '1953',
				iat: 1696101450,
				exp: 1696101750
			};
			*/
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
);

export const activateUser = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { activationCode, token } = req.body as ActivationRequest;
			const decoded = decodeJwtToken(token);

			if (decoded.activationCode !== activationCode) {
				throw new Error('Invalid activation code');
			}

			const { name, email, password } = decoded.user;
			const createdUser = await User.create({
				name,
				email,
				password
			});

			res.status(201).json({
				success: true,
				message: 'User activated successfully',
				data: createdUser.email
			});
		} catch (error: any) {
			throw new Error(error);
		}
	}
);

// login user
export const loginUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const { email, password } = req.body as LoginBody;

		if (!email || !password) {
			return next(new CustomError('Both email and password is required.', 400));
		}

		// Find user by email
		const user = await User.findOne({ email }).select('+password');

		// Check if user exists
		if (!user) {
			return next(new CustomError('Invalid credentials', 401));
		}

		// Check if password matches
		const isMatch = await user.comparePassword(password);
		if (!isMatch) {
			return next(new CustomError('Password is incorrect', 401));
		}

		// Set access token and refresh token cookies and upload session to redis
		setCookies(user, 200, res);
	} catch (error: any) {
		throw new Error(error);
	}
});

// logout user
export const logoutUser = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	// Clear access token and refresh token cookies and remove session from redis
	try {
		res.clearCookie('access_token');
		res.clearCookie('refresh_token');
		if (req.user?._id) {
			await redis.del(req.user._id);
		}

		res.status(200).json({ success: true, message: 'Logged out successfully' });
	} catch (error: any) {
		throw new Error(error);
	}
});

export const getUserInfo = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?._id;

		const user = await getUserInfoSvc(userId);

		res.status(200).json({
			success: true,
			data: user
		});
	} catch (error: any) {
		throw new Error(error);
	}
});
