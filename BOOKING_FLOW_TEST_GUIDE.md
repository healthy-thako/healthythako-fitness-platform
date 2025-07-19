# 🧪 Booking Flow Testing Guide

## 🎯 **Complete End-to-End Test Scenarios**

### **Test 1: Happy Path - Complete Booking Flow**

#### **Step 1: Navigate to Trainers**
1. Open `http://localhost:8081`
2. Click "Find Your Trainer" or navigate to `/find-trainers`
3. **Expected**: Trainer listings load with cards showing trainer information

#### **Step 2: Select a Trainer**
1. Click "Book Now" on any trainer card
2. **Expected**: BookingModal opens with trainer information
3. Fill in the modal form:
   - Session Title: "Personal Training Session"
   - Description: "I want to improve my fitness"
   - Date: Select tomorrow's date
   - Time: Select any available time
   - Mode: Online/In-person/Home
4. Click "Continue to Payment"
5. **Expected**: Redirects to `/booking-flow` with parameters

#### **Step 3: Complete Booking Form**
1. **Expected**: BookingFlow page loads with:
   - Progress indicator showing step 1/3
   - Trainer information on the left
   - Pre-filled form data from modal
2. Verify form elements:
   - Package selection (Basic/Standard/Premium)
   - Date picker with future dates only
   - Time selection dropdown
   - Session count selector
   - Description textarea (500 char limit)
3. **Expected**: Real-time validation feedback
4. **Expected**: Submit button disabled until all fields complete

#### **Step 4: Payment Processing**
1. Fill all required fields
2. Click "Pay ৳X & Book Session"
3. **Expected**: 
   - Button shows loading state
   - Toast notification: "Creating payment session..."
   - Redirects to UddoktaPay payment gateway

#### **Step 5: Payment Completion**
1. Complete payment on UddoktaPay (use test credentials)
2. **Expected**: Redirects to `/payment-redirect`
3. **Expected**: Shows payment verification screen
4. **Expected**: After verification, redirects to `/payment-success`

### **Test 2: Form Validation**

#### **Test Empty Form Submission**
1. Navigate to booking flow
2. Try to submit without filling fields
3. **Expected**: 
   - Validation summary appears
   - Submit button remains disabled
   - Clear error messages shown

#### **Test Date Validation**
1. Try to select past dates
2. **Expected**: Past dates are disabled in calendar
3. Try to select today's date
4. **Expected**: Shows error "Please select a future date"

#### **Test Character Limits**
1. Type more than 500 characters in description
2. **Expected**: Input stops at 500 characters
3. **Expected**: Character counter shows "500/500"

### **Test 3: Error Scenarios**

#### **Test Network Errors**
1. Disconnect internet during payment creation
2. **Expected**: Clear error message with retry option
3. **Expected**: No broken state, user can retry

#### **Test Invalid Trainer ID**
1. Navigate to `/booking-flow?trainer=invalid-id`
2. **Expected**: Shows "Trainer Not Found" message
3. **Expected**: "Browse Trainers" button to recover

#### **Test Unauthenticated Access**
1. Clear browser storage (logout)
2. Try to access `/booking-flow`
3. **Expected**: Redirects to `/auth` with error message

### **Test 4: Payment Flow Edge Cases**

#### **Test Payment Cancellation**
1. Start payment process
2. Cancel on UddoktaPay page
3. **Expected**: Redirects to `/payment-cancelled`
4. **Expected**: Clear cancellation message
5. **Expected**: Option to retry or go home

#### **Test Payment Timeout**
1. Start payment but don't complete
2. Wait for timeout
3. **Expected**: Proper timeout handling
4. **Expected**: Clear instructions for user

### **Test 5: Mobile Responsiveness**

#### **Test Mobile Layout**
1. Open on mobile device or use browser dev tools
2. Test all form interactions
3. **Expected**: 
   - Responsive design works properly
   - Touch interactions work smoothly
   - No horizontal scrolling
   - Readable text and buttons

## 🔍 **Key Things to Verify**

### **✅ Visual Elements**
- [ ] Progress indicator shows correctly
- [ ] Loading animations are smooth
- [ ] Form validation feedback is clear
- [ ] Package selection has hover effects
- [ ] Submit button changes state properly

### **✅ Functionality**
- [ ] All form fields work correctly
- [ ] Date picker only allows future dates
- [ ] Time slots display properly
- [ ] Character counter works
- [ ] Payment integration functions

### **✅ Error Handling**
- [ ] Network errors are handled gracefully
- [ ] Invalid data shows proper errors
- [ ] Authentication errors redirect properly
- [ ] Payment errors are user-friendly

### **✅ Performance**
- [ ] Page loads quickly
- [ ] No console errors
- [ ] Smooth animations
- [ ] Responsive interactions

## 🚨 **Common Issues to Watch For**

1. **Console Errors**: Check browser console for any JavaScript errors
2. **Network Failures**: Verify API calls are working
3. **Authentication Issues**: Ensure user session is maintained
4. **Payment Integration**: Verify UddoktaPay integration works
5. **Database Connections**: Check if bookings are created properly

## 📊 **Success Criteria**

✅ **User can complete entire booking flow without errors**
✅ **All form validations work correctly**
✅ **Payment integration functions properly**
✅ **Error scenarios are handled gracefully**
✅ **Mobile experience is smooth**
✅ **No console errors or warnings**
✅ **Database records are created correctly**

---

## 🎉 **Test Results**

After completing these tests, the booking flow should provide a smooth, professional experience for users booking training sessions with proper payment integration through UddoktaPay!
