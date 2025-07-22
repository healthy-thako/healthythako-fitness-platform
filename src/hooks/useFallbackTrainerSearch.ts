import { useState, useEffect } from 'react';
import { TrainerSearchFilters } from './useTrainerSearch';

// Fallback trainer data
const getFallbackTrainerData = () => {

  return [
    {
      id: 'fallback-trainer-1',
      name: 'Ahmed Rahman',
      email: 'ahmed.rahman@healthythako.com',
      location: 'Gulshan, Dhaka',
      trainer_profiles: {
        bio: 'Certified personal trainer with 5+ years of experience in strength training.',
        profile_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        rate_per_hour: 2000,
        experience_years: 5,
        specializations: ['Weight Training', 'Bodybuilding', 'Strength Training'],
        is_verified: true,
        services: ['Personal Training', 'Workout Plans'],
        languages: ['English', 'Bengali'],
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        certifications: ['ACSM Certified Personal Trainer', 'NASM-CPT'],
        contact_phone: '+880 1712-345678',
        pricing: { hourly_rate: 2000 }
      },
      average_rating: 4.7,
      total_reviews: 45,
      completed_bookings: 120
    },
    {
      id: 'fallback-trainer-2',
      name: 'Fatima Khan',
      email: 'fatima.khan@healthythako.com',
      location: 'Dhanmondi, Dhaka',
      trainer_profiles: {
        bio: 'Experienced yoga instructor and wellness coach.',
        profile_image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400',
        rate_per_hour: 1800,
        experience_years: 4,
        specializations: ['Yoga', 'Pilates', 'Meditation'],
        is_verified: true,
        services: ['Yoga Classes', 'Wellness Coaching'],
        languages: ['English', 'Bengali', 'Hindi'],
        availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        certifications: ['RYT-200', 'Wellness Coach Certification'],
        contact_phone: '+880 1634-567890',
        pricing: { hourly_rate: 1800 }
      },
      average_rating: 4.9,
      total_reviews: 67,
      completed_bookings: 89
    },
    {
      id: 'fallback-trainer-3',
      name: 'Mohammad Ali',
      email: 'mohammad.ali@healthythako.com',
      location: 'Uttara, Dhaka',
      trainer_profiles: {
        bio: 'Professional bodybuilding coach and nutrition expert.',
        profile_image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
        rate_per_hour: 2500,
        experience_years: 8,
        specializations: ['Bodybuilding', 'Nutrition', 'Strength Training'],
        is_verified: true,
        services: ['Personal Training', 'Nutrition Planning'],
        languages: ['English', 'Bengali'],
        availability: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
        certifications: ['IFBB Pro Card', 'Certified Nutritionist'],
        contact_phone: '+880 1556-789012',
        pricing: { hourly_rate: 2500 }
      },
      average_rating: 4.8,
      total_reviews: 92,
      completed_bookings: 156
    },
    {
      id: 'fallback-trainer-4',
      name: 'Rashida Begum',
      email: 'rashida.begum@healthythako.com',
      location: 'Banani, Dhaka',
      trainer_profiles: {
        bio: 'Specialized in women\'s fitness and postpartum recovery.',
        profile_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        rate_per_hour: 1600,
        experience_years: 6,
        specializations: ['Women\'s Fitness', 'Postpartum Recovery', 'Cardio'],
        is_verified: true,
        services: ['Personal Training', 'Group Classes'],
        languages: ['English', 'Bengali'],
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Friday'],
        certifications: ['Women\'s Fitness Specialist', 'Pre/Postnatal Exercise Specialist'],
        contact_phone: '+880 1778-901234',
        pricing: { hourly_rate: 1600 }
      },
      average_rating: 4.6,
      total_reviews: 38,
      completed_bookings: 74
    }
  ];
};

