// Order API Endpoints

import apiClient from '../client';

export const ordersApi = {
  /**
   * Get all orders with pagination, sorting, filtering
   * @param {Object} params - Query parameters
   * @returns {Promise} API response
   */
  getAll: (params) => {
    return apiClient.get('/api/orders', { params });
  },

  /**
   * Get order by ID
   * @param {string} orderId - Order ID
   * @returns {Promise} API response
   */
  getById: (orderId) => {
    return apiClient.get(`/api/orders/${orderId}`);
  },

  /**
   * Create new order
   * @param {Object} orderData - Order data
   * @returns {Promise} API response
   */
  create: (orderData) => {
    return apiClient.post('/api/orders', orderData);
  },

  /**
   * Search orders
   * @param {string} query - Search query
   * @returns {Promise} API response
   */
  search: (query) => {
    return apiClient.get('/api/orders/search', {
      params: { q: query }
    });
  },

  /**
   * Cancel order
   * @param {string} orderId - Order ID
   * @returns {Promise} API response
   */
  cancel: (orderId) => {
    return apiClient.patch(`/api/orders/${orderId}/cancel`);
  },

  /**
   * Export orders
   * @param {Object} filters - Export filters
   * @returns {Promise} API response
   */
  export: (filters) => {
    return apiClient.post('/api/orders/bulk-export', filters, {
      responseType: 'blob'
    });
  }
};
