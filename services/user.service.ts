import { redis } from '../db/redis';

export const getUserInfoSvc = async (id: string) => {
	const stringObj = await redis.get(id);
	if (stringObj) {
		const user = JSON.parse(stringObj);
		return user;
	}
	throw new Error('User not found');
};
