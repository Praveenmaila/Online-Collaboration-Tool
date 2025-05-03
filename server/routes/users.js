import express from 'express';
import { body, validationResult } from 'express-validator';
import User from '../models/User.js';

const router = express.Router();

// Update profile
router.put(
  '/profile',
  [
    body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('bio').optional().isString(),
    body('skills').optional().isArray(),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, bio, skills, avatar } = req.body;
      
      // Find user
      const user = await User.findById(req.user._id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update fields if provided
      if (name) user.name = name;
      if (bio !== undefined) user.bio = bio;
      if (skills) user.skills = skills;
      if (avatar !== undefined) user.avatar = avatar;
      
      await user.save();
      
      res.status(200).json(user.getProfile());
    } catch (error) {
      next(error);
    }
  }
);

// Change password
router.put(
  '/change-password',
  [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword')
      .isLength({ min: 6 })
      .withMessage('New password must be at least 6 characters long'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { currentPassword, newPassword } = req.body;
      
      // Find user
      const user = await User.findById(req.user._id).select('+password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Check if current password is correct
      const isMatch = await user.comparePassword(currentPassword);
      
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }
      
      // Update password
      user.password = newPassword;
      await user.save();
      
      res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;