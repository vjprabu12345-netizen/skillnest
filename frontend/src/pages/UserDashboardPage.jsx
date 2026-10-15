import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User,
  BookOpen,
  Bookmark,
  PlusCircle,
  Edit2,
  Trash2,
  ExternalLink,
  Settings,
  Star,
  Sparkles,
  Calendar,
  Share2,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { resourceAPI, favouriteAPI, authAPI } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import ShareModal from '../components/ShareModal';

export default function UserDashboardPage() {
  const { user, updateUser, refreshUser } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState('resources'); // 'resources' | 'favourites' | 'settings'
  const [myResources, setMyResources] = useState([]);
  const [favourites, setFavourites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [shareResource, setShareResource] = useState(null);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    profileImage: user?.profileImage || '',
    learningInterests: (user?.learningInterests || []).join(', '),
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [resMy, resFav] = await Promise.all([
        resourceAPI.getMyResources(),
        favouriteAPI.getAll(),
      ]);

      if (resMy.data.success) setMyResources(resMy.data.data);
      if (resFav.data.success) {
        setFavourites(resFav.data.data.map((f) => f.resource).filter(Boolean));
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;
    try {
      await resourceAPI.delete(resourceId);
      addToast('Resource deleted successfully.', 'info');
      setMyResources((prev) => prev.filter((r) => r._id !== resourceId));
      refreshUser();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to delete resource.', 'error');
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const interestsArray = profileForm.learningInterests
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await authAPI.updateProfile({
        name: profileForm.name,
        bio: profileForm.bio,
        profileImage: profileForm.profileImage,
        learningInterests: interestsArray,
      });

      if (res.data.success) {
        updateUser(res.data.user);
        addToast('Profile updated successfully!', 'success');
      }
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to update profile.', 'error');
    } finally {
      setUpdatingProfile(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Profile Overview Banner */}
      <div className="glass-card rounded-3xl p-6 sm:p-8 border border-slate-700/80 shadow-2xl relative overflow-hidden">
        <div className="glow-orb-purple -top-20 -right-20 opacity-30" />
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {user?.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-20 h-20 rounded-2xl object-cover ring-2 ring-violet-500/50 shadow-glow-sm"
              />
            ) : (
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-violet-600 via-brand-purple to-brand-blue flex items-center justify-center text-white text-3xl font-extrabold shadow-glow-sm">
                {user?.name?.charAt(0) || 'U'}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-extrabold text-white">{user?.name}</h1>
                {user?.role === 'admin' && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-violet-500/20 text-violet-300 border border-violet-500/30">
                    Admin
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400">{user?.email}</p>
              <p className="text-xs text-slate-300 max-w-xl line-clamp-2 pt-1 font-normal">
                {user?.bio || 'Passionate learner on SkillNest.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <Link
              to="/add-resource"
              className="btn-primary text-xs !py-2.5 !px-4 flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Share Resource</span>
            </Link>
          </div>
        </div>

        {/* Contribution Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-8 pt-6 border-t border-slate-800">
          <div className="p-3.5 rounded-xl bg-navy-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Resources Shared</div>
            <div className="text-2xl font-extrabold text-white mt-1">
              {myResources.length}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-900/60 border border-slate-800/80">
            <div className="text-xs text-slate-400 font-medium">Saved to Library</div>
            <div className="text-2xl font-extrabold text-violet-400 mt-1">
              {favourites.length}
            </div>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-900/60 border border-slate-800/80 col-span-2 sm:col-span-1">
            <div className="text-xs text-slate-400 font-medium">Platform Role</div>
            <div className="text-2xl font-extrabold text-brand-cyan capitalize mt-1">
              {user?.role || 'Learner'}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'resources'
              ? 'bg-violet-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-white hover:bg-navy-900'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>My Shared Resources ({myResources.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('favourites')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'favourites'
              ? 'bg-violet-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-white hover:bg-navy-900'
          }`}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Library ({favourites.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
            activeTab === 'settings'
              ? 'bg-violet-600 text-white shadow-glow-sm'
              : 'text-slate-400 hover:text-white hover:bg-navy-900'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Profile Settings</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'resources' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading resources...</div>
          ) : myResources.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-4 max-w-lg mx-auto">
              <BookOpen className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">No Resources Shared Yet</h3>
              <p className="text-xs text-slate-400">
                You haven't contributed any learning resources to SkillNest yet. Share your favorite free courses or tutorials with other students.
              </p>
              <Link to="/add-resource" className="btn-primary text-xs inline-block">
                Share First Resource
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myResources.map((res) => (
                <div
                  key={res._id}
                  className="glass-card rounded-2xl overflow-hidden border border-slate-700/60 p-5 flex flex-col justify-between space-y-4 group"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded bg-violet-950/80 text-violet-300 border border-violet-500/30">
                        {res.category}
                      </span>
                      <span className="text-[11px] text-slate-400 font-medium">
                        {res.status === 'approved' ? (
                          <span className="text-emerald-400">● Live</span>
                        ) : (
                          <span className="text-amber-400">● {res.status}</span>
                        )}
                      </span>
                    </div>

                    <Link
                      to={`/resources/${res._id}`}
                      className="text-base font-bold text-white group-hover:text-brand-cyan transition-colors block line-clamp-1"
                    >
                      {res.title}
                    </Link>
                    <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      {res.description}
                    </p>
                  </div>

                  {/* Actions bar */}
                  <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-slate-400">
                      <span className="flex items-center gap-1 text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {res.averageRating > 0 ? res.averageRating.toFixed(1) : '0'}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bookmark className="w-3.5 h-3.5 text-violet-400" />
                        {res.favouritesCount || 0}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Link
                        to={`/resources/edit/${res._id}`}
                        className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white transition-colors"
                        title="Edit Resource"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </Link>
                      <button
                        onClick={() => handleDeleteResource(res._id)}
                        className="p-1.5 rounded-lg bg-navy-800 hover:bg-rose-950/40 text-slate-300 hover:text-rose-400 transition-colors"
                        title="Delete Resource"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg bg-navy-800 hover:bg-navy-750 text-slate-300 hover:text-white transition-colors"
                        title="Open External URL"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favourites' && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading saved items...</div>
          ) : favourites.length === 0 ? (
            <div className="glass-card rounded-2xl p-12 text-center border border-slate-800 space-y-4 max-w-lg mx-auto">
              <Bookmark className="w-10 h-10 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">Your Saved Library is Empty</h3>
              <p className="text-xs text-slate-400">
                Bookmark courses and articles on SkillNest by clicking the bookmark icon to view them anytime here.
              </p>
              <Link to="/explore" className="btn-primary text-xs inline-block">
                Browse Resources
              </Link>
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
        </div>
      )}

      {activeTab === 'settings' && (
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-700/80 max-w-2xl mx-auto shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6">Edit Profile Settings</h2>
          <form onSubmit={handleProfileSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={profileForm.name}
                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                readOnly
                className="input-field bg-navy-950/60 text-slate-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Avatar Image URL
              </label>
              <input
                type="text"
                value={profileForm.profileImage}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, profileImage: e.target.value })
                }
                placeholder="https://images.unsplash.com/photo-..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Bio / Learning Goal
              </label>
              <textarea
                value={profileForm.bio}
                onChange={(e) => setProfileForm({ ...profileForm, bio: e.target.value })}
                rows={3}
                placeholder="Tell others what you're learning or teaching..."
                className="input-field resize-none text-xs"
                maxLength={300}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Learning Interests (Comma separated)
              </label>
              <input
                type="text"
                value={profileForm.learningInterests}
                onChange={(e) =>
                  setProfileForm({ ...profileForm, learningInterests: e.target.value })
                }
                placeholder="React JS, Python, Algorithms, Full Stack"
                className="input-field"
              />
            </div>

            <div className="pt-3 flex justify-end">
              <button
                type="submit"
                disabled={updatingProfile}
                className="btn-primary text-xs !py-2.5 !px-5"
              >
                {updatingProfile ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>
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
