# Requirements — Frontend Redesign & API Enhancement

## Feature Overview

Transform the Zippy Logistics Platform from a basic single-page tab interface into a professional, production-ready application with modern UI/UX, proper routing, comprehensive features, and enhanced backend APIs suitable for HR review and production deployment.

---

## User Stories & Acceptance Criteria

### Epic 1: Modern UI Architecture

#### Requirement 1: React Router Implementation

**User Story:** As a user, I want proper page navigation with browser history support so that I can use back/forward buttons and bookmark specific pages.

**Acceptance Criteria:**
1. Application uses React Router v6 for all navigation
2. Browser back/forward buttons work correctly
3. URLs are bookmarkable and shareable
4. Page refreshes maintain current route state
5. 404 page displays for invalid routes
6. Navigation transitions are smooth without full page reloads

#### Requirement 2: Modern Layout System

**User Story:** As a user, I want a consistent layout with sidebar navigation so that I can easily access different sections of the application.

**Acceptance Criteria:**
1. Sidebar displays on all main app pages with navigation links
2. Sidebar highlights the active page
3. Navbar displays at the top with branding and quick actions
4. Layout is responsive - sidebar collapses on mobile
5. Public pages (like public tracking) use a different layout without sidebar
6. Smooth transitions between pages


#### Requirement 3: Reusable UI Component Library

**User Story:** As a developer, I want a consistent set of reusable UI components so that the application has a cohesive design and is easier to maintain.

**Acceptance Criteria:**
1. Button component with variants (primary, secondary, outline, ghost, danger)
2. Button supports different sizes (sm, md, lg)
3. Button shows loading state with spinner
4. Input components with consistent styling
5. Table component with sorting, pagination, and loading states
6. Modal/Dialog component with overlay and animations
7. Toast notification system for success/error messages
8. Card component with consistent styling
9. StatusBadge component for order/shipment statuses
10. EmptyState component for no-data scenarios
11. Loading skeleton components
12. All components follow the design system (colors, spacing, typography)

---

### Epic 2: Dashboard & Analytics

#### Requirement 4: Dashboard Overview Page

**User Story:** As a merchant, I want to see a dashboard with key metrics and recent activity so that I can quickly understand my logistics operations.

**Acceptance Criteria:**
1. Dashboard displays 4 key stat cards: Total Orders, Active Shipments, Delivered Today, Total Revenue
2. Each stat card shows the current value and trend indicator
3. Stat cards have loading skeletons while data loads
4. Dashboard shows courier distribution pie/bar chart
5. Dashboard displays recent orders table (last 10 orders)
6. Recent orders table shows: Order ID, Customer, Status, Date
7. "Create New Order" button prominent on dashboard
8. All data loads within 1 second
9. Dashboard auto-refreshes stats every 30 seconds (optional)
10. Error states display if API calls fail


#### Requirement 5: Analytics Page

**User Story:** As a merchant, I want to see analytics about courier performance and order trends so that I can make informed decisions about which couriers to use.

**Acceptance Criteria:**
1. Analytics page displays courier performance comparison
2. For each courier: total shipments, delivered on time, average delivery days, success rate, average cost
3. Order trends chart shows daily order count and revenue over selected period
4. Period selector allows: 7 days, 30 days, 90 days
5. Charts use appropriate visualization (bar chart, line chart)
6. Data is exportable to CSV (optional)
7. Loading states while fetching analytics data
8. Empty state if no data available

---

### Epic 3: Order Management

#### Requirement 6: Order List with Search & Filter

**User Story:** As a merchant, I want to view all my orders in a searchable, filterable list so that I can easily find specific orders and track their status.

**Acceptance Criteria:**
1. Order list displays in a sortable table with columns: Order ID, Merchant ID, Customer Name, Status, Amount, Created Date, Actions
2. Table supports sorting by any column (click header to sort)
3. Search bar allows searching by: Order ID, Merchant Order ID, Customer Name, Phone, Tracking Number
4. Search updates results as user types (debounced)
5. Status filter dropdown allows filtering by order status
6. Pagination displays with page numbers and prev/next buttons
7. Items per page selector (20, 50, 100)
8. "View" button on each row navigates to order details
9. Loading skeleton displays while fetching orders
10. Empty state displays if no orders match filters
11. Total count displays (e.g., "Showing 1-20 of 156 orders")
12. Table maintains sort/filter state when navigating back from details


