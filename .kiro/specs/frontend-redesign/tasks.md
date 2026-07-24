# Tasks

## Task 1: Project Setup & Folder Structure
**Priority:** Critical
**Dependencies:** None

Create new folder structure and set up foundation files including CSS variables, utilities, and constants.

### Sub-tasks
- Create api/ directory structure
- Create components/ directory with ui/, layouts/, features/, common/
- Create contexts/, pages/, styles/, utils/ directories
- Create global.css with CSS variables
- Create utilities.css and animations.css
- Create formatters.js and validators.js utilities

## Task 2: API Client Layer
**Priority:** Critical
**Dependencies:** Task 1

Build centralized axios client with interceptors and custom hooks for API calls.

### Sub-tasks
- Create axios instance with base configuration
- Implement request/response interceptors
- Create useApi, usePolling, usePagination hooks
- Create endpoint modules for orders, rates, shipments, tracking, dashboard, analytics

## Task 3: Context Providers
**Priority:** Critical
**Dependencies:** Task 1

Create React Context providers for global state management.

### Sub-tasks
- Create ToastContext with provider and hook
- Implement toast notification queue
- Create ToastContainer and Toast components
- Create ThemeContext for future enhancements
- Wrap App.jsx with providers

## Task 4: Core UI Components
**Priority:** Critical
**Dependencies:** Task 1

Build reusable UI component library following the design system.

### Sub-tasks
- Create Button component with variants
- Create Input, SearchInput, Select components
- Create Card, Modal components
- Create Table with sorting and Pagination
- Create StatusBadge, Badge components
- Create Skeleton, EmptyState, LoadingSpinner
- Write CSS for all components


## Task 5: Dashboard APIs (Backend)
**Priority:** Critical
**Dependencies:** Task 2

Implement backend APIs for dashboard statistics and recent orders.

### Sub-tasks
- Create DashboardController and DashboardService in backend
- Implement GET /api/dashboard/stats endpoint
- Implement GET /api/dashboard/recent-orders endpoint
- Create DTOs for responses
- Write unit tests
- Update API documentation

## Task 6: Order Management APIs (Backend)
**Priority:** Critical
**Dependencies:** Task 2

Enhance OrderController with pagination, search, and cancellation.

### Sub-tasks
- Implement GET /api/orders with pagination support
- Implement GET /api/orders/search endpoint
- Implement PATCH /api/orders/{id}/cancel endpoint
- Add custom repository queries
- Create DTOs and write tests
- Update API documentation

## Task 7: Analytics & Tracking APIs (Backend)
**Priority:** High
**Dependencies:** Task 2

Create analytics and public tracking endpoints.

### Sub-tasks
- Create AnalyticsController and AnalyticsService
- Implement courier performance and order trends endpoints
- Implement GET /api/shipments/active endpoint
- Create TrackingController with public endpoint
- Create HealthController with health check
- Write tests and update documentation

## Task 8: Layout Components & Router Setup
**Priority:** Critical
**Dependencies:** Task 3, Task 4

Build layout components and configure React Router.

### Sub-tasks
- Create Sidebar and Navbar components
- Create AppLayout and PublicLayout
- Create ErrorBoundary and NotFound page
- Configure React Router in App.jsx
- Set up all routes with proper layouts
- Test navigation


## Task 9: Dashboard Page
**Priority:** Critical
**Dependencies:** Task 4, Task 5, Task 8

Create dashboard overview page with stats and recent orders.

### Sub-tasks
- Create Dashboard.jsx page component
- Create StatsCard, RecentOrdersTable, CourierChart components
- Integrate dashboard APIs
- Implement loading and error states
- Style with grid layout and make responsive

## Task 10: Order List Page
**Priority:** Critical
**Dependencies:** Task 4, Task 6, Task 8

Create order list page with search, filter, sort, and pagination.

### Sub-tasks
- Create OrderList.jsx page component
- Integrate order list API
- Implement search with debouncing
- Implement status filter and sorting
- Implement pagination controls
- Add loading/empty states and make responsive

## Task 11: Order Create Page
**Priority:** Critical
**Dependencies:** Task 4, Task 6, Task 8

Migrate and enhance order creation form.

### Sub-tasks
- Migrate OrderForm to new structure
- Create OrderCreate.jsx wrapper
- Update validation and styling
- Integrate with API and add loading states
- Navigate to rate comparison on success

