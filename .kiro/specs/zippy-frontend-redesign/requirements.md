# Requirements Document: Zippy Logistics Platform Frontend Redesign & Backend API Enhancement

## Introduction

This document specifies the requirements for transforming the Zippy Logistics Platform from a basic tab-based single-page application into a modern, production-ready logistics management system. The redesign encompasses a complete React architecture overhaul with proper routing, a reusable component library, 12 new backend API endpoints, comprehensive dashboard and analytics features, and enhanced user experience with animations and responsive design.

The system maintains backward compatibility with existing order, rate, and shipment functionality while adding significant new capabilities for order management, tracking, analytics, and bulk operations.

## Glossary

- **Frontend**: React-based single-page application running on port 3000
- **Backend**: Spring Boot API server running on port 8080
- **Order**: A shipment request created by a merchant containing pickup/delivery addresses and package details
- **Rate**: Shipping cost quote from a courier for a specific service
- **Shipment**: A booked delivery after selecting a carrier and service
- **Carrier**: One of three mock courier services (FastShip, QuickExpress, ReliableCourier)
- **Component_Library**: Reusable UI components (Button, Input, Modal, Table, etc.)
- **API_Client**: Centralized Axios instance with interceptors for all backend communication
- **Route**: URL path in the application managed by React Router v6
- **Context**: React Context API for global state (Toast, Preferences)
- **Dashboard**: Overview page displaying statistics and recent activity
- **Analytics**: Performance metrics and trends for orders and couriers
- **Tracking_Center**: Internal interface for tracking shipment status
- **Public_Tracking**: Customer-facing tracking page with no authentication
- **Webhook_Studio**: Testing interface for simulating courier status events


## Requirements

### Requirement 1: React Router Navigation System

**User Story:** As a user, I want to navigate between different sections of the application using URLs, so that I can bookmark pages, use browser back/forward buttons, and share specific page links.

#### Acceptance Criteria

1. WHEN the application loads, THE Frontend SHALL use React Router v6 for all navigation
2. WHEN a user navigates to the root path "/", THE Frontend SHALL redirect to "/dashboard"
3. THE Frontend SHALL render an AppLayout component containing Navbar, Sidebar, and main content area for all authenticated routes
4. WHEN a user clicks a navigation link, THE Frontend SHALL update the URL and render the appropriate page component without full page reload
5. THE Frontend SHALL maintain navigation state across page transitions
6. WHEN a user bookmarks a page URL, THE Frontend SHALL render the correct page component when the bookmark is accessed
7. THE Frontend SHALL handle 404 errors for invalid routes with an appropriate error page

### Requirement 2: Dashboard Overview Page

**User Story:** As a merchant, I want to see an overview of my logistics operations at a glance, so that I can quickly understand my business performance and recent activity.

#### Acceptance Criteria

1. WHEN a user navigates to "/dashboard", THE Frontend SHALL display the Dashboard page
2. THE Frontend SHALL call GET /api/dashboard/stats to retrieve aggregate statistics
3. WHEN dashboard stats are loaded, THE Frontend SHALL display four stat cards showing total orders, active shipments, delivered today, and revenue
4. THE Frontend SHALL call GET /api/dashboard/recent-orders to retrieve recent order activity
5. WHEN recent orders are loaded, THE Frontend SHALL display a table with the 10 most recent orders
6. THE Frontend SHALL display courier distribution breakdown using the data from dashboard stats
7. THE Frontend SHALL display order status breakdown using the data from dashboard stats
8. WHEN stat data includes trend information, THE Frontend SHALL display trend percentage with up/down indicator
9. THE Frontend SHALL refresh dashboard data when the page is loaded
10. WHEN API calls fail, THE Frontend SHALL display error toast notifications and show empty states with retry options


### Requirement 3: Order List with Pagination and Filtering

**User Story:** As a merchant, I want to view all my orders in a searchable and filterable list, so that I can quickly find specific orders and manage them efficiently.

#### Acceptance Criteria

1. WHEN a user navigates to "/orders", THE Frontend SHALL display the Order List page
2. THE Frontend SHALL call GET /api/orders with pagination parameters (page, pageSize, sortBy, sortDirection)
3. WHEN order data is loaded, THE Frontend SHALL display orders in a sortable data table
4. THE Frontend SHALL provide a search input that calls GET /api/orders/search when a query is entered
5. WHEN a user enters a search query, THE Frontend SHALL debounce the input and search after 500ms of inactivity
6. THE Frontend SHALL provide status filter dropdown with all order statuses
7. THE Frontend SHALL provide date range filter for filtering orders by creation date
8. WHEN filters are applied, THE Frontend SHALL update the API call with filter parameters and refresh the table
9. THE Frontend SHALL provide column sorting for orderId, customerName, orderStatus, totalCharge, and createdAt
10. WHEN a column header is clicked, THE Frontend SHALL toggle sort direction and refresh data
11. THE Frontend SHALL display pagination controls showing current page, total pages, and page navigation buttons
12. WHEN pagination controls are used, THE Frontend SHALL update the page parameter and load new data
13. THE Frontend SHALL display a "Create Order" button that navigates to "/orders/new"
14. WHEN a user clicks on an order row, THE Frontend SHALL navigate to "/orders/{orderId}"
15. THE Frontend SHALL display loading skeletons while order data is being fetched


### Requirement 4: Order Creation Form

**User Story:** As a merchant, I want to create new orders through a user-friendly form, so that I can request shipping services for my packages.

#### Acceptance Criteria

1. WHEN a user navigates to "/orders/new", THE Frontend SHALL display the Order Creation form
2. THE Frontend SHALL provide input fields for merchant order ID, customer name, phone, and email with validation
3. THE Frontend SHALL provide address input groups for pickup address (addressLine1, city, state, pincode)
4. THE Frontend SHALL provide address input groups for delivery address (addressLine1, city, state, pincode)
5. THE Frontend SHALL provide package detail inputs (weight in grams, length, width, height in cm)
6. THE Frontend SHALL provide payment type selection (PREPAID or COD)
7. WHEN payment type is COD, THE Frontend SHALL display and require COD amount input field
8. WHEN payment type is PREPAID, THE Frontend SHALL hide COD amount field
9. THE Frontend SHALL validate pincode format as 6-digit numeric string
10. THE Frontend SHALL validate phone number format as 10-digit number starting with 6-9
11. THE Frontend SHALL validate email format using standard email regex
12. THE Frontend SHALL validate weight as positive number greater than zero
13. THE Frontend SHALL validate dimensions as positive numbers
14. WHEN form validation fails, THE Frontend SHALL display error messages below invalid fields
15. WHEN the user submits a valid form, THE Frontend SHALL call POST /api/orders with the order data
16. WHEN order creation succeeds, THE Frontend SHALL show success toast and navigate to "/orders/{orderId}/rates"
17. WHEN order creation fails, THE Frontend SHALL display error toast with the error message
18. THE Frontend SHALL display a loading state on the submit button during API call


