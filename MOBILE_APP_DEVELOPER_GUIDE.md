# 📱 HealthyThako Mobile App Developer Integration Guide

## 🚀 Overview

This guide provides comprehensive instructions for mobile app developers to integrate with the HealthyThako payment redirection system. The system uses MCP (Model Context Protocol) for secure database operations and provides seamless deep linking between the website and mobile app.

## 🔧 Required Updates

### 1. URL Scheme Registration

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

### 2. Deep Link Handler Implementation

**React Native Example:**
```javascript
import { Linking } from 'react-native';
import { useEffect } from 'react';

const useDeepLinkHandler = () => {
  useEffect(() => {
    // Handle initial URL if app was opened via deep link
    Linking.getInitialURL().then((url) => {
      if (url) {
        handleDeepLink(url);
      }
    });

    // Listen for deep links while app is running
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => subscription?.remove();
  }, []);

  const handleDeepLink = (url) => {
    console.log('Deep link received:', url);
    
    if (url.startsWith('healthythako://payment-success')) {
      handlePaymentSuccess(url);
    } else if (url.startsWith('healthythako://payment-cancel')) {
      handlePaymentCancel(url);
    }
  };

  const handlePaymentSuccess = (url) => {
    const params = parseURLParams(url);
    
    // Navigate to payment success screen
    navigation.navigate('PaymentSuccess', {
      orderId: params.orderId,
      status: params.status,
      orderType: params.orderType,
      amount: params.amount,
      userId: params.userId,
      timestamp: params.timestamp,
      source: params.source
    });
    
    // Show success notification
    showNotification('Payment Successful', 'Your payment has been processed successfully!');
  };

  const handlePaymentCancel = (url) => {
    const params = parseURLParams(url);
    
    // Navigate to payment cancel screen
    navigation.navigate('PaymentCancel', {
      orderId: params.orderId,
      status: params.status,
      reason: params.reason || 'Payment was cancelled'
    });
    
    // Show cancel notification
    showNotification('Payment Cancelled', 'Your payment was cancelled.');
  };
};

// Helper function to parse URL parameters
const parseURLParams = (url) => {
  const urlObj = new URL(url);
  const params = {};
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  return params;
};
```

### 3. Payment Flow Integration

**WebView Configuration for UddoktaPay:**
```javascript
import { WebView } from 'react-native-webview';

const PaymentWebView = ({ paymentUrl, onPaymentComplete }) => {
  const handleNavigationStateChange = (navState) => {
    const { url } = navState;
    
    // Check if redirected to payment redirect handler
    if (url.includes('healthythako.com/payment-redirect')) {
      console.log('Payment redirect detected:', url);
      
      // Extract parameters from URL
      const urlParams = new URLSearchParams(url.split('?')[1]);
      const type = urlParams.get('type');
      const orderId = urlParams.get('orderId');
      
      // Close WebView and handle result
      onPaymentComplete({
        type,
        orderId,
        success: type === 'success'
      });
    }
  };

  return (
    <WebView
      source={{ uri: paymentUrl }}
      onNavigationStateChange={handleNavigationStateChange}
      startInLoadingState={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
      userAgent="HealthyThako-Mobile-App/1.0"
    />
  );
};
```

### 4. User Agent Configuration

**Set Custom User Agent:**
```javascript
// For WebView payments
const USER_AGENT = 'HealthyThako-Mobile-App/1.0 (iOS/Android)';

// For API calls
const API_HEADERS = {
  'User-Agent': USER_AGENT,
  'X-App-Version': '1.0.0',
  'X-Platform': Platform.OS,
};
```

## 🔗 Deep Link URL Structure

### Payment Success
```
healthythako://payment-success?orderId={id}&status=completed&orderType={type}&amount={amount}&userId={userId}&source=web_redirect&timestamp={timestamp}
```

### Payment Cancel
```
healthythako://payment-cancel?orderId={id}&status=cancelled&reason={reason}&source=web_redirect&timestamp={timestamp}
```

### Parameters Explanation

| Parameter | Type | Description | Example |
|-----------|------|-------------|---------|
| `orderId` | string | Unique order identifier | `trainer_booking_123` |
| `status` | string | Payment status | `completed`, `cancelled`, `failed` |
| `orderType` | string | Type of order | `order`, `trainer_booking`, `payment_transaction` |
| `amount` | number | Payment amount | `1500.00` |
| `userId` | string | User ID (UUID) | `550e8400-e29b-41d4-a716-446655440000` |
| `source` | string | Redirect source | `web_redirect`, `mobile_app` |
| `timestamp` | string | Unix timestamp | `1751456842240` |

