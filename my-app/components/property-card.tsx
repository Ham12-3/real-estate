import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Link from 'next/link';
import { Property } from '@/lib/supabase';
import { useState } from 'react';

export default function PropertyCard({ property }: { property: Property }) {
  const { id, title, price, location, images, bedrooms, bathrooms } = property;
  const [imageError, setImageError] = useState(false);
  
  return (
    <Link href={`/properties/${id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        <div className="aspect-video relative overflow-hidden">
          {images && images.length > 0 && !imageError ? (
            <img 
              src={images[0]} 
              alt={title} 
              className="absolute inset-0 w-full h-full object-cover"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full bg-gray-200 flex items-center justify-center">
              No Image Available
            </div>
          )}
        </div>
        <CardHeader>
          <h3 className="text-xl font-bold truncate">{title}</h3>
          <p className="text-gray-500">{location}</p>
        </CardHeader>
        <CardContent>
          <p className="text-2xl font-bold">${price}/month</p>
          <div className="flex gap-4 mt-2">
            <span>{bedrooms} {bedrooms === 1 ? 'bedroom' : 'bedrooms'}</span>
            <span>{bathrooms} {bathrooms === 1 ? 'bathroom' : 'bathrooms'}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}