#### Requirement 7: Enhanced Order Details Page

**User Story:** As a merchant, I want to view complete order details including customer info, package details, selected carrier, and tracking information in one place.

**Acceptance Criteria:**
1. Order details page displays all order information in organized sections
2. Sections: Order Summary, Customer Details, Pickup Address, Delivery Address, Package Info, Payment Info
3. If carrier selected: Display selected carrier card with service, quoted amount
4. If shipment created: Display shipment card with tracking number, current status
5. Display complete status history timeline with timestamps and locations
6. Status timeline uses visual indicators (icons, colors) for each status
7. "Track Shipment" button navigates to tracking page
8. "Cancel Order" button available if status is ORDER_CREATED or CARRIER_SELECTED
9. Cancellation shows confirmation modal before executing
10. Page updates in real-time if shipment status changes (polling every 5 seconds for active shipments)
11. Loading state while fetching order data
12. Error handling if order not found (404 message)

#### Requirement 8: Order Creation (Enhanced)

**User Story:** As a merchant, I want to create new orders with an intuitive form that validates inputs and provides helpful feedback.

**Acceptance Criteria:**
1. Order form includes all required fields with clear labels
2. Form validates inputs in real-time with error messages below fields
3. Phone validation: Indian mobile format (10 digits starting with 6-9)
4. Pincode validation: 6 digits
5. Email validation: standard email format
6. "Auto-Fill Sample Data" button populates with randomized test data
7. Payment type selector (COD/Prepaid) shows/hides COD amount field
8. Form submission disabled until all required fields valid
9. Loading state on submit button while creating order
10. Success: Navigate to rate comparison page automatically
11. Error: Display error message at top of form
12. Form data persists if user navigates away and returns (session storage)


#### Requirement 9: Rate Comparison (Enhanced)

**User Story:** As a merchant, I want to compare courier rates with clear pricing breakdown and sorting options so that I can choose the best shipping option.

**Acceptance Criteria:**
1. Rate comparison table displays all available rates from 3 couriers
2. Columns: Carrier, Service, Base Charge, COD Charge, Additional Charges, Tax, Total, Estimated Delivery, Select
3. Rates are color-coded: cheapest highlighted in green, fastest in blue
4. Sort dropdown allows sorting by: Lowest Price, Fastest Delivery, Carrier Name
5. Each rate shows estimated delivery as range (e.g., "2-3 days")
6. "Select" button on each rate row
7. Warning banner displays if any courier failed to respond
8. Loading state shows while fetching rates (parallel fetch from 3 couriers)
9. Empty state if no rates available
10. After selection: Show confirmation modal with selected rate details
11. Confirmation modal has "Confirm & Create Shipment" button
12. Navigation to shipment booking page after confirmation

---

### Epic 4: Tracking & Monitoring

#### Requirement 10: Internal Tracking Center

**User Story:** As a merchant, I want to see all active shipments and their current status so that I can monitor ongoing deliveries.

**Acceptance Criteria:**
1. Tracking center displays table of all active shipments (not DELIVERED, RTO, CANCELLED)
2. Columns: Order ID, Tracking Number, Carrier, Customer Name, Delivery City, Current Status, Last Updated, Actions
3. Status badges use color coding for visual quick scan
4. Table supports sorting and filtering by status
5. "View Details" button navigates to order details
6. Auto-refresh every 30 seconds for live updates
7. Loading state while fetching data
8. Empty state if no active shipments


#### Requirement 11: Public Tracking Page

**User Story:** As a customer, I want to track my shipment using the tracking number without needing to log in.

