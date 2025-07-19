import { useState, useEffect } from 'react';

// Fallback gym details data
const getFallbackGymDetails = (gymId: string) => {
  console.log('🔄 Returning fallback gym details for ID:', gymId);
  
  const fallbackGyms = [
    {
      id: 'fallback-gym-1',
      name: 'Elite Fitness Center',
      description: 'Premium fitness center with state-of-the-art equipment and professional trainers. We offer a complete fitness experience with modern facilities, group classes, and personalized training programs. Our mission is to help you achieve your fitness goals in a supportive and motivating environment.',
      address: 'House 45, Road 12, Gulshan 1, Dhaka 1212',
      area: 'Gulshan',
      city: 'Dhaka',
      phone: '+880 1712-345678',
      email: 'info@elitefitness.com',
      website: 'www.elitefitness.com',
      logo_url: '',
      image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      gym_owner_id: '',
      rating: 4.5,
      review_count: 25,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      monthly_price: 3500,
      daily_price: 200,
      opening_time: '06:00',
      closing_time: '23:00',
      status: 'active',
      amenities: ['Modern Equipment', 'Air Conditioning', 'Parking', 'Locker Rooms', 'Shower Facilities', 'Sauna', 'Steam Room', 'Juice Bar'],
      gym_owner: { name: 'Ahmed Hassan', email: 'owner@elitefitness.com' },
      is_gym_pass_enabled: true,
      ht_verified: true,
      location_lat: 23.7808875,
      location_lng: 90.4142273,
      membership_plans: [
        {
          id: 'plan-1',
          name: 'Monthly',
          description: 'Full access to all gym facilities',
          price: 3500,
          duration_days: 30,
          features: ['Full gym access', 'Group classes', 'Locker facility', 'Shower access'],
          is_active: true
        },
        {
          id: 'plan-2',
          name: 'Quarterly',
          description: 'Best value for regular gym goers',
          price: 9000,
          duration_days: 90,
          features: ['Full gym access', 'Group classes', 'Locker facility', 'Personal trainer session', 'Nutrition consultation'],
          is_active: true
        },
        {
          id: 'plan-3',
          name: 'Annual',
          description: 'Ultimate fitness package',
          price: 30000,
          duration_days: 365,
          features: ['Full gym access', 'Unlimited group classes', 'Personal trainer sessions', 'Nutrition consultation', 'Guest passes'],
          is_active: true
        }
      ],
      images: [
        { id: 'img-1', image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', is_primary: true },
        { id: 'img-2', image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', is_primary: false },
        { id: 'img-3', image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800', is_primary: false }
      ],
      hours: [
        { day_of_week: 0, open_time: '07:00', close_time: '22:00', is_closed: false },
        { day_of_week: 1, open_time: '06:00', close_time: '23:00', is_closed: false },
        { day_of_week: 2, open_time: '06:00', close_time: '23:00', is_closed: false },
        { day_of_week: 3, open_time: '06:00', close_time: '23:00', is_closed: false },
        { day_of_week: 4, open_time: '06:00', close_time: '23:00', is_closed: false },
        { day_of_week: 5, open_time: '06:00', close_time: '23:00', is_closed: false },
        { day_of_week: 6, open_time: '07:00', close_time: '22:00', is_closed: false }
      ]
    },
    {
      id: 'fallback-gym-2',
      name: 'PowerHouse Gym',
      description: 'Strength training focused gym with heavy-duty equipment and experienced trainers. Perfect for serious lifters and bodybuilders. We provide a hardcore training environment with professional-grade equipment and expert guidance.',
      address: 'Plot 27, Road 15, Dhanmondi, Dhaka 1205',
      area: 'Dhanmondi',
      city: 'Dhaka',
      phone: '+880 1556-789012',
      email: 'contact@powerhousegym.com',
      website: 'www.powerhousegym.com',
      logo_url: '',
      image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
      gym_owner_id: '',
      rating: 4.3,
      review_count: 18,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      monthly_price: 4000,
      daily_price: 250,
      opening_time: '05:00',
      closing_time: '24:00',
      status: 'active',
      amenities: ['Heavy Equipment', 'Powerlifting Area', 'Cardio Zone', 'Supplements Store', 'Protein Bar', 'Free Weights'],
      gym_owner: { name: 'Mohammad Rahman', email: 'owner@powerhousegym.com' },
      is_gym_pass_enabled: true,
      ht_verified: true,
      location_lat: 23.7461,
      location_lng: 90.3742,
      membership_plans: [
        {
          id: 'plan-4',
          name: 'Monthly',
          description: 'Access to all powerlifting equipment',
          price: 4000,
          duration_days: 30,
          features: ['Full gym access', 'Powerlifting area', 'Cardio zone', 'Supplement discounts'],
          is_active: true
        }
      ],
      images: [
        { id: 'img-4', image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', is_primary: true }
      ],
      hours: [
        { day_of_week: 0, open_time: '06:00', close_time: '22:00', is_closed: false },
        { day_of_week: 1, open_time: '05:00', close_time: '24:00', is_closed: false },
        { day_of_week: 2, open_time: '05:00', close_time: '24:00', is_closed: false },
        { day_of_week: 3, open_time: '05:00', close_time: '24:00', is_closed: false },
        { day_of_week: 4, open_time: '05:00', close_time: '24:00', is_closed: false },
        { day_of_week: 5, open_time: '05:00', close_time: '24:00', is_closed: false },
        { day_of_week: 6, open_time: '06:00', close_time: '22:00', is_closed: false }
      ]
    },
    {
      id: 'fallback-gym-3',
      name: 'Wellness Studio',
      description: 'Holistic wellness center offering yoga, pilates, and mindfulness classes. Our peaceful environment is designed to promote both physical fitness and mental well-being. Perfect for those seeking a balanced approach to health.',
      address: 'House 11, Road 8, Banani, Dhaka 1213',
      area: 'Banani',
      city: 'Dhaka',
      phone: '+880 1634-567890',
      email: 'hello@wellnessstudio.com',
      website: 'www.wellnessstudio.com',
      logo_url: '',
      image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
      gym_owner_id: '',
      rating: 4.8,
      review_count: 32,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      monthly_price: 2500,
      daily_price: 150,
      opening_time: '07:00',
      closing_time: '22:00',
      status: 'active',
      amenities: ['Yoga Studio', 'Pilates Equipment', 'Meditation Room', 'Healthy Cafe', 'Massage Therapy', 'Aromatherapy'],
      gym_owner: { name: 'Fatima Khan', email: 'owner@wellnessstudio.com' },
      is_gym_pass_enabled: false,
      ht_verified: true,
      location_lat: 23.7936,
      location_lng: 90.4066,
      membership_plans: [
        {
          id: 'plan-5',
          name: 'Monthly',
          description: 'Access to all wellness classes',
          price: 2500,
          duration_days: 30,
          features: ['Yoga classes', 'Pilates sessions', 'Meditation room', 'Healthy cafe discounts'],
          is_active: true
        },
        {
          id: 'plan-6',
          name: 'Annual',
          description: 'Complete wellness package',
          price: 25000,
          duration_days: 365,
          features: ['Unlimited classes', 'Personal sessions', 'Nutrition consultation', 'Massage therapy'],
          is_active: true
        }
      ],
      images: [
        { id: 'img-5', image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800', is_primary: true }
      ],
      hours: [
        { day_of_week: 0, open_time: '08:00', close_time: '20:00', is_closed: false },
        { day_of_week: 1, open_time: '07:00', close_time: '22:00', is_closed: false },
        { day_of_week: 2, open_time: '07:00', close_time: '22:00', is_closed: false },
        { day_of_week: 3, open_time: '07:00', close_time: '22:00', is_closed: false },
        { day_of_week: 4, open_time: '07:00', close_time: '22:00', is_closed: false },
        { day_of_week: 5, open_time: '07:00', close_time: '22:00', is_closed: false },
        { day_of_week: 6, open_time: '08:00', close_time: '20:00', is_closed: false }
      ]
    }
  ];

  // Find specific gym or return first one
  return fallbackGyms.find(gym => gym.id === gymId) || fallbackGyms[0];
};

export const useFallbackGymDetails = (gymId: string) => {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    if (!gymId) return;

    let isCancelled = false;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Start with fallback data immediately
      const fallbackData = getFallbackGymDetails(gymId);
      
      if (!isCancelled) {
        setData(fallbackData);
        setIsUsingFallback(true);
        setIsLoading(false);
      }
      
      // Try to fetch real data in background with short timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(
          `https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/gyms?select=id,name,description,address,rating,ht_verified,phone,email,website,location_lat,location_lng,is_gym_pass_enabled,created_at,updated_at,owner_id,gym_amenities(name),membership_plans(id,name,price,duration_days,description,features),gym_images(image_url,is_primary)&id=eq.${gymId}`,
          {
            headers: {
              'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxobmNwY3NuaXV4bnJtYWJia21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDEwMDY5MTUsImV4cCI6MjA1NjU4MjkxNX0.zWr2gDn3bxVzGeCOFzXxgGYtusw6aoboyWBtB1cDo0U',
              'Content-Type': 'application/json'
            },
            signal: controller.signal
          }
        );
        
        clearTimeout(timeoutId);
        
        if (response.ok && !isCancelled) {
          const realData = await response.json();
          
          if (realData && realData.length > 0) {
            const gym = realData[0];
            console.log('✅ Successfully fetched real gym details:', gym);
            
            // Transform real data to match expected format
            const addressParts = gym.address?.split(',') || [];
            const area = addressParts.length > 1 ? addressParts[1]?.trim() : 'Dhaka';
            const city = addressParts.length > 2 ? addressParts[2]?.trim() : 'Dhaka';
            
            const amenities = gym.gym_amenities?.map((amenity: any) => amenity.name) || ['Modern Equipment', 'Air Conditioning', 'Parking'];
            const gymImages = gym.gym_images || [];
            let primaryImage = 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800';
            
            if (gymImages.length > 0) {
              const primary = gymImages.find((img: any) => img.is_primary);
              primaryImage = primary?.image_url || gymImages[0]?.image_url || primaryImage;
            }
            
            const membershipPlans = gym.membership_plans || [];
            let monthlyRate = 3000;
            let dailyRate = 200;
            
            if (membershipPlans.length > 0) {
              const monthlyPlan = membershipPlans.find((plan: any) => plan.duration_days >= 25 && plan.duration_days <= 35);
              if (monthlyPlan) {
                monthlyRate = monthlyPlan.price;
                dailyRate = Math.round(monthlyPlan.price / 30);
              }
            }
            
            const transformedData = {
              id: gym.id,
              name: gym.name || 'Unknown Gym',
              description: gym.description || 'A modern fitness facility',
              address: gym.address || 'Dhaka, Bangladesh',
              area: area,
              city: city,
              phone: gym.phone || '+880 1234-567890',
              email: gym.email || 'info@gym.com',
              website: gym.website || '',
              logo_url: primaryImage,
              image_url: primaryImage,
              gym_owner_id: gym.owner_id || '',
              rating: gym.rating || 4.0,
              review_count: Math.floor(Math.random() * 50) + 10,
              is_active: true,
              created_at: gym.created_at,
              updated_at: gym.updated_at,
              monthly_price: monthlyRate,
              daily_price: dailyRate,
              opening_time: '06:00',
              closing_time: '23:00',
              status: 'active',
              amenities: amenities,
              gym_owner: { name: 'Gym Owner', email: gym.email || 'owner@gym.com' },
              is_gym_pass_enabled: gym.is_gym_pass_enabled || false,
              ht_verified: gym.ht_verified || false,
              location_lat: gym.location_lat,
              location_lng: gym.location_lng,
              membership_plans: membershipPlans,
              images: gymImages.map((img: any) => ({
                id: img.id || Math.random().toString(),
                image_url: img.image_url,
                is_primary: img.is_primary
              })),
              hours: [
                { day_of_week: 0, open_time: '07:00', close_time: '22:00', is_closed: false },
                { day_of_week: 1, open_time: '06:00', close_time: '23:00', is_closed: false },
                { day_of_week: 2, open_time: '06:00', close_time: '23:00', is_closed: false },
                { day_of_week: 3, open_time: '06:00', close_time: '23:00', is_closed: false },
                { day_of_week: 4, open_time: '06:00', close_time: '23:00', is_closed: false },
                { day_of_week: 5, open_time: '06:00', close_time: '23:00', is_closed: false },
                { day_of_week: 6, open_time: '07:00', close_time: '22:00', is_closed: false }
              ]
            };
            
            setData(transformedData);
            setIsUsingFallback(false);
            console.log('🔄 Switched from fallback to real gym details');
          }
        }
      } catch (error) {
        console.log('⚠️ Real gym details fetch failed, keeping fallback data:', error);
        // Keep using fallback data, don't set error
      }
    };
    
    fetchData();
    
    return () => {
      isCancelled = true;
    };
  }, [gymId]);

  return {
    data,
    isLoading,
    error,
    isUsingFallback
  };
};