### Requirement 5: Rate Comparison Interface

**User Story:** As a merchant, I want to compare shipping rates from different couriers side by side, so that I can choose the most cost-effective or fastest delivery option.

#### Acceptance Criteria

1. WHEN a user navigates to "/orders/{orderId}/rates", THE Frontend SHALL display the Rate Comparison page
2. THE Frontend SHALL call POST /api/orders/{orderId}/rates to fetch rates from all couriers
3. WHEN rate data is loading, THE Frontend SHALL display loading skeletons
4. WHEN rates are received, THE Frontend SHALL display all shipping options in a sortable table
5. THE Frontend SHALL display columns for carrier name, service name, base charge, COD charge, additional charges, tax, total charge, and estimated delivery days
6. THE Frontend SHALL provide sort controls for sorting by lowest price, fastest delivery, and carrier name
7. WHEN a sort option is selected, THE Frontend SHALL re-order the rate table accordingly
8. THE Frontend SHALL display a "Select" button for each rate option
9. WHEN warnings are returned (courier failures), THE Frontend SHALL display warning messages above the rate table
10. WHEN a user clicks "Select" on a rate, THE Frontend SHALL call POST /api/orders/{orderId}/select-carrier with carrier details
11. WHEN carrier selection succeeds, THE Frontend SHALL navigate to "/orders/{orderId}" and show success toast
12. WHEN carrier selection fails, THE Frontend SHALL display error toast
13. WHEN no rates are available, THE Frontend SHALL display an empty state with retry option
14. THE Frontend SHALL highlight recommended rates based on best price or fastest delivery
15. THE Frontend SHALL format currency values with proper locale formatting


### Requirement 6: Order Detail View with Tracking

**User Story:** As a merchant, I want to view comprehensive details of an order including its tracking history, so that I can monitor shipment progress and access all order information in one place.

#### Acceptance Criteria

1. WHEN a user navigates to "/orders/{orderId}", THE Frontend SHALL display the Order Detail page
2. THE Frontend SHALL call GET /api/orders/{orderId} to retrieve complete order details
3. WHEN order data is loaded, THE Frontend SHALL display order status with a status timeline component
4. THE Frontend SHALL display customer details including name, phone, and email
5. THE Frontend SHALL display pickup and delivery addresses in formatted address blocks
6. THE Frontend SHALL display package details including weight, dimensions, payment type, and COD amount
7. WHEN the order has a selected carrier, THE Frontend SHALL display carrier selection details with quoted amount
8. WHEN the order has a shipment, THE Frontend SHALL display tracking number and carrier information
9. WHEN the order has a shipment, THE Frontend SHALL call GET /api/orders/{orderId}/tracking to retrieve tracking events
10. WHEN tracking events are loaded, THE Frontend SHALL display them in a vertical timeline with status, description, location, and timestamp
11. THE Frontend SHALL provide a "Create Shipment" button when carrier is selected but shipment not created
12. WHEN "Create Shipment" is clicked, THE Frontend SHALL call POST /api/orders/{orderId}/create-shipment
13. WHEN shipment creation succeeds, THE Frontend SHALL refresh order data and display tracking information
14. THE Frontend SHALL provide a "Cancel Order" button when order can be cancelled (before shipment creation)
15. WHEN "Cancel Order" is clicked, THE Frontend SHALL show confirmation modal
16. WHEN cancellation is confirmed, THE Frontend SHALL call PATCH /api/orders/{orderId}/cancel
17. WHEN cancellation succeeds, THE Frontend SHALL update order status to CANCELLED
18. THE Frontend SHALL provide a "Print" button for printing order details
19. WHEN order is not found, THE Frontend SHALL display a 404 error page


### Requirement 7: Public Tracking Page

**User Story:** As a customer, I want to track my shipment using a tracking number without logging in, so that I can monitor my delivery progress.

#### Acceptance Criteria

1. WHEN a user navigates to "/tracking/{trackingNumber}", THE Frontend SHALL display the Public Tracking page
2. THE Frontend SHALL call GET /api/tracking/public/{trackingNumber} without authentication
3. WHEN tracking data is loaded, THE Frontend SHALL display carrier name and tracking number
4. THE Frontend SHALL display current shipment status with a prominent status badge
5. THE Frontend SHALL display estimated delivery date
6. THE Frontend SHALL display origin and destination cities with pincodes
7. THE Frontend SHALL display tracking events in a vertical timeline ordered by timestamp
8. THE Frontend SHALL format event timestamps in a human-readable format
9. WHEN proof of delivery is available, THE Frontend SHALL display delivery confirmation details
10. THE Frontend SHALL provide a "Share Tracking Link" button to copy the tracking URL
11. WHEN tracking number is not found, THE Frontend SHALL display a "not found" message with search option
12. THE Frontend SHALL not display any sensitive customer information (phone, email, full address)
13. THE Frontend SHALL work without authentication or authorization

### Requirement 8: Tracking Search Interface

**User Story:** As a merchant, I want to search for shipments by tracking number or order ID, so that I can quickly access tracking information.

#### Acceptance Criteria

1. WHEN a user navigates to "/tracking", THE Frontend SHALL display the Tracking Search page
2. THE Frontend SHALL provide a search input for entering tracking number or order ID
3. WHEN a user submits the search, THE Frontend SHALL determine if input is a tracking number or order ID
4. WHEN input is a tracking number, THE Frontend SHALL navigate to "/tracking/{trackingNumber}"
5. WHEN input is an order ID, THE Frontend SHALL navigate to "/orders/{orderId}"
6. THE Frontend SHALL display recent searches from localStorage
7. WHEN a user clicks a recent search, THE Frontend SHALL perform that search again
8. THE Frontend SHALL call GET /api/shipments/active to display all active in-transit shipments
9. WHEN active shipments are loaded, THE Frontend SHALL display them in a list with current status and estimated delivery
10. WHEN a user clicks an active shipment, THE Frontend SHALL navigate to the order detail page


### Requirement 9: Analytics Dashboard

**User Story:** As a merchant, I want to view analytics about my shipments and courier performance, so that I can make data-driven decisions about which couriers to use.

#### Acceptance Criteria

1. WHEN a user navigates to "/analytics", THE Frontend SHALL display the Analytics page
2. THE Frontend SHALL call GET /api/analytics/courier-performance with a period parameter
3. WHEN courier performance data is loaded, THE Frontend SHALL display a comparison table with metrics for each courier
4. THE Frontend SHALL display total shipments, delivered count, delivery success rate, average delivery days, and average cost for each courier
5. THE Frontend SHALL provide period selector buttons for 7d, 30d, 90d, and 1y timeframes
6. WHEN a period is selected, THE Frontend SHALL refresh courier performance data with the new period
7. THE Frontend SHALL call GET /api/analytics/order-trends with period and groupBy parameters
8. WHEN order trends data is loaded, THE Frontend SHALL display a line or bar chart showing order volume over time
9. THE Frontend SHALL display revenue trends on the same or separate chart
10. THE Frontend SHALL provide groupBy selector for day, week, or month aggregation
11. WHEN groupBy is changed, THE Frontend SHALL refresh trends data with new aggregation
12. THE Frontend SHALL highlight the best performing courier based on delivery success rate
13. THE Frontend SHALL display insights or recommendations based on analytics data
14. WHEN analytics data is loading, THE Frontend SHALL display loading skeletons

