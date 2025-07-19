# 📱 Mobile App Testing Guide for HealthyThako Payment Flow

## ✅ **PRODUCTION STATUS**

- **Payment Redirect Handler**: ✅ LIVE at `https://healthythako.com/payment-redirect/`
- **Database Integration**: ✅ CONFIGURED
- **Edge Functions**: ✅ DEPLOYED
- **Deep Link System**: ✅ READY FOR TESTING

## 🧪 **MOBILE APP TESTING CHECKLIST**

### **Phase 1: Deep Link Registration Verification**

#### **Test 1.1: URL Scheme Registration**

**iOS Testing:**
```bash
# Test deep link from iOS Simulator
xcrun simctl openurl booted "healthythako://payment-success?orderId=test123&status=completed&source=test"
```

**Android Testing:**
```bash
# Test deep link from Android Emulator
adb shell am start -W -a android.intent.action.VIEW -d "healthythako://payment-success?orderId=test123&status=completed&source=test" com.healthythako.app
```

**Expected Result:**
- App should open and navigate to payment success screen
- Parameters should be parsed correctly

#### **Test 1.2: Deep Link Handler Implementation**

**React Native Test Code:**
```javascript
import { Linking } from 'react-native';

// Test deep link handling
const testDeepLinkHandling = () => {
  console.log('Testing deep link handling...');
  
  // Listen for deep links
  const subscription = Linking.addEventListener('url', (event) => {
    console.log('Deep link received:', event.url);
    
    if (event.url.startsWith('healthythako://payment-success')) {
      console.log('✅ Payment success deep link received');
      handlePaymentSuccess(event.url);
    } else if (event.url.startsWith('healthythako://payment-cancel')) {
      console.log('✅ Payment cancel deep link received');
      handlePaymentCancel(event.url);
    }
  });
  
  return () => subscription?.remove();
};

// Test parameter parsing
const parseURLParams = (url) => {
  const urlObj = new URL(url);
  const params = {};
  
  urlObj.searchParams.forEach((value, key) => {
    params[key] = value;
  });
  
  console.log('Parsed parameters:', params);
  return params;
};
```

### **Phase 2: Payment WebView Integration**

#### **Test 2.1: WebView Configuration**

**Test WebView Setup:**
```javascript
import { WebView } from 'react-native-webview';

const PaymentWebView = ({ paymentUrl }) => {
  const handleNavigationStateChange = (navState) => {
    console.log('Navigation state changed:', navState.url);
    
    // Check for payment redirect
    if (navState.url.includes('healthythako.com/payment-redirect')) {
      console.log('✅ Payment redirect detected');
      
      // Extract parameters
      const urlParams = new URLSearchParams(navState.url.split('?')[1]);
      const type = urlParams.get('type');
      const orderId = urlParams.get('orderId');
      
      console.log('Payment result:', { type, orderId });
      
      // Close WebView and handle result
      handlePaymentResult({ type, orderId });
    }
  };

  return (
    <WebView
      source={{ uri: paymentUrl }}
      onNavigationStateChange={handleNavigationStateChange}
      userAgent="HealthyThako-Mobile-App/1.0"
      startInLoadingState={true}
      javaScriptEnabled={true}
      domStorageEnabled={true}
    />
  );
};
```

#### **Test 2.2: UddoktaPay Integration**

**Test Payment URL Generation:**
```javascript
const generatePaymentURL = (orderData) => {
  const paymentData = {
    amount: orderData.amount,
    currency: 'BDT',
    order_id: orderData.orderId,
    return_url: 'https://healthythako.com/payment-redirect/',
    cancel_url: 'https://healthythako.com/payment-redirect/?type=cancel',
    customer_name: orderData.customerName,
    customer_email: orderData.customerEmail,
    customer_phone: orderData.customerPhone
  };
  
  console.log('Payment data:', paymentData);
  
  // Generate UddoktaPay URL (implement according to UddoktaPay docs)
  return generateUddoktaPayURL(paymentData);
};
```

### **Phase 3: End-to-End Flow Testing**

#### **Test 3.1: Successful Payment Flow**

**Test Scenario:**
1. User initiates payment in app
2. App opens UddoktaPay WebView
3. User completes payment
4. UddoktaPay redirects to: `https://healthythako.com/payment-redirect/?type=success&orderId=xyz`
5. Website processes payment and generates deep link
6. App receives deep link and shows success screen

