// Rate API Endpoints

import apiClient from '../client';

export const ratesApi = {
  /**
   * Request rates from all couriers
   * @param {string} orderId - Order ID
   * @param {Object} params - Query parameters (sort, etc.)
   * @returns {Promise} API response
   */
  fetchRates: (orderId, params = {}) => {
    return apiClient.post(`/api/orders/${orderId}/rates`, null, { params });
  },

  /**
   * Get cached rates for an order
   * @param {string} orderId - Order ID
   * @returns {Promise} API response
   */
  getCachedRates: (orderId) => {
    return apiClient.get(`/api/orders/${orderId}/rates`);
  },

  /**
   * Select carrier for an order
   * @param {string} orderId - Order ID
   * @param {Object} selection - Carrier selection data
   * @returns {Promise} API response
   */
  selectCarrier: (orderId, selection) => {
    return apiClient.post(`/api/orders/${orderId}/select-carrier`, selection);
  }
};
