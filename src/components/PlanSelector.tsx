
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useWorkoutPlans, useNutritionPlans, useMealPlans } from '@/hooks/usePlans';
import { Dumbbell, Apple, UtensilsCrossed, Calendar, Users } from 'lucide-react';
import { format } from 'date-fns';

interface PlanSelectorProps {
  onSelectPlan: (planType: 'workout' | 'nutrition' | 'meal', planId: string) => void;
  trigger: React.ReactNode;
}

const PlanSelector: React.FC<PlanSelectorProps> = ({ onSelectPlan, trigger }) => {
  const [open, setOpen] = useState(false);
  const { data: workoutPlans, isLoading: loadingWorkout } = useWorkoutPlans();
  const { data: nutritionPlans, isLoading: loadingNutrition } = useNutritionPlans();
  const { data: mealPlans, isLoading: loadingMeal } = useMealPlans();

  const handleSelectPlan = (planType: 'workout' | 'nutrition' | 'meal', planId: string) => {
    onSelectPlan(planType, planId);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Select a Plan to Send</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="workout" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="workout" className="flex items-center space-x-2">
              <Dumbbell className="h-4 w-4" />
              <span>Workout Plans</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="flex items-center space-x-2">
              <Apple className="h-4 w-4" />
              <span>Nutrition Plans</span>
            </TabsTrigger>
            <TabsTrigger value="meal" className="flex items-center space-x-2">
              <UtensilsCrossed className="h-4 w-4" />
              <span>Meal Plans</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="workout">
            <ScrollArea className="h-[400px] w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {loadingWorkout ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : workoutPlans?.length ? (
                  workoutPlans.map((plan) => (
                    <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleSelectPlan('workout', plan.id)}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="truncate">{plan.title}</span>
                          <Badge variant="outline">{plan.difficulty_level}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {plan.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>{plan.duration_weeks} weeks</span>
                          </div>
                          <span>{format(new Date(plan.created_at), 'MMM dd')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No workout plans available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="nutrition">
            <ScrollArea className="h-[400px] w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {loadingNutrition ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : nutritionPlans?.length ? (
                  nutritionPlans.map((plan) => (
                    <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleSelectPlan('nutrition', plan.id)}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg truncate">{plan.title}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {plan.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {plan.daily_calories && (
                            <span>{plan.daily_calories} cal/day</span>
                          )}
                          <span>{format(new Date(plan.created_at), 'MMM dd')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <Apple className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No nutrition plans available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="meal">
            <ScrollArea className="h-[400px] w-full">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
                {loadingMeal ? (
                  <div className="col-span-full flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                  </div>
                ) : mealPlans?.length ? (
                  mealPlans.map((plan) => (
                    <Card key={plan.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => handleSelectPlan('meal', plan.id)}>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-lg flex items-center justify-between">
                          <span className="truncate">{plan.title}</span>
                          <Badge variant="outline">{plan.plan_type}</Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                          {plan.description || 'No description'}
                        </p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          {plan.total_calories && (
                            <span>{plan.total_calories} total cal</span>
                          )}
                          <span>{format(new Date(plan.created_at), 'MMM dd')}</span>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8">
                    <UtensilsCrossed className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No meal plans available</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default PlanSelector;