**Test Code:**
```javascript
const testSuccessfulPayment = async () => {
  console.log('🧪 Testing successful payment flow...');
  
  const testOrderId = 'test_success_' + Date.now();
  
  // Step 1: Generate payment URL
  const paymentUrl = generatePaymentURL({
    orderId: testOrderId,
    amount: '100.00',
    customerName: 'Test User',
    customerEmail: 'test@healthythako.com',
    customerPhone: '+8801234567890'
  });
  
  console.log('Payment URL:', paymentUrl);
  
  // Step 2: Open WebView (simulate payment completion)
  // In real test, user would complete payment in UddoktaPay
  
  // Step 3: Simulate redirect (for testing)
  const redirectUrl = `https://healthythako.com/payment-redirect/?type=success&orderId=${testOrderId}&source=mobile_app`;
  console.log('Expected redirect:', redirectUrl);
  
  // Step 4: Test deep link generation
  const expectedDeepLink = `healthythako://payment-success?orderId=${testOrderId}&status=completed&source=web_redirect`;
  console.log('Expected deep link:', expectedDeepLink);
};
```

#### **Test 3.2: Cancelled Payment Flow**

**Test Code:**
```javascript
const testCancelledPayment = () => {
  console.log('🧪 Testing cancelled payment flow...');
  
  const testOrderId = 'test_cancel_' + Date.now();
  
  // Simulate cancel redirect
  const cancelUrl = `https://healthythako.com/payment-redirect/?type=cancel&orderId=${testOrderId}&source=mobile_app`;
  console.log('Cancel redirect:', cancelUrl);
  
  // Expected deep link
  const expectedDeepLink = `healthythako://payment-cancel?orderId=${testOrderId}&status=cancelled&source=web_redirect`;
  console.log('Expected deep link:', expectedDeepLink);
};
```

### **Phase 4: Error Handling Tests**

#### **Test 4.1: Network Error Handling**

```javascript
const testNetworkErrors = () => {
  console.log('🧪 Testing network error handling...');
  
  // Test scenarios:
  // 1. No internet connection during payment
  // 2. Payment redirect handler unreachable
  // 3. Deep link generation fails
  
  const handleNetworkError = (error) => {
    console.log('Network error:', error);
    
    // Show user-friendly error message
    Alert.alert(
      'Payment Processing Error',
      'There was an issue processing your payment. Please check your internet connection and try again.',
      [
        { text: 'Retry', onPress: () => retryPayment() },
        { text: 'Cancel', onPress: () => cancelPayment() }
      ]
    );
  };
};
```

#### **Test 4.2: Invalid Deep Link Handling**

```javascript
const testInvalidDeepLinks = () => {
  console.log('🧪 Testing invalid deep link handling...');
  
  const invalidLinks = [
    'healthythako://invalid-path',
    'healthythako://payment-success', // Missing parameters
    'healthythako://payment-success?orderId=', // Empty order ID
    'wrong-scheme://payment-success?orderId=test123'
  ];
  
  invalidLinks.forEach(link => {
    console.log('Testing invalid link:', link);
    
    try {
      const isValid = validateDeepLink(link);
      console.log('Validation result:', isValid);
    } catch (error) {
      console.log('Validation error:', error.message);
    }
  });
};

const validateDeepLink = (url) => {
  // Validate URL scheme
  if (!url.startsWith('healthythako://')) {
    throw new Error('Invalid URL scheme');
  }
  
  // Validate required parameters
  const urlObj = new URL(url);
  const orderId = urlObj.searchParams.get('orderId');
  const status = urlObj.searchParams.get('status');
  
  if (!orderId || !status) {
    throw new Error('Missing required parameters');
  }
  
  return true;
};
```

## 📊 **TESTING CHECKLIST**

### **Pre-Testing Setup**
- [ ] ✅ URL scheme registered in app configuration
- [ ] ✅ Deep link handlers implemented
- [ ] ✅ WebView component configured
- [ ] ✅ Payment URL generation working
- [ ] ✅ Error handling implemented

### **Basic Functionality Tests**
- [ ] 🔄 Deep link registration works (test with simulator/emulator)
- [ ] 🔄 App receives and parses deep links correctly
- [ ] 🔄 WebView detects payment redirect URLs
- [ ] 🔄 Payment success flow works end-to-end
- [ ] 🔄 Payment cancel flow works end-to-end

### **Integration Tests**
- [ ] 🔄 UddoktaPay integration working
- [ ] 🔄 Database updates occur correctly
- [ ] 🔄 User sees appropriate success/cancel screens
- [ ] 🔄 Order status updates in app
- [ ] 🔄 Analytics events tracked

### **Error Handling Tests**
- [ ] 🔄 Network errors handled gracefully
- [ ] 🔄 Invalid deep links rejected
- [ ] 🔄 Payment timeout scenarios handled
- [ ] 🔄 User-friendly error messages shown

## 🔧 **DEBUGGING TOOLS**

### **Console Logging**
```javascript
// Enable detailed logging for payment flow
const DEBUG_PAYMENT = __DEV__;

if (DEBUG_PAYMENT) {
  console.log('Payment debugging enabled');
  
  // Log all deep link events
  Linking.addEventListener('url', (event) => {
    console.log('DEBUG: Deep link received:', event.url);
  });
  
  // Log WebView navigation
  const originalOnNavigationStateChange = WebView.prototype.onNavigationStateChange;
  WebView.prototype.onNavigationStateChange = function(navState) {
    console.log('DEBUG: WebView navigation:', navState.url);
    return originalOnNavigationStateChange.call(this, navState);
  };
}
```

### **Test URLs for Manual Testing**

**Success Test:**
```
https://healthythako.com/payment-redirect/?type=success&orderId=manual_test_123&source=mobile_app&amount=1500
```

**Cancel Test:**
```
https://healthythako.com/payment-redirect/?type=cancel&orderId=manual_test_456&source=mobile_app&reason=user_cancelled
```

## 🎯 **SUCCESS CRITERIA**

The mobile app integration is successful when:

- ✅ App opens correctly from deep links
- ✅ Payment WebView detects redirects
- ✅ Success/cancel flows work end-to-end
- ✅ User sees appropriate feedback
- ✅ Order status updates correctly
- ✅ Error scenarios handled gracefully

## 📱 **NEXT STEPS**

1. **Run the test suite** using the provided test code
2. **Test with real UddoktaPay** sandbox environment
3. **Verify database updates** occur correctly
4. **Test on both iOS and Android** devices
5. **Monitor analytics** for payment events

**The payment redirect system is live and ready for mobile app testing! 🚀**
