import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Flag, X, AlertTriangle, Send } from 'lucide-react';
import { reportAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const REASONS = [
  'Broken Link',
  'Outdated Content',
  'Misleading Information',
  'Copyright Violation',
  'Inappropriate Content',
  'Spam / Advertisement',
  'Other',
];

export default function ReportModal({ isOpen, onClose, resource }) {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [reason, setReason] = useState(REASONS[0]);
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen || !resource) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      addToast('Please sign in to report a resource issue.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await reportAPI.create(resource._id, { reason, description });
      addToast('Thank you! Your report has been submitted to moderators.', 'success');
      setDescription('');
      onClose();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit report.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-lg bg-navy-900 border border-slate-700/80 rounded-2xl p-6 shadow-2xl text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2 text-rose-400">
              <Flag className="w-5 h-5" />
              <h3 className="text-base font-bold text-white">Report Resource Issue</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-1">Resource being reported:</p>
              <p className="text-sm font-semibold text-white bg-navy-950/60 p-2.5 rounded-xl border border-slate-800 truncate">
                {resource.title}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Issue Category *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field"
              >
                {REASONS.map((r) => (
                  <option key={r} value={r} className="bg-navy-900 text-white">
                    {r}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Details or Context (Optional)
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Explain what is broken, incorrect, or violating guidelines..."
                className="input-field resize-none text-xs"
                maxLength={500}
              />
            </div>

            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="btn-ghost text-xs"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary !bg-rose-600 hover:!bg-rose-500 text-xs flex items-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Submit Report'}</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
