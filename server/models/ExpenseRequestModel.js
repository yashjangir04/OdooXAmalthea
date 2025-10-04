const mongoose = require('mongoose');

const ApproverStatusSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending',
  },
}, { _id: false });

const ExpenseRequestSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  expenseDate: {
    type: Date,
    required: true,
  },
  category: {
    type: String,
    required: true,
    enum: ['Food', 'Travel', 'Accommodation', 'Other'],
  },
  paidBy: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
  },
  remarks: {
    type: String,
  },
  status: {
    type: String,
    required: true,
    enum: ['Draft', 'Pending', 'Approved', 'Rejected'],
  },
  approvers: [ApproverStatusSchema],
}, {
  timestamps: true,
  toJSON: {
    transform: (doc, ret) => {
      ret.id = ret._id;
      delete ret._id;
      delete ret.__v;
    }
  }
});

module.exports = mongoose.model('ExpenseRequest', ExpenseRequestSchema);