### Requirement 10: Webhook Studio Testing Interface

**User Story:** As a developer, I want to manually trigger webhook events for testing, so that I can verify shipment status updates work correctly.

#### Acceptance Criteria

1. WHEN a user navigates to "/webhooks", THE Frontend SHALL display the Webhook Studio page
2. THE Frontend SHALL provide input fields for tracking number and carrier selection
3. THE Frontend SHALL provide status selection dropdown with all shipment statuses
4. THE Frontend SHALL provide optional fields for description, location, and timestamp
5. WHEN the user clicks "Send Webhook", THE Frontend SHALL call POST /api/webhooks/simulate with the event data
6. WHEN webhook simulation succeeds, THE Frontend SHALL display success message with previous and new status
7. WHEN webhook simulation fails, THE Frontend SHALL display error message
8. THE Frontend SHALL display a list of recently sent webhook events
9. THE Frontend SHALL provide preset buttons for common status flows (PICKED_UP → IN_TRANSIT → DELIVERED)
10. WHEN a preset is clicked, THE Frontend SHALL auto-fill the form with appropriate values


### Requirement 11: User Preferences and Settings

**User Story:** As a user, I want to customize my application preferences such as theme and default page sizes, so that I can optimize my user experience.

#### Acceptance Criteria

1. WHEN a user navigates to "/settings", THE Frontend SHALL display the Settings page
2. THE Frontend SHALL display current preferences loaded from localStorage
3. THE Frontend SHALL provide a theme toggle between dark and light modes
4. WHEN theme is changed, THE Frontend SHALL update CSS variables and save preference to localStorage
5. THE Frontend SHALL provide table density selection (comfortable, compact, spacious)
6. WHEN table density is changed, THE Frontend SHALL apply new density to all data tables
7. THE Frontend SHALL provide default page size selector (10, 20, 50, 100)
8. WHEN default page size is changed, THE Frontend SHALL use it for all paginated lists
9. THE Frontend SHALL provide preferred couriers multi-select
10. WHEN preferred couriers are selected, THE Frontend SHALL highlight them in rate comparison
11. THE Frontend SHALL persist all preferences to localStorage
12. WHEN preferences are updated, THE Frontend SHALL apply them immediately without page reload

### Requirement 12: Bulk Order Export

**User Story:** As a merchant, I want to export order data to CSV or JSON format, so that I can analyze data in external tools or keep records.

#### Acceptance Criteria

1. WHEN a user clicks "Export" button on Order List page, THE Frontend SHALL open an export modal
2. THE Frontend SHALL provide format selection (CSV or JSON)
3. THE Frontend SHALL provide filter options matching the order list filters (status, date range)
4. THE Frontend SHALL provide field selection checkboxes for choosing which columns to export
5. WHEN the user clicks "Generate Export", THE Frontend SHALL call POST /api/orders/bulk-export
6. WHEN export is generated, THE Frontend SHALL provide a download link
7. WHEN the download link is clicked, THE Frontend SHALL initiate file download
8. THE Frontend SHALL display export progress and record count
9. THE Frontend SHALL show export expiration time
10. WHEN export fails, THE Frontend SHALL display error message


### Requirement 13: Reusable Button Component

**User Story:** As a developer, I want a consistent Button component with multiple variants, so that all buttons across the application have uniform styling and behavior.

#### Acceptance Criteria

1. THE Component_Library SHALL provide a Button component with variant prop (primary, secondary, outline, ghost, danger)
2. THE Component_Library SHALL provide size prop for buttons (sm, md, lg)
3. WHEN loading prop is true, THE Button SHALL display a spinner and disable interaction
4. WHEN disabled prop is true, THE Button SHALL apply disabled styles and prevent clicks
5. THE Button SHALL support icon prop with iconPosition (left or right)
6. THE Button SHALL support fullWidth prop to span full container width
7. THE Button SHALL apply hover animations (transform and opacity changes)
8. THE Button SHALL support all standard HTML button props (onClick, type, aria-label)
9. WHEN Button variant is primary, THE Button SHALL use white background with black text
10. WHEN Button variant is danger, THE Button SHALL use red background with white text
11. THE Button SHALL have consistent padding based on size prop
12. THE Button SHALL have smooth transitions for all state changes

### Requirement 14: Reusable Input Component

**User Story:** As a developer, I want a consistent Input component with validation support, so that all form inputs have uniform styling and error handling.

#### Acceptance Criteria

1. THE Component_Library SHALL provide an Input component with type prop (text, email, tel, number, password, search)
2. THE Input SHALL support label prop displayed above the input field
3. WHEN required prop is true, THE Input SHALL display an asterisk next to the label
4. THE Input SHALL support error prop for displaying validation errors
5. WHEN error is present, THE Input SHALL apply error styling (red border and text)
6. THE Input SHALL support helperText prop for displaying hints below the input
7. THE Input SHALL support icon prop with iconPosition (left or right)
8. WHEN disabled prop is true, THE Input SHALL apply disabled styling and prevent editing
9. THE Input SHALL call onChange callback with the new value on every input change
10. THE Input SHALL support placeholder prop
11. THE Input SHALL have focus states with border color changes
12. THE Input SHALL have consistent spacing and typography


### Requirement 15: Modal Dialog Component

**User Story:** As a developer, I want a reusable Modal component for dialogs and confirmations, so that all modals have consistent overlay behavior and animations.

#### Acceptance Criteria

1. THE Component_Library SHALL provide a Modal component with open and onClose props
2. WHEN open is true, THE Modal SHALL display with backdrop overlay
3. WHEN open changes from false to true, THE Modal SHALL animate in with scale and fade effects
4. THE Modal SHALL support title prop displayed in the header
5. THE Modal SHALL support size prop (sm, md, lg, xl) controlling modal width
6. THE Modal SHALL support showCloseButton prop for displaying X button in header
7. WHEN close button is clicked, THE Modal SHALL call onClose callback
8. THE Modal SHALL support closeOnOverlayClick prop (default true)
9. WHEN closeOnOverlayClick is true and overlay is clicked, THE Modal SHALL call onClose
10. WHEN closeOnOverlayClick is false and overlay is clicked, THE Modal SHALL not close
11. THE Modal SHALL support footer prop for custom footer content
12. THE Modal SHALL prevent body scrolling when open
13. THE Modal SHALL trap keyboard focus within the modal
14. WHEN Escape key is pressed, THE Modal SHALL call onClose
15. THE Modal SHALL render with z-index above other content

