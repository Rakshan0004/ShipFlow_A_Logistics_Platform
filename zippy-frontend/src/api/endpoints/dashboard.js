// Dashboard API Endpoints

import apiClient from '../client';

export const dashboardApi = {
  /**
   * Get dashboard statistics
   * @returns {Promise} API response
   */
  getStats: () => {
    return apiClient.get('/api/dashboard/stats');
  },

  /**
   * Get recent orders for dashboard
   * @param {number} limit - Number of orders to fetch
   * @returns {Promise} API response
   */
  getRecentOrders: (limit = 10) => {
    return apiClient.get('/api/dashboard/recent-orders', {
      params: { limit }
    });
  }
};
