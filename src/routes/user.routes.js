import { Router } from 'express';
import userController from '../controllers/user.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';
import { upload } from '../middleware/multer.middleware.js';

const router = Router();

router.route('/register').post(userController.register);
router.route('/login').post(userController.login);

// Secure Routes
router.route('/logout').post(verifyJWT, userController.logout);
router.route('/users').get(verifyJWT, userController.getAllUsers);
router.route('/users/:id').get(verifyJWT, userController.getUserById);
router.route('/me')
    .get(verifyJWT, userController.getProfile)
    .delete(verifyJWT, userController.deleteUser);
router.route('/me/profile').put(verifyJWT, userController.updateProfile);
router.route('/me/password').patch(verifyJWT, userController.changePassword);
router.route('/me/profile-picture')
    .patch(verifyJWT, upload.single('profilePicture'), userController.changeProfilePicture)
    .delete(verifyJWT, userController.removeProfilePicture);
router.route('/refresh-token').post(userController.refreshAuthToken);

export default router;