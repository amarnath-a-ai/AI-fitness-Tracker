import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../middleware/auth';
import { User } from '../models/User';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  generateOTP,
} from '../utils/jwt';
import { config } from '../config/env';
import { logger } from '../utils/logger';
import crypto from 'crypto';
import { sendEmail } from '../utils/sendEmail';

// Cookie options
const accessTokenCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 15 * 60 * 1000, // 15 minutes
};

const refreshTokenCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'lax' as const,
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Register
export const register = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, firstName, lastName, email, password, gender, dateOfBirth, height, weight } = req.body;

    // Check existing user
    if (process.env.MOCK_DATABASE === 'true') {
      const { mockUsersDb } = require('../utils/mockDb');
      const existing = mockUsersDb.find((u: any) => u.email === email);
      if (existing) {
        res.status(400).json({ success: false, message: 'Email already registered' });
        return;
      }
      const newUser = {
        _id: 'mock_' + Date.now(),
        username,
        firstName,
        lastName,
        email,
        password,
        role: 'user',
        gender,
        dateOfBirth,
        height,
        weight,
        dailyCalorieGoal: 2000,
        dailyWaterGoal: 8,
        dailyStepsGoal: 10000,
        dailySleepGoal: 8,
        streak: 1,
        isEmailVerified: true
      };
      mockUsersDb.push(newUser);
      const accessToken = generateAccessToken({ id: newUser._id, role: newUser.role });
      const refreshToken = generateRefreshToken({ id: newUser._id, role: newUser.role });
      res.cookie('accessToken', accessToken, accessTokenCookieOptions);
      res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
      res.status(201).json({
        success: true,
        message: 'Registration successful',
        data: { user: newUser, accessToken }
      });
      return;
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {

      res.status(400).json({ success: false, message: 'Email or username already registered' });
      return;
    }

    // Generate OTP for email verification
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Create user
    const user = await User.create({
      username,
      firstName,
      lastName,
      email,
      password,
      gender,
      dateOfBirth,
      height,
      weight,
      isEmailVerified: false,
      otp,
      otpExpiry
    });

    // In a real app, send email here. For now, log it.
    logger.info(`OTP for ${email}: ${otp}`);
    try {
      await sendEmail({
        email,
        subject: 'Verify your Athrix Account',
        message: `Your verification code is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Welcome to Athrix!</p><p>Your verification code is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
      });
    } catch (err) {
      logger.error('Failed to send email during registration', err);
    }

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

    // Save refresh token
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    // Set cookies
    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    // Remove password from response
    const userResponse = user.toObject();
    delete (userResponse as any).password;

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (error: any) {
    logger.error('Register error:', error);
    res.status(500).json({ success: false, message: error.message || 'Registration failed' });
  }
};

// Login
export const login = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    if (process.env.MOCK_DATABASE === 'true') {
      const { mockUsersDb } = require('../utils/mockDb');
      const user = mockUsersDb.find((u: any) => u.username === username || u.email === username);
      if (!user || (user.password !== password && !await bcrypt.compare(password, user.password))) {
        res.status(401).json({ success: false, message: 'Invalid username or password' });
        return;
      }
      const accessToken = generateAccessToken({ id: user._id, role: user.role });
      const refreshToken = generateRefreshToken({ id: user._id, role: user.role });
      res.cookie('accessToken', accessToken, accessTokenCookieOptions);
      res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);
      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: { user, accessToken }
      });
      return;
    }

    const user = await User.findOne({ $or: [{ username }, { email: username }] }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid username or password' });
      return;
    }

    // Update streak
    const today = new Date();
    const lastActive = user.lastActiveDate ? new Date(user.lastActiveDate) : null;
    if (lastActive) {
      const diffDays = Math.floor(
        (today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)
      );
      if (diffDays === 1) {
        user.streak += 1;
      } else if (diffDays > 1) {
        user.streak = 1;
      }
    } else {
      user.streak = 1;
    }
    user.lastActiveDate = today;

    // Generate tokens
    const accessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
    const refreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('accessToken', accessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', refreshToken, refreshTokenCookieOptions);

    const userResponse = user.toObject();
    delete (userResponse as any).password;
    delete (userResponse as any).refreshToken;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userResponse,
        accessToken,
      },
    });
  } catch (error: any) {
    logger.error('Login error:', error);
    res.status(500).json({ success: false, message: error.message || 'Login failed' });
  }
};

// Logout
export const logout = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (req.user) {
      await User.findByIdAndUpdate(req.user._id, { refreshToken: '' });
    }

    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    res.status(200).json({ success: true, message: 'Logged out successfully' });
  } catch (error: any) {
    logger.error('Logout error:', error);
    res.status(500).json({ success: false, message: 'Logout failed' });
  }
};

// Refresh Token
export const refreshAccessToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.refreshToken || req.body.refreshToken;

    if (!token) {
      res.status(401).json({ success: false, message: 'No refresh token' });
      return;
    }

    const decoded = verifyRefreshToken(token);
    const user = await User.findById(decoded.id).select('+refreshToken');

    if (!user || user.refreshToken !== token) {
      res.status(401).json({ success: false, message: 'Invalid refresh token' });
      return;
    }

    // Rotate tokens
    const newAccessToken = generateAccessToken({ id: user._id.toString(), role: user.role });
    const newRefreshToken = generateRefreshToken({ id: user._id.toString(), role: user.role });

    user.refreshToken = newRefreshToken;
    await user.save({ validateBeforeSave: false });

    res.cookie('accessToken', newAccessToken, accessTokenCookieOptions);
    res.cookie('refreshToken', newRefreshToken, refreshTokenCookieOptions);

    res.status(200).json({
      success: true,
      data: { accessToken: newAccessToken },
    });
  } catch (error: any) {
    logger.error('Refresh token error:', error);
    res.status(401).json({ success: false, message: 'Invalid refresh token' });
  }
};

// Get Current User
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (process.env.MOCK_DATABASE === 'true') {
      res.status(200).json({ success: true, data: req.user });
      return;
    }
    const user = await User.findById(req.user._id);
    res.status(200).json({ success: true, data: user });
  } catch (error: any) {
    logger.error('Get me error:', error);
    res.status(500).json({ success: false, message: 'Failed to get user' });
  }
};


// Update Profile
export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findByIdAndUpdate(req.user._id, req.body, {
      new: true,
      runValidators: true,
    });
    res.status(200).json({ success: true, data: user, message: 'Profile updated' });
  } catch (error: any) {
    logger.error('Update profile error:', error);
    res.status(500).json({ success: false, message: error.message || 'Update failed' });
  }
};

// Forgot Password
export const forgotPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(200).json({
        success: true,
        message: 'If the email exists, a reset link has been sent',
      });
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');
    user.resetPasswordExpiry = new Date(Date.now() + 30 * 60 * 1000); // 30 min
    await user.save({ validateBeforeSave: false });

    // In production, send email with reset link
    logger.info(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'If the email exists, a reset link has been sent',
      // Dev only - include token in response
      ...(config.nodeEnv === 'development' && { resetToken }),
    });
  } catch (error: any) {
    logger.error('Forgot password error:', error);
    res.status(500).json({ success: false, message: 'Failed to process request' });
  }
};

// Reset Password
export const resetPassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, password } = req.body;

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
      res.status(400).json({ success: false, message: 'Invalid or expired token' });
      return;
    }

    user.password = password;
    user.resetPasswordToken = '';
    user.resetPasswordExpiry = undefined as any;
    await user.save();

    res.status(200).json({ success: true, message: 'Password reset successful' });
  } catch (error: any) {
    logger.error('Reset password error:', error);
    res.status(500).json({ success: false, message: 'Password reset failed' });
  }
};

// Send OTP
export const sendOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    const otp = generateOTP();
    user.otp = otp;
    user.otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 min
    await user.save({ validateBeforeSave: false });

    // In production, send OTP via email
    logger.info(`OTP for ${email}: ${otp}`);
    try {
      await sendEmail({
        email,
        subject: 'Athrix - Verification Code',
        message: `Your new verification code is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your new verification code is: <strong>${otp}</strong></p><p>It will expire in 10 minutes.</p>`,
      });
    } catch (err) {
      logger.error('Failed to send resend OTP email', err);
    }

    res.status(200).json({
      success: true,
      message: 'OTP sent to your email',
      ...(config.nodeEnv === 'development' && { otp }),
    });
  } catch (error: any) {
    logger.error('Send OTP error:', error);
    res.status(500).json({ success: false, message: 'Failed to send OTP' });
  }
};

// Verify OTP
export const verifyOTP = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { email, otp } = req.body;

    const user = await User.findOne({ email }).select('+otp +otpExpiry');

    if (!user || user.otp !== otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
      return;
    }

    user.isEmailVerified = true;
    user.otp = '';
    user.otpExpiry = undefined as any;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: 'Email verified successfully' });
  } catch (error: any) {
    logger.error('Verify OTP error:', error);
    res.status(500).json({ success: false, message: 'Verification failed' });
  }
};
