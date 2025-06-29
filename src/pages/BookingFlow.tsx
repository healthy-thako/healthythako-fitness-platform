import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { useTrainerDetails } from '@/hooks/useTrainerSearch';
import { useTrainerBookingPayment } from '@/hooks/useUddoktapayPayment';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { CalendarIcon, Clock, User, MapPin, Video, Home, CheckCircle, Star, Award } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { cn } from '@/lib/utils';

const BookingFlow = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const trainerId = searchParams.get('trainer');
  const trainerBookingPayment = useTrainerBookingPayment();

  const { data: trainer, isLoading, error } = useTrainerDetails(trainerId || '');
  const [isProcessing, setIsProcessing] = useState(false);

  // Booking form state
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedMode, setSelectedMode] = useState<'online' | 'in-person' | 'home'>('online');
  const [selectedPackage, setSelectedPackage] = useState<'basic' | 'standard' | 'premium'>('basic');
  const [description, setDescription] = useState('');
  const [sessionCount, setSessionCount] = useState(1);

  // Package definitions with dynamic pricing based on trainer rate (updated for new schema)
  const getPackages = () => {
    const baseRate = (trainer as any)?.pricing?.hourly_rate || 1200;
    return {
      basic: {
        name: 'Basic Session',
        duration: 60,
        price: baseRate,
        features: ['1-on-1 Training', 'Basic Workout Plan', 'WhatsApp Support']
      },
      standard: {
        name: 'Standard Package',
        duration: 75,
        price: Math.round(baseRate * 1.5),
        features: ['1-on-1 Training', 'Custom Workout Plan', 'Nutrition Guidance', 'Progress Tracking']
      },
      premium: {
        name: 'Premium Package',
        duration: 90,
        price: Math.round(baseRate * 2.5),
        features: ['1-on-1 Training', 'Complete Fitness Plan', 'Meal Planning', 'Weekly Check-ins', '24/7 Support']
      }
    };
  };

  // Time slots
  const timeSlots = [
    '06:00', '07:00', '08:00', '09:00', '10:00', '11:00',
    '12:00', '13:00', '14:00', '15:00', '16:00', '17:00',
    '18:00', '19:00', '20:00', '21:00'
  ];

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to book a session');
      navigate('/auth');
      return;
    }

    if (!trainerId) {
      toast.error('No trainer selected');
      navigate('/find-trainers');
      return;
    }

    if (error) {
      console.error('Error loading trainer:', error);
      toast.error('Failed to load trainer information');
      navigate('/find-trainers');
      return;
    }
    
    // Pre-fill form data from URL parameters if available
    const title = searchParams.get('title');
    const desc = searchParams.get('description');
    const date = searchParams.get('scheduled_date');
    const time = searchParams.get('scheduled_time');
    const mode = searchParams.get('mode');
    const sessionCount = searchParams.get('session_count');
    const packageType = searchParams.get('package_type');
    
    if (title) setDescription(title + (desc ? ': ' + desc : ''));
    if (date) setSelectedDate(new Date(date));
    if (time) setSelectedTime(time);
    if (mode && ['online', 'in-person', 'home'].includes(mode)) {
      setSelectedMode(mode as 'online' | 'in-person' | 'home');
    }
    if (sessionCount) setSessionCount(parseInt(sessionCount));
    if (packageType && ['basic', 'standard', 'premium'].includes(packageType)) {
      setSelectedPackage(packageType as 'basic' | 'standard' | 'premium');
    }
  }, [trainerId, user, navigate, searchParams, error]);

  const calculateTotalPrice = () => {
    const packages = getPackages();
    return packages[selectedPackage].price * sessionCount;
  };

  const handlePayment = async () => {
    if (!selectedDate || !selectedTime || !description.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!user || !trainer) {
      toast.error('Missing required information');
      return;
    }

    setIsProcessing(true);

    try {
      const bookingData = {
        trainer_id: trainer.id,
        trainer_name: trainer.name,
        title: `Personal Training Session with ${trainer.name}`,
        description: description.trim(),
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        scheduled_time: selectedTime,
        mode: selectedMode,
        session_count: sessionCount,
        package_type: selectedPackage,
        amount: calculateTotalPrice()
      };

      console.log('Creating payment with booking data:', bookingData);

      // Create payment using the new trainer booking payment hook
      await trainerBookingPayment.createPayment({
        trainerId: trainerId!,
        trainerName: (trainer as any)?.name || 'Trainer',
        amount: calculateTotalPrice(),
        packageType: selectedPackage,
        sessionCount: sessionCount,
        mode: selectedMode,
        scheduledDate: selectedDate?.toISOString().split('T')[0],
        scheduledTime: selectedTime,
        description: description,
        customerName: user.user_metadata?.name || user.email?.split('@')[0] || 'Customer',
        customerEmail: user.email || 'customer@example.com'
      });

      // Payment creation successful - user will be redirected to payment page
      // Booking will be created after successful payment via webhook
      
    } catch (error: any) {
      console.error('Error creating payment:', error);
      toast.error('Failed to create payment session: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!trainer) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Trainer Not Found</h1>
          <Button onClick={() => navigate('/find-trainers')}>
            Browse Trainers
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  // Trainer data is now directly in the trainer object (updated for new schema)
  const trainerProfile = trainer;
  const packages = getPackages();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Trainer Info */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  {trainerProfile?.profile_image ? (
                    <img
                      src={trainerProfile.profile_image}
                      alt={trainer.name}
                      className="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                      <User className="h-12 w-12 text-purple-600" />
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-gray-900">{trainer.name}</h3>
                  <p className="text-gray-600">{trainer.location}</p>
                  
                  {trainerProfile?.is_verified && (
                    <div className="flex items-center justify-center mt-2">
                      <Award className="h-4 w-4 text-blue-600 mr-1" />
                      <span className="text-sm text-blue-600 font-medium">Verified Trainer</span>
                    </div>
                  )}

                  {/* Rating and Reviews */}
                  <div className="flex items-center justify-center mt-2 text-sm">
                    <Star className="h-4 w-4 text-yellow-400 fill-current mr-1" />
                    <span className="font-medium">{(trainer as any).average_rating || 0}</span>
                    <span className="text-gray-600 ml-1">({(trainer as any).total_reviews || 0} reviews)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Experience</span>
                    <span className="font-semibold">{trainerProfile?.experience_years || 0} years</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Base Rate</span>
                    <span className="font-semibold">৳{trainerProfile?.rate_per_hour || 0}/hour</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Completed Sessions</span>
                    <span className="font-semibold">{(trainer as any).completed_bookings || 0}</span>
                  </div>

                  {trainerProfile?.specializations && (
                    <div>
                      <span className="text-gray-600 block mb-2">Specializations</span>
                      <div className="flex flex-wrap gap-1">
                        {trainerProfile.specializations.slice(0, 3).map((spec: string) => (
                          <span key={spec} className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Book Your Training Session</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Package Selection */}
                <div>
                  <Label className="text-base font-semibold mb-4 block">Choose Package</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {Object.entries(packages).map(([key, pkg]) => (
                      <div
                        key={key}
                        onClick={() => setSelectedPackage(key as any)}
                        className={`p-4 border rounded-lg cursor-pointer transition-all ${
                          selectedPackage === key
                            ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-center">
                          <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                          <p className="text-2xl font-bold text-purple-600 my-2">৳{pkg.price}</p>
                          <p className="text-sm text-gray-600 mb-3">{pkg.duration} minutes</p>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {pkg.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center">
                                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Session Count */}
                <div>
                  <Label htmlFor="sessionCount">Number of Sessions</Label>
                  <Select value={sessionCount.toString()} onValueChange={(value) => setSessionCount(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5].map(num => (
                        <SelectItem key={num} value={num.toString()}>{num} Session{num > 1 ? 's' : ''}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Training Mode */}
                <div>
                  <Label className="text-base font-semibold mb-3 block">Training Mode</Label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { key: 'online', label: 'Online', icon: Video, desc: 'Video call session' },
                      { key: 'in-person', label: 'In-Person', icon: MapPin, desc: 'At gym/studio' },
                      { key: 'home', label: 'Home Visit', icon: Home, desc: 'Trainer comes to you' }
                    ].map(({ key, label, icon: Icon, desc }) => (
                      <div
                        key={key}
                        onClick={() => setSelectedMode(key as any)}
                        className={`p-4 border rounded-lg cursor-pointer text-center transition-all ${
                          selectedMode === key
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <Icon className="h-6 w-6 mx-auto mb-2 text-purple-600" />
                        <div className="font-medium text-gray-900">{label}</div>
                        <div className="text-xs text-gray-600 mt-1">{desc}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Date Selection */}
                <div>
                  <Label>Select Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : <span>Pick a date</span>}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        disabled={(date) => date < new Date() || date < new Date("1900-01-01")}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Time Selection */}
                <div>
                  <Label htmlFor="time">Select Time</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map(time => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Session Goals & Requirements *</Label>
                  <Textarea
                    id="description"
                    placeholder="Tell the trainer about your fitness goals, any health conditions, or specific requirements..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="mt-1"
                    rows={4}
                  />
                </div>

                {/* Total Price */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-semibold">
                    <span>Total Amount:</span>
                    <span className="text-purple-600">৳{calculateTotalPrice().toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {sessionCount} × {packages[selectedPackage].name} (৳{packages[selectedPackage].price} each)
                  </p>
                </div>

                {/* Submit Button */}
                <Button
                  onClick={handlePayment}
                  disabled={!selectedDate || !selectedTime || !description.trim() || isProcessing}
                  className="w-full h-12 text-lg bg-purple-600 hover:bg-purple-700"
                >
                  {isProcessing ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    `Pay ৳${calculateTotalPrice().toLocaleString()} & Book Session`
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default BookingFlow;
