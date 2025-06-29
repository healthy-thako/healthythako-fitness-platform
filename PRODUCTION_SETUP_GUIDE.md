# 🚀 HealthyThako Production Setup Guide

## ✅ **Current Status**

### **Completed:**
- ✅ Environment variables configured in `.env` file
- ✅ UddoktaPay API integration implemented
- ✅ Payment hooks updated for new database schema
- ✅ Edge Functions deployed with environment variable support
- ✅ Mobile app deep linking support implemented
- ✅ Comprehensive testing components created

### **Next Steps Required:**

## 🔧 **Step 1: Set Supabase Environment Variables**

### **Option A: Using Supabase CLI (Recommended)**

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Set environment variables for Edge Functions
supabase secrets set UDDOKTAPAY_API_KEY="yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU" --project-ref lhncpcsniuxnrmabbkmr
supabase secrets set SUPABASE_URL="https://lhncpcsniuxnrmabbkmr.supabase.co" --project-ref lhncpcsniuxnrmabbkmr

# Verify secrets are set
supabase secrets list --project-ref lhncpcsniuxnrmabbkmr
```

### **Option B: Using Supabase Dashboard**

1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/lhncpcsniuxnrmabbkmr)
2. Navigate to **Project Settings** → **Edge Functions** → **Environment Variables**
3. Add the following variables:
   - `UDDOKTAPAY_API_KEY` = `yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU`
   - `SUPABASE_URL` = `https://lhncpcsniuxnrmabbkmr.supabase.co`
   - `SUPABASE_SERVICE_ROLE_KEY` = (Get from Project Settings → API → service_role key)

## 🧪 **Step 2: Test Environment Setup**

After setting the environment variables:

1. **Visit Environment Setup Page:**
   ```
   http://localhost:8080/environment-setup
   ```

2. **Click "Refresh Status"** to verify environment variables are set

3. **Test Payment Integration:**
   ```
   http://localhost:8080/payment-test
   ```

4. **Run Validation Script:**
   ```bash
   node scripts/validate-payment-integration.js
   ```

## 💳 **Step 3: Test Payment Flows**

### **Test Each Payment Type:**

1. **Trainer Booking Payment:**
   - Go to `/payment-test`
   - Select "Trainer Booking"
   - Set amount (e.g., 1500 BDT)
   - Click "Test trainer Payment"

2. **Gym Membership Payment:**
   - Select "Gym Membership"
   - Set amount (e.g., 2000 BDT)
   - Click "Test gym Payment"

3. **Service Order Payment:**
   - Select "Service Order"
   - Set amount (e.g., 800 BDT)
   - Click "Test service Payment"

### **Expected Results:**
- Payment gateway opens (UddoktaPay)
- Successful payment creates database records
- User redirected to success page
- Transaction logged in database

## 🌐 **Step 4: Production Deployment**

### **Frontend Deployment (Vercel/Netlify):**

1. **Set Environment Variables:**
   ```env
   VITE_SUPABASE_URL=https://lhncpcsniuxnrmabbkmr.supabase.co
   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   VITE_UDDOKTAPAY_API_KEY=yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU
   VITE_UDDOKTAPAY_BASE_URL=https://digitaldot.paymently.io/api
   VITE_APP_URL=https://your-domain.com
   VITE_APP_ENVIRONMENT=production
   VITE_ENABLE_DEBUG_LOGS=false
   ```

2. **Build and Deploy:**
   ```bash
   npm run build
   # Deploy dist folder to your hosting platform
   ```

### **Edge Functions Deployment:**

```bash
# Deploy all Edge Functions
supabase functions deploy --project-ref lhncpcsniuxnrmabbkmr

# Or deploy individually
supabase functions deploy create-payment --project-ref lhncpcsniuxnrmabbkmr
supabase functions deploy verify-payment --project-ref lhncpcsniuxnrmabbkmr
```

## 📱 **Step 5: Mobile App Integration**

### **Deep Link Configuration:**

1. **iOS (Info.plist):**
   ```xml
   <key>CFBundleURLTypes</key>
   <array>
     <dict>
       <key>CFBundleURLSchemes</key>
       <array>
         <string>healthythako</string>
       </array>
     </dict>
   </array>
   ```

2. **Android (AndroidManifest.xml):**
   ```xml
   <intent-filter android:autoVerify="true">
     <action android:name="android.intent.action.VIEW" />
     <category android:name="android.intent.category.DEFAULT" />
     <category android:name="android.intent.category.BROWSABLE" />
     <data android:scheme="healthythako" />
   </intent-filter>
   ```

### **WebView Integration:**
```javascript
// Detect mobile app environment
window.ReactNativeWebView = true;

// Handle payment redirects
const handlePaymentRedirect = (url) => {
  if (url.includes('healthythako://')) {
    // Handle deep link in mobile app
    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: 'payment_redirect',
      url: url
    }));
  }
};
```

## 🔍 **Step 6: Monitoring & Validation**

### **Health Check Endpoints:**
- Environment Status: `/environment-setup`
- Payment Test: `/payment-test`
- Migration Test: `/migration-test`

### **Log Monitoring:**
```bash
# View Edge Function logs
supabase functions logs --project-ref lhncpcsniuxnrmabbkmr

# Filter by function
supabase functions logs create-payment --project-ref lhncpcsniuxnrmabbkmr
```

### **Database Monitoring:**
- Check `transactions` table for payment records
- Monitor `trainer_bookings` for booking creation
- Verify `user_memberships` for gym memberships

## 🚨 **Troubleshooting**

### **Common Issues:**

1. **Environment Variables Not Set:**
   - Verify in Supabase Dashboard
   - Check Edge Function logs
   - Use `/environment-setup` page

2. **Payment Creation Fails:**
   - Check UddoktaPay API key
   - Verify webhook URLs
   - Monitor Edge Function logs

3. **Database Records Not Created:**
   - Check RLS policies
   - Verify table permissions
   - Review transaction logs

### **Debug Commands:**
```bash
# Test environment
node scripts/validate-payment-integration.js

# Check production config
node scripts/deploy-production.js --validate

# View Supabase secrets
supabase secrets list --project-ref lhncpcsniuxnrmabbkmr
```

## 📞 **Support Resources**

- **UddoktaPay Documentation:** https://uddoktapay.readme.io/reference/api-information
- **Supabase Dashboard:** https://supabase.com/dashboard/project/lhncpcsniuxnrmabbkmr
- **Environment Setup:** http://localhost:8080/environment-setup
- **Payment Testing:** http://localhost:8080/payment-test

## ✅ **Production Readiness Checklist**

- [ ] Supabase environment variables set
- [ ] All payment types tested successfully
- [ ] Edge Functions deployed and working
- [ ] Database schema validated
- [ ] Mobile app deep linking configured
- [ ] Production environment variables set
- [ ] Monitoring and logging configured
- [ ] Webhook URLs accessible
- [ ] SSL certificates configured
- [ ] Domain and DNS configured

---

**Once all steps are completed, your UddoktaPay payment integration will be fully operational in production!** 🎉
