'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import PropertyCard from '@/components/property-card';
import { Property } from '@/lib/supabase';

export default function PropertyList() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProperties() {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching properties:', error);
        setLoading(false);
        return;
      }
      
      // Process properties to ensure image URLs are valid
      const processedProperties = (data || []).map(property => {
        // If there are no images, return the property as is
        if (!property.images || property.images.length === 0) {
          return property;
        }
        
        // Process each image to ensure it has a valid URL
        const processedImages = property.images.map((imagePath: string) => {
          // If it's already a valid URL, return it
          if (typeof imagePath === 'string' && imagePath.startsWith('http')) {
            return imagePath;
          }
          
          // Otherwise, generate a public URL
          const { data } = supabase.storage
            .from('property-images')
            .getPublicUrl(imagePath);
            
          return data?.publicUrl || '';
        });
        
        return {
          ...property,
          images: processedImages
        };
      });
      
      setProperties(processedProperties);
      setLoading(false);
    }

    fetchProperties();
  }, []);

  if (loading) {
    return <div className="flex justify-center p-12">Loading properties...</div>;
  }

  if (properties.length === 0) {
    return <div className="text-center p-12">No properties listed yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {properties.map((property) => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
}