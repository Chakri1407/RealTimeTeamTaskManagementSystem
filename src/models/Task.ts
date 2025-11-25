import mongoose, { Schema } from 'mongoose';
import { ITask } from '../types/interfaces';
import { TaskStatus, TaskPriority } from '../types/enums';

const taskSchema = new Schema<ITask>(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      minlength: [3, 'Task title must be at least 3 characters long'],
      maxlength: [200, 'Task title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
      required: [true, 'Task must belong to a project'],
    },
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(TaskStatus),
      default: TaskStatus.TODO,
      required: true,
    },
    priority: {
      type: String,
      enum: Object.values(TaskPriority),
      default: TaskPriority.MEDIUM,
      required: true,
    },
    dueDate: {
      type: Date,
      validate: {
        validator: function (value: Date) {
          return !value || value >= new Date();
        },
        message: 'Due date must be in the future',
      },
    },
    tags: {
      type: [String],
      default: [],
      validate: {
        validator: function (tags: string[]) {
          return tags.length <= 10;
        },
        message: 'Cannot have more than 10 tags',
      },
    },
    attachments: {
      type: [String],
      default: [],
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
taskSchema.index({ project: 1 });
taskSchema.index({ assignedTo: 1 });
taskSchema.index({ createdBy: 1 });
taskSchema.index({ status: 1 });
taskSchema.index({ priority: 1 });
taskSchema.index({ dueDate: 1 });
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, status: 1, priority: 1 });

// Virtual for overdue status
taskSchema.virtual('isOverdue').get(function () {
  if (this.dueDate && this.status !== TaskStatus.DONE) {
    return new Date() > this.dueDate;
  }
  return false;
});

// Virtual for days until due
taskSchema.virtual('daysUntilDue').get(function () {
  if (this.dueDate) {
    const diffTime = this.dueDate.getTime() - new Date().getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  }
  return null;
});

// Instance method to validate status transition
taskSchema.methods.canTransitionTo = function (newStatus: TaskStatus): boolean {
  const statusFlow: Record<TaskStatus, TaskStatus[]> = {
    [TaskStatus.TODO]: [TaskStatus.IN_PROGRESS],
    [TaskStatus.IN_PROGRESS]: [TaskStatus.TODO, TaskStatus.REVIEW],
    [TaskStatus.REVIEW]: [TaskStatus.IN_PROGRESS, TaskStatus.DONE],
    [TaskStatus.DONE]: [TaskStatus.IN_PROGRESS],
  };

  const currentStatus = this.status as TaskStatus;
  return statusFlow[currentStatus]?.includes(newStatus) || false;
};

// Static method to find tasks by project
taskSchema.statics.findByProject = function (projectId: mongoose.Types.ObjectId) {
  return this.find({ project: projectId }).sort({ createdAt: -1 });
};

// Static method to find tasks by assignee
taskSchema.statics.findByAssignee = function (userId: mongoose.Types.ObjectId) {
  return this.find({ assignedTo: userId }).sort({ dueDate: 1 });
};

// Static method to find overdue tasks
taskSchema.statics.findOverdue = function () {
  return this.find({
    dueDate: { $lt: new Date() },
    status: { $ne: TaskStatus.DONE },
  }).sort({ dueDate: 1 });
};

// Static method to find tasks by status
taskSchema.statics.findByStatus = function (
  projectId: mongoose.Types.ObjectId,
  status: TaskStatus
) {
  return this.find({ project: projectId, status }).sort({ createdAt: -1 });
};

// Pre-save hook
taskSchema.pre('save', function (next) {
  next();
});

// Pre-remove hook
taskSchema.pre('deleteOne', { document: true, query: false }, async function () {
  await mongoose.model('ActivityLog').deleteMany({ task: this._id });
});

const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task; 