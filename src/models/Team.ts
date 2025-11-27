import mongoose, { Schema } from 'mongoose';
import { ITeam, ITeamMember, ITeamModel } from '../types/interfaces';
import { UserRole } from '../types/enums';

const teamMemberSchema = new Schema<ITeamMember>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    role: {
      type: String,
      enum: Object.values(UserRole),
      default: UserRole.MEMBER,
      required: true,
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const teamSchema = new Schema<ITeam, ITeamModel>(
  {
    name: {
      type: String,
      required: [true, 'Team name is required'],
      trim: true,
      minlength: [2, 'Team name must be at least 2 characters long'],
      maxlength: [100, 'Team name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
    },
    members: {
      type: [teamMemberSchema],
      default: [],
      validate: {
        validator: function (members: ITeamMember[]) {
          return members.some((member) => member.role === UserRole.ADMIN);
        },
        message: 'Team must have at least one admin',
      },
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
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
teamSchema.index({ name: 1 });
teamSchema.index({ 'members.user': 1 });
teamSchema.index({ createdBy: 1 });

// Virtual for member count
teamSchema.virtual('memberCount').get(function () {
  return this.members ? this.members.length : 0;
});

// Instance method to check if user is a member
teamSchema.methods.isMember = function (userId: mongoose.Types.ObjectId): boolean {
  if (!this.members || !Array.isArray(this.members)) return false;
  return this.members.some(
    (member: ITeamMember) => member.user.toString() === userId.toString()
  );
};

// Instance method to check if user is an admin
teamSchema.methods.isAdmin = function (userId: mongoose.Types.ObjectId): boolean {
  if (!this.members || !Array.isArray(this.members)) return false;
  return this.members.some(
    (member: ITeamMember) =>
      member.user.toString() === userId.toString() && member.role === UserRole.ADMIN
  );
};

// Instance method to get user role in team
teamSchema.methods.getUserRole = function (
  userId: mongoose.Types.ObjectId
): UserRole | null {
  if (!this.members || !Array.isArray(this.members)) return null;
  const member = this.members.find(
    (m: ITeamMember) => m.user.toString() === userId.toString()
  );
  return member ? member.role : null;
};

// Static method to find teams by user
teamSchema.statics.findByUser = function (userId: mongoose.Types.ObjectId) {
  return this.find({ 'members.user': userId });
};

const Team = mongoose.model<ITeam, ITeamModel>('Team', teamSchema);

export default Team; 