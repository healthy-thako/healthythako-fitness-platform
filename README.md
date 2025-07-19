# 🏋️ HealthyThako - Unified Fitness Ecosystem

A comprehensive fitness platform connecting trainers, gyms, and fitness enthusiasts across multiple platforms with seamless user experiences.

## 🌐 Ecosystem Overview

HealthyThako consists of three interconnected platforms sharing a unified database:
- **📱 Mobile App**: Client-focused fitness tracking and booking
- **👨‍💼 HT Trainer App**: Trainer-focused client management
- **🌐 Website**: Public-facing platform and user onboarding

All platforms work together to provide a seamless, cross-platform fitness experience.

## 🌟 Features

- **Trainer Search & Booking**: Find and book certified fitness trainers
- **Gym Membership**: Browse and join gyms with flexible membership plans
- **Payment Integration**: Secure payments via UddoktaPay
- **Multi-Role Dashboard**: Separate dashboards for clients, trainers, gym owners, and admins
- **Real-time Chat**: Communication between trainers and clients
- **Mobile App Support**: Deep linking and mobile-optimized experience

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Supabase account and project
- UddoktaPay merchant account (for payments)

### Environment Setup
1. Clone the repository
2. Copy `.env.example` to `.env` and configure:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_UDDOKTAPAY_API_KEY=your_uddoktapay_api_key
VITE_ENABLE_DEBUG_LOGS=true  # For development
```

### Installation & Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The application will be available at `http://localhost:8080`

## 🔧 Database Setup

### Supabase Configuration
1. Create a new Supabase project
2. Run the database migrations in `supabase/migrations/`
3. Set up Row Level Security (RLS) policies
4. Configure authentication providers

### Required Database Functions
The application uses several PostgreSQL functions for enhanced performance:
- `search_trainers_enhanced` - Optimized trainer search
- `get_trainer_with_profile` - Complete trainer data retrieval
- `book_trainer_session` - Session booking logic
- `update_trainer_rating` - Rating calculations

See `SUPABASE_TIMEOUT_FIXES.md` for detailed database setup and performance optimizations.

## 🐛 Debugging & Testing

### Debug Mode
Enable comprehensive logging in development:
```env
VITE_ENABLE_DEBUG_LOGS=true
```

### Connection Testing
Visit `/connection-test` in development to:
- Test database connections
- Benchmark query performance
- Verify RPC functions
- Monitor real-time performance

### Available Test Pages (Development Only)
- `/connection-test` - Database connection testing
- `/data-fetch-test` - Data fetching verification
- `/payment-test` - Payment integration testing
- `/auth-diagnostic` - Authentication debugging

## 🏗️ Architecture

### Tech Stack
- **Frontend**: React 18 + TypeScript + Vite
- **UI Components**: shadcn/ui + Tailwind CSS
- **State Management**: React Query (TanStack Query)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Payments**: UddoktaPay (Bangladesh)
- **Routing**: React Router v6

### Project Structure
```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom React hooks
├── contexts/           # React contexts
├── integrations/       # External service integrations
├── utils/              # Utility functions
└── types/              # TypeScript type definitions
```

### Key Features Implementation

#### Enhanced Database Performance
- Custom timeout and retry logic for all database operations
- Optimized RPC functions for complex queries
- Comprehensive error handling and fallback strategies
- Real-time connection monitoring and testing

#### Multi-Role Authentication
- Role-based access control (Client, Trainer, Gym Owner, Admin)
- Protected routes with role verification
- Session management with automatic refresh

#### Payment Integration
- UddoktaPay integration for Bangladesh market
- Mobile app deep linking support
- Secure payment processing with proper error handling

## 📱 Mobile App Integration

The platform supports mobile app integration through:
- Deep linking for payment flows
- Mobile-optimized responsive design
- WebView compatibility
- Push notification support (planned)

## 🔒 Security

- Row Level Security (RLS) policies on all database tables
- JWT-based authentication with automatic token refresh
- Input validation and sanitization
- CORS configuration for secure API access

## 📊 Performance Optimizations

Recent performance improvements include:
- Enhanced Supabase client configuration with 30-second timeouts
- Retry logic for failed database operations
- Optimized query patterns with proper indexing
- React Query caching strategies

See `SUPABASE_TIMEOUT_FIXES.md` for detailed performance optimization documentation.

## 🚀 Deployment

### Production Environment Variables
```env
VITE_APP_ENVIRONMENT=production
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_anon_key
VITE_UDDOKTAPAY_API_KEY=your_production_uddoktapay_key
VITE_ENABLE_DEBUG_LOGS=false
```

### Build and Deploy
```bash
# Build for production
npm run build

# Deploy to Netlify (configured in netlify.toml)
# Automatic deployment on main branch push
```

## 📚 Documentation

### **Ecosystem Documentation**
- `HEALTHYTHAKO_ECOSYSTEM_DOCUMENTATION.md` - Complete ecosystem overview
- `SEAMLESS_USER_EXPERIENCE_REQUIREMENTS.md` - Cross-platform UX requirements
- `CLEANUP_SUMMARY.md` - Codebase cleanup and optimization summary

### **Technical Documentation**
- `SUPABASE_TIMEOUT_FIXES.md` - Database performance and timeout fixes
- `RLS_POLICIES_ANALYSIS_AND_FIXES.md` - Database security and policies
- `MOBILE_APP_TESTING_GUIDE.md` - Mobile integration testing
- `ENHANCED_PAYMENT_REDIRECT_HANDLER.html` - Payment flow documentation

### **Deployment & Testing**
- `/deployment-test` - Production deployment testing (always available)
- Debug components available in development mode only

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly using the debug tools
5. Submit a pull request

## 📞 Support

For technical support or questions:
- Email: support@healthythako.com
- Documentation: Check the markdown files in the project root
- Debug Tools: Use the built-in testing pages in development mode

## 📄 License

This project is proprietary software for HealthyThako platform.
