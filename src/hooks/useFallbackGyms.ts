import { useState, useEffect } from 'react';

// Fallback gym data
const getFallbackGymData = () => {
  console.log('🔄 Returning fallback gym data...');
  return [
    {
      id: 'fallback-gym-1',
      name: 'Elite Fitness Center',
      description: 'Premium fitness center with state-of-the-art equipment and professional trainers.',
      address: 'Gulshan 1, Dhaka',
      area: 'Gulshan',
      city: 'Dhaka',
      phone: '+880 1712-345678',
      email: 'info@elitefitness.com',
      website: '',
      logo_url: '',
      image_url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800',
      gym_owner_id: '',
      rating: 4.5,
      review_count: 25,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      monthly_rate: 3500,
      daily_rate: 200,
      operating_hours: '6:00 AM - 11:00 PM',
      status: 'active',
      amenities: ['Modern Equipment', 'Air Conditioning', 'Parking', 'Locker Rooms', 'Shower Facilities'],
      gym_owner: { name: 'Gym Owner', email: 'owner@elitefitness.com' },
      is_gym_pass_enabled: true,
      ht_verified: true,
      location_lat: 23.7808875,
      location_lng: 90.4142273,
      membership_plans: [
        {
          id: 'plan-1',
          name: 'Monthly',
          price: 3500,
          duration_days: 30,
          features: ['Full gym access', 'Group classes', 'Locker facility']
        },
        {
          id: 'plan-2',
          name: 'Quarterly',
          price: 9000,
          duration_days: 90,
          features: ['Full gym access', 'Group classes', 'Locker facility', 'Personal trainer session']
        }
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800', is_primary: true }
      ]
    },
    {
      id: 'fallback-gym-2',
      name: 'PowerHouse Gym',
      description: 'Strength training focused gym with heavy-duty equipment and experienced trainers.',
      address: 'Dhanmondi 27, Dhaka',
      area: 'Dhanmondi',
      city: 'Dhaka',
      phone: '+880 1556-789012',
      email: 'contact@powerhousegym.com',
      website: '',
      logo_url: '',
      image_url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800',
      gym_owner_id: '',
      rating: 4.3,
      review_count: 18,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      monthly_rate: 4000,
      daily_rate: 250,
      operating_hours: '5:00 AM - 12:00 AM',
      status: 'active',
      amenities: ['Heavy Equipment', 'Powerlifting Area', 'Cardio Zone', 'Supplements Store'],
      gym_owner: { name: 'Gym Owner', email: 'owner@powerhousegym.com' },
      is_gym_pass_enabled: true,
      ht_verified: true,
      location_lat: 23.7461,
      location_lng: 90.3742,
      membership_plans: [
        {
          id: 'plan-3',
          name: 'Monthly',
          price: 4000,
          duration_days: 30,
          features: ['Full gym access', 'Powerlifting area', 'Cardio zone']
        }
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800', is_primary: true }
      ]
    },
    {
      id: 'fallback-gym-3',
      name: 'Wellness Studio',
      description: 'Holistic wellness center offering yoga, pilates, and mindfulness classes.',
      address: 'Banani 11, Dhaka',
      area: 'Banani',
      city: 'Dhaka',
      phone: '+880 1634-567890',
      email: 'hello@wellnessstudio.com',
      website: '',
      logo_url: '',
      image_url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800',
      gym_owner_id: '',
      rating: 4.8,
      review_count: 32,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      monthly_rate: 2500,
      daily_rate: 150,
      operating_hours: '7:00 AM - 10:00 PM',
      status: 'active',
      amenities: ['Yoga Studio', 'Pilates Equipment', 'Meditation Room', 'Healthy Cafe'],
      gym_owner: { name: 'Gym Owner', email: 'owner@wellnessstudio.com' },
      is_gym_pass_enabled: false,
      ht_verified: true,
      location_lat: 23.7936,
      location_lng: 90.4066,
      membership_plans: [
        {
          id: 'plan-4',
          name: 'Monthly',
          price: 2500,
          duration_days: 30,
          features: ['Yoga classes', 'Pilates sessions', 'Meditation room']
        },
        {
          id: 'plan-5',
          name: 'Annual',
          price: 25000,
          duration_days: 365,
          features: ['Unlimited classes', 'Personal sessions', 'Nutrition consultation']
        }
      ],
      images: [
        { url: 'https://images.unsplash.com/photo-1545205597-3d9d02c29597?w=800', is_primary: true }
      ]
    }
  ];
};

export const useFallbackGyms = () => {
  const [data, setData] = useState(getFallbackGymData());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  useEffect(() => {
    let isCancelled = false;
    
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      
      // Start with fallback data immediately
      const fallbackData = getFallbackGymData();
      
      if (!isCancelled) {
        setData(fallbackData);
        setIsUsingFallback(true);
        setIsLoading(false);
      }
      
      // Try to fetch real data in background with short timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const url = 'https://lhncpcsniuxnrmabbkmr.supabase.co/rest/v1/gyms?select=id,name,description,address,rating,ht_verified,phone,email,website,location_lat,location_lng,is_gym_pass_enabled,created_at,updated_at,owner_id,gym_amenities(name),membership_plans(id,name,price,duration_days),gym_images(image_url,is_primary)&limit=20&order=created_at.desc';
        
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
          console.log('✅ Successfully fetched real gym data:', realData.length);
          
          // Transform real data to match expected format
          const transformedData = realData.map((gym: any) => {
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
            
            return {
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
              monthly_rate: monthlyRate,
              daily_rate: dailyRate,
              operating_hours: '6:00 AM - 11:00 PM',
              status: 'active',
              amenities: amenities,
              gym_owner: { name: 'Gym Owner', email: gym.email || 'owner@gym.com' },
              is_gym_pass_enabled: gym.is_gym_pass_enabled || false,
              ht_verified: gym.ht_verified || false,
              location_lat: gym.location_lat,
              location_lng: gym.location_lng,
              membership_plans: membershipPlans,
              images: gymImages.map((img: any) => ({
                url: img.image_url,
                is_primary: img.is_primary
              }))
            };
          });
          
          setData(transformedData);
          setIsUsingFallback(false);
          console.log('🔄 Switched from fallback to real gym data');
        }
      } catch (error) {
        console.log('⚠️ Real gym data fetch failed, keeping fallback data:', error);
        // Keep using fallback data, don't set error
      }
    };
    
    fetchData();
    
    return () => {
      isCancelled = true;
    };
  }, []);

  return {
    data,
    isLoading,
    error,
    isUsingFallback
  };
};