**Acceptance Criteria:**
1. Public tracking page accessible via /tracking/public/{trackingNumber}
2. Page displays carrier name, current status, estimated delivery date
3. Status timeline shows all tracking events with timestamps and descriptions
4. Delivery location shows city and pincode (no full address for privacy)
5. Page design is clean and customer-friendly
6. No authentication required
7. Error message if tracking number not found
8. Loading state while fetching tracking data
9. "Track Another Shipment" button to search again
10. Page is shareable (customer can share URL)

---

### Epic 5: Developer Tools

#### Requirement 12: Webhook Studio (Enhanced)

**User Story:** As a developer/tester, I want to simulate webhook events to test the tracking flow without waiting for real courier updates.

**Acceptance Criteria:**
1. Webhook studio page displays list of all shipments with tracking numbers
2. For each shipment: Display current status and available next status transitions
3. "Advance Status" button triggers next status in the flow
4. "Set Specific Status" allows jumping to any status (for testing invalid transitions)
5. Confirmation modal before triggering webhook
6. Success/error toast after webhook is sent
7. Status updates reflect immediately in the UI
8. Dropdown to select specific shipment from all active shipments
9. Manual tracking number input option
10. Display webhook payload preview before sending


---

### Epic 6: Backend API Enhancements

#### Requirement 13: Dashboard Statistics API

**User Story:** As a frontend developer, I need an API endpoint that returns aggregated statistics for the dashboard.

**Acceptance Criteria:**
1. GET /api/dashboard/stats returns JSON with dashboard metrics
2. Response includes: totalOrders, activeShipments, deliveredToday, totalRevenue
3. Response includes courierBreakdown (count per courier)
4. Response includes statusBreakdown (count per order status)
5. API response time < 500ms
6. Proper error handling with standard error response format
7. No authentication required (for this demo project)

#### Requirement 14: Order List API with Pagination

**User Story:** As a frontend developer, I need an API to fetch orders with pagination, sorting, and filtering.

**Acceptance Criteria:**
1. GET /api/orders accepts query params: page, limit, sort, order, status, search
2. Returns paginated response with data array and pagination metadata
3. Pagination metadata includes: currentPage, totalPages, totalItems, limit
4. Default: page=1, limit=20, sort=createdAt, order=desc
5. Sorting supports: createdAt, orderStatus, totalAmount
6. Status filter accepts order status values
7. Search is case-insensitive and searches across multiple fields
8. Response time < 300ms for typical page
9. Proper validation of query parameters


#### Requirement 15: Order Search API

**User Story:** As a frontend developer, I need a fast search API for finding orders by various fields.

**Acceptance Criteria:**
1. GET /api/orders/search?q={query} searches across multiple fields
2. Searches: orderId, merchantOrderId, customerName, customerPhone, trackingNumber
3. Search is case-insensitive and uses LIKE matching
4. Returns array of matching orders (max 50 results)
5. Response time < 400ms
6. Results sorted by relevance/created date
7. Empty array if no matches

#### Requirement 16: Analytics APIs

**User Story:** As a frontend developer, I need APIs for analytics data to power charts and reports.

**Acceptance Criteria:**
1. GET /api/analytics/courier-performance returns performance metrics per courier
2. Metrics include: totalShipments, deliveredOnTime, averageDeliveryDays, successRate, averageCost
3. GET /api/analytics/order-trends?period={7d|30d|90d} returns daily trends
4. Trends include: date, orderCount, deliveredCount, totalRevenue per day
5. Period defaults to 7d if not specified
6. Proper date formatting and timezone handling
7. Response time < 600ms

#### Requirement 17: Active Shipments API

**User Story:** As a frontend developer, I need an API to fetch all shipments that are not in terminal states.

**Acceptance Criteria:**
1. GET /api/shipments/active returns all non-terminal shipments
2. Terminal states excluded: DELIVERED, RTO, DELIVERY_FAILED, CANCELLED
3. Returns: orderId, trackingNumber, carrierCode, currentStatus, customerName, deliveryCity, estimatedDelivery, updatedAt
4. Sorted by updatedAt descending (most recent first)
5. Response time < 300ms


#### Requirement 18: Public Tracking API

**User Story:** As a frontend developer, I need a public API for customer tracking pages that doesn't expose sensitive merchant data.

