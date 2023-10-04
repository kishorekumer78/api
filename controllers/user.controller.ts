import asyncHandler from 'express-async-handler';
import { NextFunction, Request, Response } from 'express';
import { v2 as cloudinary } from 'cloudinary';

// internal import
import User from '../models/user.model';
import { UpdatePasswordBody, UserInfo } from '../utils/types';
import { CustomError } from '../utils/CustomError';
import { redis } from '../db/redis';
import { getUserInfoSvc } from '../services/user.service';
import { getPasswordLessUser } from '../utils/misc';
// get user information
export const getUserInfo = asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
	try {
		const userId = req.user?._id;

		const user = await getUserInfoSvc(userId);
		if (!user) {
			return next(new CustomError('User not found', 404));
		}
		res.status(200).json({
			success: true,
			data: user
		});
	} catch (error: any) {
		throw new Error(error);
	}
});

// update user info
export const updateUserInfo = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const userId = req.user?._id;
			const { name, email } = req.body as UserInfo;

			const user = await User.findById(userId);
			if (!user) {
				return next(new CustomError('User not found', 404));
			}

			if (email && email !== user.email) {
				const existingUser = await User.findOne({ email });
				if (existingUser) {
					return next(new CustomError('Email already registered', 400));
				}
			}

			user.name = name || user.name;
			user.email = email || user.email;

			const updatedUser = await user.save();

			console.log(updatedUser);

			await redis.set(userId, JSON.stringify(updatedUser));

			res.status(200).json({
				success: true,
				data: updatedUser
			});
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
);

// update user password
export const updatePassword = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { oldPassword, newPassword } = req.body as UpdatePasswordBody;
			if (!oldPassword || !newPassword) {
				return next(new CustomError('Please provide old and new password', 400));
			}
			const userId = req.user?._id;
			// get user from db
			const user = await User.findById(userId).select('+password');

			if (!user) {
				return next(new CustomError('User not found', 404));
			}
			// compare existing password with provided old password
			const isPasswordMatch = await user.comparePassword(oldPassword);
			if (!isPasswordMatch) {
				return next(new CustomError('Please provide valid current password', 400));
			}

			// update password
			user.password = newPassword;
			const updatedUser = await user.save();
			// as we are not saving password in redis, so no need to set it again in redis
			res.status(200).json({
				success: true,
				message: 'Password updated successfully',
				data: getPasswordLessUser(updatedUser)
			});
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
);

// update profile picture
export const updateProfilePicture = asyncHandler(
	async (req: Request, res: Response, next: NextFunction) => {
		try {
			const { avatar } = req.body; // file ??

			const userId = req.user?._id;
			const user = await User.findById(userId); //TODO: with out password check
			if (!user) {
				return next(new CustomError('User not found', 404));
			}

			if (user.avatar.public_id) {
				// delete old image from cloudinary
				await cloudinary.uploader.destroy(user.avatar.public_id);
			}
			const uploadDetails = await cloudinary.uploader.upload(avatar, {
				folder: 'avatars',
				width: 150,
				height: 150,
				quality: 'auto'
			});
			user.avatar = {
				public_id: uploadDetails.public_id,
				url: uploadDetails.secure_url
			};

			await user.save();
			// update in redis
			await redis.set(userId, JSON.stringify(user));

			res.status(200).json({
				success: true,
				message: 'Profile picture updated successfully',
				data: user
			});
		} catch (error: any) {
			throw new Error(error.message);
		}
	}
);
