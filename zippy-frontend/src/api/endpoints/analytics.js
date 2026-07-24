// Analytics API Endpoints

import apiClient from '../client';

export const analyticsApi = {
  /**
   * Get courier performance metrics
   * @param {string} period - Time period (7d, 30d, 90d)
   * @returns {Promise} API response
   */
  getCourierPerformance: (period = '30d') => {
    return apiClient.get('/api/analytics/courier-performance', {
      params: { period }
    });
  },

  /**
   * Get order trends over time
   * @param {string} period - Time period (7d, 30d, 90d)
   * @returns {Promise} API response
   */
  getOrderTrends: (period = '7d') => {
    return apiClient.get('/api/analytics/order-trends', {
      params: { period }
    });
  }
};
