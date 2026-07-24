// Custom Hook for Pagination State Management

import { useState, useCallback } from 'react';
import { PAGINATION_DEFAULTS } from '../../utils/constants';

/**
 * Custom hook for managing pagination state
 * @param {Object} initialConfig - Initial pagination config
 * @returns {Object} Pagination state and controls
 */
export function usePagination(initialConfig = {}) {
  const [page, setPage] = useState(initialConfig.page || PAGINATION_DEFAULTS.PAGE);
  const [limit, setLimit] = useState(initialConfig.limit || PAGINATION_DEFAULTS.LIMIT);
  const [sortBy, setSortBy] = useState(initialConfig.sort || PAGINATION_DEFAULTS.SORT);
  const [sortOrder, setSortOrder] = useState(initialConfig.order || PAGINATION_DEFAULTS.ORDER);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const goToPage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  const nextPage = useCallback(() => {
    setPage((prev) => Math.min(prev + 1, totalPages));
  }, [totalPages]);

  const previousPage = useCallback(() => {
    setPage((prev) => Math.max(prev - 1, 1));
  }, []);

  const changeLimit = useCallback((newLimit) => {
    setLimit(newLimit);
    setPage(1); // Reset to first page when changing limit
  }, []);

  const changeSort = useCallback((newSortBy) => {
    if (sortBy === newSortBy) {
      // Toggle sort order if clicking same column
      setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortBy(newSortBy);
      setSortOrder('desc'); // Default to descending for new column
    }
  }, [sortBy]);

  const updatePaginationInfo = useCallback((info) => {
    setTotalPages(info.totalPages || 0);
    setTotalItems(info.totalItems || 0);
  }, []);

  const reset = useCallback(() => {
    setPage(PAGINATION_DEFAULTS.PAGE);
    setLimit(PAGINATION_DEFAULTS.LIMIT);
    setSortBy(PAGINATION_DEFAULTS.SORT);
    setSortOrder(PAGINATION_DEFAULTS.ORDER);
    setTotalPages(0);
    setTotalItems(0);
  }, []);

  return {
    page,
    limit,
    sortBy,
    sortOrder,
    totalPages,
    totalItems,
    goToPage,
    nextPage,
    previousPage,
    changeLimit,
    changeSort,
    updatePaginationInfo,
    reset,
    // Helper computed properties
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
    startItem: totalItems > 0 ? (page - 1) * limit + 1 : 0,
    endItem: Math.min(page * limit, totalItems)
  };
}
