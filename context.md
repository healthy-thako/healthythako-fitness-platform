# HealthyThako Trainer - Complete Project Context

## Project Overview

**HealthyThako** is a comprehensive fitness platform connecting trainers, clients, gym owners, and administrators in Bangladesh. It's a multi-role marketplace with integrated payment processing, real-time messaging, and comprehensive management systems.

### Core Mission
- Connect fitness trainers with clients seeking personalized training
- Lets people to buy gym membership
- Provide gym owners with membership management tools
- Enable seamless booking, gym membership purchase and payment processing
- Create a comprehensive fitness ecosystem in Bangladesh

## Tech Stack & Architecture

### Frontend Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: shadcn-ui + Radix UI primitives
- **State Management**: TanStack Query (React Query) + React Context API
- **Routing**: React Router DOM with lazy loading for performance
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React icon library
- **Forms**: React Hook Form with Zod validation
- **Notifications**: Sonner for toast notifications

### Backend & Infrastructure
- **Backend-as-a-Service**: Supabase (PostgreSQL + Auth + Edge Functions)
- **Database**: PostgreSQL with Row Level Security (RLS)
- **Authentication**: Supabase Auth with role-based access control
- **File Storage**: Supabase Storage for images and documents
- **Edge Functions**: Deno-based serverless functions for business logic
- **Payment Gateway**: UddoktaPay integration for Bangladesh market

### Development & Deployment
- **Package Manager**: npm
- **TypeScript**: Full type safety across the application
- **Code Quality**: ESLint + Prettier
- **Version Control**: Git with structured commit patterns
- **Deployment**: Vercel/Netlify compatible

## Application Architecture

### Multi-Role System
The platform supports four distinct user roles, each with dedicated dashboards and permissions:

1. **Clients** - Book trainers, Buy Gym Membership, manage sessions & membership,
2. **Trainers** - Offer services, manage bookings, create plans
3. **Gym Owners** - Sell Gym Membership, Manage gym memberships, analytics
4. **Administrators** - Platform oversight, user management, analytics

### Route Structure
```
/                          # Landing page
/auth                      # Authentication (login/signup)
/auth/gym                  # Gym owner authentication
/admin/login               # Admin authentication

# Public Pages
/find-trainers             # Browse trainers
/browse-services           # Browse trainer services (gigs)
/gym-membership            # Browse gym memberships
/blog                      # Blog/content section
/ai                        # HealthyThako AI assistant

# Protected Dashboards
/client-dashboard/*        # Client management interface
/trainer-dashboard/*       # Trainer management interface
/gym-dashboard/*           # Gym owner management interface
/admin/*                   # Admin management interface

# Dynamic Routes
/trainer/:trainerId        # Public trainer profiles
/gym/:gymId               # Public gym profiles
/gig/:gigId               # Service detail pages
```

### Component Architecture
- **60+ Pages** covering all user flows and features
- **100+ Components** with modular, reusable design
- **Lazy Loading** for optimal performance
- **Protected Routes** with role-based access control
- **Error Boundaries** for graceful error handling
- **Loading States** with branded spinners

## Database Schema (39+ Tables)

### Core User Management
```sql
-- User profiles with role-based access
profiles (id, email, name, role, location, phone, gender, date_of_birth)
trainer_profiles (user_id, bio, specializations, rate_per_hour, certifications, is_verified)
gym_owners (id, name, email, business_name, business_license, is_verified)
admin_users (id, username, email, password_hash, role, is_active)
```

### Booking & Transaction System
```sql
-- Core booking functionality
bookings (id, client_id, trainer_id, amount, status, scheduled_date, mode, session_count)
transactions (id, booking_id, amount, commission, net_amount, status, payment_method)
reviews (id, booking_id, reviewer_id, reviewee_id, rating, comment)

-- Trainer marketplace
gigs (id, trainer_id, title, description, basic_price, standard_price, premium_price, category)
```

### Gym Management System
```sql
-- Gym operations
gyms (id, owner_id, name, description, location, contact_info, amenities)
gym_membership_plans (id, gym_id, name, price, duration_months, features)
gym_memberships (id, user_id, gym_id, plan_id, start_date, end_date, status)
gym_members (id, user_id, gym_id, plan_id, amount_paid, payment_status)
gym_bookings (id, user_id, gym_id, booking_date, status)
gym_amenities (id, gym_id, name, amenity_type, description)
```

