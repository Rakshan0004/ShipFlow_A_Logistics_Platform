// Payment API Endpoints

import apiClient from '../client';

export const paymentsApi = {
  /**
   * Get payment details for a specific order.
   * Auto-generates the payment record on the backend if it doesn't exist yet.
   * @param {string} orderId - Zippy Order ID (e.g. ZPY-ORD-10001)
   */
  getByOrderId: (orderId) => {
    return apiClient.get(`/api/payments/${orderId}`);
  },

  /**
   * Get paginated list of all payments with optional filters.
   * @param {Object} params - { page, size, paymentStatus, settlementStatus }
   */
  getAll: (params = {}) => {
    return apiClient.get('/api/payments', { params });
  },
};
