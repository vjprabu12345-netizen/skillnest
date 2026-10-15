import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  PlusCircle,
  Link as LinkIcon,
  BookOpen,
  Image,
  Tag,
  Layers,
  ArrowLeft,
  Sparkles,
  HelpCircle,
} from 'lucide-react';
import { resourceAPI } from '../services/api';
import { useToast } from '../context/ToastContext';

const CATEGORIES = [
  'HTML and CSS',
  'JavaScript',
  'React JS',
  'Node.js and Express',
  'MongoDB and Databases',
  'Full Stack Development',
  'UI/UX Design',
  'Python',
  'Java',
  'Data Structures and Algorithms',
  'Interview Preparation',
  'Free Coding Courses',
  'DevOps & Cloud',
  'Other',
];

const RESOURCE_TYPES = [
  'Course',
  'Article',
  'Video',
  'Documentation',
  'Book',
  'Interactive Tool',
  'Cheatsheet',
];

const DIFFICULTIES = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];

export default function AddResourcePage() {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: CATEGORIES[0],
    resourceType: 'Course',
    url: '',
    thumbnail: '',
    tags: '',
    difficulty: 'All Levels',
  });

  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.title.trim()) {
      errs.title = 'Title is required (at least 3 characters)';
    } else if (formData.title.trim().length < 3) {
      errs.title = 'Title must be at least 3 characters';
    }

    if (!formData.description.trim()) {
      errs.description = 'Description is required (at least 20 characters)';
    } else if (formData.description.trim().length < 20) {
      errs.description = 'Please write at least 20 characters explaining the resource';
    }

    if (!formData.category) {
      errs.category = 'Please select a category';
    }

    if (!formData.url.trim()) {
      errs.url = 'Valid external URL is required';
    } else if (
      !/^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?(\?.*)?(#.*)?$/i.test(
        formData.url.trim()
      )
    ) {
      errs.url = 'Please enter a valid URL (e.g. https://example.com)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      addToast('Please correct the highlighted form errors.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      // Ensure URL has protocol
      let formattedUrl = formData.url.trim();
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = `https://${formattedUrl}`;
      }

      const payload = {
        ...formData,
        url: formattedUrl,
      };

      const res = await resourceAPI.create(payload);
      if (res.data.success) {
        addToast('Resource shared successfully! Thank you for contributing.', 'success');
        navigate(`/resources/${res.data.data._id}`);
      }
    } catch (err) {
      addToast(
        err.response?.data?.message || 'Failed to submit resource. Please check your data.',
        'error'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-2xl space-y-6">
        <div>
          <div className="flex items-center gap-2 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-1">
            <Sparkles className="w-4 h-4" />
            <span>Community Knowledge Sharing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Share a Free Educational Resource
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Help students, developers, and self-learners discover top-tier open tutorials, documentation, and roadmaps.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pt-2">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Resource Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="e.g. Full Stack Open 2026, Harvard CS50, React Docs"
              className={`input-field ${errors.title ? 'border-rose-500 ring-rose-500/20' : ''}`}
              maxLength={120}
            />
            {errors.title && (
              <p className="mt-1 text-xs text-rose-400">{errors.title}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Description & Highlights *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows={4}
              placeholder="Explain what learners will gain from this resource. What prerequisite knowledge is required? Why do you recommend it?"
              className={`input-field resize-none text-xs leading-relaxed ${
                errors.description ? 'border-rose-500 ring-rose-500/20' : ''
              }`}
              maxLength={3000}
            />
            <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
              <span>{errors.description && <span className="text-rose-400">{errors.description}</span>}</span>
              <span>{formData.description.length} / 3000 characters</span>
            </div>
          </div>

          {/* Category, Type & Difficulty */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="input-field text-xs bg-navy-900"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Resource Type
              </label>
              <select
                name="resourceType"
                value={formData.resourceType}
                onChange={handleChange}
                className="input-field text-xs bg-navy-900"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Difficulty Level
              </label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="input-field text-xs bg-navy-900"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* External URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>External Resource URL *</span>
              <span className="text-[11px] text-slate-500">Must be 100% free to access</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleChange}
                placeholder="https://fullstackopen.com or https://cs50.harvard.edu"
                className={`input-field pl-10 ${errors.url ? 'border-rose-500 ring-rose-500/20' : ''}`}
              />
            </div>
            {errors.url && (
              <p className="mt-1 text-xs text-rose-400">{errors.url}</p>
            )}
          </div>

          {/* Thumbnail URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Thumbnail Image URL (Optional)</span>
              <span className="text-[11px] text-slate-500">Unsplash or direct image link</span>
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                placeholder="https://images.unsplash.com/photo-..."
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
              <span>Keywords & Tags</span>
              <span className="text-[11px] text-slate-500">Comma separated</span>
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="react, hooks, redux, frontend, intermediate"
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Submit CTA */}
          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <Link to="/explore" className="btn-ghost text-xs">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs !py-3 !px-6 flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Publishing...' : 'Publish to SkillNest'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
