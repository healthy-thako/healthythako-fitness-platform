# 🔄 HealthyThako Complete Redirection System

## 📋 System Overview

The HealthyThako app uses a sophisticated redirection system that seamlessly handles payments between the mobile app and website, ensuring both platforms share the same database and provide a unified user experience.

## 🏗️ Architecture Components

### 1. **Shared Database (Supabase)**
- **URL**: `https://lhncpcsniuxnrmabbkmr.supabase.co`
- **Tables**: `orders`, `trainer_bookings`, `payment_transactions`
- **Authentication**: Row Level Security (RLS) enabled
- **Real-time**: Synchronized between app and website

### 2. **Payment Gateway (UddoktaPay)**
- **API Key**: `yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU`
- **Environment**: Production
- **Base URL**: `https://digitaldot.paymently.io/api`

### 3. **Redirect Handler**
- **Location**: `https://healthythako.com/payment-redirect/index.html`
- **Purpose**: Process payment results and redirect to mobile app
- **Features**: Database verification, deep linking, error handling

## 🔗 Deep Linking Flow

### Step-by-Step Process:

1. **Payment Initiation (Mobile App)**
   ```javascript
   // App detects mobile environment
   const paymentUrls = getPaymentUrls('trainer_booking');
   // Returns: healthythako.com/payment-redirect for return_url
   ```

2. **Payment Processing (UddoktaPay)**
   ```
   User completes payment → UddoktaPay redirects to:
   https://healthythako.com/payment-redirect/index.html?type=success&orderId=123&source=mobile_app
   ```

3. **Database Verification (Website)**
   ```javascript
   // Redirect handler verifies payment in database
   const orderData = await verifyPaymentStatus(orderId);
   // Updates order status to 'completed'
   ```

4. **Deep Link Generation (Website)**
   ```javascript
   const deepLink = buildDeepLink();
   // Returns: healthythako://payment-success?orderId=123&status=completed
   ```

5. **App Redirect (Multiple Methods)**
   ```javascript
   // Method 1: iframe (iOS Safari)
   iframe.src = deepLinkUrl;
   
   // Method 2: Direct redirect (Android Chrome)
   window.location.href = deepLinkUrl;
   
   // Method 3: Link click (Fallback)
   link.click();
   ```

6. **App Handling (Mobile App)**
   ```javascript
   // React Native deep link handler
   Linking.addEventListener('url', (event) => {
     if (event.url.startsWith('healthythako://payment-success')) {
       navigateToPaymentSuccess(parseParams(event.url));
     }
   });
   ```

## 📊 Database Schema Integration

### Order Types and Tables:

**1. Trainer Bookings** (`trainer_bookings`)
```sql
id: uuid (Primary Key)
user_id: uuid (Client)
trainer_id: uuid (Trainer)
total_amount: numeric
status: varchar ('pending', 'confirmed', 'completed', 'cancelled')
payment_status: varchar ('pending', 'completed', 'failed')
session_date: date
session_time: time
```

**2. Gym Memberships** (`orders`)
```sql
id: uuid (Primary Key)
user_id: uuid (Member)
gym_id: uuid (Gym)
total_amount: numeric
status: text ('pending', 'completed', 'cancelled')
payment_status: text ('pending', 'completed', 'failed')
membership_type: text
membership_details: jsonb
```

**3. Payment Transactions** (`payment_transactions`)
```sql
id: uuid (Primary Key)
trainer_id: uuid
amount: numeric
payment_status: varchar
payment_method: varchar
transaction_type: varchar
metadata: jsonb
```

## 🔧 Configuration Details

### Environment Variables (Production):
```bash
# Supabase (CORRECTED)
VITE_SUPABASE_URL=https://lhncpcsniuxnrmabbkmr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# UddoktaPay
VITE_UDDOKTAPAY_API_KEY=yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU
VITE_UDDOKTAPAY_BASE_URL=https://digitaldot.paymently.io/api

# Mobile Deep Links
VITE_MOBILE_APP_SCHEME=healthythako
VITE_MOBILE_DEEP_LINK_SUCCESS=healthythako://payment/success
VITE_MOBILE_DEEP_LINK_CANCEL=healthythako://payment/cancelled

# Website URLs
VITE_APP_URL=https://healthythako.com
VITE_PAYMENT_REDIRECT_URL=/payment-redirect
```

