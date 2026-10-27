import { Router } from 'express';
import {
  register, login, logout, refreshAccessToken, getMe, updateProfile,
  forgotPassword, resetPassword, sendOTP, verifyOTP,
} from '../controllers/auth.controller';
import { protect } from '../middleware/auth';
import { validate } from '../middleware/validate';
import {
  registerSchema, loginSchema, forgotPasswordSchema,
  resetPasswordSchema, verifyOtpSchema, updateProfileSchema,
} from '../validators/schemas';

const router = Router();

router.post('/register', validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);
router.post('/logout', protect, logout);
router.post('/refresh-token', refreshAccessToken);
router.get('/me', protect, getMe);
router.put('/profile', protect, validate(updateProfileSchema), updateProfile);
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), resetPassword);
router.post('/send-otp', sendOTP);
router.post('/verify-otp', validate(verifyOtpSchema), verifyOTP);

export default router;
