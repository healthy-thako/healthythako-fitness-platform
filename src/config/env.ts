/**
 * Environment Configuration for HealthyThako
 * Centralized management of all environment variables
 */

// Supabase Configuration
export const SUPABASE_CONFIG = {
  url: import.meta.env.VITE_SUPABASE_URL || 'https://lhncpcsniuxnrmabbkmr.supabase.co',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
} as const;

// UddoktaPay Configuration
export const UDDOKTAPAY_CONFIG = {
  apiKey: import.meta.env.VITE_UDDOKTAPAY_API_KEY || '',
  baseUrl: import.meta.env.VITE_UDDOKTAPAY_BASE_URL || 'https://digitaldot.paymently.io/api',
  environment: import.meta.env.VITE_UDDOKTAPAY_ENVIRONMENT || 'production',
} as const;

// Application Configuration
export const APP_CONFIG = {
  name: import.meta.env.VITE_APP_NAME || 'HealthyThako',
  url: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
  environment: import.meta.env.VITE_APP_ENVIRONMENT || 'development',
  productionUrl: 'https://healthythako.com',
} as const;

// Dynamic URL resolution helper
export const getAppUrl = () => {
  // In production, always use the production URL
  if (isProduction()) {
    return APP_CONFIG.productionUrl;
  }

  // In development, check if we're running in browser
  if (typeof window !== 'undefined') {
    // Use current window location for dynamic resolution
    const { protocol, hostname, port } = window.location;
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      return `${protocol}//${hostname}:${port}`;
    }
    // If accessing via domain name, use that
    return `${protocol}//${hostname}${port ? `:${port}` : ''}`;
  }

  // Fallback to configured URL
  return APP_CONFIG.url;
};

// Payment Configuration
export const PAYMENT_CONFIG = {
  currency: import.meta.env.VITE_PAYMENT_CURRENCY || 'BDT',
  successUrl: import.meta.env.VITE_PAYMENT_SUCCESS_URL || '/payment-success',
  cancelUrl: import.meta.env.VITE_PAYMENT_CANCEL_URL || '/payment-cancelled',
  redirectUrl: import.meta.env.VITE_PAYMENT_REDIRECT_URL || '/payment-redirect',
  commission: parseFloat(import.meta.env.VITE_PLATFORM_COMMISSION || '0.1'),
  defaultTrainerRate: parseInt(import.meta.env.VITE_DEFAULT_TRAINER_RATE || '1200'),
  defaultGymMonthlyRate: parseInt(import.meta.env.VITE_DEFAULT_GYM_MONTHLY_RATE || '2000'),
} as const;

// Mobile app detection helper
export const isMobileApp = () => {
  if (typeof window === 'undefined') return false;
  return window.ReactNativeWebView !== undefined;
};

