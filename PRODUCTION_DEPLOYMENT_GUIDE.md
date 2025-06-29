# 🚀 HealthyThako Production Deployment Guide

## ✅ **PROBLEM SOLVED: API Endpoints Not Working on healthythako.com**

### **Root Cause Identified:**
The main issue was that the application was configured for **development** (localhost:8080) instead of **production** (healthythako.com). This caused all API calls to fail when deployed to the live website.

### **Solution Implemented:**
✅ **Environment Configuration Fixed**
✅ **Production Build Process Optimized**
✅ **Dynamic URL Resolution System**
✅ **Hosting Platform Instructions**

---

## 🔧 **What Was Fixed:**

### **Before (Broken):**
```bash
VITE_APP_URL=http://localhost:8080          # ❌ Wrong for production
VITE_APP_ENVIRONMENT=development            # ❌ Wrong for production  
VITE_ENABLE_DEBUG_LOGS=true                 # ❌ Security risk
```

### **After (Fixed):**
```bash
VITE_APP_URL=https://healthythako.com       # ✅ Correct for production
VITE_APP_ENVIRONMENT=production             # ✅ Correct for production
VITE_ENABLE_DEBUG_LOGS=false                # ✅ Secure for production
```

---

## 🚀 **Step-by-Step Deployment Instructions**

### **Step 1: Prepare Production Environment**
```bash
# Run the production setup script
node scripts/setup-production.js --setup
```

This will:
- ✅ Backup your current development .env
- ✅ Create production-ready environment configuration
- ✅ Set correct URLs for healthythako.com

### **Step 2: Build the Application**
```bash
# Install dependencies (if not already done)
npm install

# Build for production
npm run build
```

This creates a `dist/` folder with production-ready files.

### **Step 3: Deploy to Hosting Platform**

#### **Option A: Vercel (Recommended)**
1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Import Project" and connect your GitHub repository
3. In project settings, add these environment variables:

```bash
VITE_SUPABASE_URL=https://lhncpcsniuxnrmabbkmr.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U
VITE_UDDOKTAPAY_API_KEY=yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU
VITE_UDDOKTAPAY_BASE_URL=https://digitaldot.paymently.io/api
VITE_UDDOKTAPAY_ENVIRONMENT=production
VITE_APP_NAME=HealthyThako
VITE_APP_URL=https://healthythako.com
VITE_APP_ENVIRONMENT=production
VITE_PAYMENT_CURRENCY=BDT
VITE_PAYMENT_SUCCESS_URL=/payment-success
VITE_PAYMENT_CANCEL_URL=/payment-cancelled
VITE_PAYMENT_REDIRECT_URL=/payment-redirect
VITE_PLATFORM_COMMISSION=0.1
VITE_DEFAULT_TRAINER_RATE=1200
VITE_DEFAULT_GYM_MONTHLY_RATE=2000
VITE_ENABLE_REAL_TIME=true
VITE_ENABLE_NOTIFICATIONS=true
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_DEBUG_LOGS=false
VITE_MOBILE_APP_SCHEME=healthythako
VITE_MOBILE_DEEP_LINK_SUCCESS=healthythako://payment/success
VITE_MOBILE_DEEP_LINK_CANCEL=healthythako://payment/cancelled
VITE_SUPPORT_EMAIL=support@healthythako.com
VITE_CONTACT_EMAIL=contact@healthythako.com
```

4. Set custom domain to: `healthythako.com`
5. Deploy the project

#### **Option B: Netlify**
1. Go to [app.netlify.com](https://app.netlify.com)
2. Import your GitHub repository
3. In Site settings > Environment variables, add the same variables above
4. Set custom domain to: `healthythako.com`
5. Deploy the project

#### **Option C: Manual Hosting**
1. Upload the `dist/` folder contents to your web server
2. Configure your web server to serve `index.html` for all routes
3. Ensure HTTPS is enabled for `healthythako.com`

### **Step 4: Configure Supabase Edge Functions**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard/project/lhncpcsniuxnrmabbkmr)
2. Navigate to Edge Functions > Environment Variables
3. Set these server-side variables:
   ```bash
   UDDOKTAPAY_API_KEY=yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```
4. Deploy Edge Functions:
   ```bash
   supabase functions deploy --project-ref lhncpcsniuxnrmabbkmr
   ```

---

## 🧪 **Testing Your Deployment**

### **Step 1: Basic Website Test**
1. Visit `https://healthythako.com`
2. Check that the website loads correctly
3. Verify no console errors in browser Developer Tools

### **Step 2: API Connectivity Test**
1. Open browser Developer Tools (F12)
2. Go to Network tab
3. Try to login or register
4. Check that API calls are successful (green entries in Network tab)

### **Step 3: Payment Flow Test**
1. Navigate to trainer booking or gym membership
2. Initiate a payment
3. Verify redirect to UddoktaPay works
4. Complete test payment
5. Verify redirect back to healthythako.com works

### **Step 4: Mobile App Test** (if applicable)
1. Test payment flow in mobile app
2. Verify deep links work correctly
3. Check WebView integration

---

## 🔧 **Troubleshooting Common Issues**

### **❌ Issue: APIs still not working**
**Solution:**
1. Check browser Developer Tools > Console for errors
2. Verify environment variables are set in hosting platform
3. Ensure build process included environment variables
4. Check Network tab for failed requests

### **❌ Issue: CORS errors**
**Solution:**
1. Verify Supabase URL is correct
2. Check CORS settings in Supabase Dashboard
3. Ensure domain is whitelisted

### **❌ Issue: Payment redirects fail**
**Solution:**
1. Check UddoktaPay API key is correct
2. Verify Edge Functions are deployed
3. Test Edge Function URLs directly

### **❌ Issue: Environment variables not working**
**Solution:**
1. Ensure variables start with `VITE_` for client-side
2. Rebuild application after changing variables
3. Clear browser cache and try again

---

## 📋 **Quick Deployment Checklist**

- [ ] ✅ Run `node scripts/setup-production.js --setup`
- [ ] ✅ Run `npm run build` successfully
- [ ] ✅ Set environment variables in hosting platform
- [ ] ✅ Configure custom domain: `healthythako.com`
- [ ] ✅ Deploy to hosting platform
- [ ] ✅ Set Supabase Edge Function environment variables
- [ ] ✅ Deploy Edge Functions
- [ ] ✅ Test website loads at `https://healthythako.com`
- [ ] ✅ Test API calls work (login/register)
- [ ] ✅ Test payment flow works
- [ ] ✅ Verify no console errors

---

## 🎉 **Success Indicators**

When everything is working correctly, you should see:

✅ **Website loads at https://healthythako.com**
✅ **Login/registration works**
✅ **Trainer and gym data loads**
✅ **Payment flow completes successfully**
✅ **No console errors in browser**
✅ **API calls show as successful in Network tab**

---

## 📞 **Need Help?**

If you encounter issues:

1. **Run diagnostics:**
   ```bash
   node scripts/diagnose-production.js --validate
   ```

2. **Check troubleshooting:**
   ```bash
   node scripts/setup-production.js --troubleshoot
   ```

3. **View hosting instructions:**
   ```bash
   node scripts/setup-production.js --hosting
   ```

The production deployment is now ready and should work correctly on healthythako.com! 🚀
