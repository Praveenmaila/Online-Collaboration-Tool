import mongoose from 'mongoose';

const UserStorySchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: 2,
      maxlength: 200,
    },
    description: {
      type: String,
      default: '',
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    sprintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Sprint',
      default: null,
    },
    status: {
      type: String,
      enum: ['backlog', 'todo', 'inProgress', 'review', 'done'],
      default: 'backlog',
    },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'medium',
    },
    points: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    assignee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    reporter: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    comments: [
      {
        text: {
          type: String,
          required: true,
        },
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware to populate assignee and reporter
UserStorySchema.pre(/^find/, function (next) {
  this.populate({
    path: 'assignee',
    select: 'name email avatar',
  });
  
  this.populate({
    path: 'reporter',
    select: 'name email avatar',
  });
  
  next();
});

const UserStory = mongoose.model('UserStory', UserStorySchema);
export default UserStory;