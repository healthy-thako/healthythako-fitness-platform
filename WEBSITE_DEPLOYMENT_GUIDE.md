# HealthyThako Website Deployment Guide

## 🚀 Critical Deployment Steps

### 1. Payment Redirect Handler Deployment

**REQUIRED**: Deploy the `ENHANCED_PAYMENT_REDIRECT_HANDLER.html` file to:
```
https://healthythako.com/payment-redirect/index.html
```

This file has been **CORRECTED** with:
- ✅ Proper Supabase URL: `lhncpcsniuxnrmabbkmr.supabase.co`
- ✅ Correct database schema mapping
- ✅ Updated CSP headers
- ✅ Fixed order verification logic

### 2. Deep Linking Configuration

The app uses the URL scheme: `healthythako://`

**Deep Link URLs Generated:**
```javascript
// Success redirect
healthythako://payment-success?orderId={id}&status=completed&source=web_redirect&timestamp={timestamp}

// Cancel redirect  
healthythako://payment-cancel?orderId={id}&status=cancelled&source=web_redirect&timestamp={timestamp}
```

### 3. Database Schema Verification

**Current Tables Used for Payment Processing:**
- `orders` - Gym memberships, general orders
- `trainer_bookings` - Trainer session bookings  
- `payment_transactions` - Payment transaction records

**Order ID Patterns:**
- Trainer bookings: IDs containing "trainer" or starting with "trainer_"
- Regular orders: All other order IDs
- Payment transactions: Fallback for transaction-only records

### 4. Environment Configuration

**Required Environment Variables:**
```bash
# Supabase Configuration (CORRECTED)
SUPABASE_URL=https://lhncpcsniuxnrmabbkmr.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U

# UddoktaPay Configuration
UDDOKTAPAY_API_KEY=yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU
UDDOKTAPAY_BASE_URL=https://digitaldot.paymently.io/api
UDDOKTAPAY_ENVIRONMENT=production

# Website Configuration
WEBSITE_URL=https://healthythako.com
```

### 5. Testing Checklist

**Test URLs:**
```bash
# Success redirect test
https://healthythako.com/payment-redirect/index.html?type=success&orderId=test123&source=mobile_app

# Cancel redirect test  
https://healthythako.com/payment-redirect/index.html?type=cancel&orderId=test123&source=mobile_app
```

**Expected Behavior:**
1. ✅ Shows appropriate success/cancel UI
2. ✅ Connects to correct Supabase database
3. ✅ Attempts automatic app redirect (mobile)
4. ✅ Provides manual "Open App" button
5. ✅ Updates order status in database

### 6. Mobile App Integration

**URL Scheme Registration Required:**
- iOS: Add `healthythako` to URL schemes in Info.plist
- Android: Add intent filter for `healthythako://` scheme

**Deep Link Handler Implementation:**
```javascript
// React Native example
import { Linking } from 'react-native';

Linking.addEventListener('url', (event) => {
  const url = event.url;
  if (url.startsWith('healthythako://payment-success')) {
    // Handle payment success
    const params = parseURLParams(url);
    navigateToPaymentSuccess(params);
  } else if (url.startsWith('healthythako://payment-cancel')) {
    // Handle payment cancellation
    const params = parseURLParams(url);
    navigateToPaymentCancel(params);
  }
});
```

### 7. Security Considerations

**HTTPS Required:**
- All payment redirects must use HTTPS
- SSL certificate must be valid for healthythako.com

**CSP Headers:**
- Updated to allow connections to correct Supabase URL
- Restricts script sources for security

**Database Security:**
- Row Level Security (RLS) policies active
- Anonymous key has limited permissions
- Service role key required for admin operations

### 8. Monitoring & Troubleshooting

**Common Issues:**
1. **Deep link not working**: Check mobile app URL scheme registration
2. **Database connection failed**: Verify Supabase URL and key
3. **Order not found**: Check order ID format and table structure
4. **CORS errors**: Ensure proper domain configuration

**Debug Information:**
- All operations logged to browser console
- Error messages displayed to user
- Analytics tracking for payment events

### 9. Production Deployment

**Pre-deployment Checklist:**
- [ ] ✅ ENHANCED_PAYMENT_REDIRECT_HANDLER.html deployed to correct path
- [ ] ✅ HTTPS certificate valid
- [ ] ✅ Environment variables configured
- [ ] ✅ Database connection tested
- [ ] ✅ Mobile app deep linking tested
- [ ] ✅ Payment flow end-to-end tested

**Post-deployment Verification:**
- [ ] ✅ Test payment redirect from mobile app
- [ ] ✅ Verify database updates occur
- [ ] ✅ Check analytics tracking
- [ ] ✅ Monitor error logs

## 🔧 Technical Implementation Notes

### Database Schema Compatibility

The redirect handler now correctly maps to your actual database schema:

**Orders Table Structure:**
- `id` (uuid) - Primary key
- `user_id` (uuid) - User reference
- `total_amount` (numeric) - Payment amount
- `status` (text) - Order status
- `payment_status` (text) - Payment status
- `gym_id` (uuid) - Gym reference (for memberships)
- `membership_type` (text) - Membership type
- `created_at`, `updated_at` (timestamp)

**Trainer Bookings Table Structure:**
- `id` (uuid) - Primary key
- `user_id` (uuid) - Client reference
- `trainer_id` (uuid) - Trainer reference
- `total_amount` (numeric) - Session cost
- `status` (varchar) - Booking status
- `payment_status` (varchar) - Payment status
- `session_date` (date) - Session date
- `session_time` (time) - Session time
- `created_at`, `updated_at` (timestamp)

**Payment Transactions Table Structure:**
- `id` (uuid) - Primary key
- `trainer_id` (uuid) - Trainer reference
- `amount` (numeric) - Transaction amount
- `payment_status` (varchar) - Payment status
- `payment_method` (varchar) - Payment method
- `transaction_type` (varchar) - Transaction type
- `created_at`, `updated_at` (timestamp)

### Deep Linking Flow

1. **Payment Initiation**: Mobile app opens UddoktaPay in WebView
2. **Payment Processing**: User completes payment on UddoktaPay
3. **Redirect**: UddoktaPay redirects to healthythako.com/payment-redirect
4. **Database Update**: Website updates order status in Supabase
5. **Deep Link**: Website attempts to open mobile app with results
6. **App Handling**: Mobile app receives deep link and shows appropriate screen

This implementation ensures seamless integration between the website and mobile app with proper database synchronization.
