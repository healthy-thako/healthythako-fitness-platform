/**
 * Database Connection Test Utility
 * Tests the fixed trainer and gym data fetching functionality
 */

import { supabase, queryWithTimeout } from '@/integrations/supabase/client';

// Test trainer data fetching
export const testTrainerDataFetching = async () => {
  console.log('🧪 Testing trainer data fetching...');
  
  try {
    const { data: trainersData, error } = await queryWithTimeout(
      supabase
        .from('trainers')
        .select(`
          id,
          name,
          contact_email,
          location,
          bio,
          image_url,
          specialty,
          experience,
          rating,
          reviews,
          description,
          certifications,
          specialties,
          availability,
          contact_phone,
          pricing,
          status,
          average_rating,
          total_reviews,
          created_at
        `)
        .limit(5),
      10000
    );

    if (error) {
      console.error('❌ Trainer data fetching failed:', error);
      return { success: false, error: error.message };
    }

    if (!trainersData || trainersData.length === 0) {
      console.warn('⚠️ No trainer data found');
      return { success: false, error: 'No trainers found' };
    }

    console.log('✅ Trainer data fetching successful:', trainersData.length, 'trainers');
    console.log('📊 Sample trainer data:', trainersData[0]);

    // Test data transformation
    const transformedTrainer = {
      id: trainersData[0].id,
      name: trainersData[0].name || 'Unknown Trainer',
      email: trainersData[0].contact_email || '',
      location: trainersData[0].location || 'Dhaka',
      trainer_profiles: {
        bio: trainersData[0].bio || trainersData[0].description || 'Experienced fitness trainer',
        profile_image: trainersData[0].image_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        rate_per_hour: trainersData[0].pricing?.hourly_rate || 1500,
        experience_years: trainersData[0].experience ? parseInt(trainersData[0].experience.replace(/\D/g, '')) || 2 : 2,
        specializations: trainersData[0].specialties || [trainersData[0].specialty].filter(Boolean) || ['Fitness Training'],
        is_verified: trainersData[0].status === 'verified' || trainersData[0].status === 'active',
        services: trainersData[0].specialties || [trainersData[0].specialty].filter(Boolean) || ['Personal Training'],
        languages: ['English', 'Bengali'],
        availability: trainersData[0].availability || [],
        certifications: trainersData[0].certifications || ['Certified Personal Trainer']
      },
      average_rating: parseFloat(trainersData[0].average_rating) || trainersData[0].rating || 4.0,
      total_reviews: trainersData[0].total_reviews || trainersData[0].reviews || 0,
      completed_bookings: 0
    };

    console.log('✅ Data transformation successful:', transformedTrainer);
    return { success: true, data: trainersData, transformed: transformedTrainer };

  } catch (error) {
    console.error('💥 Trainer data fetching test failed:', error);
    return { success: false, error: error.message };
  }
};

// Test gym data fetching
export const testGymDataFetching = async () => {
  console.log('🧪 Testing gym data fetching...');
  
  try {
    const { data: gymsData, error } = await queryWithTimeout(
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
        .limit(5),
      10000
    );

    if (error) {
      console.error('❌ Gym data fetching failed:', error);
      return { success: false, error: error.message };
    }

    if (!gymsData || gymsData.length === 0) {
      console.warn('⚠️ No gym data found');
      return { success: false, error: 'No gyms found' };
    }

    console.log('✅ Gym data fetching successful:', gymsData.length, 'gyms');
    console.log('📊 Sample gym data:', gymsData[0]);

    // Test data transformation
    const transformedGym = {
      id: gymsData[0].id,
      name: gymsData[0].name || 'Unknown Gym',
      description: gymsData[0].description || 'A modern fitness facility',
      address: gymsData[0].address || 'Dhaka, Bangladesh',
      area: gymsData[0].address?.split(',')[1]?.trim() || 'Dhaka',
      city: 'Dhaka',
      phone: gymsData[0].phone || '+880 1234-567890',
      email: gymsData[0].email || 'info@gym.com',
      website: gymsData[0].website || '',
      logo_url: gymsData[0].logo_url || '',
      image_url: gymsData[0].image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      gym_owner_id: gymsData[0].owner_id || '',
      rating: gymsData[0].rating || 4.0,
      review_count: gymsData[0].review_count || 0,
      is_active: true,
      created_at: gymsData[0].created_at,
      updated_at: gymsData[0].updated_at,
      monthly_rate: 2000,
      daily_rate: 150,
      operating_hours: '6:00 AM - 10:00 PM',
      status: 'active',
      amenities: ['Modern Equipment', 'Air Conditioning', 'Parking', 'Locker Rooms'],
      gym_owner: {
        name: 'Gym Owner',
        email: gymsData[0].email || 'owner@gym.com'
      }
    };

    console.log('✅ Data transformation successful:', transformedGym);
    return { success: true, data: gymsData, transformed: transformedGym };

  } catch (error) {
    console.error('💥 Gym data fetching test failed:', error);
    return { success: false, error: error.message };
  }
};

// Run comprehensive database tests
export const runDatabaseTests = async () => {
  console.log('🚀 Starting comprehensive database tests...');
  
  const results = {
    trainers: await testTrainerDataFetching(),
    gyms: await testGymDataFetching(),
  };

  const allTestsPassed = results.trainers.success && results.gyms.success;

  console.log('📋 Test Results Summary:');
  console.log('- Trainers:', results.trainers.success ? '✅ PASS' : '❌ FAIL');
  console.log('- Gyms:', results.gyms.success ? '✅ PASS' : '❌ FAIL');
  console.log('Overall:', allTestsPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');

  return {
    success: allTestsPassed,
    results
  };
};

// Export for use in components or debugging
export default {
  testTrainerDataFetching,
  testGymDataFetching,
  runDatabaseTests
};
