// Validation Utility Functions

/**
 * Validate Indian mobile phone number
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid
 */
export function validatePhone(phone) {
  if (!phone) return false;
  
  // Remove any non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Indian mobile: 10 digits starting with 6-9
  const phoneRegex = /^[6-9]\d{9}$/;
  
  return phoneRegex.test(cleaned);
}

/**
 * Validate Indian pincode
 * @param {string} pincode - Pincode to validate
 * @returns {boolean} True if valid
 */
export function validatePincode(pincode) {
  if (!pincode) return false;
  
  // Indian pincode: exactly 6 digits
  const pincodeRegex = /^\d{6}$/;
  
  return pincodeRegex.test(pincode);
}

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid
 */
export function validateEmail(email) {
  if (!email) return false;
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  return emailRegex.test(email);
}

/**
 * Validate required field
 * @param {any} value - Value to validate
 * @returns {boolean} True if not empty
 */
export function validateRequired(value) {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (typeof value === 'number') return true;
  return Boolean(value);
}

/**
 * Validate number is positive
 * @param {number} value - Number to validate
 * @returns {boolean} True if positive
 */
export function validatePositiveNumber(value) {
  const num = Number(value);
  return !isNaN(num) && num > 0;
}

/**
 * Validate number is within range
 * @param {number} value - Number to validate
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {boolean} True if within range
 */
export function validateRange(value, min, max) {
  const num = Number(value);
  return !isNaN(num) && num >= min && num <= max;
}

/**
 * Validate tracking number format
 * @param {string} trackingNumber - Tracking number to validate
 * @returns {boolean} True if valid format
 */
export function validateTrackingNumber(trackingNumber) {
  if (!trackingNumber) return false;
  
  // Basic validation: alphanumeric, 8-20 characters
  const trackingRegex = /^[A-Z0-9]{8,20}$/i;
  
  return trackingRegex.test(trackingNumber);
}

/**
 * Validate order ID format
 * @param {string} orderId - Order ID to validate
 * @returns {boolean} True if valid format
 */
export function validateOrderId(orderId) {
  if (!orderId) return false;
  
  // Zippy order format: ZPY-ORD-{number}
  const zippyOrderRegex = /^ZPY-ORD-\d+$/;
  
  // Merchant order format: any non-empty string
  if (zippyOrderRegex.test(orderId)) return true;
  
  return orderId.trim().length > 0;
}

/**
 * Validate form data
 * @param {object} data - Form data object
 * @param {object} rules - Validation rules
 * @returns {object} Errors object
 */
export function validateForm(data, rules) {
  const errors = {};
  
  for (const [field, validators] of Object.entries(rules)) {
    const value = data[field];
    
    for (const validator of validators) {
      const result = validator(value);
      
      if (result !== true) {
        errors[field] = result;
        break; // Stop at first error for this field
      }
    }
  }
  
  return errors;
}

/**
 * Create validation rule: required
 * @param {string} message - Error message
 * @returns {function} Validator function
 */
export function required(message = 'This field is required') {
  return (value) => validateRequired(value) || message;
}

/**
 * Create validation rule: email
 * @param {string} message - Error message
 * @returns {function} Validator function
 */
export function email(message = 'Invalid email address') {
  return (value) => !value || validateEmail(value) || message;
}

/**
 * Create validation rule: phone
 * @param {string} message - Error message
 * @returns {function} Validator function
 */
export function phone(message = 'Invalid phone number') {
  return (value) => !value || validatePhone(value) || message;
}

/**
 * Create validation rule: pincode
 * @param {string} message - Error message
 * @returns {function} Validator function
 */
export function pincode(message = 'Invalid pincode') {
  return (value) => !value || validatePincode(value) || message;
}

/**
 * Create validation rule: minimum value
 * @param {number} min - Minimum value
 * @param {string} message - Error message
 * @returns {function} Validator function
 */
export function min(min, message = `Minimum value is ${min}`) {
  return (value) => !value || Number(value) >= min || message;
}

/**
 * Create validation rule: maximum value
 * @param {number} max - Maximum value
 * @param {string} message - Error message
 * @returns {function} Validator function
 */
export function max(max, message = `Maximum value is ${max}`) {
  return (value) => !value || Number(value) <= max || message;
}
