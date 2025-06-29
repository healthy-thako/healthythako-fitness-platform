# Healthythako.com Website Integration Guide

## Overview

This guide provides instructions for the healthythako.com website developer to implement payment redirect handling and API integration that works seamlessly with the mobile app. Both the website and mobile app share the same Supabase database.

## 1. Payment Redirect Handler Implementation

### Critical Requirement: `/payment-redirect` Endpoint

**File Location**: `https://healthythako.com/payment-redirect/index.html`

**Purpose**: Handle UddoktaPay payment redirects and deep link back to the mobile app

### URL Parameters Received

When UddoktaPay redirects to your website, you'll receive these parameters:

```
https://healthythako.com/payment-redirect?type=success&orderId=123&source=mobile_app&timestamp=1234567890
```

- `type`: 'success' or 'cancel'
- `orderId`: Order ID from mobile app
- `source`: 'mobile_app' (indicates redirect from mobile)
- `timestamp`: Timestamp of the redirect

### Required Implementation

Create this HTML file that will:
1. **Detect payment result** (success/cancel)
2. **Show appropriate UI** (loading, success, or cancel state)
3. **Attempt deep link** back to mobile app
4. **Provide fallback options** if deep link fails

### Deep Link Format

Your website should redirect back to the app using:

```
// For successful payments
healthythako://payment-success?orderId=123&status=completed&source=web_redirect

// For cancelled payments
healthythako://payment-cancel?orderId=123&status=cancelled&source=web_redirect
```

## 2. Database Integration

### Shared Supabase Database

Both the website and mobile app use the same Supabase database.

#### Environment Variables

Add these to your website's environment configuration:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# UddoktaPay Configuration (if handling payments on website)
NEXT_PUBLIC_UDDOKTAPAY_API_KEY=your_uddoktapay_api_key
NEXT_PUBLIC_UDDOKTAPAY_BASE_URL=https://sandbox.uddoktapay.com/api/checkout-v2

# Website Configuration
NEXT_PUBLIC_WEBSITE_URL=https://healthythako.com
NEXT_PUBLIC_API_URL=https://api.healthythako.com
```

#### Key Database Tables

```sql
-- Orders table (for gym memberships, products, trainer bookings)
orders (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  gym_id UUID REFERENCES gyms(id),
  membership_type TEXT,
  price DECIMAL,
  tax DECIMAL,
  total_amount DECIMAL,
  payment_method TEXT,
  status TEXT, -- 'pending', 'completed', 'cancelled', 'failed'
  payment_status TEXT, -- 'pending', 'completed', 'failed'
  transaction_id TEXT,
  invoice_id TEXT,
  membership_details JSONB,
  shipping_info JSONB,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)

-- Products table
products (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  price DECIMAL,
  category TEXT,
  image_url TEXT,
  is_active BOOLEAN,
  stock_quantity INTEGER,
  created_at TIMESTAMP
)

-- Gyms table
gyms (
  id UUID PRIMARY KEY,
  name TEXT,
  description TEXT,
  address TEXT,
  rating DECIMAL,
  is_gym_pass_enabled BOOLEAN,
  created_at TIMESTAMP
)

-- Membership plans
membership_plans (
  id UUID PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id),
  name TEXT,
  description TEXT,
  price DECIMAL,
  duration_days INTEGER,
  features JSONB,
  created_at TIMESTAMP
)

-- User profiles
user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT,
  phone_number TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  role TEXT, -- 'user', 'gym_owner', 'trainer', 'admin'
  created_at TIMESTAMP
)
```

## 3. API Integration Examples

### Supabase Client Setup

```javascript
// lib/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Order Management

```javascript
// lib/orders.js
import { supabase } from './supabase'

// Get order by ID
export async function getOrder(orderId) {
  const { data, error } = await supabase
    .from('orders')
    .select(\`
      *,
      gyms(name, address),
      user_profiles(full_name, email)
    \`)
    .eq('id', orderId)
    .single()
  
  if (error) throw error
  return data
}

// Update order status
export async function updateOrderStatus(orderId, status, paymentData = {}) {
  const { data, error } = await supabase
    .from('orders')
    .update({
      status,
      payment_status: paymentData.payment_status || status,
      transaction_id: paymentData.transaction_id,
      invoice_id: paymentData.invoice_id,
      updated_at: new Date().toISOString()
    })
    .eq('id', orderId)
    .select()
  
  if (error) throw error
  return data[0]
}

// Get user orders
export async function getUserOrders(userId) {
  const { data, error } = await supabase
    .from('orders')
    .select(\`
      *,
      gyms(name, address),
      products(name, image_url)
    \`)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}
```

## 4. Implementation Checklist

### Phase 1: Payment Redirect (Critical)
- [ ] ✅ Deploy `/payment-redirect/index.html` to website
- [ ] ✅ Test deep link functionality
- [ ] ✅ Verify HTTPS configuration
- [ ] ✅ Test with mobile app payment flow

### Phase 2: Database Integration
- [ ] ✅ Set up Supabase client
- [ ] ✅ Implement order management APIs
- [ ] ✅ Add product management
- [ ] ✅ Add gym management
- [ ] ✅ Test database operations

### Phase 3: Testing & Deployment
- [ ] ✅ End-to-end testing
- [ ] ✅ Mobile app integration testing
- [ ] ✅ Production deployment
- [ ] ✅ Monitor payment flows

## 5. Testing Instructions

### Test Payment Redirect

1. **Create test URL**:
   ```
   https://healthythako.com/payment-redirect?type=success&orderId=test123&source=mobile_app&timestamp=1234567890
   ```

2. **Open in mobile browser** and verify:
   - UI shows success state
   - Deep link attempts to open app
   - Fallback button works

3. **Test cancel flow**:
   ```
   https://healthythako.com/payment-redirect?type=cancel&orderId=test123&source=mobile_app
   ```

## 6. Security Considerations

- **HTTPS Only**: All payment redirects must use HTTPS
- **Parameter Validation**: Sanitize all URL parameters
- **Database Security**: Use Row Level Security (RLS) in Supabase
- **API Rate Limiting**: Implement rate limiting on payment endpoints

## 7. Support & Troubleshooting

### Common Issues

1. **Deep link not working**: Check mobile app scheme configuration
2. **Database connection failed**: Verify Supabase credentials
3. **Payment creation failed**: Check UddoktaPay API key and environment
4. **CORS errors**: Configure proper CORS settings

This implementation will ensure seamless integration between the healthythako.com website and the mobile app, with shared database access and proper payment redirect handling.
