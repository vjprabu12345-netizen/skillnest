import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Save, Trash2, Link as LinkIcon, Image, Tag, Sparkles } from 'lucide-react';
import { resourceAPI } from '../services/api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

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

export default function EditResourcePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
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

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const fetchResource = async () => {
      try {
        setLoading(true);
        const res = await resourceAPI.getById(id);
        if (res.data.success) {
          const r = res.data.data;
          // Check if author or admin
          if (r.author?._id !== user?._id && !isAdmin) {
            addToast('You are not authorized to edit this resource.', 'error');
            navigate('/dashboard');
            return;
          }

          setFormData({
            title: r.title,
            description: r.description,
            category: r.category,
            resourceType: r.resourceType || 'Course',
            url: r.url,
            thumbnail: r.thumbnail || '',
            tags: Array.isArray(r.tags) ? r.tags.join(', ') : '',
            difficulty: r.difficulty || 'All Levels',
          });
        }
      } catch (err) {
        addToast('Failed to load resource data.', 'error');
        navigate('/dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchResource();
  }, [id, user, isAdmin, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.description.trim() || !formData.url.trim()) {
      addToast('Please fill out all required fields.', 'warning');
      return;
    }

    setSubmitting(true);
    try {
      await resourceAPI.update(id, formData);
      addToast('Resource updated successfully!', 'success');
      navigate(`/resources/${id}`);
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update resource.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to permanently delete this resource?')) {
      return;
    }
    try {
      await resourceAPI.delete(id);
      addToast('Resource removed successfully.', 'info');
      navigate('/dashboard');
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete resource.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 animate-pulse space-y-6">
        <div className="h-6 w-32 bg-slate-800 rounded" />
        <div className="h-64 bg-slate-800 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <Link
          to={`/resources/${id}`}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Cancel & Return</span>
        </Link>
        <button
          onClick={handleDelete}
          className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 p-2 rounded-lg hover:bg-rose-500/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Delete Resource</span>
        </button>
      </div>

      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-700/80 shadow-2xl space-y-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Edit Educational Resource
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Keep resource information accurate and up-to-date for the learning community.
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
              className="input-field"
              required
            />
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
              className="input-field resize-none text-xs leading-relaxed"
              required
            />
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

          {/* URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              External Resource URL *
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="url"
                value={formData.url}
                onChange={handleChange}
                className="input-field pl-10"
                required
              />
            </div>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Thumbnail Image URL (Optional)
            </label>
            <div className="relative">
              <Image className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="thumbnail"
                value={formData.thumbnail}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags (Comma separated)
            </label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="input-field pl-10"
              />
            </div>
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-800">
            <Link to={`/resources/${id}`} className="btn-ghost text-xs">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary text-xs !py-3 !px-6 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{submitting ? 'Saving Changes...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
