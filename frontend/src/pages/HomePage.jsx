import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Sparkles,
  ArrowRight,
  BookOpen,
  Users,
  Star,
  Bookmark,
  Code,
  Layers,
  Database,
  Cpu,
  Palette,
  Terminal,
  TrendingUp,
  Clock,
  Compass,
  CheckCircle,
} from 'lucide-react';
import { resourceAPI, statsAPI } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import ResourceSkeleton from '../components/ResourceSkeleton';
import ShareModal from '../components/ShareModal';

export default function HomePage() {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [featuredResources, setFeaturedResources] = useState([]);
  const [recentResources, setRecentResources] = useState([]);
  const [trendingResources, setTrendingResources] = useState([]);
  const [activeTab, setActiveTab] = useState('recent'); // 'recent' | 'trending'
  const [stats, setStats] = useState({
    totalLearners: 0,
    totalResources: 0,
    totalReviews: 0,
    totalFavourites: 0,
  });
  const [loading, setLoading] = useState(true);
  const [shareResource, setShareResource] = useState(null);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [featRes, recRes, trendRes, statRes] = await Promise.all([
          resourceAPI.getFeatured(),
          resourceAPI.getAll({ limit: 6, sort: 'newest' }),
          resourceAPI.getTrending(),
          statsAPI.getSummary(),
        ]);

        if (featRes.data.success) setFeaturedResources(featRes.data.data);
        if (recRes.data.success) setRecentResources(recRes.data.data);
        if (trendRes.data.success) setTrendingResources(trendRes.data.data);
        if (statRes.data.success) setStats(statRes.data.data);
      } catch (err) {
        console.error('Error fetching homepage data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/explore');
    }
  };

  // Popular category cards
  const categories = [
    {
      name: 'Full Stack Development',
      icon: <Layers className="w-5 h-5 text-brand-cyan" />,
      color: 'from-cyan-500/20 to-blue-500/10',
      count: 'Roadmaps & MERN',
    },
    {
      name: 'React JS',
      icon: <Cpu className="w-5 h-5 text-sky-400" />,
      color: 'from-sky-500/20 to-indigo-500/10',
      count: 'Hooks & Next.js',
    },
    {
      name: 'JavaScript',
      icon: <Code className="w-5 h-5 text-amber-400" />,
      color: 'from-amber-500/20 to-orange-500/10',
      count: 'ES6+ & Async JS',
    },
    {
      name: 'Data Structures and Algorithms',
      icon: <Terminal className="w-5 h-5 text-brand-violet" />,
      color: 'from-violet-500/20 to-purple-500/10',
      count: 'LeetCode & Patterns',
    },
    {
      name: 'Interview Preparation',
      icon: <TrendingUp className="w-5 h-5 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/10',
      count: 'System Design & QA',
    },
    {
      name: 'UI/UX Design',
      icon: <Palette className="w-5 h-5 text-brand-pink" />,
      color: 'from-pink-500/20 to-rose-500/10',
      count: 'Figma & Design Systems',
    },
  ];

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="relative pt-12 pb-20 md:pt-20 md:pb-28 overflow-hidden">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          {/* Subtle top badge */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-violet-950/70 border border-violet-500/30 text-violet-300 text-xs sm:text-sm font-medium mb-8 backdrop-blur-md shadow-glow-sm"
          >
            <Sparkles className="w-4 h-4 text-brand-cyan" />
            <span>Discover Verified Free Educational Materials</span>
          </motion.div>

          {/* Animated Main Headline & Tagline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white leading-[1.15]"
          >
            Learn. Share.{' '}
            <span className="text-gradient inline-block">Grow.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Free Knowledge. Unlimited Possibilities.{' '}
            <span className="text-slate-400 block sm:inline">
              A community-curated nest bringing the web's best open courses, tutorials, and documentation into one place.
            </span>
          </motion.p>

          {/* Real-time Search Bar in Hero */}
          <motion.form
            onSubmit={handleSearchSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-10 max-w-2xl mx-auto"
          >
            <div className="relative flex items-center p-2 rounded-2xl bg-navy-900/90 border border-slate-700 shadow-2xl backdrop-blur-xl focus-within:border-violet-500 focus-within:ring-2 focus-within:ring-violet-500/30 transition-all">
              <Search className="w-5 h-5 text-slate-400 ml-3 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search free courses, React, Python, CS50, Algorithms..."
                className="w-full bg-transparent px-3 py-2 text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="btn-primary shrink-0 text-sm !py-2.5 !px-5"
              >
                Search
              </button>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 text-xs text-slate-400 flex-wrap">
              <span>Popular searches:</span>
              <button
                type="button"
                onClick={() => navigate('/explore?search=React')}
                className="hover:text-brand-cyan underline decoration-slate-600 underline-offset-4"
              >
                React JS
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/explore?search=Python')}
                className="hover:text-brand-cyan underline decoration-slate-600 underline-offset-4"
              >
                Python
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/explore?search=Harvard')}
                className="hover:text-brand-cyan underline decoration-slate-600 underline-offset-4"
              >
                Harvard CS50
              </button>
              <span>•</span>
              <button
                type="button"
                onClick={() => navigate('/explore?search=Algorithms')}
                className="hover:text-brand-cyan underline decoration-slate-600 underline-offset-4"
              >
                Algorithms
              </button>
            </div>
          </motion.form>

          {/* Quick CTA Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <Link
              to="/explore"
              className="btn-primary text-sm flex items-center gap-2"
            >
              <Compass className="w-4 h-4" />
              <span>Explore All Resources</span>
            </Link>
            <Link
              to="/add-resource"
              className="btn-secondary text-sm flex items-center gap-2"
            >
              <span>Share a Resource</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Real Platform Statistics (from MongoDB) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          <div className="glass-card rounded-2xl p-6 text-center border border-slate-700/60 shadow-lg">
            <div className="w-10 h-10 mx-auto rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3">
              <Users className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {stats.totalLearners}
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Active Learners
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center border border-slate-700/60 shadow-lg">
            <div className="w-10 h-10 mx-auto rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center text-violet-400 mb-3">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {stats.totalResources}
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Curated Resources
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center border border-slate-700/60 shadow-lg">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3">
              <Star className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {stats.totalReviews}
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Reviews & Ratings
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6 text-center border border-slate-700/60 shadow-lg">
            <div className="w-10 h-10 mx-auto rounded-xl bg-pink-500/10 border border-pink-500/20 flex items-center justify-center text-pink-400 mb-3">
              <Bookmark className="w-5 h-5" />
            </div>
            <div className="text-3xl font-extrabold text-white">
              {stats.totalFavourites}
            </div>
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">
              Saved to Libraries
            </div>
          </div>
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-brand-cyan text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-4 h-4" />
              <span>Handpicked Excellence</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              Featured Learning Resources
            </h2>
          </div>
          <Link
            to="/explore"
            className="text-sm font-semibold text-brand-cyan hover:text-white flex items-center gap-1.5 transition-colors self-start sm:self-auto"
          >
            <span>View all resources</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <ResourceSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredResources.map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onShare={setShareResource}
              />
            ))}
          </div>
        )}
      </section>

      {/* Popular Categories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
            Explore by Learning Domain
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            From modern web stacks to interview algorithms, jump straight into curated curriculums.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, idx) => (
            <Link
              key={idx}
              to={`/explore?category=${encodeURIComponent(cat.name)}`}
              className="glass-card glass-card-hover p-5 rounded-2xl flex items-center justify-between group border border-slate-700/60"
            >
              <div className="flex items-center gap-4">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${cat.color} flex items-center justify-center border border-white/10 group-hover:scale-105 transition-transform`}
                >
                  {cat.icon}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white group-hover:text-brand-cyan transition-colors">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">{cat.count}</p>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
            </Link>
          ))}
        </div>
      </section>

      {/* Tabbed Recently Added vs Trending Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 pb-4 border-b border-slate-800 gap-4">
          <div className="flex items-center gap-2 p-1 rounded-xl bg-navy-900 border border-slate-800">
            <button
              onClick={() => setActiveTab('recent')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'recent'
                  ? 'bg-violet-600 text-white shadow-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Recently Added</span>
            </button>
            <button
              onClick={() => setActiveTab('trending')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'trending'
                  ? 'bg-violet-600 text-white shadow-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Trending & Popular</span>
            </button>
          </div>

          <Link
            to={`/explore?sort=${activeTab === 'trending' ? 'popular' : 'newest'}`}
            className="text-xs font-semibold text-brand-cyan hover:underline flex items-center gap-1"
          >
            <span>Explore all {activeTab === 'trending' ? 'trending' : 'recent'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <ResourceSkeleton count={6} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'recent' ? recentResources : trendingResources).map((resource) => (
              <ResourceCard
                key={resource._id}
                resource={resource}
                onShare={setShareResource}
              />
            ))}
          </div>
        )}
      </section>

      {/* Community CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden p-8 sm:p-14 bg-gradient-to-r from-violet-950/60 via-navy-900 to-navy-950 border border-violet-500/30 shadow-2xl text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
              Join the Nest
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white">
              Know a great free resource? <br className="hidden sm:inline" />
              Help fellow learners discover it.
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              SkillNest thrives on community contributions. Submissions are reviewed for authenticity and stay free forever.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link
              to="/add-resource"
              className="btn-primary text-sm !py-3 !px-6"
            >
              Submit a Resource
            </Link>
            <Link
              to="/register"
              className="btn-secondary text-sm !py-3 !px-6"
            >
              Create Account
            </Link>
          </div>
        </div>
      </section>

      {/* Share Modal Dialog */}
      <ShareModal
        isOpen={!!shareResource}
        resource={shareResource}
        onClose={() => setShareResource(null)}
      />
    </div>
  );
}