### Requirement 16: Toast Notification System

**User Story:** As a user, I want to see temporary notifications for successful actions and errors, so that I receive immediate feedback on my interactions.

#### Acceptance Criteria

1. THE Frontend SHALL provide a ToastContext with showToast and removeToast methods
2. THE ToastContext SHALL maintain an array of active toasts
3. WHEN showToast is called, THE ToastContext SHALL add a new toast to the array
4. THE ToastContext SHALL support toast types: success, error, info, warning
5. WHEN a toast is added, THE Frontend SHALL display it in the ToastContainer
6. THE Frontend SHALL position toasts in the top-right corner of the screen
7. THE Frontend SHALL animate toasts in from the right with slide animation
8. WHEN toast duration expires, THE Frontend SHALL automatically remove the toast
9. THE Frontend SHALL animate toasts out with fade animation
10. THE Frontend SHALL allow manual dismissal by clicking the X button
11. WHEN multiple toasts are active, THE Frontend SHALL stack them vertically
12. THE Frontend SHALL limit maximum visible toasts to 5
13. WHEN toast type is success, THE Frontend SHALL use green color scheme
14. WHEN toast type is error, THE Frontend SHALL use red color scheme
15. THE Frontend SHALL display toasts above all other content with highest z-index


### Requirement 17: Data Table Component

**User Story:** As a developer, I want a reusable DataTable component with sorting and custom rendering, so that all data tables have consistent functionality.

#### Acceptance Criteria

1. THE Component_Library SHALL provide a DataTable component accepting columns and data props
2. THE DataTable SHALL render table headers from column definitions
3. THE DataTable SHALL render table rows from data array
4. WHEN a column has sortable prop set to true, THE DataTable SHALL display sort indicators in the header
5. WHEN a sortable column header is clicked, THE DataTable SHALL call onSort callback with the column key
6. THE DataTable SHALL display sort direction indicator (↑ or ↓) for the currently sorted column
7. WHEN a column has render function, THE DataTable SHALL use it to render cell content
8. WHEN a column has no render function, THE DataTable SHALL display the raw value from data
9. WHEN loading prop is true, THE DataTable SHALL display LoadingSkeleton component
10. WHEN data array is empty, THE DataTable SHALL display emptyState component
11. THE DataTable SHALL support rowClassName function for conditional row styling
12. THE DataTable SHALL support onRowClick callback for row click handling
13. THE DataTable SHALL support column width property for controlling column widths
14. THE DataTable SHALL apply hover effects on table rows
15. THE DataTable SHALL have responsive overflow handling for mobile devices

### Requirement 18: Loading Skeleton Component

**User Story:** As a user, I want to see placeholder content while data is loading, so that I have visual feedback that the application is working.

#### Acceptance Criteria

1. THE Component_Library SHALL provide a LoadingSkeleton component
2. THE LoadingSkeleton SHALL support type prop (table, card, text)
3. WHEN type is table, THE LoadingSkeleton SHALL render skeleton rows and columns
4. THE LoadingSkeleton SHALL support rows and columns props for table type
5. WHEN type is card, THE LoadingSkeleton SHALL render skeleton card layout
6. WHEN type is text, THE LoadingSkeleton SHALL render skeleton text lines
7. THE LoadingSkeleton SHALL animate with shimmer effect
8. THE LoadingSkeleton SHALL use neutral gray colors matching the design system
9. THE LoadingSkeleton SHALL have rounded corners matching component styles
10. THE LoadingSkeleton SHALL maintain aspect ratio and dimensions of actual content


### Requirement 19: Status Badge Component

**User Story:** As a user, I want to see order and shipment statuses with color-coded badges, so that I can quickly understand status at a glance.

#### Acceptance Criteria

1. THE Component_Library SHALL provide a StatusBadge component accepting status prop
2. THE StatusBadge SHALL map ORDER_CREATED to blue badge with "Created" label
3. THE StatusBadge SHALL map CARRIER_SELECTED to purple badge with "Carrier Selected" label
4. THE StatusBadge SHALL map SHIPMENT_CREATED to cyan badge with "Booked" label
5. THE StatusBadge SHALL map PICKED_UP to yellow badge with "Picked Up" label
6. THE StatusBadge SHALL map IN_TRANSIT to orange badge with "In Transit" label
7. THE StatusBadge SHALL map OUT_FOR_DELIVERY to amber badge with "Out for Delivery" label
8. THE StatusBadge SHALL map DELIVERED to green badge with "Delivered" label
9. THE StatusBadge SHALL map DELIVERY_FAILED to red badge with "Failed" label
10. THE StatusBadge SHALL map RTO to gray badge with "RTO" label
11. THE StatusBadge SHALL map CANCELLED to gray badge with "Cancelled" label
12. WHEN status is unknown, THE StatusBadge SHALL display the raw status value with gray badge
13. THE StatusBadge SHALL use pill-shaped design with rounded corners
14. THE StatusBadge SHALL have appropriate padding and font size
15. THE StatusBadge SHALL use colors from the design system

### Requirement 20: Centralized API Client with Interceptors

**User Story:** As a developer, I want a centralized API client with request/response interceptors, so that all API calls have consistent error handling and logging.

#### Acceptance Criteria

1. THE API_Client SHALL be an Axios instance configured with base URL from environment variable
2. THE API_Client SHALL have a default timeout of 15 seconds
3. THE API_Client SHALL have request interceptor that adds Authorization header if token exists in localStorage
4. THE API_Client SHALL have request interceptor that logs requests in development mode
5. THE API_Client SHALL have response interceptor that logs responses in development mode
6. THE API_Client SHALL have response interceptor that handles 401 errors by redirecting to login
7. THE API_Client SHALL have response interceptor that implements retry logic for 503 errors
8. WHEN a 503 error occurs, THE API_Client SHALL wait 2 seconds and retry the request once
9. THE API_Client SHALL have response interceptor that extracts error messages from response data
10. THE API_Client SHALL have response interceptor that rejects with structured error object
11. THE API_Client SHALL set Content-Type header to application/json by default
12. THE API_Client SHALL support custom headers and configurations per request


### Requirement 21: Service Layer for API Endpoints

**User Story:** As a developer, I want organized service modules for different API domains, so that API calls are easy to find and maintain.

#### Acceptance Criteria

