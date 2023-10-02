export type RegisterBody = {
	name: string;
	email: string;
	password: string;
	avatar?: string;
};
export type ActivationDetails = {
	token: string;
	activationCode: string;
};

export type ActivationRequest = {
	token: string; // jwt
	activationCode: string; // 4 digit code for activation
};

export type EmailOptions = {
	email: string;
	subject: string;
	templateFileName: string;
	data: {
		[key: string]: any;
	};
};
export type LoginBody = {
	email: string;
	password: string;
};

export type CookieOptions = {
	expires: Date;
	maxAge: number;
	httpOnly: boolean;
	sameSite: 'lax' | 'strict' | 'none' | undefined;
	secure?: boolean;
};
