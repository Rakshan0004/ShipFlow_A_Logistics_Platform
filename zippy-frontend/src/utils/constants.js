// Application Constants

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export const ORDER_STATUS = {
  ORDER_CREATED: 'ORDER_CREATED',
  CARRIER_SELECTED: 'CARRIER_SELECTED',
  SHIPMENT_CREATED: 'SHIPMENT_CREATED',
  CANCELLED: 'CANCELLED'
};

export const ORDER_STATUSES = {
  ORDER_CREATED: 'Order Created',
  CARRIER_SELECTED: 'Carrier Selected',
  SHIPMENT_CREATED: 'Shipment Created',
  PICKED_UP: 'Picked Up',
  IN_TRANSIT: 'In Transit',
  OUT_FOR_DELIVERY: 'Out for Delivery',
  DELIVERED: 'Delivered',
  DELIVERY_FAILED: 'Delivery Failed',
  RTO: 'RTO',
  CANCELLED: 'Cancelled'
};

export const SHIPMENT_STATUS = {
  SHIPMENT_CREATED: 'SHIPMENT_CREATED',
  PICKED_UP: 'PICKED_UP',
  IN_TRANSIT: 'IN_TRANSIT',
  OUT_FOR_DELIVERY: 'OUT_FOR_DELIVERY',
  DELIVERED: 'DELIVERED',
  DELIVERY_FAILED: 'DELIVERY_FAILED',
  RTO: 'RTO'
};

export const TERMINAL_STATUSES = [
  SHIPMENT_STATUS.DELIVERED,
  SHIPMENT_STATUS.RTO,
  SHIPMENT_STATUS.DELIVERY_FAILED,
  ORDER_STATUS.CANCELLED
];

export const CARRIER_CODES = {
  FASTSHIP: 'FASTSHIP',
  QUICKEXPRESS: 'QUICKEXPRESS',
  RELIABLE: 'RELIABLE'
};

export const CARRIER_NAMES = {
  FASTSHIP: 'FastShip',
  QUICKEXPRESS: 'QuickExpress',
  RELIABLE: 'ReliableCourier'
};

export const PAYMENT_TYPES = {
  PREPAID: 'PREPAID',
  COD: 'COD'
};

export const SORT_OPTIONS = {
  PRICE: 'price',
  DELIVERY_TIME: 'delivery',
  CARRIER: 'carrier'
};

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 20,
  SORT: 'createdAt',
  ORDER: 'desc'
};

export const POLLING_INTERVAL = {
  TRACKING: 5000,      // 5 seconds for active shipments
  DASHBOARD: 30000     // 30 seconds for dashboard stats
};

export const DEBOUNCE_DELAY = {
  SEARCH: 500,         // 500ms for search inputs
  RESIZE: 250          // 250ms for window resize
};

export const TOAST_DURATION = {
  SHORT: 3000,
  NORMAL: 5000,
  LONG: 8000
};

export const BREAKPOINTS = {
  SM: 640,
  MD: 768,
  LG: 1024,
  XL: 1280
};

export const STATUS_COLORS = {
  [ORDER_STATUS.ORDER_CREATED]: 'blue',
  [ORDER_STATUS.CARRIER_SELECTED]: 'purple',
  [ORDER_STATUS.SHIPMENT_CREATED]: 'cyan',
  [ORDER_STATUS.CANCELLED]: 'gray',
  [SHIPMENT_STATUS.SHIPMENT_CREATED]: 'cyan',
  [SHIPMENT_STATUS.PICKED_UP]: 'yellow',
  [SHIPMENT_STATUS.IN_TRANSIT]: 'orange',
  [SHIPMENT_STATUS.OUT_FOR_DELIVERY]: 'amber',
  [SHIPMENT_STATUS.DELIVERED]: 'green',
  [SHIPMENT_STATUS.DELIVERY_FAILED]: 'red',
  [SHIPMENT_STATUS.RTO]: 'gray'
};
