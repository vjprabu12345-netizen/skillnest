import mongoose from 'mongoose';

export const REPORT_REASONS = [
  'Broken Link',
  'Outdated Content',
  'Misleading Information',
  'Copyright Violation',
  'Inappropriate Content',
  'Spam / Advertisement',
  'Other',
];

const reportSchema = new mongoose.Schema(
  {
    resource: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
    reportingUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reason: {
      type: String,
      required: [true, 'Please select a reason for reporting'],
      enum: {
        values: REPORT_REASONS,
        message: '{VALUE} is not a valid reporting reason',
      },
    },
    description: {
      type: String,
      default: '',
      maxlength: [1000, 'Report notes cannot exceed 1000 characters'],
    },
    status: {
      type: String,
      enum: ['pending', 'resolved', 'dismissed'],
      default: 'pending',
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ resource: 1, reportingUser: 1, status: 1 });

const Report = mongoose.model('Report', reportSchema);
export default Report;
