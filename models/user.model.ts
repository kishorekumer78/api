import { Document, Model, Schema, model } from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const emailRegexPattern: RegExp = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export interface IUser extends Document {
	name: string;
	email: string;
	password: string;
	avatar: {
		public_id: string;
		url: string;
	};
	role: string;
	isVerified: boolean;
	courses: Array<{ courseId: string }>;
	comparePassword: (password: string) => Promise<boolean>;
	signAccessToken: () => string;
	signRefreshToken: () => string;
}

const userSchema: Schema<IUser> = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Name is required']
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			//match: [emailRegexPattern, 'Please enter a valid email']
			validate: {
				validator: (value: string) => emailRegexPattern.test(value),
				message: 'Please enter a valid email'
			}
		},
		password: {
			type: String,
			required: true,
			minlength: [6, 'Password must be at least 6 characters'],
			select: false
		},
		avatar: {
			public_id: String,
			url: String
		},
		role: {
			type: String,
			default: 'user'
		},
		isVerified: {
			type: Boolean,
			default: false
		},
		courses: [
			{
				// type: Schema.Types.ObjectId,
				// ref: 'Course'
				courseId: String
			}
		]
	},
	{ timestamps: true }
);
// hash password before saving
userSchema.pre<IUser>('save', async function (next) {
	if (!this.isModified('password')) {
		return next(); //TODO not sure return will be here
	}
	this.password = await bcrypt.hash(this.password, 12);
	next();
});

// compare password
userSchema.methods.comparePassword = async function (password: string): Promise<boolean> {
	return await bcrypt.compare(password, this.password);
};

// sign access token
userSchema.methods.signAccessToken = function () {
	return jwt.sign({ id: this._id }, process.env.ACCESS_TOKEN!, {
		expiresIn: '5m'
	});
};

// sign refresh token
userSchema.methods.signRefreshToken = function () {
	return jwt.sign({ id: this._id }, process.env.REFRESH_TOKEN!, {
		expiresIn: '3d'
	});
};

const User: Model<IUser> = model<IUser>('User', userSchema);
export default User;