## 🛡️ Security Considerations

### 1. URL Validation
```javascript
const validateDeepLink = (url) => {
  // Validate URL scheme
  if (!url.startsWith('healthythako://')) {
    console.warn('Invalid URL scheme:', url);
    return false;
  }
  
  // Validate required parameters
  const params = parseURLParams(url);
  if (!params.orderId || !params.status) {
    console.warn('Missing required parameters:', params);
    return false;
  }
  
  // Validate timestamp (within last 10 minutes)
  const timestamp = parseInt(params.timestamp);
  const now = Date.now();
  const tenMinutes = 10 * 60 * 1000;
  
  if (now - timestamp > tenMinutes) {
    console.warn('Deep link expired:', timestamp);
    return false;
  }
  
  return true;
};
```

### 2. Order Verification
```javascript
const verifyOrderWithBackend = async (orderId, orderType) => {
  try {
    const response = await fetch(`${API_BASE_URL}/verify-order`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userToken}`,
        ...API_HEADERS
      },
      body: JSON.stringify({
        orderId,
        orderType
      })
    });
    
    const result = await response.json();
    return result.verified;
  } catch (error) {
    console.error('Order verification failed:', error);
    return false;
  }
};
```

## 📊 Analytics & Monitoring

### 1. Track Deep Link Events
```javascript
import Analytics from '@react-native-async-storage/async-storage';

const trackDeepLinkEvent = (eventName, params) => {
  Analytics.track(eventName, {
    ...params,
    timestamp: Date.now(),
    platform: Platform.OS,
    appVersion: DeviceInfo.getVersion()
  });
};

// Usage
trackDeepLinkEvent('payment_deep_link_received', {
  orderId: params.orderId,
  status: params.status,
  orderType: params.orderType,
  source: params.source
});
```

### 2. Error Handling
```javascript
const handleDeepLinkError = (error, url) => {
  console.error('Deep link error:', error);
  
  // Log error for monitoring
  Analytics.track('deep_link_error', {
    error: error.message,
    url,
    timestamp: Date.now()
  });
  
  // Show user-friendly error message
  Alert.alert(
    'Payment Processing Error',
    'There was an issue processing your payment. Please check your order status in the app.',
    [
      { text: 'OK', onPress: () => navigation.navigate('Orders') }
    ]
  );
};
```

## 🧪 Testing

### 1. Test Deep Links
```bash
# iOS Simulator
xcrun simctl openurl booted "healthythako://payment-success?orderId=test123&status=completed&orderType=order&amount=1500&source=test"

# Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "healthythako://payment-success?orderId=test123&status=completed&orderType=order&amount=1500&source=test" com.healthythako.app
```

### 2. Test Payment Flow
```javascript
const testPaymentFlow = async () => {
  const testPaymentUrl = 'https://healthythako.com/payment-redirect/index.html?type=success&orderId=test123&source=mobile_app';
  
  // Open test URL in WebView
  navigation.navigate('PaymentWebView', {
    paymentUrl: testPaymentUrl
  });
};
```

## 🔄 Migration Checklist

- [ ] ✅ URL scheme registered in app configuration
- [ ] ✅ Deep link handler implemented
- [ ] ✅ Payment WebView configured with custom user agent
- [ ] ✅ URL validation and security checks added
- [ ] ✅ Analytics tracking implemented
- [ ] ✅ Error handling for failed deep links
- [ ] ✅ Order verification with backend
- [ ] ✅ Payment success/cancel screens updated
- [ ] ✅ Notification system for payment events
- [ ] ✅ Testing completed on both iOS and Android

## 🆘 Troubleshooting

### Common Issues

1. **Deep links not working**
   - Verify URL scheme registration
   - Check app is set as default handler
   - Test with simple deep link first

2. **Payment redirect not detected**
   - Ensure WebView navigation handler is set
   - Check user agent configuration
   - Verify redirect URL pattern matching

3. **Parameters not parsed correctly**
   - Check URL encoding/decoding
   - Validate parameter names match exactly
   - Test with known good URLs

### Debug Tools

```javascript
// Enable deep link debugging
const DEBUG_DEEP_LINKS = __DEV__;

if (DEBUG_DEEP_LINKS) {
  console.log('Deep link debugging enabled');
  
  // Log all deep link events
  Linking.addEventListener('url', (event) => {
    console.log('DEBUG: Deep link received:', event.url);
  });
}
```

This integration ensures seamless payment processing between the HealthyThako website and mobile app with proper security, monitoring, and error handling.
