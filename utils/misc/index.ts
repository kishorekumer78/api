import { IUser } from '../../models/user.model';

export const getPasswordLessUser = (user: IUser) => {
	const userObj = user.toObject();
	userObj['password'] = undefined;
	return userObj;
};
