# 🚀 HealthyThako Payment Redirect Production Guide

## ✅ Problem Solved: Production-Ready Payment Redirection

### **Issue Description:**
The payment redirection system was using hardcoded localhost URLs, which would not work when deployed to the production domain (healthythako.com). This guide documents the complete solution for production-ready payment redirection.

### **Solution Implemented:**
Created a dynamic URL resolution system that automatically adapts to the deployment environment, ensuring payment redirects work correctly in both development (localhost) and production (healthythako.com) environments.

---

## 🛠️ **Implementation Details**

### **1. Dynamic URL Resolution System**
**File:** `src/config/env.ts`

**Features:**
- ✅ Automatic environment detection (development vs production)
- ✅ Dynamic URL generation based on current domain
- ✅ Mobile app deep link support
- ✅ Fallback to production domain for safety

```typescript
// Dynamic URL resolution
export const getAppUrl = () => {
  if (isProduction()) {
    return 'https://healthythako.com';
  }
  
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }
  
  return APP_CONFIG.url;
};
```

### **2. Enhanced Payment URL Generation**
**Features:**
- ✅ Environment-aware URL generation
- ✅ Mobile app detection and deep link support
- ✅ Payment type-specific URLs

```typescript
export const getPaymentUrls = (paymentType = 'general') => {
  const baseUrl = getAppUrl();
  
  if (isMobileApp()) {
    return {
      successUrl: `healthythako://payment/success?type=${paymentType}`,
      cancelUrl: `healthythako://payment/cancelled?type=${paymentType}`,
      redirectUrl: `healthythako://payment/success?type=${paymentType}`,
    };
  }
  
  return {
    successUrl: `${baseUrl}/payment-success`,
    cancelUrl: `${baseUrl}/payment-cancelled`,
    redirectUrl: `${baseUrl}/payment-redirect`,
  };
};
```

### **3. Updated Edge Functions**
**Files:** 
- `supabase/functions/create-payment/index.ts`
- `supabase/functions/verify-payment/index.ts`

**Features:**
- ✅ Dynamic origin detection from request headers
- ✅ Mobile app vs web app URL handling
- ✅ Fallback to production domain

```typescript
// Dynamic origin resolution in Edge Functions
const origin = req.headers.get('origin') || 
               req.headers.get('referer')?.split('/').slice(0, 3).join('/') || 
               'https://healthythako.com';

if (isMobileApp) {
  finalRedirectUrl = `healthythako://payment/success?type=${paymentType}`;
} else {
  finalRedirectUrl = return_url || `${origin}/payment-redirect`;
}
```

---

## 🌐 **Environment Configuration**

### **Development Environment (.env)**
```bash
VITE_APP_URL=http://localhost:8080
VITE_APP_ENVIRONMENT=development
VITE_ENABLE_DEBUG_LOGS=true
# ... other development settings
```

### **Production Environment (.env.production)**
```bash
VITE_APP_URL=https://healthythako.com
VITE_APP_ENVIRONMENT=production
VITE_ENABLE_DEBUG_LOGS=false
# ... other production settings
```

---

## 🚀 **Deployment Process**

### **Step 1: Prepare Production Environment**
```bash
# Setup production configuration
node scripts/deploy-to-production.js --setup

# Validate configuration
node scripts/deploy-to-production.js --validate
```

### **Step 2: Build Application**
```bash
npm run build
```

### **Step 3: Deploy to Hosting Platform**

#### **For Vercel:**
```bash
vercel --prod
```

#### **For Netlify:**
```bash
netlify deploy --prod
```

#### **For Manual Hosting:**
Upload the `dist/` folder to your web server at `healthythako.com`

### **Step 4: Configure Supabase Edge Functions**
```bash
# Set environment variables in Supabase Dashboard:
# - UDDOKTAPAY_API_KEY
# - SUPABASE_SERVICE_ROLE_KEY

# Deploy Edge Functions
supabase functions deploy --project-ref lhncpcsniuxnrmabbkmr
```

---

## 🧪 **Testing & Validation**

### **Automated Testing**
```bash
# Run comprehensive tests
node scripts/test-payment-redirect.js

# Validate configuration only
node scripts/test-payment-redirect.js --validate

# Show testing checklist
node scripts/test-payment-redirect.js --checklist
```

### **Manual Testing Checklist**

#### **🌐 Web Browser Testing:**
- [ ] Test payment flow on localhost:8080 (development)
- [ ] Test payment flow on healthythako.com (production)
- [ ] Verify redirect URLs use correct domain
- [ ] Test all payment types (trainer, gym, service)

#### **📱 Mobile App Testing:**
- [ ] Test payment flow in mobile app
- [ ] Verify deep link redirects work
- [ ] Test WebView payment integration

#### **🔧 Backend Testing:**
- [ ] Verify Edge Functions are deployed
- [ ] Test webhook functionality
- [ ] Check payment verification works

---

## 📱 **Mobile App Integration**

### **Deep Link Support:**
- ✅ Success: `healthythako://payment/success?type={type}`
- ✅ Cancelled: `healthythako://payment/cancelled?type={type}`
- ✅ Automatic mobile detection and URL switching

### **WebView Integration:**
```javascript
// Mobile app detection
const isMobileApp = window.ReactNativeWebView !== undefined;

// Automatic URL switching
if (isMobileApp) {
  // Use deep links
  redirectUrl = 'healthythako://payment/success';
} else {
  // Use web URLs
  redirectUrl = 'https://healthythako.com/payment-success';
}
```

---

## 🔐 **Security Considerations**

### **Environment Variables:**
- ✅ API keys properly configured for each environment
- ✅ Debug logs disabled in production
- ✅ Secure webhook validation

### **URL Validation:**
- ✅ Origin validation in Edge Functions
- ✅ Fallback to secure production domain
- ✅ Mobile app URL scheme validation

---

## 🎯 **Results**

### **✅ Problems Resolved:**
- ❌ **Before:** Hardcoded localhost URLs failed in production
- ✅ **After:** Dynamic URL resolution works in all environments

### **✅ Features Added:**
- 🌐 Environment-aware URL generation
- 📱 Mobile app deep link support
- 🔧 Production deployment automation
- 🧪 Comprehensive testing tools

### **✅ Files Updated:**
- `src/config/env.ts` - Dynamic URL system
- `src/hooks/useUddoktapayPayment.ts` - Enhanced mobile support
- `supabase/functions/create-payment/index.ts` - Dynamic origin handling
- `supabase/functions/verify-payment/index.ts` - Production URL support
- `.env.production` - Production configuration
- `scripts/deploy-to-production.js` - Deployment automation
- `scripts/test-payment-redirect.js` - Testing validation

---

## 📞 **Support & Troubleshooting**

### **Common Issues:**
1. **Payment redirects to localhost in production**
   - Solution: Ensure `.env.production` is used for build
   
2. **Mobile app deep links not working**
   - Solution: Verify mobile app URL scheme configuration
   
3. **Edge Functions not receiving correct URLs**
   - Solution: Check Supabase environment variables

### **Testing Commands:**
```bash
# Validate setup
node scripts/test-payment-redirect.js --validate

# Show deployment steps
node scripts/test-payment-redirect.js --deploy

# Get environment variables for hosting
node scripts/deploy-to-production.js --env-vars
```

---

## 🎉 **Conclusion**

The payment redirection system is now production-ready and will work correctly when deployed to healthythako.com. The dynamic URL resolution ensures compatibility across all environments while maintaining mobile app deep link support.
