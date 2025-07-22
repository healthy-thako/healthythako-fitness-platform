/**
 * Direct Gym Test - Bypass React Query
 * Tests gym fetching without React Query to isolate the issue
 */

import { supabase, queryWithTimeout } from '@/integrations/supabase/client';

// Direct gym test without React Query
export const testDirectGymFetch = async () => {
  console.log('🧪 Testing direct gym fetch...');
  
  try {
    // Test 1: Very simple query

    const { data: countData, error: countError } = await supabase
      .from('gyms')
      .select('*', { count: 'exact', head: true });

    if (countError) {

      return { success: false, error: countError.message, step: 'count' };
    }

    // Test 2: Basic select
    const { data: basicData, error: basicError } = await supabase
      .from('gyms')
      .select('id, name')
      .limit(3);

    if (basicError) {

      return { success: false, error: basicError.message, step: 'basic' };
    }

    console.log('✅ Basic query successful:', basicData);

    // Test 3: Full query with timeout
    console.log('Test 3: Full query with timeout...');
    const { data: fullData, error: fullError } = await queryWithTimeout(
      supabase
        .from('gyms')
        .select('id, name, description, address, phone, email, rating')
        .order('created_at', { ascending: false })
        .limit(10),
      8000
    );

    if (fullError) {
      console.error('❌ Full query failed:', fullError);
      return { success: false, error: fullError.message, step: 'full' };
    }

    console.log('✅ Full query successful:', fullData);

    return {
      success: true,
      basicData,
      fullData,
      totalGyms: fullData?.length || 0
    };

  } catch (error) {
    console.error('💥 Direct test failed:', error);
    return { success: false, error: error.message, step: 'exception' };
  }
};

// Test gym images separately
export const testDirectImageFetch = async () => {
  console.log('🧪 Testing direct image fetch...');
  
  try {
    const { data: imagesData, error: imagesError } = await queryWithTimeout(
      supabase
        .from('gym_images')
        .select('gym_id, image_url, is_primary')
        .eq('is_primary', true)
        .limit(10),
      5000
    );

    if (imagesError) {
      console.error('❌ Images query failed:', imagesError);
      return { success: false, error: imagesError.message };
    }

    console.log('✅ Images query successful:', imagesData);
    return { success: true, imagesData, totalImages: imagesData?.length || 0 };

  } catch (error) {
    console.error('💥 Images test failed:', error);
    return { success: false, error: error.message };
  }
};

// Run comprehensive direct tests
export const runDirectGymTests = async () => {
  const gymResult = await testDirectGymFetch();
  const imageResult = await testDirectImageFetch();

  return {
    gymResult,
    imageResult,
    allPassed: gymResult.success && imageResult.success
  };
};

// Export for use in browser console
(window as any).testDirectGymFetch = testDirectGymFetch;
(window as any).testDirectImageFetch = testDirectImageFetch;
(window as any).runDirectGymTests = runDirectGymTests;

export default {
  testDirectGymFetch,
  testDirectImageFetch,
  runDirectGymTests
};
