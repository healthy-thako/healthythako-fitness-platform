# HealthyThako Mobile App Payment Integration Guide

## 🔗 Deep Linking Setup

### URL Scheme Configuration

**Recommended URL Schemes:**
```
healthythako://
healthythako-dev://  (for development)
```

### Deep Link URLs

#### Payment Success
```
healthythako://payment/success?type={payment_type}&id={booking_id}&amount={amount}
```

#### Payment Cancelled
```
healthythako://payment/cancelled?type={payment_type}&reason={reason}
```

#### Payment Failed
```
healthythako://payment/failed?type={payment_type}&error={error_code}
```

## 📱 Platform-Specific Implementation

### iOS (React Native)

#### 1. URL Scheme Registration (Info.plist)
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

#### 2. Deep Link Handling
```javascript
import { Linking } from 'react-native';

// Listen for deep links
useEffect(() => {
  const handleDeepLink = (url) => {
    if (url.includes('payment/success')) {
      // Handle payment success
      const params = parseURLParams(url);
      navigateToPaymentSuccess(params);
    } else if (url.includes('payment/cancelled')) {
      // Handle payment cancellation
      navigateToPaymentCancelled();
    }
  };

  Linking.addEventListener('url', handleDeepLink);
  
  // Check if app was opened via deep link
  Linking.getInitialURL().then(handleDeepLink);

  return () => {
    Linking.removeEventListener('url', handleDeepLink);
  };
}, []);
```

### Android (React Native)

#### 1. Intent Filter (android/app/src/main/AndroidManifest.xml)
```xml
<activity
  android:name=".MainActivity"
  android:exported="true"
  android:launchMode="singleTop">
  
  <intent-filter android:autoVerify="true">
    <action android:name="android.intent.action.VIEW" />
    <category android:name="android.intent.category.DEFAULT" />
    <category android:name="android.intent.category.BROWSABLE" />
    <data android:scheme="healthythako" />
  </intent-filter>
  
</activity>
```

#### 2. Deep Link Handling (Same as iOS)

## 🔄 Payment Flow Integration

### 1. Update Payment URLs in Web App

```javascript
// In payment hooks, detect mobile app and use deep links
const getReturnURL = (paymentType) => {
  const isMobileApp = window.ReactNativeWebView !== undefined;
  
  if (isMobileApp) {
    return `healthythako://payment/success?type=${paymentType}`;
  }
  
  return `${window.location.origin}/payment-success?type=${paymentType}`;
};

const getCancelURL = (paymentType) => {
  const isMobileApp = window.ReactNativeWebView !== undefined;
  
  if (isMobileApp) {
    return `healthythako://payment/cancelled?type=${paymentType}`;
  }
  
  return `${window.location.origin}/payment-cancelled?type=${paymentType}`;
};
```

### 2. WebView Integration

```javascript
// In React Native WebView component
import { WebView } from 'react-native-webview';

const PaymentWebView = () => {
  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    
    // Intercept payment gateway redirects
    if (url.includes('healthythako://')) {
      // Handle deep link
      Linking.openURL(url);
      return false; // Prevent WebView navigation
    }
    
    return true;
  };

  return (
    <WebView
      source={{ uri: 'https://healthythako.com/payment-flow' }}
      onNavigationStateChange={handleNavigationStateChange}
      injectedJavaScript={`
        window.ReactNativeWebView = true;
        true;
      `}
    />
  );
};
```

## 🔧 Backend Configuration Updates

### Update Edge Functions for Mobile Support

```javascript
// In create-payment function
const getRedirectURLs = (metadata, origin) => {
  const isMobileApp = metadata.is_mobile_app;
  const paymentType = metadata.payment_type;
  
  if (isMobileApp) {
    return {
      redirect_url: `healthythako://payment/success?type=${paymentType}`,
      cancel_url: `healthythako://payment/cancelled?type=${paymentType}`
    };
  }
  
  return {
    redirect_url: `${origin}/payment-success?type=${paymentType}`,
    cancel_url: `${origin}/payment-cancelled?type=${paymentType}`
  };
};
```

## 📊 Testing Strategy

### 1. Development Testing
```bash
# Test deep links in development
adb shell am start \
  -W -a android.intent.action.VIEW \
  -d "healthythako://payment/success?type=trainer_booking&id=123" \
  com.healthythako.app
```

### 2. iOS Testing
```bash
# Test deep links in iOS Simulator
xcrun simctl openurl booted "healthythako://payment/success?type=gym_membership&id=456"
```

## 🔐 Security Considerations

### 1. URL Validation
```javascript
const validatePaymentURL = (url) => {
  const allowedHosts = ['digitaldot.paymently.io', 'healthythako.com'];
  const urlObj = new URL(url);
  
  return allowedHosts.includes(urlObj.hostname);
};
```

### 2. Parameter Sanitization
```javascript
const sanitizeParams = (params) => {
  return {
    type: params.type?.replace(/[^a-z_]/g, ''),
    id: params.id?.replace(/[^a-zA-Z0-9-]/g, ''),
    amount: parseFloat(params.amount) || 0
  };
};
```

## 🚀 Deployment Checklist

### Web App Updates
- [ ] Update payment hooks with mobile detection
- [ ] Deploy updated Edge functions
- [ ] Test payment flows in browser
- [ ] Verify deep link generation

### Mobile App Updates
- [ ] Configure URL schemes
- [ ] Implement deep link handlers
- [ ] Test WebView integration
- [ ] Verify payment redirects

### Backend Configuration
- [ ] Set UddoktaPay API key: `yrnDmmCuY0uiPU7rgoBGsWYbx97tJxNFpapmKwXYU`
- [ ] Configure webhook URLs
- [ ] Test payment verification
- [ ] Monitor transaction logs

## 📞 Support & Troubleshooting

### Common Issues

1. **Deep links not working**
   - Verify URL scheme registration
   - Check intent filters (Android)
   - Test with development tools

2. **Payment redirects failing**
   - Verify UddoktaPay configuration
   - Check webhook URL accessibility
   - Monitor Edge function logs

3. **WebView navigation issues**
   - Implement proper navigation handling
   - Use injected JavaScript for detection
   - Handle external link opening

### Debug Commands
```javascript
// Enable debug logging
console.log('Payment URL:', paymentURL);
console.log('Is Mobile App:', window.ReactNativeWebView);
console.log('Return URL:', returnURL);
```