### Communication & Content
```sql
-- Real-time messaging with plan sharing
messages (id, sender_id, receiver_id, content, message_type, workout_plan_id, nutrition_plan_id)

-- Content management
blog_posts (id, author_id, title, content, slug, status, featured_image, tags)
blog_categories (id, name, slug, description)
```

### Analytics & Monitoring
```sql
-- Platform analytics
platform_analytics (date, total_users, total_bookings, total_revenue, commission_earned)
gym_analytics (gym_id, date, total_members, new_members, revenue, bookings_count)
user_activity_logs (user_id, action, page_visited, session_id, duration_seconds)
system_health (metric_name, metric_value, metric_data, recorded_at)
```

### Plans & Programs
```sql
-- Trainer-created content
workout_plans (id, trainer_id, client_id, title, exercises, difficulty_level, duration_weeks)
nutrition_plans (id, trainer_id, client_id, title, daily_calories, macros, guidelines)
meal_plans (id, trainer_id, client_id, title, meals, dietary_restrictions)
```

### Administrative Features
```sql
-- Admin management
admin_sessions (id, admin_id, session_token, expires_at)
admin_tasks (id, title, type, description, status, priority, assigned_admin)
mass_email_campaigns (id, title, content, status, scheduled_at, sent_count)
email_campaign_recipients (campaign_id, recipient_email, status, sent_at, opened_at)
```

### Financial Management
```sql
-- Payment and earnings
payment_methods (id, user_id, type, provider, details, is_default)
withdrawal_requests (id, trainer_id, amount, status, payment_method_id, admin_notes)
gym_earnings (id, gym_id, amount, commission, net_amount, membership_id)
```

### User Engagement
```sql
-- User preferences and activity
favorites (id, client_id, trainer_id)
gym_favorites (id, user_id, gym_id)
notifications (id, user_id, title, message, type, is_read, related_id)
search_history (id, user_id, search_query, filters)
```

## Key Features & Business Logic

### 1. Trainer Marketplace
- **Gig Creation**: Trainers create service offerings with tiered pricing (Basic/Standard/Premium)
- **Service Categories**: Fitness training, nutrition coaching, specialized programs
- **Verification System**: Admin-verified trainer profiles with certification validation
- **Portfolio Management**: Image galleries, service descriptions, FAQ sections

### 2. Booking & Session Management
- **Flexible Booking**: One-time sessions or package deals
- **Multiple Modes**: In-person, online, or hybrid training sessions
- **Scheduling System**: Calendar integration with availability management
- **Session Tracking**: Progress monitoring and session history

### 3. Payment Processing (UddoktaPay Integration)
- **Local Payment Methods**: bKash, Nagad, Rocket (mobile banking)
- **International Cards**: Visa, Mastercard support
- **Bank Transfers**: Direct bank account integration
- **Commission System**: 10% platform commission on all transactions
- **Secure Processing**: PCI-compliant payment handling

### 4. Real-time Messaging System
- **Direct Communication**: Trainer-client messaging
- **Plan Sharing**: Share workout/nutrition plans within conversations
- **File Attachments**: Image and document sharing
- **Read Receipts**: Message status tracking

### 5. Gym Management Platform
- **Membership Plans**: Flexible pricing and duration options
- **Member Management**: Registration, renewals, status tracking
- **Facility Booking**: Equipment and space reservations
- **Analytics Dashboard**: Revenue, member growth, utilization metrics

### 6. Content Management System
- **Blog Platform**: SEO-optimized content creation
- **Category Management**: Organized content structure
- **Author System**: Multi-author support with admin oversight
- **Publishing Workflow**: Draft, review, publish states

### 7. Administrative Controls
- **User Management**: Account creation, verification, suspension
- **Financial Oversight**: Transaction monitoring, commission tracking
- **Content Moderation**: Review and approve user-generated content
- **Analytics Dashboard**: Platform-wide metrics and insights
- **Email Campaigns**: Mass communication with users

### 8. AI Integration
- **HealthyThako AI**: Fitness and nutrition guidance assistant
- **Personalized Recommendations**: AI-driven trainer and gym suggestions
- **Content Generation**: Automated workout and meal plan suggestions

## Authentication & Security

### Multi-layered Authentication
1. **Supabase Auth**: Primary authentication system
2. **Admin Auth**: Separate authentication for administrators
3. **Gym Owner Auth**: Dedicated authentication for gym owners
4. **Session Management**: Secure token-based sessions

