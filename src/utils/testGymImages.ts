/**
 * Gym Images Test Utility
 * Tests the gym image fetching functionality
 */

import { supabase, queryWithTimeout } from '@/integrations/supabase/client';

// Test gym images fetching
export const testGymImagesFetching = async () => {
  console.log('🧪 Testing gym images fetching...');
  
  try {
    // Test the exact query that the frontend will use
    const { data: gymData, error: gymError } = await queryWithTimeout(
      supabase
        .from('gyms')
        .select(`
          id,
          name,
          description,
          address,
          phone,
          email,
          website,
          rating,
          created_at,
          updated_at,
          owner_id,
          ht_verified,
          is_gym_pass_enabled,
          location_lat,
          location_lng
        `)
        .order('created_at', { ascending: false })
        .limit(5),
      10000
    );

    if (gymError) {
      console.error('❌ Gym data fetching failed:', gymError);
      return { success: false, error: gymError.message };
    }

    if (!gymData || gymData.length === 0) {
      console.warn('⚠️ No gym data found');
      return { success: false, error: 'No gyms found' };
    }

    console.log('✅ Gym data fetching successful:', gymData.length, 'gyms');

    // Test images fetching
    const gymIds = gymData.map(gym => gym.id);
    const { data: imagesData, error: imagesError } = await queryWithTimeout(
      supabase
        .from('gym_images')
        .select('gym_id, image_url, is_primary')
        .in('gym_id', gymIds)
        .eq('is_primary', true),
      10000
    );

    if (imagesError) {
      console.error('❌ Images fetching failed:', imagesError);
      return { success: false, error: imagesError.message };
    }

    console.log('✅ Images fetching successful:', imagesData?.length || 0, 'images');

    // Create a map of gym_id to primary image URL
    const imageMap = new Map();
    imagesData?.forEach(img => {
      imageMap.set(img.gym_id, img.image_url);
    });

    // Test data transformation
    const enrichedGymData = gymData.map(gym => ({
      ...gym,
      primary_image_url: imageMap.get(gym.id) || null,
      has_image: !!imageMap.get(gym.id)
    }));

    console.log('✅ Data transformation successful');
    console.log('📊 Gym images summary:');
    enrichedGymData.forEach(gym => {
      console.log(`- ${gym.name}: ${gym.has_image ? '✅ Has image' : '❌ No image'}`);
      if (gym.has_image) {
        console.log(`  Image URL: ${gym.primary_image_url}`);
      }
    });

    return { 
      success: true, 
      gyms: enrichedGymData,
      totalGyms: gymData.length,
      gymsWithImages: enrichedGymData.filter(g => g.has_image).length,
      gymsWithoutImages: enrichedGymData.filter(g => !g.has_image).length
    };

  } catch (error) {
    console.error('💥 Gym images test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test specific gym image fetching
export const testSpecificGymImage = async (gymId: string) => {
  console.log('🧪 Testing specific gym image fetching for:', gymId);
  
  try {
    const { data: imageData, error } = await queryWithTimeout(
      supabase
        .from('gym_images')
        .select('image_url, is_primary')
        .eq('gym_id', gymId)
        .eq('is_primary', true)
        .single(),
      5000
    );

    if (error) {
      console.error('❌ Specific gym image fetching failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ Specific gym image fetching successful:', imageData);
    return { success: true, image: imageData };

  } catch (error) {
    console.error('💥 Specific gym image test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test all gym images in the database
export const testAllGymImages = async () => {
  console.log('🧪 Testing all gym images in database...');
  
  try {
    const { data: allImages, error } = await queryWithTimeout(
      supabase
        .from('gym_images')
        .select(`
          id,
          gym_id,
          image_url,
          is_primary,
          created_at,
          gyms(name)
        `)
        .order('created_at', { ascending: false }),
      10000
    );

    if (error) {
      console.error('❌ All gym images fetching failed:', error);
      return { success: false, error: error.message };
    }

    console.log('✅ All gym images fetching successful:', allImages?.length || 0, 'images');
    
    const primaryImages = allImages?.filter(img => img.is_primary) || [];
    const secondaryImages = allImages?.filter(img => !img.is_primary) || [];

    console.log('📊 Images breakdown:');
    console.log(`- Primary images: ${primaryImages.length}`);
    console.log(`- Secondary images: ${secondaryImages.length}`);
    console.log(`- Total images: ${allImages?.length || 0}`);

    return { 
      success: true, 
      allImages,
      primaryImages,
      secondaryImages,
      totalImages: allImages?.length || 0
    };

  } catch (error) {
    console.error('💥 All gym images test failed:', error);
    return { success: false, error: error.message };
  }
};

// Run comprehensive gym images tests
export const runGymImagesTests = async () => {
  console.log('🚀 Starting comprehensive gym images tests...');
  
  const results = {
    gymImages: await testGymImagesFetching(),
    allImages: await testAllGymImages(),
  };

  const allTestsPassed = results.gymImages.success && results.allImages.success;

  console.log('📋 Gym Images Test Results Summary:');
  console.log('- Gym Images Fetching:', results.gymImages.success ? '✅ PASS' : '❌ FAIL');
  console.log('- All Images Query:', results.allImages.success ? '✅ PASS' : '❌ FAIL');
  console.log('Overall:', allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

  if (results.gymImages.success) {
    console.log(`📊 Summary: ${results.gymImages.totalGyms} gyms, ${results.gymImages.gymsWithImages} with images, ${results.gymImages.gymsWithoutImages} without images`);
  }

  return {
    success: allTestsPassed,
    results
  };
};

// Export for use in components or debugging
export default {
  testGymImagesFetching,
  testSpecificGymImage,
  testAllGymImages,
  runGymImagesTests
};
