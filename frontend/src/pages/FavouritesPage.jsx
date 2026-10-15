import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bookmark, ArrowLeft, BookOpen, Compass } from 'lucide-react';
import { favouriteAPI } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import ResourceSkeleton from '../components/ResourceSkeleton';
import ShareModal from '../components/ShareModal';

export default function FavouritesPage() {
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareResource, setShareResource] = useState(null);

  const fetchFavourites = async () => {
    try {
      setLoading(true);
      const res = await favouriteAPI.getAll();
      if (res.data.success) {
        setFavourites(res.data.data.map((item) => item.resource).filter(Boolean));
      }
    } catch (err) {
      console.error('Failed to load saved resources:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFavourites();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Explore</span>
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
            <Bookmark className="w-8 h-8 text-violet-400 fill-violet-400/20" />
            <span>My Saved Library</span>
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            All your bookmarked learning resources, saved directly to your SkillNest account.
          </p>
        </div>

        <div className="text-xs text-slate-400">
          Total Saved: <strong className="text-white">{favourites.length}</strong> resources
        </div>
      </div>

      {loading ? (
        <ResourceSkeleton count={6} />
      ) : favourites.length === 0 ? (
        <div className="glass-card rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 border border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <Bookmark className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Saved Resources Yet</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            Click the bookmark icon on any course, documentation, or tutorial across SkillNest to build your personalized learning library.
          </p>
          <div className="pt-2">
            <Link to="/explore" className="btn-primary text-xs !py-2.5 !px-5 inline-flex items-center gap-2">
              <Compass className="w-4 h-4" />
              <span>Explore Educational Resources</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {favourites.map((res) => (
            <ResourceCard
              key={res._id}
              resource={res}
              onShare={setShareResource}
              onFavouriteToggle={(id, isFav) => {
                if (!isFav) {
                  setFavourites((prev) => prev.filter((r) => r._id !== id));
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!shareResource}
        resource={shareResource}
        onClose={() => setShareResource(null)}
      />
    </div>
  );
}