### Role-Based Access Control (RBAC)
- **Route Protection**: Role-specific route access
- **Component-level Security**: Conditional rendering based on roles
- **API Security**: Row Level Security (RLS) on all database tables
- **Permission Granularity**: Fine-grained access control

### Data Security
- **Row Level Security**: Database-level access control
- **Input Validation**: Comprehensive form validation
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content sanitization

## Performance Optimizations

### Frontend Performance
- **Code Splitting**: Lazy-loaded routes and components
- **Image Optimization**: Responsive images with proper sizing
- **Bundle Optimization**: Tree shaking and dead code elimination
- **Caching Strategy**: React Query for intelligent data caching

### Database Performance
- **Indexing Strategy**: Optimized database indexes
- **Query Optimization**: Efficient database queries
- **Connection Pooling**: Supabase connection management
- **Real-time Subscriptions**: Efficient WebSocket connections

## Business Model

### Revenue Streams
1. **Commission-based**: 10% commission on all trainer bookings
2. **Gym Partnerships**: Revenue sharing with gym memberships
3. **Premium Features**: Advanced analytics and tools
4. **Advertising**: Promoted trainer and gym listings

### Market Focus
- **Primary Market**: Bangladesh fitness industry
- **Target Demographics**: Urban professionals, fitness enthusiasts
- **Local Integration**: Bengali language support, local payment methods
- **Cultural Adaptation**: Culturally appropriate fitness programs

## Development Workflow

### Code Organization
```
src/
├── components/         # Reusable UI components
│   ├── ui/             # Base UI components (shadcn-ui)
│   ├── client/         # Client-specific components
│   ├── trainer/        # Trainer-specific components
│   ├── admin/          # Admin-specific components
│   └── public/         # Public-facing components
├── pages/              # Route components
├── contexts/           # React Context providers
├── hooks/              # Custom React hooks
├── integrations/       # External service integrations
├── lib/                # Utility functions
└── types/              # TypeScript type definitions
```

### State Management Strategy
- **Server State**: TanStack Query for API data
- **Client State**: React Context for UI state
- **Form State**: React Hook Form for form management
- **Authentication State**: Dedicated auth context

### API Integration
- **Supabase Client**: Type-safe database operations
- **Edge Functions**: Serverless business logic
- **Real-time Subscriptions**: Live data updates
- **File Upload**: Integrated storage management

## Deployment & Infrastructure

### Hosting Strategy
- **Frontend**: Vercel/Netlify for static site hosting
- **Backend**: Supabase managed infrastructure
- **CDN**: Global content delivery network
- **SSL**: Automatic HTTPS certificate management

### Environment Management
- **Development**: Local Supabase instance
- **Staging**: Separate Supabase project for testing
- **Production**: Production Supabase project with backups
- **Environment Variables**: Secure configuration management

## Future Roadmap

### Planned Features
1. **Mobile Application**: React Native mobile app
2. **Video Calling**: Integrated video sessions
3. **Wearable Integration**: Fitness tracker connectivity
4. **Advanced Analytics**: ML-powered insights
5. **Marketplace Expansion**: Equipment and supplement sales
6. **Social Features**: Community building and challenges
7. **Multi-language Support**: Additional language options
8. **Franchise System**: Gym franchise management tools

### Technical Improvements
1. **Microservices Architecture**: Service decomposition
2. **Advanced Caching**: Redis integration
3. **Search Enhancement**: Elasticsearch implementation
4. **Real-time Features**: Enhanced WebSocket functionality
5. **API Gateway**: Centralized API management
6. **Monitoring**: Advanced application monitoring
7. **Testing**: Comprehensive test coverage
8. **Documentation**: API documentation and guides

This context document provides a comprehensive overview of the HealthyThako Trainer platform, covering all technical, business, and architectural aspects of the system.

## 1. Critical User Flows & Routing Patterns

### 1.1 Trainer Booking Flow (Client Journey)

**Primary Route**: `/find-trainers` → `/trainer/:trainerId` → `/booking-flow` → `/payment` → `/client-dashboard/bookings`

#### Flow Steps:
1. **Discovery Phase**
   - Client visits `/find-trainers`
   - Filters by location, specialization, price range, rating
   - Views trainer cards with basic info and ratings

2. **Selection Phase**
   - Clicks on trainer card → opens trainer profile modal
   - Or navigates to `/trainer/:trainerId` for full profile
   - Reviews services, portfolio, reviews, and pricing

3. **Booking Initiation**
   - Clicks "Book Session" → redirects to `/booking-flow?trainer=:trainerId`
   - Selects service type (gig-based or custom session)
   - Chooses session count, mode (online/in-person), and date

