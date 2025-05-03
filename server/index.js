import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import projectRoutes from './routes/projects.js';
import sprintRoutes from './routes/sprints.js';
import storyRoutes from './routes/stories.js';
import teamRoutes from './routes/team.js';

// Middleware
import { verifyToken } from './middleware/auth.js';
import { errorHandler } from './middleware/error.js';

// Configuration
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
const app = express();
const server = http.createServer(app);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(cookieParser());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, userRoutes);
app.use('/api/projects', verifyToken, projectRoutes);
app.use('/api/sprints', verifyToken, sprintRoutes);
app.use('/api/stories', verifyToken, storyRoutes);
app.use('/api/team', verifyToken, teamRoutes);

// Error handling middleware
app.use(errorHandler);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket middleware to verify token
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    return next(new Error('Authentication error'));
  }
  
  try {
    // This would be replaced with actual token verification
    // jwt.verify(token, process.env.JWT_SECRET);
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);
  
  // Join rooms for projects the user is a member of
  socket.on('joinProject', (projectId) => {
    socket.join(`project:${projectId}`);
    console.log(`User joined project: ${projectId}`);
  });
  
  // Leave project room
  socket.on('leaveProject', (projectId) => {
    socket.leave(`project:${projectId}`);
    console.log(`User left project: ${projectId}`);
  });
  
  // Handle real-time updates for tasks
  socket.on('taskUpdated', (data) => {
    // Broadcast to all users in the project room except sender
    socket.to(`project:${data.projectId}`).emit('taskUpdate', data);
  });
  
  // Handle disconnection
  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

// Database connection
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    server.listen(PORT, () => {
      console.log(`Server running on port: ${PORT}`);
    });
  })
  .catch((error) => {
    console.error(`Error connecting to MongoDB: ${error.message}`);
  });