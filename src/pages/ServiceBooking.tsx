import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useGigById } from '@/hooks/useGigsCRUD';
import { useServiceOrderPayment } from '@/hooks/useUddoktapayPayment';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Clock, DollarSign, User, MessageSquare, CheckCircle, Star } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Breadcrumb from '@/components/Breadcrumb';
import LoadingSpinner from '@/components/LoadingSpinner';

const ServiceBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const gigId = searchParams.get('gig');
  const packageType = searchParams.get('package') || 'basic';
  const price = searchParams.get('price') || '0';
  const deliveryDays = searchParams.get('delivery_days') || '7';
  
  const { data: gig, isLoading, error } = useGigById(gigId || '');
  const serviceOrderPayment = useServiceOrderPayment();
  const [isProcessing, setIsProcessing] = useState(false);

  // Order form state
  const [requirements, setRequirements] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [urgentDelivery, setUrgentDelivery] = useState(false);
  const [additionalNotes, setAdditionalNotes] = useState('');

  useEffect(() => {
    if (!user) {
      toast.error('Please sign in to place an order');
      navigate('/auth');
      return;
    }

    if (!gigId) {
      toast.error('No service selected');
      navigate('/browse-services');
      return;
    }

    if (error) {
      console.error('Error loading service:', error);
      toast.error('Failed to load service information');
      navigate('/browse-services');
      return;
    }
  }, [gigId, user, navigate, error]);

  const calculateTotalPrice = () => {
    let basePrice = parseFloat(price) * quantity;
    if (urgentDelivery) {
      basePrice += basePrice * 0.5; // 50% extra for urgent delivery
    }
    return basePrice;
  };

  const getDeliveryTime = () => {
    const baseDays = parseInt(deliveryDays);
    return urgentDelivery ? Math.ceil(baseDays / 2) : baseDays;
  };

  const handlePlaceOrder = async () => {
    if (!requirements.trim()) {
      toast.error('Please describe your requirements');
      return;
    }

    if (!user || !gig) {
      toast.error('Missing required information');
      return;
    }

    setIsProcessing(true);

    try {
      const orderData = {
        gig_id: gig.id,
        trainer_id: gig.trainer_id,
        service_title: gig.title,
        package_type: packageType,
        quantity: quantity,
        requirements: requirements.trim(),
        additional_notes: additionalNotes.trim(),
        urgent_delivery: urgentDelivery,
        delivery_days: getDeliveryTime(),
        amount: calculateTotalPrice()
      };

      console.log('Creating payment with service order data:', orderData);

      // Create payment using the new service order payment hook
      await serviceOrderPayment.createPayment({
        trainerId: (gig as any)?.trainer_id || 'unknown',
        serviceTitle: (gig as any)?.title || 'Service Order',
        amount: calculateTotalPrice(),
        packageType: selectedPackage,
        quantity: quantity,
        deliveryDays: getDeliveryTime(),
        requirements: requirements,
        additionalNotes: additionalNotes,
        urgentDelivery: urgentDelivery,
        customerName: user.user_metadata?.name || user.email?.split('@')[0] || 'Customer',
        customerEmail: user.email || 'customer@example.com'
      });

      // Payment creation successful - user will be redirected to payment page
      // Service order will be created after successful payment via webhook
      
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
          <LoadingSpinner size="lg" />
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !gig) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-4xl mx-auto px-4 py-20">
          <Card className="text-center py-16">
            <CardContent>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Service not found</h3>
              <p className="text-gray-600 mb-8">The service you're looking for doesn't exist.</p>
              <Button onClick={() => navigate('/browse-services')}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Browse Services
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </div>
    );
  }

  const trainerProfile = gig.trainer_profiles;
  const profile = gig.profiles;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Breadcrumb */}
        <Breadcrumb 
          items={[
            { label: 'Services', href: '/browse-services' },
            { label: gig.title, href: `/gig/${gig.id}` },
            { label: 'Order', current: true }
          ]}
        />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  <span>Order Requirements</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Describe your requirements *
                  </label>
                  <Textarea
                    value={requirements}
                    onChange={(e) => setRequirements(e.target.value)}
                    placeholder="Please provide detailed information about what you need..."
                    rows={4}
                    className="w-full"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Quantity
                    </label>
                    <Select value={quantity.toString()} onValueChange={(value) => setQuantity(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5].map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Speed
                    </label>
                    <Select value={urgentDelivery ? 'urgent' : 'normal'} onValueChange={(value) => setUrgentDelivery(value === 'urgent')}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="normal">Standard ({deliveryDays} days)</SelectItem>
                        <SelectItem value="urgent">Urgent ({Math.ceil(parseInt(deliveryDays) / 2)} days) +50%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <Textarea
                    value={additionalNotes}
                    onChange={(e) => setAdditionalNotes(e.target.value)}
                    placeholder="Any additional information or special requests..."
                    rows={2}
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Service Info */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg">{gig.title}</CardTitle>
                <Badge variant="secondary" className="w-fit">
                  {packageType.charAt(0).toUpperCase() + packageType.slice(1)} Package
                </Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Trainer Info */}
                <div className="flex items-center space-x-3 pb-3 border-b">
                  {trainerProfile?.profile_image ? (
                    <img
                      src={trainerProfile.profile_image}
                      alt={profile?.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">{profile?.name}</p>
                    <div className="flex items-center text-sm text-gray-600">
                      {trainerProfile?.is_verified && (
                        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
                      )}
                      <span>{trainerProfile?.experience_years || 0}+ years experience</span>
                    </div>
                  </div>
                </div>

                {/* Order Summary */}
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span>Package Price</span>
                    <span>৳{price}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Quantity</span>
                    <span>×{quantity}</span>
                  </div>
                  {urgentDelivery && (
                    <div className="flex justify-between text-sm">
                      <span>Urgent Delivery (+50%)</span>
                      <span>৳{(parseFloat(price) * quantity * 0.5).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex items-center text-sm text-gray-600 pt-2 border-t">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{getDeliveryTime()} days delivery</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold pt-2 border-t">
                    <span>Total</span>
                    <span>৳{calculateTotalPrice().toFixed(2)}</span>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handlePlaceOrder}
                  disabled={isProcessing || !requirements.trim()}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-3"
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin h-4 w-4 mr-2 border-2 border-white border-t-transparent rounded-full" />
                      Processing...
                    </>
                  ) : (
                    <>Continue to Payment (৳{calculateTotalPrice().toFixed(2)})</>
                  )}
                </Button>

                {/* Trust Elements */}
                <div className="pt-4 border-t text-center">
                  <div className="grid grid-cols-3 gap-2 text-xs text-gray-600">
                    <div>
                      <CheckCircle className="h-4 w-4 mx-auto mb-1 text-green-500" />
                      Money back guarantee
                    </div>
                    <div>
                      <Star className="h-4 w-4 mx-auto mb-1 text-yellow-500" />
                      Quality assured
                    </div>
                    <div>
                      <User className="h-4 w-4 mx-auto mb-1 text-blue-500" />
                      Verified trainer
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ServiceBooking; 