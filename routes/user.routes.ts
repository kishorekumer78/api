import express from 'express';
import {
	getUserInfo,
	updatePassword,
	updateProfilePicture,
	updateUserInfo
} from '../controllers/user.controller';
import { authorizedRoles, isAuthenticated } from '../middlewares/auth-middlewares';
import { updateAccessToken } from '../controllers/token.controller';
import {
	activateUser,
	loginUser,
	logoutUser,
	registerUser,
	socialAuth
} from '../controllers/auth.controller';

const router = express.Router();

router.post('/register', registerUser);
router.post('/activate-user', activateUser);
router.post('/login', loginUser);
router.get('/logout', isAuthenticated, logoutUser);
router.get('/refresh-token', updateAccessToken);
router.get('/me', isAuthenticated, getUserInfo);
router.post('/social-login', socialAuth);
router.put('/update-user', isAuthenticated, updateUserInfo);
router.put('/update-password', isAuthenticated, updatePassword);
router.put('/update-user-avatar', isAuthenticated, updateProfilePicture);

export default router;
