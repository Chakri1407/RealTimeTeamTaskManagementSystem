import mongoose, { Schema } from 'mongoose';
import { IActivityLog, IActivityLogModel } from '../types/interfaces';
import { ActivityAction } from '../types/enums';

const activityLogSchema = new Schema<IActivityLog, IActivityLogModel>(
  {
    action: {
      type: String,
      enum: Object.values(ActivityAction),
      required: [true, 'Action type is required'],
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User is required'],
    },
    team: {
      type: Schema.Types.ObjectId,
      ref: 'Team',
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: 'Project',
    },
    task: {
      type: Schema.Types.ObjectId,
      ref: 'Task',
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      transform: function (_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
    toObject: {
      transform: function (_doc, ret) {
        delete (ret as any).__v;
        return ret;
      },
    },
  }
);

// Indexes for efficient querying
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ team: 1, createdAt: -1 });
activityLogSchema.index({ project: 1, createdAt: -1 });
activityLogSchema.index({ task: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

// Compound indexes for common queries
activityLogSchema.index({ team: 1, action: 1, createdAt: -1 });
activityLogSchema.index({ project: 1, action: 1, createdAt: -1 });

// TTL index to automatically delete old logs after 90 days
activityLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 7776000 });

// Static method to create activity log
activityLogSchema.statics.createLog = async function (logData: {
  action: ActivityAction;
  user: mongoose.Types.ObjectId;
  description: string;
  team?: mongoose.Types.ObjectId;
  project?: mongoose.Types.ObjectId;
  task?: mongoose.Types.ObjectId;
  metadata?: Record<string, any>;
}) {
  return this.create(logData);
};

// Static method to get team activity
activityLogSchema.statics.getTeamActivity = function (
  teamId: mongoose.Types.ObjectId,
  limit: number = 50
) {
  return this.find({ team: teamId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .populate('project', 'name')
    .populate('task', 'title');
};

// Static method to get project activity
activityLogSchema.statics.getProjectActivity = function (
  projectId: mongoose.Types.ObjectId,
  limit: number = 50
) {
  return this.find({ project: projectId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('user', 'name email')
    .populate('task', 'title');
};

// Static method to get user activity
activityLogSchema.statics.getUserActivity = function (
  userId: mongoose.Types.ObjectId,
  limit: number = 50
) {
  return this.find({ user: userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('team', 'name')
    .populate('project', 'name')
    .populate('task', 'title');
};

// Static method to get task history
activityLogSchema.statics.getTaskHistory = function (
  taskId: mongoose.Types.ObjectId
) {
  return this.find({ task: taskId })
    .sort({ createdAt: -1 })
    .populate('user', 'name email');
};

// Static method to get activity by date range
activityLogSchema.statics.getActivityByDateRange = function (
  startDate: Date,
  endDate: Date,
  filters?: {
    team?: mongoose.Types.ObjectId;
    project?: mongoose.Types.ObjectId;
    user?: mongoose.Types.ObjectId;
  }
) {
  const query: any = {
    createdAt: { $gte: startDate, $lte: endDate },
  };

  if (filters?.team) query.team = filters.team;
  if (filters?.project) query.project = filters.project;
  if (filters?.user) query.user = filters.user;

  return this.find(query)
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('team', 'name')
    .populate('project', 'name')
    .populate('task', 'title');
};

const ActivityLog = mongoose.model<IActivityLog, IActivityLogModel>('ActivityLog', activityLogSchema);

export default ActivityLog; 