import express from 'express';
import { body, param, validationResult } from 'express-validator';
import Project from '../models/Project.js';
import Sprint from '../models/Sprint.js';
import UserStory from '../models/UserStory.js';

const router = express.Router();

// Get all projects for current user
router.get('/', async (req, res, next) => {
  try {
    // Find projects where user is owner or member
    const projects = await Project.find({
      $or: [
        { owner: req.user._id },
        { members: req.user._id },
      ],
    });
    
    res.status(200).json(projects);
  } catch (error) {
    next(error);
  }
});

// Create a new project
router.post(
  '/',
  [
    body('name')
      .notEmpty()
      .withMessage('Project name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Project name must be between 2 and 100 characters'),
    body('key')
      .notEmpty()
      .withMessage('Project key is required')
      .isLength({ min: 2, max: 10 })
      .withMessage('Project key must be between 2 and 10 characters')
      .isAlphanumeric()
      .withMessage('Project key must be alphanumeric')
      .toUpperCase(),
    body('description').optional(),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, key, description } = req.body;
      
      // Check if project key already exists
      const existingProject = await Project.findOne({ key });
      
      if (existingProject) {
        return res.status(400).json({ message: 'Project key already exists' });
      }
      
      // Create new project
      const project = await Project.create({
        name,
        key,
        description,
        owner: req.user._id,
        members: [req.user._id], // Add owner as a member by default
      });
      
      res.status(201).json(project);
    } catch (error) {
      next(error);
    }
  }
);

// Get project by ID
router.get(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find project
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to view this project
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to view this project' });
      }
      
      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }
);

// Update project
router.put(
  '/:id',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('name')
      .optional()
      .isLength({ min: 2, max: 100 })
      .withMessage('Project name must be between 2 and 100 characters'),
    body('description').optional(),
    body('status')
      .optional()
      .isIn(['active', 'completed', 'archived'])
      .withMessage('Invalid status'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, description, status } = req.body;
      
      // Find project
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is the project owner
      if (project.owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to update this project' });
      }
      
      // Update fields if provided
      if (name) project.name = name;
      if (description !== undefined) project.description = description;
      if (status) project.status = status;
      
      await project.save();
      
      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }
);

// Delete project
router.delete(
  '/:id',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find project
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is the project owner
      if (project.owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to delete this project' });
      }
      
      // Delete all associated sprints and user stories
      await Sprint.deleteMany({ projectId: project._id });
      await UserStory.deleteMany({ projectId: project._id });
      
      // Delete project
      await project.deleteOne();
      
      res.status(200).json({ message: 'Project deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// Add member to project
router.post(
  '/:id/members',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('userId').isMongoId().withMessage('Invalid user ID'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { userId } = req.body;
      
      // Find project
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is the project owner
      if (project.owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to add members to this project' });
      }
      
      // Check if user is already a member
      if (project.members.some((member) => member._id.toString() === userId)) {
        return res.status(400).json({ message: 'User is already a member of this project' });
      }
      
      // Add user to members
      project.members.push(userId);
      await project.save();
      
      // Populate the newly added member
      await project.populate({
        path: 'members',
        select: 'name email avatar',
      });
      
      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }
);

// Remove member from project
router.delete(
  '/:id/members/:userId',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    param('userId').isMongoId().withMessage('Invalid user ID'),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find project
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is the project owner
      if (project.owner._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: 'Not authorized to remove members from this project' });
      }
      
      // Check if trying to remove the owner
      if (project.owner._id.toString() === req.params.userId) {
        return res.status(400).json({ message: 'Cannot remove the project owner' });
      }
      
      // Remove user from members
      project.members = project.members.filter(
        (member) => member._id.toString() !== req.params.userId
      );
      
      await project.save();
      
      res.status(200).json(project);
    } catch (error) {
      next(error);
    }
  }
);

// Get all sprints for a project
router.get(
  '/:id/sprints',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find project
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to view this project
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to view this project' });
      }
      
      // Find sprints
      const sprints = await Sprint.find({ projectId: req.params.id }).sort({ startDate: 1 });
      
      res.status(200).json(sprints);
    } catch (error) {
      next(error);
    }
  }
);

// Create a new sprint
router.post(
  '/:id/sprints',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('name')
      .notEmpty()
      .withMessage('Sprint name is required')
      .isLength({ min: 2, max: 100 })
      .withMessage('Sprint name must be between 2 and 100 characters'),
    body('startDate').notEmpty().withMessage('Start date is required').isISO8601(),
    body('endDate').notEmpty().withMessage('End date is required').isISO8601(),
    body('goal').optional(),
  ],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      const { name, startDate, endDate, goal } = req.body;
      
      // Find project
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to create sprints for this project
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to create sprints for this project' });
      }
      
      // Create new sprint
      const sprint = await Sprint.create({
        name,
        projectId: req.params.id,
        startDate,
        endDate,
        goal,
      });
      
      res.status(201).json(sprint);
    } catch (error) {
      next(error);
    }
  }
);

// Get all user stories for a project
router.get(
  '/:id/stories',
  [param('id').isMongoId().withMessage('Invalid project ID')],
  async (req, res, next) => {
    try {
      // Check for validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      
      // Find project
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to view this project
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to view this project' });
      }
      
      // Get filter options from query params
      const { sprintId, status, assignee } = req.query;
      
      // Build filter object
      const filter: any = { projectId: req.params.id };
      if (sprintId) filter.sprintId = sprintId;
      if (status) filter.status = status;
      if (assignee) filter.assignee = assignee;
      
      // Find user stories
      const userStories = await UserStory.find(filter);
      
      res.status(200).json(userStories);
    } catch (error) {
      next(error);
    }
  }
);

// Create a new user story
router.post(
  '/:id/stories',
  [
    param('id').isMongoId().withMessage('Invalid project ID'),
    body('title')
      .notEmpty()
      .withMessage('Title is required')
      .isLength({ min: 2, max: 200 })
      .withMessage('Title must be between 2 and 200 characters'),
    body('description').optional(),
    body('sprintId').optional().isMongoId().withMessage('Invalid sprint ID'),
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
        sprintId,
        status,
        priority,
        points,
        assignee,
      } = req.body;
      
      // Find project
      const project = await Project.findById(req.params.id);
      
      if (!project) {
        return res.status(404).json({ message: 'Project not found' });
      }
      
      // Check if user is authorized to create user stories for this project
      const isAuthorized =
        project.owner._id.toString() === req.user._id.toString() ||
        project.members.some((member) => member._id.toString() === req.user._id.toString());
      
      if (!isAuthorized) {
        return res.status(403).json({ message: 'Not authorized to create user stories for this project' });
      }
      
      // If sprintId is provided, check if it exists and belongs to the project
      if (sprintId) {
        const sprint = await Sprint.findOne({
          _id: sprintId,
          projectId: req.params.id,
        });
        
        if (!sprint) {
          return res.status(404).json({ message: 'Sprint not found or does not belong to this project' });
        }
      }
      
      // If assignee is provided, check if they are a member of the project
      if (assignee) {
        const isMember = project.members.some((member) => member._id.toString() === assignee);
        
        if (!isMember) {
          return res.status(400).json({ message: 'Assignee is not a member of this project' });
        }
      }
      
      // Create new user story
      const userStory = await UserStory.create({
        title,
        description,
        projectId: req.params.id,
        sprintId: sprintId || null,
        status: status || 'backlog',
        priority: priority || 'medium',
        points: points || 0,
        assignee: assignee || null,
        reporter: req.user._id,
      });
      
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
      
      res.status(201).json(userStory);
    } catch (error) {
      next(error);
    }
  }
);

export default router;