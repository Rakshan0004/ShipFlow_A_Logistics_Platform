// Health Check API Endpoint

import apiClient from '../client';

export const healthApi = {
  /**
   * Get system health status
   * @returns {Promise} API response
   */
  check: () => {
    return apiClient.get('/api/health');
  }
};