1. THE Frontend SHALL provide an orderService module with methods for order operations
2. THE orderService SHALL provide listOrders method calling GET /api/orders with params
3. THE orderService SHALL provide searchOrders method calling GET /api/orders/search
4. THE orderService SHALL provide getOrder method calling GET /api/orders/{orderId}
5. THE orderService SHALL provide createOrder method calling POST /api/orders
6. THE orderService SHALL provide cancelOrder method calling PATCH /api/orders/{orderId}/cancel
7. THE orderService SHALL provide exportOrders method calling POST /api/orders/bulk-export
8. THE Frontend SHALL provide dashboardService module for dashboard APIs
9. THE dashboardService SHALL provide getStats method calling GET /api/dashboard/stats
10. THE dashboardService SHALL provide getRecentOrders method calling GET /api/dashboard/recent-orders
11. THE Frontend SHALL provide analyticsService module for analytics APIs
12. THE analyticsService SHALL provide getCourierPerformance method calling GET /api/analytics/courier-performance
13. THE analyticsService SHALL provide getOrderTrends method calling GET /api/analytics/order-trends
14. THE Frontend SHALL provide rateService module for rate operations
15. THE rateService SHALL provide requestRates method calling POST /api/orders/{orderId}/rates
16. THE rateService SHALL provide getRates method calling GET /api/orders/{orderId}/rates
17. THE rateService SHALL provide selectCarrier method calling POST /api/orders/{orderId}/select-carrier
18. THE Frontend SHALL provide shipmentService module for shipment operations
19. THE shipmentService SHALL provide createShipment method calling POST /api/orders/{orderId}/create-shipment
20. THE shipmentService SHALL provide getTracking method calling GET /api/orders/{orderId}/tracking
21. THE shipmentService SHALL provide getActiveShipments method calling GET /api/shipments/active
22. THE Frontend SHALL provide trackingService module for tracking operations
23. THE trackingService SHALL provide getPublicTracking method calling GET /api/tracking/public/{trackingNumber}
24. ALL service methods SHALL return Promise resolving to response data
25. ALL service methods SHALL allow errors to propagate to be handled by interceptors


### Requirement 22: Backend Dashboard Stats API

**User Story:** As a backend developer, I want a dashboard stats endpoint that aggregates order and shipment data, so that the frontend can display overview metrics.

#### Acceptance Criteria

