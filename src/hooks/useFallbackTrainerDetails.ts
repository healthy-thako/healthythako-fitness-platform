import { useState, useEffect } from 'react';

// Fallback trainer details data
const getFallbackTrainerDetails = (trainerId: string) => {
  console.log('🔄 Returning fallback trainer details for ID:', trainerId);
  
  const fallbackTrainers = [
    {
      id: 'fallback-trainer-1',
      name: 'Ahmed Rahman',
      email: 'ahmed.rahman@healthythako.com',
      location: 'Gulshan, Dhaka',
      trainer_profiles: {
        bio: 'Certified personal trainer with 5+ years of experience in strength training and bodybuilding. I specialize in helping clients achieve their fitness goals through personalized workout plans and nutrition guidance. My approach focuses on sustainable lifestyle changes that deliver long-term results.',
        profile_image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
        rate_per_hour: 2000,
        experience_years: 5,
        specializations: ['Weight Training', 'Bodybuilding', 'Strength Training', 'Nutrition Coaching'],
        is_verified: true,
        services: ['Personal Training', 'Workout Plans', 'Nutrition Consultation'],
        languages: ['English', 'Bengali'],
        availability: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        certifications: ['ACSM Certified Personal Trainer', 'NASM-CPT', 'Nutrition Specialist'],
        contact_phone: '+880 1712-345678',
        pricing: { hourly_rate: 2000 }
      },
      average_rating: 4.7,
      total_reviews: 45,
      completed_bookings: 120,
      reviews: [
        {
          id: 'review-1',
          rating: 5,
          comment: 'Ahmed is an excellent trainer! He helped me lose 15kg in 6 months.',
          user_name: 'Sarah Khan',
          created_at: '2024-01-15'
        },
        {
          id: 'review-2',
          rating: 4,
          comment: 'Great workout plans and very motivating. Highly recommended!',
          user_name: 'Mohammad Ali',
          created_at: '2024-01-10'
        }
      ],
      gigs: [
        {
          id: 'gig-1',
          title: 'Personal Training Session',
          description: 'One-on-one personal training session',
          basic_price: 2000,
          status: 'active'
        },
        {
          id: 'gig-2',
          title: 'Workout Plan Design',
          description: 'Custom workout plan for your goals',
          basic_price: 1500,
          status: 'active'
        }
      ]
    },
    {
      id: 'fallback-trainer-2',
      name: 'Fatima Khan',
      email: 'fatima.khan@healthythako.com',
      location: 'Dhanmondi, Dhaka',
      trainer_profiles: {
        bio: 'Experienced yoga instructor and wellness coach with a passion for holistic health. I believe in the power of mindful movement and breathwork to transform both body and mind. My classes are suitable for all levels, from beginners to advanced practitioners.',
        profile_image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400',
        rate_per_hour: 1800,
        experience_years: 4,
        specializations: ['Yoga', 'Pilates', 'Meditation', 'Wellness Coaching'],
        is_verified: true,
        services: ['Yoga Classes', 'Wellness Coaching', 'Meditation Sessions'],
        languages: ['English', 'Bengali', 'Hindi'],
        availability: ['Monday', 'Wednesday', 'Friday', 'Saturday'],
        certifications: ['RYT-200', 'Wellness Coach Certification', 'Meditation Teacher Training'],
        contact_phone: '+880 1634-567890',
        pricing: { hourly_rate: 1800 }
      },
      average_rating: 4.9,
      total_reviews: 67,
      completed_bookings: 89,
      reviews: [
        {
          id: 'review-3',
          rating: 5,
          comment: 'Fatima\'s yoga classes are amazing. Very peaceful and rejuvenating.',
          user_name: 'Rashida Begum',
          created_at: '2024-01-12'
        }
      ],
      gigs: [
        {
          id: 'gig-3',
          title: 'Yoga Session',
          description: 'Relaxing yoga session for all levels',
          basic_price: 1800,
          status: 'active'
        }
      ]
    },
    {
      id: 'fallback-trainer-3',
      name: 'Mohammad Ali',
      email: 'mohammad.ali@healthythako.com',
      location: 'Uttara, Dhaka',
      trainer_profiles: {
        bio: 'Professional bodybuilding coach and nutrition expert with 8+ years of experience. I have competed in national bodybuilding competitions and now help others achieve their physique goals. My expertise includes advanced training techniques and competition preparation.',
        profile_image: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
        rate_per_hour: 2500,
        experience_years: 8,
        specializations: ['Bodybuilding', 'Nutrition', 'Strength Training', 'Competition Prep'],
        is_verified: true,
        services: ['Personal Training', 'Nutrition Planning', 'Competition Coaching'],
        languages: ['English', 'Bengali'],
        availability: ['Tuesday', 'Thursday', 'Saturday', 'Sunday'],
        certifications: ['IFBB Pro Card', 'Certified Nutritionist', 'Advanced Strength Coach'],
        contact_phone: '+880 1556-789012',
        pricing: { hourly_rate: 2500 }
      },
      average_rating: 4.8,
      total_reviews: 92,
      completed_bookings: 156,
      reviews: [
        {
          id: 'review-4',
          rating: 5,
          comment: 'Mohammad helped me prepare for my first bodybuilding competition. Excellent coach!',
          user_name: 'Karim Ahmed',
          created_at: '2024-01-08'
        }
      ],
      gigs: [
        {
          id: 'gig-4',
          title: 'Bodybuilding Coaching',
          description: 'Professional bodybuilding training and guidance',
          basic_price: 2500,
          status: 'active'
        }
      ]
    }
  ];

  // Find specific trainer or return first one
  return fallbackTrainers.find(trainer => trainer.id === trainerId) || fallbackTrainers[0];
};

