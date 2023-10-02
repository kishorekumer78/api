import User from '../models/user.model';

export const getUserInfoSvc = async (id: string) => {
	const user = await User.findById(id);
	console.log(user);

	return user;
};