**Acceptance Criteria:**
1. GET /api/tracking/public/{trackingNumber} is publicly accessible (no auth)
2. Returns sanitized tracking information suitable for customers
3. Includes: trackingNumber, carrierName, currentStatus, estimatedDelivery, events, delivery city/pincode
4. Excludes: merchant order ID, customer phone/email, full addresses, pricing
5. Returns 404 if tracking number not found
6. Response time < 200ms
7. Rate limiting to prevent abuse (100 requests per IP per minute)

#### Requirement 19: Order Cancellation API

**User Story:** As a frontend developer, I need an API to cancel orders before shipment creation.

**Acceptance Criteria:**
1. PATCH /api/orders/{orderId}/cancel cancels the order
2. Only allowed if orderStatus is ORDER_CREATED or CARRIER_SELECTED
3. Returns 409 Conflict if shipment already created
4. Updates orderStatus to CANCELLED
5. Records cancelledAt timestamp
6. Returns updated order response
7. Proper authorization check (for future auth implementation)

#### Requirement 20: Health Check API

**User Story:** As a DevOps engineer, I need a health check endpoint to monitor system and courier connectivity.

**Acceptance Criteria:**
1. GET /api/health returns system health status
2. Response includes: status (healthy/unhealthy), timestamp, services object
3. Services includes status for: database, fastship, quickexpress, reliable
4. Each service status: up, down, or unknown
5. Overall status is healthy if database is up (courier status is informational)
6. Response time < 100ms
7. No authentication required


#### Requirement 21: Recent Orders API

**User Story:** As a frontend developer, I need an API to fetch recent orders for the dashboard.

**Acceptance Criteria:**
1. GET /api/dashboard/recent-orders?limit={n} returns recent orders
2. Default limit is 10, max limit is 50
3. Returns: orderId, merchantOrderId, customerName, orderStatus, createdAt, deliveryCity
4. Sorted by createdAt descending
5. Response time < 200ms

---

### Epic 7: Technical Excellence

#### Requirement 22: Centralized API Client

**User Story:** As a developer, I want a centralized API client with error handling so that all API calls are consistent and maintainable.

**Acceptance Criteria:**
1. Axios instance configured with base URL and timeout
2. Request interceptor adds headers and can add loading state
3. Response interceptor handles errors globally
4. Error responses trigger toast notifications automatically
5. API client exported with organized endpoint modules
6. Custom hooks for API calls (useApi, usePolling)
7. Consistent error handling across all API calls
8. Retry logic for failed requests (optional, 3 retries max)

#### Requirement 23: Global State Management

**User Story:** As a developer, I want React Context for global state so that components can share data without prop drilling.

**Acceptance Criteria:**
1. ToastContext manages notification queue
2. Toast notifications auto-dismiss after 5 seconds
3. Toast supports types: success, error, warning, info
4. ThemeContext manages user preferences (future: light/dark mode)
5. Context providers wrap entire app in App.jsx
6. Custom hooks for consuming context (useToast, useTheme)


#### Requirement 24: Responsive Design

**User Story:** As a mobile user, I want the application to work well on my phone and tablet so that I can manage orders on the go.

**Acceptance Criteria:**
1. Mobile-first CSS approach with breakpoints at 640px, 768px, 1024px, 1280px
2. Sidebar collapses to hamburger menu on mobile
3. Tables become horizontally scrollable on mobile
4. Form inputs and buttons are touch-friendly (min 44px height)
5. Stats cards stack vertically on mobile (1 column)
6. Stats cards display 2 columns on tablet
7. Stats cards display 4 columns on desktop
8. All text is readable without zooming
9. Navigation is accessible with touch gestures
10. Tested on Chrome Mobile, Safari Mobile, and Firefox Mobile

#### Requirement 25: Performance Optimization

**User Story:** As a user, I want the application to load quickly and respond smoothly so that I can work efficiently.

