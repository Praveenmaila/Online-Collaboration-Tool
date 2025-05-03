import express from 'express';
import { body, param, validationResult } from 'express-validator';
import UserStory from '../models/UserStory.js';
import Project from '../models/Project.js';

const router = express.Router();

// Get user story by ID
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user story ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find user story
      const userStory = await UserStory.findById(req.params.id);
      
      if (!userStory) {
        return res.status(404).json({ message: 'User story not found' });
      }
      
      // Find project to check authorization
      const project = await Project.findById(userStory.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to view this user story
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to view this user story' });
      }
      
      res.status(200).json(userStory);
    } catch (error) {
      next(error);
    }
  }
);

// Update user story
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid user story ID'),
    body('title')
      .optional()
      .isLength({ min: 2, max: 200 })
      .withMessage('Title must be between 2 and 200 characters'),
    body('description').optional(),
    body('status')
      .optional()
      .isIn(['backlog', 'todo', 'inProgress', 'review', 'done'])
      .withMessage('Invalid status'),
    body('priority')
      .optional()
      .isIn(['low', 'medium', 'high'])
      .withMessage('Invalid priority'),
    body('points').optional().isInt({ min: 0, max: 100 }).withMessage('Points must be between 0 and 100'),
    body('assignee').optional().isMongoId().withMessage('Invalid assignee ID'),
    body('sprintId').optional().isMongoId().withMessage('Invalid sprint ID'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const {
        title,
        description,
        status,
        priority,
        points,
        assignee,
        sprintId,
      } = req.body;
      
      // Find user story
      const userStory = await UserStory.findById(req.params.id);
      
      if (!userStory) {
        return res.status(404).json({ message: 'User story not found' });
      }
      
      // Find project to check authorization
      const project = await Project.findById(userStory.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to update this user story
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to update this user story' });
      }
      
      // If assignee is provided, check if they are a member of the project
      if (assignee) {
        const isMember = project.members.some((member) => member._id.toString() === assignee);
        
        if (!isMember) {
          return res.status(400).json({ message: 'Assignee is not a member of this project' });
        }
      }
      
      // Update fields if provided
      if (title) userStory.title = title;
      if (description !== undefined) userStory.description = description;
      if (status) userStory.status = status;
      if (priority) userStory.priority = priority;
      if (points !== undefined) userStory.points = points;
      if (assignee !== undefined) userStory.assignee = assignee || null;
      if (sprintId !== undefined) userStory.sprintId = sprintId || null;
      
      await userStory.save();
      
      await userStory.populate([
        {
          path: 'assignee',
          select: 'name email avatar',
        },
        {
          path: 'reporter',
          select: 'name email avatar',
        },
      ]);
      
      res.status(200).json(userStory);
    } catch (error) {
      next(error);
    }
  }
);

// Delete user story
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid user story ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find user story
      const userStory = await UserStory.findById(req.params.id);
      
      if (!userStory) {
        return res.status(404).json({ message: 'User story not found' });
      }
      
      // Find project to check authorization
      const project = await Project.findById(userStory.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to delete this user story
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        userStory.reporter._id.toString() === req.user._id.toString();
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to delete this user story' });
      }
      
      // Delete user story
      await userStory.deleteOne();
      
      res.status(200).json({ message: 'User story deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Add comment to user story
router.post(
  '/:id/comments',
  [
    param('id').isMongoId().withMessage('Invalid user story ID'),
    body('text').notEmpty().withMessage('Comment text is required'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { text } = req.body;
      
      // Find user story
      const userStory = await UserStory.findById(req.params.id);
      
      if (!userStory) {
        return res.status(404).json({ message: 'User story not found' });
      }
      
      // Find project to check authorization
      const project = await Project.findById(userStory.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to comment on this user story
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to comment on this user story' });
      }
      
      // Add comment
      userStory.comments.push({
        text,
        author: req.user._id,
      });
      
      await userStory.save();
      
      // Populate author details
      await userStory.populate({
        path: 'comments.author',
        select: 'name email avatar',
      });
      
      res.status(200).json(userStory);
    } catch (error) {
      next(error);
    }
  }
);

export default router;