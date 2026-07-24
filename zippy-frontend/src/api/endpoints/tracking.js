// Tracking API Endpoints

import apiClient from '../client';

export const trackingApi = {
  /**
   * Get tracking information for an order
   * @param {string} orderId - Order ID
   * @returns {Promise} API response
   */
  getByOrderId: (orderId) => {
    return apiClient.get(`/api/orders/${orderId}/tracking`);
  },

  /**
   * Get public tracking information by tracking number
   * @param {string} trackingNumber - Tracking number
   * @returns {Promise} API response
   */
  getPublicTracking: (trackingNumber) => {
    return apiClient.get(`/api/tracking/public/${trackingNumber}`);
  }
};
