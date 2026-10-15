import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bookmark,
  ExternalLink,
  Star,
  Eye,
  Share2,
  Video,
  BookOpen,
  FileCode,
  Layers,
  Sparkles,
} from 'lucide-react';
import { favouriteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function ResourceCard({ resource, onFavouriteToggle, onShare }) {
  const { isAuthenticated } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [isFavourited, setIsFavourited] = useState(resource.isFavourited || false);
  const [favCount, setFavCount] = useState(resource.favouritesCount || 0);
  const [loadingFav, setLoadingFav] = useState(false);

  // Type icon mapping
  const getTypeIcon = (type) => {
    switch (type) {
      case 'Video':
        return <Video className="w-3.5 h-3.5" />;
      case 'Book':
        return <BookOpen className="w-3.5 h-3.5" />;
      case 'Documentation':
      case 'Cheatsheet':
        return <FileCode className="w-3.5 h-3.5" />;
      default:
        return <Layers className="w-3.5 h-3.5" />;
    }
  };

  const handleToggleFavourite = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      addToast('Please sign in to save resources to your library.', 'info');
      navigate('/login');
      return;
    }

    if (loadingFav) return;
    setLoadingFav(true);

    try {
      if (isFavourited) {
        await favouriteAPI.remove(resource._id);
        setIsFavourited(false);
        setFavCount((prev) => Math.max(0, prev - 1));
        addToast('Removed from your saved library.', 'info');
        if (onFavouriteToggle) onFavouriteToggle(resource._id, false);
      } else {
        await favouriteAPI.add(resource._id);
        setIsFavourited(true);
        setFavCount((prev) => prev + 1);
        addToast('Saved to your favourites!', 'success');
        if (onFavouriteToggle) onFavouriteToggle(resource._id, true);
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not update favourites.', 'error');
    } finally {
      setLoadingFav(false);
    }
  };

  const handleShareClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onShare) {
      onShare(resource);
    } else {
      const shareUrl = `${window.location.origin}/resources/${resource._id}`;
      navigator.clipboard.writeText(shareUrl);
      addToast('Resource link copied to clipboard!', 'success');
    }
  };

  // Default fallback image if thumbnail is absent
  const thumbnailSrc =
    resource.thumbnail ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card glass-card-hover rounded-2xl overflow-hidden flex flex-col group border border-slate-700/60 hover:border-violet-500/40"
    >
      {/* Thumbnail Header */}
      <div className="relative h-44 w-full overflow-hidden bg-navy-900">
        <img
          src={thumbnailSrc}
          alt={resource.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/40 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-navy-950/80 backdrop-blur-md text-brand-cyan border border-brand-cyan/30 shadow-sm pointer-events-auto">
            {getTypeIcon(resource.resourceType)}
            <span>{resource.resourceType || 'Course'}</span>
          </span>

          <div className="flex items-center gap-1.5 pointer-events-auto">
            <button
              onClick={handleShareClick}
              className="p-1.5 rounded-full bg-navy-950/80 backdrop-blur-md text-slate-300 hover:text-white hover:bg-navy-900 border border-slate-700/60 transition-colors"
              title="Share Resource"
              aria-label="Share Resource"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleToggleFavourite}
              disabled={loadingFav}
              className={`p-1.5 rounded-full backdrop-blur-md border transition-all ${
                isFavourited
                  ? 'bg-violet-600/90 text-white border-violet-400 shadow-glow-sm'
                  : 'bg-navy-950/80 text-slate-300 hover:text-white border-slate-700/60'
              }`}
              title={isFavourited ? 'Remove from saved' : 'Save to favourites'}
              aria-label="Favourite button"
            >
              <Bookmark className={`w-3.5 h-3.5 ${isFavourited ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Category Pill */}
        <div className="absolute bottom-3 left-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-medium bg-violet-950/90 text-violet-300 border border-violet-500/30 backdrop-blur-md">
            {resource.category}
          </span>
        </div>

        {/* Verified Free badge */}
        <div className="absolute bottom-3 right-3">
          <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            Free
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <Link
            to={`/resources/${resource._id}`}
            className="block text-base font-bold text-white hover:text-brand-cyan transition-colors line-clamp-1 group-hover:underline"
          >
            {resource.title}
          </Link>
          <p className="mt-2 text-xs text-slate-400 line-clamp-2 leading-relaxed">
            {resource.description}
          </p>

          {/* Tags */}
          {resource.tags && resource.tags.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {resource.tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700/40"
                >
                  #{tag}
                </span>
              ))}
              {resource.tags.length > 3 && (
                <span className="text-[10px] text-slate-500 self-center">
                  +{resource.tags.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer Meta & Actions */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-3">
            {/* Rating */}
            <div className="flex items-center gap-1 font-semibold text-amber-400">
              <Star className="w-3.5 h-3.5 fill-current" />
              <span>
                {resource.averageRating > 0
                  ? resource.averageRating.toFixed(1)
                  : 'New'}
              </span>
              {resource.numReviews > 0 && (
                <span className="text-slate-500 font-normal">
                  ({resource.numReviews})
                </span>
              )}
            </div>

            {/* Favourites count */}
            <div className="flex items-center gap-1 text-slate-400">
              <Bookmark className="w-3 h-3 text-violet-400" />
              <span>{favCount}</span>
            </div>
          </div>

          {/* Direct link or details */}
          <div className="flex items-center gap-2">
            <Link
              to={`/resources/${resource._id}`}
              className="text-xs font-semibold text-brand-cyan hover:underline"
            >
              Details
            </Link>
            <a
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white border border-slate-700/60 transition-colors"
              title="Open External Resource"
              aria-label="Open External Resource"
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
