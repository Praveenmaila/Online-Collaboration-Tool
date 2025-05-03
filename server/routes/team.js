import express from 'express';
import { body, param, validationResult } from 'express-validator';
import User from '../models/User.js';
import { isAdmin } from '../middleware/auth.js';

const router = express.Router();

// Get all team members
router.get('/', async (req, res, next) => {
  try {
    // Find all users
    const users = await User.find().select('-password');
    
    res.status(200).json(users);
  } catch (error) {
    next(error);
  }
});

// Get team member by ID
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find user
      const user = await User.findById(req.params.id).select('-password');
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }
);

// Invite team member (create new user)
router.post(
  '/invite',
  [
    body('email').isEmail().withMessage('Please provide a valid email'),
    body('role').isIn(['admin', 'member']).withMessage('Invalid role'),
  ],
  isAdmin,
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { email, role } = req.body;
      
      // Check if user already exists
      const existingUser = await User.findOne({ email });
      
      if (existingUser) {
        return res.status(400).json({ message: 'User already exists' });
      }
      
      // Generate a random password (in a real app, you would send an invitation email)
      const randomPassword = Math.random().toString(36).substring(2, 12);
      
      // Create new user
      const user = await User.create({
        name: email.split('@')[0], // Use part of the email as name initially
        email,
        password: randomPassword,
        role,
      });
      
      // In a real app, you would send an invitation email with the password or a link to set a password
      
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        message: 'Invitation sent to user',
      });
    } catch (error) {
      next(error);
    }
  }
);

// Update team member
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user ID'),
    body('name').optional().isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
    body('role').optional().isIn(['admin', 'member']).withMessage('Invalid role'),
    body('skills').optional().isArray(),
  ],
  isAdmin,
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, role, skills } = req.body;
      
      // Find user
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Update fields if provided
      if (name) user.name = name;
      if (role) user.role = role;
      if (skills) user.skills = skills;
      
      await user.save();
      
      res.status(200).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        skills: user.skills,
      });
    } catch (error) {
      next(error);
    }
  }
);

// Remove team member
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user ID')],
  isAdmin,
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Prevent deleting yourself
      if (req.params.id === req.user._id.toString()) {
        return res.status(400).json({ message: 'Cannot delete yourself' });
      }
      
      // Find user
      const user = await User.findById(req.params.id);
      
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Delete user
      await user.deleteOne();
      
      res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;