1. THE Backend SHALL provide GET /api/dashboard/stats endpoint
2. WHEN the endpoint is called, THE Backend SHALL count total orders in the database
3. THE Backend SHALL count active shipments (statuses: SHIPMENT_CREATED, PICKED_UP, IN_TRANSIT, OUT_FOR_DELIVERY)
4. THE Backend SHALL count shipments delivered today (DELIVERED status with today's date)
5. THE Backend SHALL sum quoted amounts from all delivered shipments for total revenue
6. THE Backend SHALL group orders by status and count each status
7. THE Backend SHALL group shipments by carrier code and count each carrier
8. THE Backend SHALL calculate order trend by comparing last 7 days vs previous 7 days
9. WHEN order count increased, THE Backend SHALL return trend direction "up" with percentage
10. WHEN order count decreased, THE Backend SHALL return trend direction "down" with percentage
11. WHEN order count unchanged, THE Backend SHALL return trend direction "neutral" with 0 percentage
12. THE Backend SHALL return response with totalOrders, activeShipments, deliveredToday, revenue, orderTrend, and statusBreakdown fields
13. THE Backend SHALL return 200 OK with stats data

### Requirement 23: Backend Recent Orders API

**User Story:** As a backend developer, I want a recent orders endpoint that returns the latest orders, so that the frontend can display recent activity on the dashboard.

#### Acceptance Criteria

1. THE Backend SHALL provide GET /api/dashboard/recent-orders endpoint
2. THE Backend SHALL accept optional limit query parameter (default 10, max 50)
3. WHEN the endpoint is called, THE Backend SHALL query orders sorted by createdAt descending
4. THE Backend SHALL limit results to the specified limit
5. THE Backend SHALL join with shipment data to include carrier and tracking information
6. THE Backend SHALL return array of orders with orderId, merchantOrderId, customerName, orderStatus, totalCharge, carrier, and createdAt
7. THE Backend SHALL return 200 OK with orders array
8. WHEN limit is invalid, THE Backend SHALL return 400 Bad Request


### Requirement 24: Backend Order List API with Pagination

**User Story:** As a backend developer, I want an order list endpoint with pagination, filtering, and sorting, so that the frontend can efficiently display large order lists.

#### Acceptance Criteria

1. THE Backend SHALL provide GET /api/orders endpoint
2. THE Backend SHALL accept page query parameter (default 1, minimum 1)
3. THE Backend SHALL accept pageSize query parameter (default 20, minimum 1, maximum 100)
4. THE Backend SHALL accept sortBy query parameter (createdAt, orderStatus, totalCharge)
5. THE Backend SHALL accept sortDirection query parameter (asc, desc, default desc)
6. THE Backend SHALL accept status query parameter as comma-separated list for filtering
7. THE Backend SHALL accept dateFrom query parameter for filtering orders after this date
8. THE Backend SHALL accept dateTo query parameter for filtering orders before this date
9. WHEN the endpoint is called, THE Backend SHALL build query with filters applied
10. THE Backend SHALL apply sorting based on sortBy and sortDirection
11. THE Backend SHALL calculate offset as (page - 1) * pageSize
12. THE Backend SHALL execute paginated query with LIMIT and OFFSET
13. THE Backend SHALL count total matching orders for pagination metadata
14. THE Backend SHALL join with shipment data to include carrier and tracking number
15. THE Backend SHALL calculate totalPages as ceiling of totalCount / pageSize
16. THE Backend SHALL return response with data array and pagination object
17. THE Backend SHALL return pagination object with currentPage, totalPages, totalItems, limit fields
18. THE Backend SHALL return 200 OK with paginated results
19. WHEN query parameters are invalid, THE Backend SHALL return 400 Bad Request

### Requirement 25: Backend Order Search API

**User Story:** As a backend developer, I want a search endpoint that finds orders by multiple criteria, so that users can quickly locate orders.

#### Acceptance Criteria

1. THE Backend SHALL provide GET /api/orders/search endpoint
2. THE Backend SHALL accept required q query parameter for search query
3. THE Backend SHALL accept page and pageSize parameters for pagination
4. WHEN the endpoint is called, THE Backend SHALL search across orderId field
5. THE Backend SHALL search across merchantOrderId field
6. THE Backend SHALL search across customer name field (case-insensitive)
7. THE Backend SHALL search across customer phone field
8. THE Backend SHALL search across tracking number field by joining shipments table
9. THE Backend SHALL combine all search conditions with OR logic
10. THE Backend SHALL apply pagination to search results
11. THE Backend SHALL return matching orders with matchField indicating which field matched
12. THE Backend SHALL return 200 OK with search results
13. WHEN q parameter is missing, THE Backend SHALL return 400 Bad Request with error message


### Requirement 26: Backend Courier Performance Analytics API

**User Story:** As a backend developer, I want a courier performance endpoint that calculates delivery metrics, so that users can compare courier reliability.

#### Acceptance Criteria

1. THE Backend SHALL provide GET /api/analytics/courier-performance endpoint
2. THE Backend SHALL accept period query parameter (7d, 30d, 90d, 1y, default 30d)
3. WHEN the endpoint is called, THE Backend SHALL calculate date range based on period
4. THE Backend SHALL query shipments within the date range grouped by carrier code
5. FOR EACH carrier, THE Backend SHALL count total shipments
6. FOR EACH carrier, THE Backend SHALL count delivered shipments (DELIVERED status)
7. FOR EACH carrier, THE Backend SHALL calculate delivery success rate as (delivered / total * 100)
8. FOR EACH carrier, THE Backend SHALL calculate average delivery days from SHIPMENT_CREATED to DELIVERED events
9. FOR EACH carrier, THE Backend SHALL calculate on-time delivery rate by comparing actual vs estimated delivery days
10. FOR EACH carrier, THE Backend SHALL calculate average cost from quoted amounts
11. THE Backend SHALL return array of courier performance objects
12. THE Backend SHALL return 200 OK with period and couriers array
13. WHEN period is invalid, THE Backend SHALL return 400 Bad Request

### Requirement 27: Backend Order Trends Analytics API

**User Story:** As a backend developer, I want an order trends endpoint that shows volume and revenue over time, so that users can see business trends.

#### Acceptance Criteria

1. THE Backend SHALL provide GET /api/analytics/order-trends endpoint
2. THE Backend SHALL accept period query parameter (7d, 30d, 90d, default 7d)
3. THE Backend SHALL accept groupBy query parameter (day, week, month, default day)
4. WHEN the endpoint is called, THE Backend SHALL calculate date range based on period
5. WHEN groupBy is day, THE Backend SHALL group orders by date truncated to day
6. WHEN groupBy is week, THE Backend SHALL group orders by ISO week number
7. WHEN groupBy is month, THE Backend SHALL group orders by year-month
8. FOR EACH time bucket, THE Backend SHALL count orders created
9. FOR EACH time bucket, THE Backend SHALL sum revenue from delivered shipments
10. FOR EACH time bucket, THE Backend SHALL calculate average order value
11. THE Backend SHALL return array of trend data points with date, orderCount, revenue, avgOrderValue
12. THE Backend SHALL sort results by date ascending
13. THE Backend SHALL return 200 OK with period, groupBy, and data array
14. WHEN parameters are invalid, THE Backend SHALL return 400 Bad Request


### Requirement 28: Backend Active Shipments API

**User Story:** As a backend developer, I want an active shipments endpoint that returns in-progress deliveries, so that users can monitor current shipments.

#### Acceptance Criteria

1. THE Backend SHALL provide GET /api/shipments/active endpoint
2. THE Backend SHALL accept optional carrier query parameter for filtering by carrier code
3. THE Backend SHALL accept optional status query parameter as comma-separated list
4. WHEN the endpoint is called, THE Backend SHALL query shipments not in terminal states
5. THE Backend SHALL exclude DELIVERED, DELIVERY_FAILED, and RTO statuses by default
6. WHEN carrier filter is provided, THE Backend SHALL filter by carrier code
7. WHEN status filter is provided, THE Backend SHALL filter by specified statuses
8. THE Backend SHALL join with orders to include customer and destination information
9. THE Backend SHALL sort results by updatedAt descending (most recently updated first)
10. THE Backend SHALL return array of shipment objects with orderId, trackingNumber, carrier, currentStatus, lastUpdate, estimatedDelivery, and destination
11. THE Backend SHALL return 200 OK with shipments array and totalCount
12. WHEN no active shipments exist, THE Backend SHALL return empty array with 200 OK

### Requirement 29: Backend Public Tracking API

**User Story:** As a backend developer, I want a public tracking endpoint that works without authentication, so that customers can track shipments.

#### Acceptance Criteria

1. THE Backend SHALL provide GET /api/tracking/public/{trackingNumber} endpoint
2. THE Backend SHALL NOT require authentication or authorization for this endpoint
3. WHEN the endpoint is called, THE Backend SHALL query shipment by tracking number
4. WHEN shipment is found, THE Backend SHALL join with order to get destination information
5. THE Backend SHALL query shipment events ordered by eventTime ascending
6. THE Backend SHALL return tracking number, carrier code and name, current status, estimated delivery
7. THE Backend SHALL return origin and destination with city, state, pincode only (no full address)
8. THE Backend SHALL return array of events with status, description, location, eventTime
9. THE Backend SHALL NOT return customer PII (phone, email, full address, customer name)
10. WHEN shipment has proof of delivery, THE Backend SHALL include it in response
11. THE Backend SHALL return 200 OK with tracking data
12. WHEN tracking number is not found, THE Backend SHALL return 404 Not Found
13. THE Backend SHALL implement rate limiting on this endpoint to prevent abuse


### Requirement 30: Backend Order Cancellation API

**User Story:** As a backend developer, I want an order cancellation endpoint, so that users can cancel orders before shipment creation.

#### Acceptance Criteria

1. THE Backend SHALL provide PATCH /api/orders/{orderId}/cancel endpoint
2. THE Backend SHALL accept request body with reason and cancelledBy fields
3. WHEN the endpoint is called, THE Backend SHALL query the order by orderId
4. WHEN order is not found, THE Backend SHALL return 404 Not Found
5. WHEN order status is SHIPMENT_CREATED or later, THE Backend SHALL return 409 Conflict with message "Cannot cancel order - shipment already created"
6. WHEN order status is ORDER_CREATED or CARRIER_SELECTED, THE Backend SHALL update order status to CANCELLED
7. THE Backend SHALL store cancellation timestamp in cancelledAt field
8. THE Backend SHALL store cancellation reason
9. THE Backend SHALL store who cancelled the order (cancelledBy)
10. WHEN cancellation succeeds, THE Backend SHALL return updated order with 200 OK
11. THE Backend SHALL include order in cancelled order counts but exclude from active metrics

### Requirement 31: Backend Order Export API

**User Story:** As a backend developer, I want an order export endpoint that generates CSV or JSON files, so that users can download order data.

#### Acceptance Criteria

1. THE Backend SHALL provide POST /api/orders/bulk-export endpoint
2. THE Backend SHALL accept request body with format (csv or json), filters, and fields
3. THE Backend SHALL accept filters for status, dateFrom, dateTo
4. THE Backend SHALL accept fields array specifying which columns to include
5. WHEN the endpoint is called, THE Backend SHALL query orders matching the filters
6. THE Backend SHALL generate a unique export ID with format "EXP-{date}-{sequence}"
7. WHEN format is csv, THE Backend SHALL convert order data to CSV format with headers
8. WHEN format is json, THE Backend SHALL convert order data to JSON array
9. THE Backend SHALL store export file temporarily with 24-hour expiration
10. THE Backend SHALL return export metadata with exportId, format, status, downloadUrl, recordCount, createdAt, expiresAt
11. THE Backend SHALL provide GET /api/exports/{exportId}/download endpoint for downloading the file
12. WHEN download endpoint is called, THE Backend SHALL return file with appropriate Content-Type header
13. WHEN export has expired, THE Backend SHALL return 404 Not Found
14. THE Backend SHALL return 200 OK with export metadata from POST endpoint


### Requirement 32: Backend Webhook Simulation API

**User Story:** As a backend developer, I want a webhook simulation endpoint for testing, so that developers can manually trigger status updates without calling courier APIs.

#### Acceptance Criteria

1. THE Backend SHALL provide POST /api/webhooks/simulate endpoint
2. THE Backend SHALL accept request body with trackingNumber, carrier, and event object
3. THE Backend SHALL accept event object with type, status, description, location, and timestamp
4. WHEN the endpoint is called, THE Backend SHALL query shipment by tracking number and carrier
5. WHEN shipment is not found, THE Backend SHALL return 404 Not Found
6. THE Backend SHALL validate that the status is a valid shipment status
7. THE Backend SHALL create a new shipment event with the provided details
8. THE Backend SHALL update shipment current status to the new status
9. THE Backend SHALL update shipment updatedAt timestamp
10. THE Backend SHALL return previous status and new status in response
11. THE Backend SHALL return 200 OK with success true and status change details
12. WHEN status is invalid, THE Backend SHALL return 400 Bad Request
13. THIS endpoint SHALL only be enabled in development and staging environments for security

### Requirement 33: Backend Health Check API

**User Story:** As a backend developer, I want a health check endpoint that reports system status, so that monitoring tools can verify service health.

#### Acceptance Criteria

1. THE Backend SHALL provide GET /api/health endpoint
2. WHEN the endpoint is called, THE Backend SHALL check database connectivity
3. THE Backend SHALL measure database response time
4. THE Backend SHALL check connectivity to all three courier services
5. THE Backend SHALL measure response time for each courier service
6. FOR EACH courier, THE Backend SHALL store last check timestamp
7. WHEN a courier check fails, THE Backend SHALL store error message
8. THE Backend SHALL return overall status as "healthy" when database is up
9. THE Backend SHALL return current timestamp and version number
10. THE Backend SHALL return services object with database and couriers status
11. FOR EACH service, THE Backend SHALL return status (up or down), response time, and last check time
12. WHEN a courier is down, THE Backend SHALL still return status "healthy" as couriers are external dependencies
13. THE Backend SHALL return 200 OK with health data
14. THIS endpoint SHALL NOT require authentication


### Requirement 34: Responsive Design Implementation

**User Story:** As a user, I want the application to work well on mobile, tablet, and desktop devices, so that I can access it from any device.

#### Acceptance Criteria

1. THE Frontend SHALL use mobile-first CSS approach with min-width media queries
2. THE Frontend SHALL define breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px), 2xl (1536px)
3. WHEN viewport width is less than 768px, THE Frontend SHALL hide the sidebar by default
4. WHEN viewport width is less than 768px, THE Frontend SHALL show a hamburger menu button
5. WHEN hamburger menu is clicked on mobile, THE Frontend SHALL slide in sidebar from left
6. WHEN viewport width is 768px or more, THE Frontend SHALL display sidebar permanently
7. THE Frontend SHALL use responsive grid layouts that adapt to screen size
8. WHEN viewport width is less than 640px, THE Frontend SHALL display stat cards in single column
9. WHEN viewport width is 768px or more, THE Frontend SHALL display stat cards in 2 columns
10. WHEN viewport width is 1024px or more, THE Frontend SHALL display stat cards in 4 columns
11. THE Frontend SHALL make data tables horizontally scrollable on mobile devices
12. THE Frontend SHALL stack form fields vertically on mobile and side-by-side on desktop
13. THE Frontend SHALL adjust font sizes for better readability on small screens
14. THE Frontend SHALL ensure touch targets are at least 44x44 pixels on mobile
15. THE Frontend SHALL test responsive behavior at all defined breakpoints