4. **Payment Processing**
   - Redirects to UddoktaPay payment gateway
   - Processes payment via bKash, Nagad, Rocket, or card
   - Returns to `/payment-success` or `/payment-failed`

5. **Confirmation & Management**
   - Successful booking creates entry in `bookings` table
   - Client redirected to `/client-dashboard/bookings`
   - Trainer receives notification and booking request

#### Key Components:
- `TrainerCard` - Trainer listing display
- `TrainerProfile` - Detailed trainer information
- `BookingFlow` - Multi-step booking process
- `PaymentGateway` - UddoktaPay integration
- `BookingConfirmation` - Success/failure handling

### 1.2 Gym Membership Purchase Flow

**Primary Route**: `/gym-membership` → `/gym/:gymId` → `/membership-purchase` → `/payment` → `/client-dashboard/memberships`

#### Flow Steps:
1. **Gym Discovery**
   - Client visits `/gym-membership`
   - Browses available gyms with location filtering
   - Views gym cards with amenities and pricing

2. **Gym Selection**
   - Clicks gym card → navigates to `/gym/:gymId`
   - Reviews gym details, amenities, membership plans
   - Compares different membership tiers

3. **Membership Selection**
   - Selects membership plan (monthly/quarterly/yearly)
   - Clicks "Purchase Membership" → `/membership-purchase?gym=:gymId&plan=:planId`
   - Reviews membership benefits and terms

4. **Payment & Activation**
   - Processes payment through UddoktaPay
   - Creates entry in `gym_memberships` table
   - Generates membership ID and QR code

5. **Membership Management**
   - Client redirected to `/client-dashboard/memberships`
   - Can view membership status, expiry, and gym access

### 1.3 Trainer Request Management Flow

**Primary Route**: `/trainer-dashboard/orders` → `/trainer-dashboard/orders/:bookingId` → `/trainer-dashboard/messages`

#### Flow Steps:
1. **Request Reception**
   - Trainer receives booking notification
   - Visits `/trainer-dashboard/orders` to view pending requests
   - Reviews client profile and booking details

2. **Request Evaluation**
   - Clicks on booking → `/trainer-dashboard/orders/:bookingId`
   - Reviews session requirements, client goals, and payment status
   - Can accept, decline, or request modifications

3. **Acceptance & Communication**
   - Accepts booking → status changes to "confirmed"
   - Automatically creates conversation thread
   - Redirected to `/trainer-dashboard/messages` for client communication

4. **Session Preparation**
   - Can share workout/nutrition plans through messaging
   - Schedules session details and location/meeting info
   - Updates booking status as sessions progress

## 2. Authentication & Role-Based Routing

### 2.1 Multi-Role Authentication System

#### Client Authentication
- **Route**: `/auth` (login/signup)
- **Redirect**: `/client-dashboard` after successful login
- **Protected Routes**: All `/client-dashboard/*` routes

#### Trainer Authentication
- **Route**: `/auth` with trainer role selection
- **Redirect**: `/trainer-dashboard` after successful login
- **Protected Routes**: All `/trainer-dashboard/*` routes
- **Verification**: Requires admin approval for full access

#### Gym Owner Authentication
- **Route**: `/auth/gym` (dedicated gym owner auth)
- **Redirect**: `/gym-dashboard` after successful login
- **Protected Routes**: All `/gym-dashboard/*` routes
- **Verification**: Business license verification required

#### Admin Authentication
- **Route**: `/admin/login` (separate admin portal)
- **Redirect**: `/admin/dashboard` after successful login
- **Protected Routes**: All `/admin/*` routes
- **Security**: Enhanced security with session management

### 2.2 Route Protection Implementation

```typescript
// Protected route wrapper with role-based access
<ProtectedRoute allowedRoles={['client']}>
  <ClientDashboard />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['trainer']}>
  <TrainerDashboard />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['gym_owner']}>
  <GymDashboard />
</ProtectedRoute>

<ProtectedRoute allowedRoles={['admin']}>
  <AdminDashboard />
</ProtectedRoute>
```

## 3. Messaging & Communication Flow

### 3.1 Trainer-Client Communication

**Primary Route**: `/trainer-dashboard/messages` ↔ `/client-dashboard/messages`

#### Flow Steps:
1. **Conversation Initiation**
   - Automatically created when booking is accepted
   - Both parties can access via their respective message dashboards
   - Real-time updates using Supabase subscriptions