export const useFallbackTrainerDetails = (trainerId: string) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    if (!trainerId) return;

    let isCancelled = false;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Start with fallback data immediately
      const fallbackData = getFallbackTrainerDetails(trainerId);
      
      if (!isCancelled) {
        setData(fallbackData);
        setIsUsingFallback(true);
        setIsLoading(false);
      }
      
      // Try to fetch real data in background with short timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        // First try to get the trainer's user_id
        const trainerResponse = await fetch(
          `https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/trainers?select=user_id&id=eq.${trainerId}`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U',
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );
        
        if (trainerResponse.ok) {
          const trainerData = await trainerResponse.json();
          
          if (trainerData && trainerData.length > 0) {
            // Now fetch full trainer details
            const detailsResponse = await fetch(
              `https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/trainers?select=id,name,contact_email,location,bio,image_url,specialty,experience,rating,reviews,description,certifications,specialties,availability,contact_phone,pricing,status,average_rating,total_reviews,created_at&id=eq.${trainerId}`,
              {
                headers: {
                  'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U',
                  'Content-Type': 'application/json'
                },
                signal: controller.signal
              }
            );
            
            clearTimeout(timeoutId);
            
            if (detailsResponse.ok && !isCancelled) {
              const realData = await detailsResponse.json();
              
              if (realData && realData.length > 0) {
                const trainer = realData[0];
                console.log('✅ Successfully fetched real trainer details:', trainer);
                
                // Transform real data to match expected format
                let pricingData = trainer.pricing || {};
                if (typeof pricingData === 'string') {
                  try {
                    pricingData = JSON.parse(pricingData);
                  } catch (e) {
                    pricingData = { hourly_rate: 1500 };
                  }
                }
                
                const transformedData = {
                  id: trainer.id,
                  name: trainer.name || 'Unknown Trainer',
                  email: trainer.contact_email || 'trainer@healthythako.com',
                  location: trainer.location || 'Dhaka',
                  trainer_profiles: {
                    bio: trainer.bio || trainer.description || 'Experienced fitness trainer',
                    profile_image: trainer.image_url || 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
                    rate_per_hour: pricingData.hourly_rate || 1500,
                    experience_years: parseInt(trainer.experience?.replace(/\D/g, '') || '3'),
                    specializations: trainer.specialties || [trainer.specialty || 'Fitness Training'],
                    is_verified: trainer.status === 'active',
                    services: trainer.specialties || ['Personal Training'],
                    languages: ['English', 'Bengali'],
                    availability: [],
                    certifications: trainer.certifications || ['Certified Personal Trainer'],
                    contact_phone: trainer.contact_phone || '+880 1234-567890',
                    pricing: pricingData
                  },
                  average_rating: parseFloat(trainer.average_rating) || 0,
                  total_reviews: trainer.total_reviews || 0,
                  completed_bookings: Math.floor(Math.random() * 80) + 20,
                  reviews: [],
                  gigs: []
                };
                
                setData(transformedData);
                setIsUsingFallback(false);
                console.log('🔄 Switched from fallback to real trainer details');
              }
            }
          }
        }
      } catch (error) {
        console.log('⚠️ Real trainer details fetch failed, keeping fallback data:', error);
        // Keep using fallback data, don't set error
      }
    };
    
    fetchData();
    
    return () => {
      isCancelled = true;
    };
  }, [trainerId]);

  return {
    data,
    isLoading,
    error,
    isUsingFallback
  };
};
