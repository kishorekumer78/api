import express from 'express';
import {
	activateUser,
	getUserInfo,
	loginUser,
	logoutUser,
	registerUser
} from '../controllers/user.controller';
import { authorizedRoles, isAuthenticated } from '../middlewares/auth-middlewares';
import { updateAccessToken } from '../controllers/token.controller';

const router = express.Router();

router.post('/register', registerUser);
router.post('/activate-user', activateUser);
router.post('/login', loginUser);
router.get('/logout', isAuthenticated, logoutUser);
router.get('/refresh-token', updateAccessToken);
router.get('/me', isAuthenticated, getUserInfo);

export default router;
