# ScrumCollab - Team Collaboration Platform

A modern web application for team collaboration using the MERN (MongoDB, Express, React, Node.js) stack with Scrum methodology for project management.

## Features

- User authentication and team management
- Project creation and management with Scrum methodology
- Interactive sprint planning and backlog management
- Kanban-style board for visualizing workflow
- Real-time collaboration with WebSockets
- Task assignment, commenting, and status tracking
- Time tracking and reporting capabilities
- Role-based permissions and access control

## Tech Stack

- **Frontend**:
  - React with TypeScript
  - React Router for navigation
  - Zustand for state management
  - Tailwind CSS for styling
  - Socket.io for real-time updates

- **Backend**:
  - Node.js with Express
  - MongoDB with Mongoose
  - JWT for authentication
  - Socket.io for real-time communication

## Getting Started

### Prerequisites

- Node.js and npm
- MongoDB

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables:
   - Copy `.env.example` to `.env`
   - Update the MongoDB URI and JWT secret

4. Start the development server:
   ```
   npm run dev:full
   ```

## Project Structure

```
├── public/                # Static assets
├── server/                # Backend server code
│   ├── middleware/        # Express middleware
│   ├── models/            # Mongoose models
│   ├── routes/            # API routes
│   └── index.js           # Server entry point
└── src/                   # Frontend source code
    ├── components/        # Reusable React components
    ├── context/           # React context providers
    ├── layouts/           # Page layouts
    ├── pages/             # Page components
    ├── stores/            # Zustand state stores
    └── config.ts          # App configuration
```

## API Documentation

The API follows RESTful principles and supports the following endpoints:

- `/api/auth` - Authentication routes
- `/api/users` - User management
- `/api/projects` - Project management
- `/api/sprints` - Sprint management
- `/api/stories` - User story management
- `/api/team` - Team management

## License

MIT