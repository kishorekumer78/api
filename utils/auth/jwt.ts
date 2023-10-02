import jwt from 'jsonwebtoken';
import { RegisterBody, ActivationDetails } from '../types';

function generateActivationCode(): string {
	return Math.floor(1000 + Math.random() * 9000).toString();
}

function generateJwtToken(user: RegisterBody, activationCode: string): string {
	return jwt.sign({ user, activationCode }, process.env.JWT_SECRET!, { expiresIn: '5m' });
}

// TODO: We have used the registerBody
// might need to use the interface from user.model mongo
/**
 * Creates an activation token for a user registration.
 * @param user The user object containing registration details.
 * @returns The token and activation code.
 */
export function createActivationToken(user: RegisterBody): ActivationDetails {
	const activationCode = generateActivationCode();
	const token = generateJwtToken(user, activationCode);

	const activationTokenObj: ActivationDetails = {
		token,
		activationCode
	};
	return activationTokenObj;
}

export function decodeJwtToken(token: string) {
	return jwt.verify(token, process.env.JWT_SECRET!) as {
		user: RegisterBody;
		activationCode: string;
		iat: number;
		exp: number;
	};
}
