// Shipment API Endpoints

import apiClient from '../client';

export const shipmentsApi = {
  /**
   * Create shipment with selected carrier
   * @param {string} orderId - Order ID
   * @returns {Promise} API response
   */
  create: (orderId) => {
    return apiClient.post(`/api/orders/${orderId}/create-shipment`);
  },

  /**
   * Get active shipments (not in terminal state)
   * @returns {Promise} API response
   */
  getActive: () => {
    return apiClient.get('/api/shipments/active');
  }
};