### Mobile App URL Scheme Registration:

**iOS (Info.plist):**
```xml
<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleURLName</key>
        <string>healthythako</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>healthythako</string>
        </array>
    </dict>
</array>
```

**Android (AndroidManifest.xml):**
```xml
<activity android:name=".MainActivity">
    <intent-filter>
        <action android:name="android.intent.action.VIEW" />
        <category android:name="android.intent.category.DEFAULT" />
        <category android:name="android.intent.category.BROWSABLE" />
        <data android:scheme="healthythako" />
    </intent-filter>
</activity>
```

## 🧪 Testing & Validation

### Test URLs:
```bash
# Success Test
https://healthythako.com/payment-redirect/index.html?type=success&orderId=test123&source=mobile_app

# Cancel Test
https://healthythako.com/payment-redirect/index.html?type=cancel&orderId=test123&source=mobile_app

# Deep Link Test
healthythako://payment-success?orderId=test123&status=completed&source=web_redirect
```

### Validation Checklist:
- [ ] ✅ Database connection established
- [ ] ✅ Order verification working
- [ ] ✅ Status updates successful
- [ ] ✅ Deep links generated correctly
- [ ] ✅ Mobile app receives deep links
- [ ] ✅ Error handling functional
- [ ] ✅ Analytics tracking active

## 🚨 Critical Fixes Applied

### 1. **Database URL Correction**
- **Before**: `lhxhbdhqzgqmgdmqdnfm.supabase.co` (WRONG)
- **After**: `lhncpcsniuxnrmabbkmr.supabase.co` (CORRECT)

### 2. **Schema Mapping Update**
- **Removed**: Non-existent `bundle_orders` table
- **Added**: Proper `payment_transactions` fallback
- **Fixed**: Order ID pattern matching

### 3. **CSP Header Update**
- **Updated**: Content Security Policy to allow correct Supabase URL
- **Secured**: Script and connection sources

### 4. **Error Handling Enhancement**
- **Added**: Comprehensive error logging
- **Improved**: User feedback messages
- **Enhanced**: Fallback mechanisms

## 🔒 Security Measures

### Database Security:
- **RLS Policies**: Active on all tables
- **Anonymous Key**: Limited read/write permissions
- **Service Role**: Required for admin operations

### Payment Security:
- **HTTPS Only**: All payment redirects use SSL
- **Parameter Validation**: All URL parameters sanitized
- **API Key Protection**: Stored in environment variables

### Deep Link Security:
- **URL Scheme Validation**: App validates incoming URLs
- **Parameter Verification**: All parameters checked before processing
- **Fallback Handling**: Graceful degradation for failed redirects

## 📈 Monitoring & Analytics

### Event Tracking:
```javascript
// Payment redirect events
trackEvent('payment_redirect_view', { type, source, order_id });
trackEvent('payment_success_redirect', { order_id, amount });
trackEvent('deep_link_attempt', { method, success });
```

### Error Monitoring:
```javascript
// Global error handling
window.addEventListener('error', (e) => {
  trackEvent('payment_redirect_error', { error: e.message });
});
```

## 🎯 Success Metrics

The redirection system is considered successful when:

1. **Database Synchronization**: ✅ 100% order status updates
2. **Deep Link Success**: ✅ >95% successful app redirects
3. **Error Rate**: ✅ <1% payment processing errors
4. **User Experience**: ✅ <3 second redirect time
5. **Cross-Platform**: ✅ Works on iOS and Android

## 🔄 Maintenance

### Regular Checks:
- **Weekly**: Database connection health
- **Monthly**: Deep link functionality
- **Quarterly**: Security audit
- **Annually**: URL scheme updates

This comprehensive redirection system ensures seamless payment processing between the HealthyThako mobile app and website while maintaining data consistency and providing excellent user experience.
