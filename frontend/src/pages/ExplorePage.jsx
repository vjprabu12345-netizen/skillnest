import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search,
  Filter,
  SlidersHorizontal,
  RotateCcw,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Layers,
  X,
} from 'lucide-react';
import { resourceAPI } from '../services/api';
import ResourceCard from '../components/ResourceCard';
import ResourceSkeleton from '../components/ResourceSkeleton';
import ShareModal from '../components/ShareModal';
import { useDebounce } from '../hooks/useDebounce';

const CATEGORIES = [
  'All',
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
];

const RESOURCE_TYPES = [
  'All',
  'Course',
  'Article',
  'Video',
  'Documentation',
  'Book',
  'Interactive Tool',
  'Cheatsheet',
];

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Search & Filter States initialized from URL params if available
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';
  const initialSort = searchParams.get('sort') || 'newest';

  const [search, setSearch] = useState(initialSearch);
  const debouncedSearch = useDebounce(search, 300);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedType, setSelectedType] = useState('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState('All');
  const [sortBy, setSortBy] = useState(initialSort);
  const [page, setPage] = useState(1);

  const [resources, setResources] = useState([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 9,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [loading, setLoading] = useState(true);
  const [shareResource, setShareResource] = useState(null);

  // Sync category changes with URL search params
  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    setPage(1);
    const params = new URLSearchParams(searchParams);
    if (cat === 'All') {
      params.delete('category');
    } else {
      params.set('category', cat);
    }
    setSearchParams(params);
  };

  // Reset filters
  const handleResetFilters = () => {
    setSearch('');
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedDifficulty('All');
    setSortBy('newest');
    setPage(1);
    setSearchParams({});
  };

  // Fetch resources from API
  useEffect(() => {
    const fetchResources = async () => {
      setLoading(true);
      try {
        const params = {
          page,
          limit: 9,
          sort: sortBy,
        };
        if (debouncedSearch.trim()) params.search = debouncedSearch.trim();
        if (selectedCategory !== 'All') params.category = selectedCategory;
        if (selectedType !== 'All') params.resourceType = selectedType;
        if (selectedDifficulty !== 'All') params.difficulty = selectedDifficulty;

        const res = await resourceAPI.getAll(params);
        if (res.data.success) {
          setResources(res.data.data);
          setPagination(res.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load resources:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchResources();
  }, [debouncedSearch, selectedCategory, selectedType, selectedDifficulty, sortBy, page]);

  const hasActiveFilters =
    search.trim() !== '' ||
    selectedCategory !== 'All' ||
    selectedType !== 'All' ||
    selectedDifficulty !== 'All' ||
    sortBy !== 'newest';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Title & Search Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Explore Free Resources
          </h1>
          <p className="mt-1.5 text-sm text-slate-400">
            Browse through hundreds of verified free courses, tutorials, and documentation.
          </p>
        </div>

        {/* Search bar and Quick Sort */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by topic, keyword, or technology (e.g. React, Python, CS50)..."
              className="input-field pl-11 pr-10"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value);
                setPage(1);
              }}
              className="input-field !w-auto text-xs py-3 font-semibold bg-navy-900"
              aria-label="Sort Resources"
            >
              <option value="newest">Sort: Newest Added</option>
              <option value="popular">Sort: Most Popular</option>
              <option value="rating">Sort: Highest Rated</option>
              <option value="title">Sort: Alphabetical (A-Z)</option>
              <option value="oldest">Sort: Oldest First</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                className="btn-secondary !py-3 !px-3 text-xs flex items-center gap-1.5 text-slate-400 hover:text-white shrink-0"
                title="Reset all filters"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* Horizontal Category Scroll Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => handleCategorySelect(cat)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-violet-600 text-white shadow-glow-sm border border-violet-400'
                  : 'bg-navy-900/90 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Secondary Filters Bar (Resource Type & Difficulty) */}
        <div className="flex flex-wrap items-center justify-between gap-4 py-2 border-y border-slate-800/80 text-xs text-slate-400">
          <div className="flex flex-wrap items-center gap-4">
            {/* Resource Type */}
            <div className="flex items-center gap-1.5">
              <span>Type:</span>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPage(1);
                }}
                className="bg-navy-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {RESOURCE_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Difficulty */}
            <div className="flex items-center gap-1.5">
              <span>Difficulty:</span>
              <select
                value={selectedDifficulty}
                onChange={(e) => {
                  setSelectedDifficulty(e.target.value);
                  setPage(1);
                }}
                className="bg-navy-900 border border-slate-700/80 rounded-lg px-2.5 py-1 text-slate-200 focus:outline-none focus:border-violet-500"
              >
                {DIFFICULTIES.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <span>
              Showing <strong className="text-white">{resources.length}</strong> of{' '}
              <strong className="text-white">{pagination.total}</strong> verified resources
            </span>
          </div>
        </div>
      </div>

      {/* Main Resource Grid */}
      {loading ? (
        <ResourceSkeleton count={9} />
      ) : resources.length === 0 ? (
        /* Empty State */
        <div className="glass-card rounded-2xl p-12 text-center max-w-xl mx-auto space-y-4 border border-slate-800">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-violet-950/60 border border-violet-500/30 flex items-center justify-center text-violet-400">
            <BookOpen className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-white">No Learning Resources Found</h3>
          <p className="text-sm text-slate-400 leading-relaxed">
            We couldn't find any resources matching your search and filter criteria. Try adjusting your query or clear the active filters.
          </p>
          <div className="pt-2">
            <button
              onClick={handleResetFilters}
              className="btn-primary text-xs !py-2 !px-4"
            >
              Reset Filters
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              onShare={setShareResource}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={!pagination.hasPrevPage || loading}
            className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          <div className="flex items-center gap-1 text-xs px-2">
            {Array.from({ length: pagination.totalPages }).map((_, i) => {
              const pNum = i + 1;
              return (
                <button
                  key={pNum}
                  onClick={() => setPage(pNum)}
                  className={`w-8 h-8 rounded-lg font-semibold transition-all ${
                    pagination.page === pNum
                      ? 'bg-violet-600 text-white shadow-glow-sm'
                      : 'text-slate-400 hover:text-white hover:bg-navy-900'
                  }`}
                >
                  {pNum}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={!pagination.hasNextPage || loading}
            className="btn-secondary !py-2 !px-3 text-xs flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
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