**Acceptance Criteria:**
1. Initial page load < 2 seconds on 4G connection
2. Time to interactive < 3 seconds
3. Bundle size < 500KB gzipped
4. Code splitting for page components (lazy loading)
5. Images and assets optimized
6. API responses cached where appropriate
7. Search inputs debounced (500ms delay)
8. Lighthouse performance score > 90
9. No console errors or warnings in production build
10. Smooth 60fps animations


#### Requirement 26: Accessibility (WCAG 2.1 AA)

**User Story:** As a user with disabilities, I want the application to be accessible so that I can use it with assistive technologies.

**Acceptance Criteria:**
1. All interactive elements accessible via keyboard (Tab, Enter, Space, Escape)
2. Focus indicators visible on all interactive elements
3. ARIA labels on icons and icon-only buttons
4. Form inputs have associated labels
5. Error messages have role="alert"
6. Color contrast ratio ≥ 4.5:1 for normal text
7. Color contrast ratio ≥ 3:1 for large text and UI components
8. Skip to main content link available
9. Headings use semantic hierarchy (h1, h2, h3)
10. Tables have proper th headers with scope
11. Modal dialogs trap focus and return focus on close
12. Screen reader tested with NVDA/JAWS (optional)

#### Requirement 27: Error Handling & Loading States

**User Story:** As a user, I want clear feedback when actions are processing or when errors occur so that I understand what's happening.

**Acceptance Criteria:**
1. All buttons show loading state when action is processing
2. All data tables show skeleton loaders while fetching
3. Empty states display when no data available with helpful message
4. Error messages are specific and actionable (not generic "error occurred")
5. Toast notifications for success/error actions
6. Network errors show retry button
7. 404 pages have link back to dashboard
8. Form validation errors display inline below fields
9. Global error boundary catches unhandled errors gracefully
10. Loading spinners use accessible markup

---

## Non-Functional Requirements

### Performance Targets
- Dashboard load time: < 1 second
- Order list load time: < 500ms per page
- Search results: < 300ms
- API response time (95th percentile): < 1 second
- Bundle size: < 500KB gzipped


### Browser Support
- Chrome: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Edge: Last 2 versions

### Security
- Input validation on all form fields
- XSS prevention (sanitize user input)
- CORS configured correctly
- No sensitive data in localStorage
- Environment variables for configuration
- Rate limiting on public endpoints

### Code Quality
- ESLint configured with React rules
- Consistent code formatting (Prettier)
- Component modularity (max 300 lines per component)
- Proper prop types or TypeScript (optional)
- Clear folder structure
- Meaningful variable and function names

---

## Out of Scope (Future Enhancements)

The following features are explicitly out of scope for this phase:

1. **User Authentication** - No login/JWT required for demo
2. **Role-Based Access Control** - All users have full access
3. **Multi-Tenant Support** - Single merchant context
4. **Real-Time WebSockets** - Using polling instead
5. **Offline Support** - Requires internet connection
6. **PWA Features** - Not a progressive web app yet
7. **Internationalization** - English only
8. **Dark/Light Theme Toggle** - Dark theme only for now
9. **Advanced Reporting** - Basic analytics only
10. **Email Notifications** - No email integration
11. **SMS Notifications** - No SMS integration
12. **Shipment Label Printing** - Mock label URLs only
13. **Bulk Order Import** - Single order creation only
14. **Order Templates** - No saved templates
15. **Advanced Filtering** - Basic status filter only

---

## Success Criteria

This frontend redesign will be considered successful when:

✅ All 27 requirements are implemented and tested
✅ Application loads in < 2 seconds on standard connections
✅ All pages are responsive on mobile, tablet, and desktop
✅ WCAG 2.1 AA accessibility standards met
✅ Zero console errors in production build
✅ Lighthouse score > 90 for Performance and Accessibility
✅ All new backend APIs documented and tested
✅ Code review feedback incorporated
✅ HR reviewers provide positive feedback on UI/UX quality
✅ Demo video showcasing all features recorded

---

## Dependencies

- Existing backend APIs continue to work without breaking changes
- PostgreSQL database with current schema
- Mock courier services continue to operate
- Docker Compose setup for local development
- Existing project dependencies (React, Vite, Axios, React Router)

