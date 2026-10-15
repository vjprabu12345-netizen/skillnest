import Report, { REPORT_REASONS } from '../models/Report.js';
import Resource from '../models/Resource.js';

// @desc    Submit a report for a resource (broken link, inappropriate, etc.)
// @route   POST /api/resources/:id/reports
// @access  Private
export const createReport = async (req, res, next) => {
  try {
    const { id: resourceId } = req.params;
    const { reason, description } = req.body;

    if (!reason) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a reason for reporting this resource.',
      });
    }

    if (!REPORT_REASONS.includes(reason)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid report reason selected.',
      });
    }

    const resource = await Resource.findById(resourceId);
    if (!resource) {
      return res.status(404).json({
        success: false,
        message: 'Resource not found',
      });
    }

    const report = await Report.create({
      resource: resourceId,
      reportingUser: req.user._id,
      reason,
      description: description ? description.trim() : '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Report submitted. Our moderation team will review this promptly.',
      data: report,
    });
  } catch (error) {
    next(error);
  }
};