### Requirement 35: Animation and Micro-interactions

**User Story:** As a user, I want smooth animations and visual feedback, so that the application feels polished and responsive.

#### Acceptance Criteria

1. THE Frontend SHALL define CSS animations for fadeIn, slideInFromRight, slideInFromBottom, and scaleIn
2. THE Frontend SHALL animate page transitions with fadeIn effect
3. WHEN modals open, THE Frontend SHALL animate with scaleIn effect
4. WHEN toasts appear, THE Frontend SHALL animate with slideInFromRight effect
5. THE Frontend SHALL apply hover-lift effect on cards (translateY(-2px) on hover)
6. THE Frontend SHALL apply hover effects on buttons (opacity and transform changes)
7. THE Frontend SHALL use transition duration variables (fast: 150ms, base: 200ms, slow: 300ms)
8. THE Frontend SHALL implement shimmer animation for loading skeletons
9. THE Frontend SHALL apply ease timing function for natural-feeling animations
10. THE Frontend SHALL respect prefers-reduced-motion media query for accessibility
11. WHEN prefers-reduced-motion is set, THE Frontend SHALL disable or reduce animations
12. THE Frontend SHALL ensure animations do not block user interaction
13. THE Frontend SHALL use CSS transforms for performant animations


### Requirement 36: Design System with CSS Variables

**User Story:** As a developer, I want a consistent design system with CSS variables, so that styling is maintainable and themeable.

#### Acceptance Criteria

1. THE Frontend SHALL define CSS custom properties for all design tokens in :root
2. THE Frontend SHALL define color variables for black, white, and gray scale (50-950)
3. THE Frontend SHALL define semantic color variables for backgrounds, text, and borders
4. THE Frontend SHALL define status color variables for success, error, warning, and info
5. THE Frontend SHALL define spacing scale variables (space-1 through space-16)
6. THE Frontend SHALL define border radius variables (radius-sm, md, lg, xl, full)
7. THE Frontend SHALL define shadow variables (shadow-sm, md, lg, xl, card)
8. THE Frontend SHALL define typography variables for font families, sizes, weights, and line heights
9. THE Frontend SHALL define transition timing variables
10. THE Frontend SHALL define z-index variables for layering (dropdown: 1000, modal: 1300, toast: 1400)
11. THE Frontend SHALL use dark theme colors by default
12. ALL component styles SHALL reference CSS variables instead of hard-coded values
13. THE Frontend SHALL support theme switching by updating CSS variable values
14. THE Frontend SHALL ensure sufficient color contrast for accessibility (WCAG AA minimum)

### Requirement 37: Error Boundary Implementation

**User Story:** As a user, I want the application to gracefully handle JavaScript errors, so that a single component error doesn't break the entire app.

#### Acceptance Criteria

1. THE Frontend SHALL provide an ErrorBoundary component wrapping all route content
2. WHEN a component throws an error during rendering, THE ErrorBoundary SHALL catch it
3. WHEN an error is caught, THE ErrorBoundary SHALL display fallback UI with error message
4. THE ErrorBoundary SHALL log error details to console for debugging
5. THE ErrorBoundary SHALL display a "Reload Page" button in the fallback UI
6. WHEN "Reload Page" is clicked, THE ErrorBoundary SHALL reload the page
7. THE ErrorBoundary SHALL provide option to report the error
8. THE ErrorBoundary SHALL not break the entire application when a single component fails
9. THE ErrorBoundary SHALL reset error state when navigating to a different route
10. THE ErrorBoundary SHALL have a user-friendly error message not exposing technical details


