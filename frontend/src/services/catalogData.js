import fallbackList from './catalogData.json';

export const FALLBACK_RESOURCES = fallbackList;

export function filterFallbackCatalog(params = {}) {
  const {
    category = 'All',
    resourceType = 'All',
    difficulty = 'All',
    search = '',
    sort = 'newest',
    page = 1,
    limit = 9,
  } = params;

  let filtered = [...FALLBACK_RESOURCES];

  // Category filter
  if (category && category !== 'All') {
    const targetCat = category.toLowerCase().trim();
    filtered = filtered.filter((r) => {
      const itemCat = (r.category || '').toLowerCase().trim();
      if (itemCat === targetCat) return true;
      // Cross-match if category name matches any tag
      if (Array.isArray(r.tags) && r.tags.some((t) => t.toLowerCase() === targetCat)) {
        return true;
      }
      return false;
    });
  }

  // Resource Type filter
  if (resourceType && resourceType !== 'All') {
    const targetType = resourceType.toLowerCase().trim();
    filtered = filtered.filter(
      (r) => (r.resourceType || '').toLowerCase().trim() === targetType
    );
  }

  // Difficulty filter
  if (difficulty && difficulty !== 'All') {
    const targetDiff = difficulty.toLowerCase().trim();
    filtered = filtered.filter(
      (r) =>
        (r.difficulty || '').toLowerCase().trim() === targetDiff ||
        r.difficulty === 'All Levels'
    );
  }

  // Intelligent Search filter
  if (search && search.trim() !== '') {
    const terms = search
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .filter((t) => t.length > 0);

    filtered = filtered.filter((r) => {
      const searchSpace = `${r.title || ''} ${r.description || ''} ${r.category || ''} ${(r.tags || []).join(' ')}`.toLowerCase();
      // Match if every query word appears anywhere in the search space
      return terms.every((term) => searchSpace.includes(term));
    });
  }

  // If zero items matched the specific combination, relax sub-filters so the category always displays resources
  if (filtered.length === 0 && category && category !== 'All') {
    const targetCat = category.toLowerCase().trim();
    filtered = FALLBACK_RESOURCES.filter(
      (r) => (r.category || '').toLowerCase().trim() === targetCat
    );
  }

  // Sorting
  if (sort === 'popular') {
    filtered.sort((a, b) => (b.favouritesCount || 0) - (a.favouritesCount || 0));
  } else if (sort === 'rating') {
    filtered.sort((a, b) => (b.averageRating || 0) - (a.averageRating || 0));
  } else if (sort === 'title') {
    filtered.sort((a, b) => (a.title || '').localeCompare(b.title || ''));
  } else if (sort === 'oldest') {
    filtered.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
  } else {
    filtered.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  }

  const pageNum = parseInt(page, 10) || 1;
  const limitNum = parseInt(limit, 10) || 9;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limitNum) || 1;
  const startIndex = (pageNum - 1) * limitNum;
  const paginated = filtered.slice(startIndex, startIndex + limitNum);

  return {
    success: true,
    data: paginated,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
}

export function getSuggestedResources(count = 6) {
  return [...FALLBACK_RESOURCES]
    .filter((r) => r.isFeatured || (r.averageRating && r.averageRating >= 4.8))
    .slice(0, count);
}

