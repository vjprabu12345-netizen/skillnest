import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, MessageSquare, Trash2, Edit3, Send, Check } from 'lucide-react';
import { reviewAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Link } from 'react-router-dom';

export default function ReviewSection({ resourceId, onRatingUpdated }) {
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Edit review state
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editReviewText, setEditReviewText] = useState('');

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await reviewAPI.getByResource(resourceId);
      if (res.data.success) {
        setReviews(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (resourceId) {
      fetchReviews();
    }
  }, [resourceId]);

  const userHasReviewed = reviews.some(
    (r) => r.user?._id === user?._id || r.user === user?._id
  );

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      addToast('Please sign in to write a review.', 'info');
      return;
    }
    if (!reviewText.trim()) {
      addToast('Please enter your review text.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      const res = await reviewAPI.create(resourceId, {
        rating,
        reviewText: reviewText.trim(),
      });
      if (res.data.success) {
        addToast('Review submitted successfully!', 'success');
        setReviewText('');
        fetchReviews();
        if (onRatingUpdated && res.data.resourceStats) {
          onRatingUpdated(res.data.resourceStats);
        }
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to submit review.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (!window.confirm('Are you sure you want to delete your review?')) return;
    try {
      await reviewAPI.delete(reviewId);
      addToast('Review deleted.', 'info');
      fetchReviews();
      if (onRatingUpdated) onRatingUpdated();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete review.', 'error');
    }
  };

  const handleStartEdit = (rev) => {
    setEditingReviewId(rev._id);
    setEditRating(rev.rating);
    setEditReviewText(rev.reviewText);
  };

  const handleSaveEdit = async (reviewId) => {
    try {
      await reviewAPI.update(reviewId, {
        rating: editRating,
        reviewText: editReviewText.trim(),
      });
      addToast('Review updated successfully!', 'success');
      setEditingReviewId(null);
      fetchReviews();
      if (onRatingUpdated) onRatingUpdated();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update review.', 'error');
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-violet-400" />
          <span>Learner Reviews & Ratings ({reviews.length})</span>
        </h3>
      </div>

      {/* Review Submission Form */}
      {isAuthenticated ? (
        !userHasReviewed ? (
          <form
            onSubmit={handleSubmitReview}
            className="p-6 rounded-2xl bg-navy-900/90 border border-slate-700/80 shadow-xl space-y-4"
          >
            <h4 className="text-sm font-semibold text-white">
              Write a Review
            </h4>

            {/* Star Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">Your Rating:</span>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 focus:outline-none transition-transform hover:scale-110"
                    aria-label={`Rate ${star} stars`}
                  >
                    <Star
                      className={`w-5 h-5 ${
                        (hoverRating || rating) >= star
                          ? 'text-amber-400 fill-amber-400'
                          : 'text-slate-600'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-semibold text-amber-400 ml-1">
                {rating} out of 5
              </span>
            </div>

            {/* Textarea */}
            <div>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your experience with this learning resource. What made it helpful? Is it up to date?"
                rows={3}
                className="input-field resize-none text-xs leading-relaxed"
                maxLength={1000}
                required
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting}
                className="btn-primary text-xs flex items-center gap-2"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Submitting...' : 'Post Review'}</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="p-4 rounded-xl bg-violet-950/30 border border-violet-500/20 text-xs text-violet-300 flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>You have already submitted a review for this resource. You can edit your review below.</span>
          </div>
        )
      ) : (
        <div className="p-6 rounded-2xl bg-navy-900/60 border border-slate-800 text-center space-y-3">
          <p className="text-sm text-slate-300 font-medium">
            Have you completed or used this resource?
          </p>
          <p className="text-xs text-slate-500">
            Sign in to rate and share valuable feedback for other students.
          </p>
          <Link
            to="/login"
            className="btn-secondary text-xs inline-flex items-center gap-1.5"
          >
            Sign in to Review
          </Link>
        </div>
      )}

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="p-5 rounded-2xl bg-navy-900/50 border border-slate-800/80 animate-pulse space-y-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-800" />
                <div className="space-y-1">
                  <div className="w-28 h-3.5 bg-slate-800 rounded" />
                  <div className="w-16 h-3 bg-slate-800/60 rounded" />
                </div>
              </div>
              <div className="w-full h-3 bg-slate-800/40 rounded" />
            </div>
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="p-8 text-center rounded-2xl bg-navy-900/40 border border-dashed border-slate-800 text-slate-500 text-sm">
          No reviews yet. Be the first learner to leave feedback!
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((rev) => {
            const isOwner =
              user && (rev.user?._id === user._id || rev.user === user._id || user.role === 'admin');
            const isEditing = editingReviewId === rev._id;

            return (
              <motion.div
                key={rev._id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-5 rounded-2xl bg-navy-900/80 border border-slate-700/60 space-y-3 shadow-md"
              >
                {/* Reviewer Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {rev.user?.profileImage ? (
                      <img
                        src={rev.user.profileImage}
                        alt={rev.user.name}
                        className="w-9 h-9 rounded-full object-cover ring-1 ring-violet-500/40"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-violet-600 to-brand-cyan flex items-center justify-center text-white text-xs font-bold">
                        {rev.user?.name?.charAt(0) || 'L'}
                      </div>
                    )}
                    <div>
                      <div className="text-sm font-semibold text-white">
                        {rev.user?.name || 'SkillNest Learner'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {new Date(rev.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Stars / Actions */}
                  <div className="flex items-center gap-3">
                    {!isEditing && (
                      <div className="flex items-center gap-0.5 text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`w-3.5 h-3.5 ${
                              i < rev.rating ? 'fill-current' : 'text-slate-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {isOwner && !isEditing && (
                      <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                        <button
                          onClick={() => handleStartEdit(rev)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                          title="Edit review"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteReview(rev._id)}
                          className="p-1 text-slate-400 hover:text-rose-400 transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Body or Edit mode */}
                {isEditing ? (
                  <div className="space-y-3 pt-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-400">Edit Rating:</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            type="button"
                            key={star}
                            onClick={() => setEditRating(star)}
                            className="p-0.5"
                          >
                            <Star
                              className={`w-4 h-4 ${
                                editRating >= star
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-slate-600'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                    <textarea
                      value={editReviewText}
                      onChange={(e) => setEditReviewText(e.target.value)}
                      rows={2}
                      className="input-field text-xs resize-none"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditingReviewId(null)}
                        className="btn-ghost text-xs"
                      >
                        Cancel
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(rev._id)}
                        className="btn-primary text-xs !py-1.5 !px-3"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-normal">
                    {rev.reviewText}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
