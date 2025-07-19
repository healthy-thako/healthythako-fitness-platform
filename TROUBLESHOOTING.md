# HealthyThako Troubleshooting Guide

## Common Issues and Solutions

### 1. Database Connection Timeouts

**Symptoms:**
- RPC call timeout errors in console
- Trainer search not loading
- Gym data not displaying
- "Unable to load trainers at the moment" message

**Solutions:**

#### Check Connection Test Page
1. Navigate to `/connection-test` in development mode
2. Click "Run Connection Test" button
3. Check browser console for detailed logs
4. Verify all tests pass

#### Verify Environment Configuration
```env
# Required environment variables
VITE_SUPABASE_URL=https://lhncpcsniuxnrmabbkmr.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_ENABLE_DEBUG_LOGS=true  # For debugging
```

#### Database Function Verification
Test RPC functions directly in Supabase dashboard:
```sql
-- Test trainer search function
SELECT * FROM search_trainers_enhanced('', '', null, 0, 5, 0);

-- Test trainer profile function
SELECT * FROM get_trainer_with_profile('user_id_here');
```

#### Network Issues
- Check firewall/proxy settings
- Verify Supabase project status
- Test with different network connection
- Check browser network tab for failed requests

### 2. Authentication Issues

**Symptoms:**
- Infinite loading on login
- "Invalid refresh token" errors
- Automatic logout
- Dashboard access denied

**Solutions:**

#### Clear Browser Storage
```javascript
// Run in browser console
localStorage.clear();
sessionStorage.clear();
location.reload();
```

#### Check Auth Configuration
1. Verify Supabase auth settings
2. Check RLS policies on users table
3. Ensure proper user roles are set
4. Test with `/auth-diagnostic` page

#### Token Refresh Issues
- Check network connectivity during auth
- Verify Supabase project auth settings
- Clear auth tokens and re-login

### 3. Payment Integration Issues

**Symptoms:**
- Payment redirect failures
- UddoktaPay errors
- Mobile deep linking not working
- Payment status not updating

**Solutions:**

#### Verify UddoktaPay Configuration
```env
VITE_UDDOKTAPAY_API_KEY=your_api_key
VITE_UDDOKTAPAY_BASE_URL=https://digitaldot.paymently.io/api
VITE_UDDOKTAPAY_ENVIRONMENT=production
```

#### Test Payment Flow
1. Use `/payment-test` page in development
2. Check payment redirect URLs
3. Verify webhook endpoints
4. Test mobile deep linking

#### Mobile App Integration
- Verify deep link scheme configuration
- Test payment redirect in mobile WebView
- Check mobile app URL handling

### 4. Performance Issues

**Symptoms:**
- Slow page loading
- High memory usage
- Frequent re-renders
- Poor mobile performance

**Solutions:**

#### React Query Optimization
```typescript
// Check query configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

#### Database Query Optimization
- Check query execution times in console
- Verify proper database indexes
- Use enhanced timeout utilities
- Monitor connection test results

#### Memory Leaks
- Check for uncleaned event listeners
- Verify React Query cache cleanup
- Monitor browser memory usage

### 5. UI/UX Issues

**Symptoms:**
- Components not rendering
- Styling issues
- Mobile responsiveness problems
- Loading states not working

**Solutions:**

#### Component Debugging
1. Check browser console for React errors
2. Verify component props and state
3. Test with React Developer Tools
4. Check CSS class conflicts

#### Responsive Design
- Test on different screen sizes
- Verify Tailwind CSS classes
- Check mobile viewport settings
- Test touch interactions

### 6. Development Environment Issues

**Symptoms:**
- Hot reload not working
- Build failures
- TypeScript errors
- Import/export issues

**Solutions:**

#### Development Server
```bash
# Clear cache and restart
rm -rf node_modules/.vite
npm run dev
```

#### TypeScript Issues
```bash
# Check TypeScript configuration
npx tsc --noEmit

# Update type definitions
npm run type-check
```

#### Dependency Issues
```bash
# Clear and reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

## Debug Tools and Utilities

### 1. Connection Test Page
**URL:** `/connection-test`
**Purpose:** Test all database connections and performance
**Features:**
- RPC function testing
- Query performance benchmarking
- Real-time hook monitoring
- Error diagnosis

### 2. Data Fetch Test Page
**URL:** `/data-fetch-test`
**Purpose:** Verify data fetching mechanisms
**Features:**
- Hook testing
- API endpoint verification
- Data transformation testing

### 3. Auth Diagnostic Page
**URL:** `/auth-diagnostic`
**Purpose:** Debug authentication issues
**Features:**
- Session state monitoring
- Token validation
- Role verification
- Permission testing

### 4. Payment Test Page
**URL:** `/payment-test`
**Purpose:** Test payment integration
**Features:**
- UddoktaPay API testing
- Payment flow simulation
- Deep link testing
- Webhook verification

## Logging and Monitoring

### Enable Debug Logging
```env
VITE_ENABLE_DEBUG_LOGS=true
```

### Console Log Categories
- 🚀 Operation start
- ⏳ In progress
- ✅ Success
- ❌ Error
- 🔄 Retry attempt
- ⏰ Timeout
- 📊 Performance metrics

### Browser Developer Tools
1. **Console Tab:** Check for errors and debug logs
2. **Network Tab:** Monitor API requests and responses
3. **Application Tab:** Check localStorage and sessionStorage
4. **Performance Tab:** Monitor rendering performance

## Getting Help

### Before Reporting Issues
1. Check this troubleshooting guide
2. Run connection tests
3. Check browser console for errors
4. Test with different browsers/devices
5. Verify environment configuration

### Reporting Issues
Include the following information:
- Browser and version
- Operating system
- Error messages from console
- Steps to reproduce
- Connection test results
- Environment configuration (without sensitive data)

### Contact Information
- **Technical Support:** support@healthythako.com
- **Documentation:** Check project markdown files
- **Debug Tools:** Use built-in testing pages

## Preventive Measures

### Regular Maintenance
1. Monitor connection test results
2. Check database performance metrics
3. Update dependencies regularly
4. Review error logs
5. Test payment flows

### Performance Monitoring
1. Use connection test page weekly
2. Monitor query execution times
3. Check memory usage patterns
4. Test mobile performance

### Security Checks
1. Verify RLS policies
2. Check authentication flows
3. Test permission boundaries
4. Monitor for suspicious activity

## Emergency Procedures

### Database Connection Failure
1. Check Supabase project status
2. Verify network connectivity
3. Test with connection test page
4. Contact Supabase support if needed

### Payment System Failure
1. Check UddoktaPay service status
2. Verify API credentials
3. Test with payment test page
4. Contact UddoktaPay support

### Authentication System Failure
1. Check Supabase auth status
2. Clear browser storage
3. Test with auth diagnostic page
4. Verify RLS policies

This troubleshooting guide should help resolve most common issues. For persistent problems, use the debug tools and contact support with detailed information.
