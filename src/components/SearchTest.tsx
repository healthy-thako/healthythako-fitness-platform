import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const SearchTest = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [minRating, setMinRating] = useState(0);

  const { data: searchResults, isLoading, error, refetch } = useQuery({
    queryKey: ['search-test', searchQuery, specialty, minRating],
    queryFn: async () => {
      console.log('Testing search with:', {
        search_query: searchQuery,
        specialty_filter: specialty,
        gym_id_filter: null,
        min_rating: minRating,
        limit_count: 10,
        offset_count: 0
      });

      const { data, error } = await supabase.rpc('search_trainers', {
        search_query: searchQuery,
        specialty_filter: specialty,
        gym_id_filter: null,
        min_rating: minRating,
        limit_count: 10,
        offset_count: 0
      });

      if (error) {
        console.error('Search error:', error);
        throw error;
      }

      console.log('Search results:', data);
      return data;
    },
    enabled: false // Only run when manually triggered
  });

  const handleSearch = () => {
    refetch();
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Trainer Search Function Test</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Search Query</label>
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter search term (leave empty for all)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Specialty</label>
              <Input
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                placeholder="Enter specialty (leave empty for all)"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Min Rating</label>
              <Input
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={minRating}
                onChange={(e) => setMinRating(parseFloat(e.target.value) || 0)}
                placeholder="Minimum rating"
              />
            </div>
          </div>
          
          <Button onClick={handleSearch} disabled={isLoading}>
            {isLoading ? 'Searching...' : 'Test Search'}
          </Button>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <h3 className="font-medium text-red-800">Error:</h3>
              <p className="text-red-600">{error.message}</p>
            </div>
          )}

          {searchResults && (
            <div className="space-y-4">
              <h3 className="font-medium">Results ({searchResults.length} found):</h3>
              {searchResults.length === 0 ? (
                <p className="text-gray-500">No trainers found with the current filters.</p>
              ) : (
                <div className="grid gap-4">
                  {searchResults.map((trainer: any) => (
                    <Card key={trainer.id} className="p-4">
                      <div className="flex items-start gap-4">
                        {trainer.image_url && (
                          <img
                            src={trainer.image_url}
                            alt={trainer.name}
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <h4 className="font-medium">{trainer.name}</h4>
                          <p className="text-sm text-gray-600">{trainer.specialty}</p>
                          <p className="text-sm text-gray-500">{trainer.experience} experience</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-sm font-medium">Rating: {trainer.rating}</span>
                            <span className="text-sm text-gray-500">({trainer.reviews} reviews)</span>
                          </div>
                          {trainer.pricing && (
                            <p className="text-sm text-green-600 mt-1">
                              ${trainer.pricing.hourly_rate}/hour
                            </p>
                          )}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SearchTest;