### Requirement 38: Empty State Components

**User Story:** As a user, I want to see helpful empty states when there is no data, so that I understand why content is missing and what actions I can take.

#### Acceptance Criteria

1. THE Component_Library SHALL provide an EmptyState component
2. THE EmptyState SHALL accept message prop for displaying custom message
3. THE EmptyState SHALL accept optional icon prop for visual representation
4. THE EmptyState SHALL accept optional action prop for providing a call-to-action button
5. WHEN data tables have no data, THE Frontend SHALL display EmptyState with appropriate message
6. WHEN search returns no results, THE Frontend SHALL display EmptyState with "No results found" message
7. WHEN filters exclude all data, THE Frontend SHALL display EmptyState with filter reset action
8. WHEN dashboard has no recent orders, THE Frontend SHALL display EmptyState with "Create your first order" action
9. THE EmptyState SHALL use muted colors and icon to indicate absence of data
10. THE EmptyState SHALL be centered in its container with appropriate padding

### Requirement 39: Utility Functions for Formatting

**User Story:** As a developer, I want utility functions for common formatting tasks, so that formatting is consistent across the application.

#### Acceptance Criteria

1. THE Frontend SHALL provide formatCurrency function accepting amount parameter
2. THE formatCurrency function SHALL format numbers using Indian locale (en-IN)
3. THE formatCurrency function SHALL display currency symbol ₹
4. THE Frontend SHALL provide formatDate function accepting dateString and format parameters
5. WHEN format is "short", THE formatDate function SHALL return date in short format (DD/MM/YYYY)
6. WHEN format is "long", THE formatDate function SHALL return date with time (DD Month YYYY, HH:MM)
7. THE Frontend SHALL provide formatRelativeTime function for relative timestamps
8. THE formatRelativeTime function SHALL return "Just now" for times less than 1 minute ago
9. THE formatRelativeTime function SHALL return "Xm ago" for times less than 1 hour ago
10. THE formatRelativeTime function SHALL return "Xh ago" for times less than 24 hours ago
11. THE formatRelativeTime function SHALL return "Xd ago" for times less than 7 days ago
12. THE Frontend SHALL provide validator functions for phone, pincode, and email
13. ALL formatting functions SHALL handle null and undefined inputs gracefully


### Requirement 40: Keyboard Navigation and Accessibility

**User Story:** As a user with accessibility needs, I want to navigate the application using keyboard, so that I can use the application without a mouse.

#### Acceptance Criteria

1. ALL interactive elements SHALL be keyboard accessible with Tab key navigation
2. THE Frontend SHALL display visible focus indicators on all interactive elements
3. THE Frontend SHALL support Escape key to close modals and dropdowns
4. THE Frontend SHALL trap keyboard focus within open modals
5. WHEN a modal opens, THE Frontend SHALL move focus to the first focusable element
6. WHEN a modal closes, THE Frontend SHALL return focus to the trigger element
7. THE Frontend SHALL support Enter key to activate buttons and links
8. THE Frontend SHALL support Space key to activate buttons
9. THE Frontend SHALL support arrow keys for navigating dropdowns and selects
10. ALL form inputs SHALL have associated label elements for screen readers
11. THE Frontend SHALL use semantic HTML elements (nav, main, section, article, aside)
12. THE Frontend SHALL provide aria-label attributes for icon-only buttons
13. THE Frontend SHALL use aria-live regions for dynamic content updates (toasts)
14. THE Frontend SHALL ensure color contrast ratios meet WCAG AA standards (4.5:1 for text)
15. THE Frontend SHALL not rely solely on color to convey information

### Requirement 41: Performance Optimization

**User Story:** As a user, I want the application to load quickly and respond instantly, so that I have a smooth experience.

#### Acceptance Criteria

1. THE Frontend SHALL use code splitting with React.lazy for route-based components
2. THE Frontend SHALL implement Suspense boundaries with loading fallbacks
3. THE Frontend SHALL debounce search inputs with 500ms delay
4. THE Frontend SHALL use React.memo for expensive component renders
5. THE Frontend SHALL use useMemo for expensive calculations
6. THE Frontend SHALL use useCallback for callback functions passed to child components
7. THE Frontend SHALL implement virtual scrolling for large lists (>100 items)
8. THE Frontend SHALL optimize images with appropriate formats and sizes
9. THE Frontend SHALL lazy load images below the fold
10. THE Frontend SHALL minimize bundle size by avoiding large dependencies
11. THE Frontend SHALL enable Vite build optimizations for production
12. THE Frontend SHALL implement caching strategies for API responses where appropriate
13. THE Frontend SHALL measure and maintain Lighthouse performance score above 90


### Requirement 42: Environment Configuration

**User Story:** As a developer, I want environment-specific configuration, so that the application works correctly in development, staging, and production.

#### Acceptance Criteria

1. THE Frontend SHALL use Vite environment variables with VITE_ prefix
2. THE Frontend SHALL define VITE_API_BASE_URL for backend API base URL
3. THE Frontend SHALL define VITE_ENV for environment identification (development, staging, production)
4. THE Frontend SHALL provide .env.development file for development configuration
5. THE Frontend SHALL provide .env.production file for production configuration
6. THE Frontend SHALL default API_BASE_URL to http://localhost:8080 in development
7. THE Frontend SHALL require explicit API_BASE_URL in production
8. THE Frontend SHALL enable debug logging only in development environment
9. THE Frontend SHALL display environment indicator in development (not in production)
10. THE Frontend SHALL validate required environment variables on startup
11. THE Backend SHALL allow CORS from frontend origin specified in configuration
12. THE Backend SHALL use different database connections per environment

### Requirement 43: Docker Compatibility

**User Story:** As a developer, I want the application to run in Docker containers, so that deployment is consistent across environments.

#### Acceptance Criteria

1. THE Frontend SHALL provide a Dockerfile for building production container
2. THE Frontend Dockerfile SHALL use multi-stage build with Node.js and nginx
3. THE Frontend Dockerfile SHALL build the application with npm run build
4. THE Frontend Dockerfile SHALL serve static files with nginx
5. THE Frontend SHALL configure nginx to handle React Router URLs with fallback to index.html
6. THE Backend SHALL provide a Dockerfile for building Spring Boot container
7. THE Backend Dockerfile SHALL use multi-stage build with Gradle and JRE
8. THE Backend Dockerfile SHALL expose port 8080
9. THE project SHALL provide docker-compose.yml orchestrating frontend, backend, database, and mock couriers
10. THE docker-compose SHALL configure environment variables for service communication
11. THE docker-compose SHALL set up network for inter-service communication
12. THE docker-compose SHALL define volumes for database persistence
13. ALL services SHALL be accessible and functional when started with docker-compose up

