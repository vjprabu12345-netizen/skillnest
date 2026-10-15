import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ExternalLink,
  Bookmark,
  Share2,
  Flag,
  Star,
  Eye,
  Calendar,
  Layers,
  Sparkles,
  ArrowLeft,
  CheckCircle,
  FileCode,
  Video,
  BookOpen,
} from 'lucide-react';
import { resourceAPI, favouriteAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ReviewSection from '../components/ReviewSection';
import ReportModal from '../components/ReportModal';
import ShareModal from '../components/ShareModal';
import ResourceCard from '../components/ResourceCard';

export default function ResourceDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { addToast } = useToast();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFavourited, setIsFavourited] = useState(false);
  const [favCount, setFavCount] = useState(0);
  const [favLoading, setFavLoading] = useState(false);

  const [isReportOpen, setIsReportOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  const fetchResource = async () => {
    try {
      setLoading(true);
      const res = await resourceAPI.getById(id);
      if (res.data.success) {
        const data = res.data.data;
        setResource(data);
        setIsFavourited(data.isFavourited || false);
        setFavCount(data.favouritesCount || 0);

        // Save to Recently Viewed in localStorage
        try {
          const viewed = JSON.parse(localStorage.getItem('skillnest_recent_viewed') || '[]');
          const filtered = viewed.filter((item) => item._id !== data._id);
          filtered.unshift({
            _id: data._id,
            title: data.title,
            category: data.category,
            thumbnail: data.thumbnail,
          });
          localStorage.setItem('skillnest_recent_viewed', JSON.stringify(filtered.slice(0, 8)));
        } catch (e) {
          // ignore
        }
      }
    } catch (err) {
      console.error('Error fetching resource details:', err);
      addToast('Could not find the requested learning resource.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResource();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [id]);

  const handleToggleFavourite = async () => {
    if (!isAuthenticated) {
      addToast('Please sign in to save resources.', 'info');
      navigate('/login');
      return;
    }
    if (favLoading) return;
    setFavLoading(true);

    try {
      if (isFavourited) {
        await favouriteAPI.remove(resource._id);
        setIsFavourited(false);
        setFavCount((c) => Math.max(0, c - 1));
        addToast('Removed from favourites.', 'info');
      } else {
        await favouriteAPI.add(resource._id);
        setIsFavourited(true);
        setFavCount((c) => c + 1);
        addToast('Saved to your favourites!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Could not update favourites.', 'error');
    } finally {
      setFavLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-8 animate-pulse">
        <div className="h-6 w-32 bg-slate-800 rounded" />
        <div className="h-72 bg-slate-800 rounded-3xl" />
        <div className="h-10 w-2/3 bg-slate-800 rounded" />
        <div className="h-24 bg-slate-800/60 rounded" />
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-bold text-white">Resource Not Found</h2>
        <p className="text-sm text-slate-400">
          The educational resource you are looking for does not exist or may have been removed.
        </p>
        <Link to="/explore" className="btn-primary text-sm inline-block">
          Explore Other Resources
        </Link>
      </div>
    );
  }

  const thumbnailSrc =
    resource.thumbnail ||
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore Resources</span>
        </Link>
      </div>

      {/* Main Details Header / Hero Card */}
      <div className="glass-card rounded-3xl overflow-hidden border border-slate-700/80 shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Visual Banner */}
          <div className="lg:col-span-5 relative h-64 lg:h-auto min-h-[260px] bg-navy-900 overflow-hidden">
            <img
              src={thumbnailSrc}
              alt={resource.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-navy-950 via-navy-950/30 to-transparent lg:bg-gradient-to-r lg:from-transparent lg:to-navy-950" />
            <div className="absolute top-4 left-4">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-navy-950/80 backdrop-blur-md text-brand-cyan border border-brand-cyan/30 shadow-sm">
                {resource.resourceType || 'Course'}
              </span>
            </div>
            <div className="absolute bottom-4 left-4">
              <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-950/90 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                100% Free Resource
              </span>
            </div>
          </div>

          {/* Details Content */}
          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category & Stats Badges */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-3 py-1 rounded-lg font-semibold bg-violet-950/80 text-violet-300 border border-violet-500/30">
                  {resource.category}
                </span>
                <span className="px-2.5 py-1 rounded-lg font-medium bg-slate-800/80 text-slate-300 border border-slate-700/50">
                  Difficulty: {resource.difficulty || 'All Levels'}
                </span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight leading-snug">
                {resource.title}
              </h1>

              {/* Author & Metrics */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-1 border-t border-slate-800/80">
                <div className="flex items-center gap-2">
                  {resource.author?.profileImage ? (
                    <img
                      src={resource.author.profileImage}
                      alt={resource.author.name}
                      className="w-6 h-6 rounded-full object-cover ring-1 ring-violet-500/40"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-violet-600 flex items-center justify-center text-white text-[10px] font-bold">
                      {resource.author?.name?.charAt(0) || 'U'}
                    </div>
                  )}
                  <span>
                    Shared by <strong className="text-slate-200">{resource.author?.name || 'Educator'}</strong>
                  </span>
                </div>

                <div className="flex items-center gap-1 text-amber-400 font-semibold">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span>
                    {resource.averageRating > 0
                      ? resource.averageRating.toFixed(1)
                      : 'Unrated'}{' '}
                    ({resource.numReviews} {resource.numReviews === 1 ? 'review' : 'reviews'})
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                  <span>{resource.views || 0} views</span>
                </div>
              </div>

              {/* Tags */}
              {resource.tags && resource.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {resource.tags.map((t, idx) => (
                    <span
                      key={idx}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800/80 text-slate-300 border border-slate-700/40"
                    >
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-slate-800">
              <a
                href={resource.url}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary text-sm !py-3 !px-6 flex items-center gap-2 shadow-glow-sm"
              >
                <span>Access Free Resource</span>
                <ExternalLink className="w-4 h-4" />
              </a>

              <button
                onClick={handleToggleFavourite}
                disabled={favLoading}
                className={`btn-secondary text-sm !py-3 !px-4 flex items-center gap-2 transition-all ${
                  isFavourited ? '!border-violet-500 !bg-violet-950/40 text-violet-300' : ''
                }`}
              >
                <Bookmark className={`w-4 h-4 ${isFavourited ? 'fill-current text-violet-400' : ''}`} />
                <span>{isFavourited ? 'Saved in Library' : 'Save to Library'}</span>
                <span className="text-xs text-slate-400">({favCount})</span>
              </button>

              <button
                onClick={() => setIsShareOpen(true)}
                className="btn-secondary text-sm !py-3 !px-3"
                title="Share Resource"
                aria-label="Share Resource"
              >
                <Share2 className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsReportOpen(true)}
                className="p-3 text-slate-400 hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors ml-auto"
                title="Report issue or broken link"
                aria-label="Report issue"
              >
                <Flag className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Description & Overview */}
      <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-700/80 space-y-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-brand-cyan" />
          <span>About this Learning Resource</span>
        </h2>
        <div className="text-slate-300 text-sm sm:text-base leading-relaxed whitespace-pre-line">
          {resource.description}
        </div>

        {/* Verification guarantee */}
        <div className="mt-8 p-4 rounded-2xl bg-navy-900/90 border border-slate-800 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-xs text-slate-300 leading-relaxed">
            <strong className="text-white">SkillNest Verification:</strong> This resource points to open, publicly accessible educational material verified by the community. If the destination URL is expired or paywalled, please click the flag icon to let our moderators know.
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ReviewSection
        resourceId={resource._id}
        onRatingUpdated={(stats) => {
          if (stats) {
            setResource((prev) => ({
              ...prev,
              averageRating: stats.averageRating,
              numReviews: stats.numReviews,
            }));
          } else {
            fetchResource();
          }
        }}
      />

      {/* Related Resources */}
      {resource.related && resource.related.length > 0 && (
        <div className="space-y-6 pt-6">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-violet-400" />
            <span>Related in {resource.category}</span>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {resource.related.map((rel) => (
              <Link
                key={rel._id}
                to={`/resources/${rel._id}`}
                className="glass-card glass-card-hover rounded-xl p-4 border border-slate-800 block space-y-2 group"
              >
                <div className="text-xs font-semibold text-brand-cyan">{rel.resourceType}</div>
                <h4 className="text-sm font-bold text-white group-hover:text-violet-300 transition-colors line-clamp-1">
                  {rel.title}
                </h4>
                <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800">
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3 h-3 fill-current" />
                    {rel.averageRating > 0 ? rel.averageRating.toFixed(1) : 'New'}
                  </span>
                  <span className="flex items-center gap-1">
                    <Bookmark className="w-3 h-3 text-violet-400" />
                    {rel.favouritesCount || 0}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      <ReportModal
        isOpen={isReportOpen}
        resource={resource}
        onClose={() => setIsReportOpen(false)}
      />
      <ShareModal
        isOpen={isShareOpen}
        resource={resource}
        onClose={() => setIsShareOpen(false)}
      />
    </div>
  );
}