2. **Message Exchange**
   - Text messages with real-time delivery
   - File attachments (images, documents)
   - Plan sharing (workout/nutrition plans)
   - Read receipts and typing indicators

3. **Plan Sharing Integration**
   - Trainers can share custom workout plans
   - Nutrition plans with meal recommendations
   - Plans are embedded in conversation with preview
   - Clients can save plans to their library

### 3.2 Notification System

#### Real-time Notifications
- **Booking Requests**: Instant trainer notifications
- **Message Alerts**: Real-time message notifications
- **Payment Updates**: Transaction status updates
- **Membership Expiry**: Automated renewal reminders

## 4. Payment Processing Architecture

### 4.1 UddoktaPay Integration Flow

**Edge Function**: `create-payment` → UddoktaPay Gateway → `verify-payment`

#### Payment Process:
1. **Payment Initiation**
   - Client submits booking/membership purchase
   - System calls `create-payment` edge function
   - Creates payment session with UddoktaPay

2. **Gateway Processing**
   - User redirected to UddoktaPay interface
   - Selects payment method (bKash, Nagad, Rocket, Card)
   - Completes payment authentication

3. **Payment Verification**
   - UddoktaPay sends webhook to `verify-payment` function
   - Verifies payment status and amount
   - Updates booking/membership status in database

4. **Commission Handling**
   - 10% platform commission automatically calculated
   - Trainer/gym owner receives 90% of payment
   - Commission tracked in `transactions` table

### 4.2 Financial Management

#### Trainer Earnings
- **Route**: `/trainer-dashboard/earnings`
- **Features**: Earnings overview, withdrawal requests, transaction history
- **Withdrawal**: Manual withdrawal requests processed by admin

#### Gym Revenue
- **Route**: `/gym-dashboard/analytics`
- **Features**: Membership revenue, member growth, analytics
- **Payout**: Automated monthly payouts to gym owners

## 5. Admin Management System

### 5.1 User Management Flow

**Primary Route**: `/admin/users` → `/admin/users/:userId` → `/admin/users/actions`

#### Admin Capabilities:
1. **User Oversight**
   - View all users across roles
   - User verification and approval
   - Account suspension/activation

2. **Trainer Verification**
   - Review trainer applications
   - Verify certifications and credentials
   - Approve/reject trainer profiles

3. **Content Moderation**
   - Review user-generated content
   - Moderate reviews and ratings
   - Handle dispute resolution

### 5.2 Platform Analytics

**Route**: `/admin/analytics`

#### Analytics Features:
- **User Growth**: Registration trends and user acquisition
- **Revenue Tracking**: Platform commission and transaction volumes
- **Engagement Metrics**: Session completion rates, user activity
- **Performance Monitoring**: System health and response times

## 6. Content Management & Blog System

### 6.1 Blog Management Flow

**Admin Route**: `/admin/blog` → `/admin/blog/create` → `/admin/blog/edit/:postId`
**Public Route**: `/blog` → `/blog/:slug`

#### Content Workflow:
1. **Content Creation**
   - Admin creates blog posts via rich text editor
   - SEO optimization with meta tags and descriptions
   - Category assignment and tag management

2. **Publishing Process**
   - Draft → Review → Published workflow
   - Scheduled publishing capabilities
   - Featured post management

3. **Public Display**
   - SEO-friendly URLs with slugs
   - Category-based filtering
   - Search functionality

## 7. Advanced Features & Integrations

### 7.1 AI Integration (HealthyThako AI)

**Route**: `/ai`

#### AI Capabilities:
- **Fitness Guidance**: Personalized workout recommendations
- **Nutrition Advice**: Meal planning and dietary suggestions
- **Trainer Matching**: AI-powered trainer recommendations
- **Progress Tracking**: Intelligent progress analysis

### 7.2 Real-time Features

#### WebSocket Connections:
- **Live Messaging**: Real-time chat functionality
- **Booking Updates**: Live booking status changes
- **Notification Delivery**: Instant notification system
- **Activity Tracking**: Real-time user activity monitoring

### 7.3 Search & Discovery System

#### Advanced Search Features:
- **Trainer Search**: Location-based with filters
- **Gym Discovery**: Amenity-based filtering
- **Service Search**: Category and price-based search
- **Content Search**: Blog and resource search

#### Search Implementation:
- **Database Indexing**: Optimized search queries
- **Filter Combinations**: Multiple filter support
- **Search History**: User search tracking
- **Recommendations**: Personalized suggestions based on search patterns 