## Task 12: Order Details Page
**Priority:** Critical
**Dependencies:** Task 4, Task 6, Task 8

Create comprehensive order details page with tracking.

### Sub-tasks
- Create OrderDetails.jsx and detail cards
- Integrate order and tracking APIs
- Implement cancel order with confirmation
- Add polling for status updates
- Display status timeline and make responsive


## Task 13: Rate Comparison Page
**Priority:** Critical
**Dependencies:** Task 4, Task 8

Enhance rate comparison with better UI and confirmation flow.

### Sub-tasks
- Migrate RateComparisonTable to new structure
- Add color coding for cheapest/fastest
- Add confirmation modal for selection
- Integrate APIs and add loading states
- Update styling and make responsive

## Task 14: Tracking Center Page
**Priority:** High
**Dependencies:** Task 4, Task 7, Task 8

Create internal tracking center for active shipments.

### Sub-tasks
- Create TrackingCenter.jsx and ActiveShipmentsTable
- Integrate active shipments API
- Implement filtering and sorting
- Add auto-refresh every 30 seconds
- Add loading/empty states and make responsive

## Task 15: Public Tracking Page
**Priority:** High
**Dependencies:** Task 4, Task 7, Task 8

Create customer-facing public tracking page.

### Sub-tasks
- Create PublicTracking.jsx and search form
- Create PublicStatusTimeline component
- Integrate public tracking API
- Style for customer-friendly appearance
- Handle errors for invalid tracking numbers

## Task 16: Analytics Page
**Priority:** Medium
**Dependencies:** Task 4, Task 7, Task 8

Create analytics page with courier performance and trends.

### Sub-tasks
- Create Analytics.jsx page component
- Create CourierPerformanceCard and OrderTrendsChart
- Integrate analytics APIs
- Implement period selector
- Create chart visualizations and make responsive


## Task 17: Webhook Studio Page
**Priority:** Medium
**Dependencies:** Task 4, Task 8

Enhance webhook simulation interface.

### Sub-tasks
- Migrate SimulationPanel to new structure
- Create WebhookStudio.jsx wrapper
- Add shipment selector and status advancer
- Add confirmation and payload preview
- Show success/error feedback via toasts

## Task 18: Responsive Design Implementation
**Priority:** Medium
**Dependencies:** Task 9, Task 10, Task 11, Task 12, Task 13, Task 14, Task 15, Task 16, Task 17

Ensure all pages work on mobile, tablet, and desktop.

### Sub-tasks
- Review and fix mobile viewport (375px)
- Review and fix tablet viewport (768px)
- Fix sidebar collapse on mobile
- Make tables scrollable on mobile
- Ensure touch-friendly buttons (min 44px)
- Test on multiple browsers and devices

## Task 19: Performance Optimization
**Priority:** Medium
**Dependencies:** Task 18

Optimize bundle size and page load times.

### Sub-tasks
- Implement code splitting with React.lazy()
- Add Suspense with loading fallback
- Optimize assets and CSS
- Implement debouncing and React.memo
- Run Lighthouse audit and fix issues
- Optimize production build

## Task 20: Accessibility Implementation
**Priority:** Medium
**Dependencies:** Task 19

Ensure WCAG 2.1 AA compliance.

### Sub-tasks
- Add keyboard navigation support
- Add visible focus indicators
- Add ARIA labels to all interactive elements
- Verify color contrast ratios
- Add skip to main content link
- Implement modal focus trap
- Run Lighthouse accessibility audit


## Task 21: Testing & Quality Assurance
**Priority:** Medium
**Dependencies:** Task 20

Test all features end-to-end and fix bugs.

### Sub-tasks
- Test all pages with real backend data
- Test complete user flows
- Test error handling and loading states
- Test responsive design on real devices
- Test browser compatibility
- Run final Lighthouse audit
- Create test data for demo
- Document known issues

## Task 22: Documentation Updates
**Priority:** Low  
**Dependencies:** Task 21

Update all documentation with new features.

### Sub-tasks
- Update README with new structure
- Update API_CONTRACTS with new endpoints
- Update Postman collection
- Document component usage
- Add screenshots and demo guide

## Task 23: Docker & Deployment
**Priority:** Low
**Dependencies:** Task 22

Prepare for deployment and test Docker setup.

### Sub-tasks
- Update Dockerfile if needed
- Update docker-compose.yml
- Create nginx.conf for production
- Create .env.production
- Test Docker build and full stack
- Document deployment process