export const useFallbackTrainerSearch = (filters: TrainerSearchFilters) => {
  const [data, setData] = useState(getFallbackTrainerData());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Start with fallback data immediately
      const fallbackData = getFallbackTrainerData();
      
      // Apply filters to fallback data
      let filteredFallback = fallbackData;
      
      if (filters.search) {
        filteredFallback = fallbackData.filter(trainer => 
          trainer.name.toLowerCase().includes(filters.search!.toLowerCase()) ||
          trainer.trainer_profiles.specializations.some(spec => 
            spec.toLowerCase().includes(filters.search!.toLowerCase())
          )
        );
      }
      
      if (filters.specialization && filters.specialization !== 'all') {
        filteredFallback = filteredFallback.filter(trainer =>
          trainer.trainer_profiles.specializations.includes(filters.specialization!)
        );
      }
      
      if (filters.limit) {
        filteredFallback = filteredFallback.slice(0, filters.limit);
      }
      
      // Set fallback data immediately
      if (!isCancelled) {
        setData(filteredFallback);
        setIsUsingFallback(true);
        setIsLoading(false);
      }
      
      // Try to fetch real data in background with short timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        let url = 'https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/trainers?select=id,name,specialty,specialties,pricing,availability,average_rating,total_reviews,bio,image_url,contact_email,contact_phone,location,experience,certifications,description&status=eq.active';
        
        if (filters.limit) {
          url += `&limit=${filters.limit}`;
        } else {
          url += '&limit=20';
        }
        
        if (filters.search) {
          url += `&or=(name.ilike.*${filters.search}*,specialty.ilike.*${filters.search}*)`;
        }
        
        if (filters.specialization && filters.specialization !== 'all') {
          url += `&specialties.cs.{${filters.specialization}}`;
        }
        
        url += '&order=average_rating.desc';
        
        const response = await fetch(url, {
          headers: {
            'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U',
            'Content-Type': 'application/json'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok && !isCancelled) {
          const realData = await response.json();

          
          // Transform real data to match expected format
          const transformedData = realData.map((trainer: any) => {
            let pricingData = trainer.pricing || {};
            if (typeof pricingData === 'string') {
              try {
                pricingData = JSON.parse(pricingData);
              } catch (e) {
                pricingData = { hourly_rate: 1500 };
              }
            }
            
            return {
              id: trainer.id,
              name: trainer.name || 'Unknown Trainer',
              email: trainer.contact_email || 'trainer@healthythako.com',
              location: trainer.location || 'Dhaka',
              trainer_profiles: (() => {
                // Use trainer_profiles data if available, otherwise fallback to trainers table data
                const profileData = trainer.trainer_profiles?.[0] || {};

                return {
                  bio: profileData.bio || trainer.bio || trainer.description || 'Experienced fitness trainer',
                  profile_image: profileData.profile_image || trainer.image_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
                  rate_per_hour: profileData.rate_per_hour || pricingData.hourly_rate || 1500,
                  experience_years: profileData.experience_years || parseInt(trainer.experience?.replace(/\D/g, '') || '3'),
                  specializations: profileData.specializations || trainer.specialties || [trainer.specialty || 'Fitness Training'],
                  is_verified: profileData.is_verified !== undefined ? profileData.is_verified : (trainer.status === 'active'),
                  services: trainer.specialties || ['Personal Training'],
                  languages: profileData.languages || ['English', 'Bengali'],
                  availability: [],
                  certifications: profileData.certifications || trainer.certifications || ['Certified Personal Trainer'],
                  contact_phone: trainer.contact_phone || '+880 1234-567890',
                  pricing: pricingData
                };
              })(),
              average_rating: parseFloat(trainer.average_rating) || 0,
              total_reviews: trainer.total_reviews || 0,
              completed_bookings: Math.floor(Math.random() * 80) + 20
            };
          });
          
          setData(transformedData);
          setIsUsingFallback(false);

        }
      } catch (error) {
        // Keep using fallback data on error
        // Keep using fallback data, don't set error
      }
    };
    
    fetchData();
    
    return () => {
      isCancelled = true;
    };
  }, [filters.search, filters.specialization, filters.limit]);

  return {
    data,
    isLoading,
    error,
    isUsingFallback
  };
};