export const isMobileDevice = () => {
  if (typeof window === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

// Dynamic payment URL helpers
export const getPaymentUrls = (paymentType = 'general') => {
  const baseUrl = getAppUrl();

  // If mobile app, use deep links
  if (isMobileApp()) {
    return {
      successUrl: `${MOBILE_CONFIG.deepLinkSuccess}?type=${paymentType}`,
      cancelUrl: `${MOBILE_CONFIG.deepLinkCancel}?type=${paymentType}`,
      redirectUrl: `${MOBILE_CONFIG.deepLinkSuccess}?type=${paymentType}`,
    };
  }

  // Otherwise use web URLs
  return {
    successUrl: `${baseUrl}${PAYMENT_CONFIG.successUrl}`,
    cancelUrl: `${baseUrl}${PAYMENT_CONFIG.cancelUrl}`,
    redirectUrl: `${baseUrl}${PAYMENT_CONFIG.redirectUrl}`,
  };
};

// Feature Flags
export const FEATURE_FLAGS = {
  enableRealTime: import.meta.env.VITE_ENABLE_REAL_TIME === 'true',
  enableNotifications: import.meta.env.VITE_ENABLE_NOTIFICATIONS !== 'false',
  enableAnalytics: import.meta.env.VITE_ENABLE_ANALYTICS !== 'false',
  enableDebugLogs: import.meta.env.VITE_ENABLE_DEBUG_LOGS === 'true',
} as const;

// Mobile App Configuration
export const MOBILE_CONFIG = {
  scheme: import.meta.env.VITE_MOBILE_APP_SCHEME || 'healthythako',
  deepLinkSuccess: import.meta.env.VITE_MOBILE_DEEP_LINK_SUCCESS || 'healthythako://payment/success',
  deepLinkCancel: import.meta.env.VITE_MOBILE_DEEP_LINK_CANCEL || 'healthythako://payment/cancelled',
} as const;

// Contact Information
export const CONTACT_CONFIG = {
  supportEmail: import.meta.env.VITE_SUPPORT_EMAIL || 'support@healthythako.com',
  contactEmail: import.meta.env.VITE_CONTACT_EMAIL || 'contact@healthythako.com',
} as const;

// API Configuration
export const API_CONFIG = {
  rateLimit: parseInt(import.meta.env.VITE_API_RATE_LIMIT || '100'),
  rateWindow: parseInt(import.meta.env.VITE_API_RATE_WINDOW || '60000'),
  maxFileSize: parseInt(import.meta.env.VITE_MAX_FILE_SIZE || '5242880'), // 5MB
  allowedFileTypes: (import.meta.env.VITE_ALLOWED_FILE_TYPES || 'image/jpeg,image/png,image/webp,application/pdf').split(','),
} as const;

// Validation Functions
export const validateConfig = () => {
  const errors: string[] = [];

  // Check required Supabase configuration
  if (!SUPABASE_CONFIG.url) {
    errors.push('VITE_SUPABASE_URL is required');
  }
  if (!SUPABASE_CONFIG.anonKey) {
    errors.push('VITE_SUPABASE_ANON_KEY is required');
  }

  // Check required UddoktaPay configuration
  if (!UDDOKTAPAY_CONFIG.apiKey) {
    errors.push('VITE_UDDOKTAPAY_API_KEY is required');
  }

  // Validate URLs
  try {
    new URL(SUPABASE_CONFIG.url);
  } catch {
    errors.push('VITE_SUPABASE_URL must be a valid URL');
  }

  try {
    new URL(UDDOKTAPAY_CONFIG.baseUrl);
  } catch {
    errors.push('VITE_UDDOKTAPAY_BASE_URL must be a valid URL');
  }

  try {
    new URL(APP_CONFIG.url);
  } catch {
    errors.push('VITE_APP_URL must be a valid URL');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

// Development helpers
export const isDevelopment = () => APP_CONFIG.environment === 'development';
export const isProduction = () => APP_CONFIG.environment === 'production';

// Production configuration helper
export const getProductionConfig = () => {
  const productionUrls = {
    successUrl: `${APP_CONFIG.productionUrl}${PAYMENT_CONFIG.successUrl}`,
    cancelUrl: `${APP_CONFIG.productionUrl}${PAYMENT_CONFIG.cancelUrl}`,
    redirectUrl: `${APP_CONFIG.productionUrl}${PAYMENT_CONFIG.redirectUrl}`,
  };

  return {
    app: {
      ...APP_CONFIG,
      environment: 'production',
      url: APP_CONFIG.productionUrl,
    },
    payment: {
      ...PAYMENT_CONFIG,
      ...productionUrls,
    },
    features: {
      ...FEATURE_FLAGS,
      enableDebugLogs: false,
      enableRealTime: true,
      enableAnalytics: true,
    },
    urls: productionUrls,
  };
};

// Debug logging helper - disabled for production
export const debugLog = (...args: any[]) => {
  // Debug logging disabled for production
};

// Environment info for debugging
export const getEnvironmentInfo = () => ({
  app: {
    name: APP_CONFIG.name,
    environment: APP_CONFIG.environment,
    url: APP_CONFIG.url,
  },
  features: FEATURE_FLAGS,
  payment: {
    currency: PAYMENT_CONFIG.currency,
    environment: UDDOKTAPAY_CONFIG.environment,
  },
  mobile: MOBILE_CONFIG,
});

// Export all configurations
export const ENV = {
  SUPABASE: SUPABASE_CONFIG,
  UDDOKTAPAY: UDDOKTAPAY_CONFIG,
  APP: APP_CONFIG,
  PAYMENT: PAYMENT_CONFIG,
  FEATURES: FEATURE_FLAGS,
  MOBILE: MOBILE_CONFIG,
  CONTACT: CONTACT_CONFIG,
  API: API_CONFIG,
  // Dynamic helpers
  getAppUrl,
  getPaymentUrls,
  getProductionConfig,
  // Mobile helpers
  isMobileApp,
  isMobileDevice,
} as const;

// Type definitions for better TypeScript support
export type EnvironmentConfig = typeof ENV;
export type FeatureFlags = typeof FEATURE_FLAGS;
export type PaymentConfig = typeof PAYMENT_CONFIG;
