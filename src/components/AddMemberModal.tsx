
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateGymMember } from '@/hooks/useGymMembers';
import { useGymMembershipPlans } from '@/hooks/useGymMembershipPlans';
import { toast } from 'sonner';

interface AddMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  gymId: string;
}

const AddMemberModal: React.FC<AddMemberModalProps> = ({ isOpen, onClose, gymId }) => {
  const createMember = useCreateGymMember();
  const { data: plans } = useGymMembershipPlans(gymId);
  
  const [formData, setFormData] = useState({
    user_email: '',
    user_name: '',
    user_phone: '',
    plan_id: '',
    start_date: new Date().toISOString().split('T')[0],
    amount_paid: 0,
    payment_method: 'cash',
    payment_status: 'completed' as const
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.plan_id) {
      toast.error('Please select a membership plan');
      return;
    }

    const selectedPlan = plans?.find(p => p.id === formData.plan_id);
    if (!selectedPlan) {
      toast.error('Invalid plan selected');
      return;
    }

    // Calculate end date based on plan duration
    const startDate = new Date(formData.start_date);
    const endDate = new Date(startDate);
    endDate.setMonth(endDate.getMonth() + selectedPlan.duration_months);

    try {
      // For demo purposes, we'll create a temporary user ID
      // In production, this would involve user registration
      const tempUserId = crypto.randomUUID();
      
      await createMember.mutateAsync({
        gym_id: gymId,
        user_id: tempUserId,
        plan_id: formData.plan_id,
        status: 'active',
        start_date: formData.start_date,
        end_date: endDate.toISOString().split('T')[0],
        amount_paid: formData.amount_paid || selectedPlan.price,
        payment_method: formData.payment_method,
        payment_status: formData.payment_status
      });

      toast.success('Member added successfully');
      onClose();
      setFormData({
        user_email: '',
        user_name: '',
        user_phone: '',
        plan_id: '',
        start_date: new Date().toISOString().split('T')[0],
        amount_paid: 0,
        payment_method: 'cash',
        payment_status: 'completed'
      });
    } catch (error: any) {
      toast.error('Failed to add member: ' + error.message);
    }
  };

  const selectedPlan = plans?.find(p => p.id === formData.plan_id);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Member</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="user_name">Member Name</Label>
            <Input
              id="user_name"
              value={formData.user_name}
              onChange={(e) => setFormData({ ...formData, user_name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="user_email">Email</Label>
            <Input
              id="user_email"
              type="email"
              value={formData.user_email}
              onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="user_phone">Phone</Label>
            <Input
              id="user_phone"
              value={formData.user_phone}
              onChange={(e) => setFormData({ ...formData, user_phone: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="plan_id">Membership Plan</Label>
            <Select value={formData.plan_id} onValueChange={(value) => setFormData({ ...formData, plan_id: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select a plan" />
              </SelectTrigger>
              <SelectContent>
                {plans?.map((plan) => (
                  <SelectItem key={plan.id} value={plan.id}>
                    {plan.name} - ৳{plan.price} ({plan.duration_months} months)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="start_date">Start Date</Label>
            <Input
              id="start_date"
              type="date"
              value={formData.start_date}
              onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="amount_paid">Amount Paid</Label>
            <Input
              id="amount_paid"
              type="number"
              value={formData.amount_paid || selectedPlan?.price || ''}
              onChange={(e) => setFormData({ ...formData, amount_paid: Number(e.target.value) })}
              placeholder={`Default: ৳${selectedPlan?.price || 0}`}
            />
          </div>

          <div>
            <Label htmlFor="payment_method">Payment Method</Label>
            <Select value={formData.payment_method} onValueChange={(value) => setFormData({ ...formData, payment_method: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="cash">Cash</SelectItem>
                <SelectItem value="card">Card</SelectItem>
                <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
                <SelectItem value="mobile_payment">Mobile Payment</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMember.isPending}>
              {createMember.isPending ? 'Adding...' : 'Add Member'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddMemberModal;
