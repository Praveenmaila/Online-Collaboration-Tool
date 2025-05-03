import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    key: {
      type: String,
      required: [true, 'Project key is required'],
      trim: true,
      uppercase: true,
      minlength: 2,
      maxlength: 10,
      unique: true,
    },
    description: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'archived'],
      default: 'active',
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Middleware to populate owner and members
ProjectSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'owner',
    select: 'name email avatar',
  });
  
  this.populate({
    path: 'members',
    select: 'name email avatar',
  });
  
  next();
});

const Project = mongoose.model('Project', ProjectSchema);
export default Project;