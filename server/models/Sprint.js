import mongoose from 'mongoose';

const SprintSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Sprint name is required'],
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
    },
    goal: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['planning', 'active', 'completed'],
      default: 'planning',
    },
  },
  {
    timestamps: true,
  }
);

// Middleware to ensure end date is after start date
SprintSchema.pre('save', function (next) {
  if (this.startDate && this.endDate) {
    if (new Date(this.endDate) <= new Date(this.startDate)) {
      const error = new Error('End date must be after start date');
      error.statusCode = 400;
      return next(error);
    }
  }
  next();
});

const Sprint = mongoose.model('Sprint', SprintSchema);
export default Sprint;