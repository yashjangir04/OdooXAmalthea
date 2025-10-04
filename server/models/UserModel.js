const mongoose = require('mongoose');

const ApprovalWorkflowSchema = new mongoose.Schema({
  approvers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isSequenced: {
    type: Boolean,
    default: false,
  },
  minApprovalPercentage: {
    type: Number,
    default: 50,
    min: 0,
    max: 100,
  },
  specialApproverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { _id: false });


const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['Admin', 'Manager', 'Finance', 'Director', 'Employee'],
  },
  managerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  workflow: {
    type: ApprovalWorkflowSchema,
    default: () => ({ approvers: [], isSequenced: false, minApprovalPercentage: 50 })
  }
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
      delete ret.password; // Never send password hash to client
    }
  }
});

module.exports = mongoose.model('User', UserSchema);