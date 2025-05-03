import express from 'express';
import { body, param, validationResult } from 'express-validator';
import Sprint from '../models/Sprint.js';
import Project from '../models/Project.js';
import UserStory from '../models/UserStory.js';

const router = express.Router();

// Get sprint by ID
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid sprint ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find sprint
      const sprint = await Sprint.findById(req.params.id);
      
      if (!sprint) {
        return res.status(404).json({ message: 'Sprint not found' });
      }
      
      // Find project to check authorization
      const project = await Project.findById(sprint.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to view this sprint
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to view this sprint' });
      }
      
      res.status(200).json(sprint);
    } catch (error) {
      next(error);
    }
  }
);

// Update sprint
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid sprint ID'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Sprint name must be between 2 and 100 characters'),
    body('startDate').optional().isISO8601().withMessage('Invalid start date'),
    body('endDate').optional().isISO8601().withMessage('Invalid end date'),
    body('goal').optional(),
    body('status')
      .optional()
      .isIn(['planning', 'active', 'completed'])
      .withMessage('Invalid status'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, startDate, endDate, goal, status } = req.body;
      
      // Find sprint
      const sprint = await Sprint.findById(req.params.id);
      
      if (!sprint) {
        return res.status(404).json({ message: 'Sprint not found' });
      }
      
      // Find project to check authorization
      const project = await Project.findById(sprint.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to update this sprint
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to update this sprint' });
      }
      
      // Update fields if provided
      if (name) sprint.name = name;
      if (startDate) sprint.startDate = startDate;
      if (endDate) sprint.endDate = endDate;
      if (goal !== undefined) sprint.goal = goal;
      if (status) sprint.status = status;
      
      await sprint.save();
      
      res.status(200).json(sprint);
    } catch (error) {
      next(error);
    }
  }
);

// Delete sprint
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid sprint ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find sprint
      const sprint = await Sprint.findById(req.params.id);
      
      if (!sprint) {
        return res.status(404).json({ message: 'Sprint not found' });
      }
      
      // Find project to check authorization
      const project = await Project.findById(sprint.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to delete this sprint
      if (project.owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this sprint' });
      }
      
      // Remove sprint reference from user stories
      await UserStory.updateMany(
        { sprintId: sprint._id },
        { $set: { sprintId: null, status: 'backlog' } }
      );
      
      // Delete sprint
      await sprint.deleteOne();
      
      res.status(200).json({ message: 'Sprint deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Get all user stories for a sprint
router.get(
  '/:id/stories',
  [param('id').isMongoId().withMessage('Invalid sprint ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find sprint
      const sprint = await Sprint.findById(req.params.id);
      
      if (!sprint) {
        return res.status(404).json({ message: 'Sprint not found' });
      }
      
      // Find project to check authorization
      const project = await Project.findById(sprint.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to view this sprint
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to view this sprint' });
      }
      
      // Find user stories
      const userStories = await UserStory.find({ sprintId: req.params.id });
      
      res.status(200).json(userStories);
    } catch (error) {
      next(error);
    }
  }
);

// Add user story to sprint
router.post(
  '/:id/stories/:storyId',
  [
    param('id').isMongoId().withMessage('Invalid sprint ID'),
    param('storyId').isMongoId().withMessage('Invalid user story ID'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find sprint
      const sprint = await Sprint.findById(req.params.id);
      
      if (!sprint) {
        return res.status(404).json({ message: 'Sprint not found' });
      }
      
      // Find user story
      const userStory = await UserStory.findById(req.params.storyId);
      
      if (!userStory) {
        return res.status(404).json({ message: 'User story not found' });
      }
      
      // Find project to check authorization
      const project = await Project.findById(sprint.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to update this sprint
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to update this sprint' });
      }
      
      // Check if user story belongs to the same project as the sprint
      if (userStory.projectId.toString() !== sprint.projectId.toString()) {
        return res.status(400).json({ message: 'User story does not belong to the same project' });
      }
      
      // Add user story to sprint
      userStory.sprintId = sprint._id;
      userStory.status = 'todo'; // Set status to todo when added to a sprint
      
      await userStory.save();
      
      res.status(200).json(userStory);
    } catch (error) {
      next(error);
    }
  }
);

// Remove user story from sprint
router.delete(
  '/:id/stories/:storyId',
  [
    param('id').isMongoId().withMessage('Invalid sprint ID'),
    param('storyId').isMongoId().withMessage('Invalid user story ID'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find sprint
      const sprint = await Sprint.findById(req.params.id);
      
      if (!sprint) {
        return res.status(404).json({ message: 'Sprint not found' });
      }
      
      // Find user story
      const userStory = await UserStory.findById(req.params.storyId);
      
      if (!userStory) {
        return res.status(404).json({ message: 'User story not found' });
      }
      
      // Find project to check authorization
      const project = await Project.findById(sprint.projectId);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to update this sprint
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to update this sprint' });
      }
      
      // Check if user story belongs to this sprint
      if (userStory.sprintId?.toString() !== sprint._id.toString()) {
        return res.status(400).json({ message: 'User story does not belong to this sprint' });
      }
      
      // Remove user story from sprint
      userStory.sprintId = null;
      userStory.status = 'backlog'; // Set status to backlog when removed from a sprint
      
      await userStory.save();
      
      res.status(200).json(userStory);
    } catch (error) {
      next(error);
    }
  }
);

export default router;