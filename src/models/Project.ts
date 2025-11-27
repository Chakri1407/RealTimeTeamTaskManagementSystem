import mongoose, { Schema } from 'mongoose';
import { IProject, IProjectModel } from '../types/interfaces';

const projectSchema = new Schema<IProject, IProjectModel>(
  {
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
      minlength: [2, 'Project name must be at least 2 characters long'],
      maxlength: [100, 'Project name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
      required: [true, 'Project must belong to a team'],
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    startDate: {
      type: Date,
    },
    endDate: {
      type: Date,
      validate: {
        validator: function (this: IProject, value: Date) {
          if (this.startDate && value) {
            return value >= this.startDate;
          }
          return true;
        },
        message: 'End date must be after start date',
      },
    },
    status: {
      type: String,
      enum: ['Planning', 'Active', 'On Hold', 'Completed', 'Cancelled'],
      default: 'Planning',
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      virtuals: true,
      transform: function (_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes
projectSchema.index({ team: 1 });
projectSchema.index({ createdBy: 1 });
projectSchema.index({ name: 1, team: 1 });
projectSchema.index({ status: 1 });

// Virtual for duration in days
projectSchema.virtual('duration').get(function () {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate.getTime() - this.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Virtual populate for tasks
projectSchema.virtual('tasks', {
  ref: 'Task',
  localField: '_id',
  foreignField: 'project',
});

// Static method to find projects by team
projectSchema.statics.findByTeam = function (teamId: mongoose.Types.ObjectId) {
  return this.find({ team: teamId }).sort({ createdAt: -1 });
};

// Static method to find active projects
projectSchema.statics.findActive = function () {
  return this.find({ status: 'Active' }).sort({ createdAt: -1 });
};

// Pre-remove hook to handle cascading deletes
projectSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await mongoose.model('Task').deleteMany({ project: this._id });
  await mongoose.model('ActivityLog').deleteMany({ project: this._id });
});

const Project = mongoose.model<IProject, IProjectModel>('Project', projectSchema);

export default Project; 