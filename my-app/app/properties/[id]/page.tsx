import { supabase } from '@/lib/supabase';
import { notFound } from 'next/navigation';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Make this an async function and properly handle the params
export default async function PropertyPage({ 
  params 
}: { 
  params: { id: string } 
}) {
  // Extract the ID first to avoid the awaiting params error
  const id = params.id;
  
  // Use async/await pattern for fetching data
  const { data: property, error } = await supabase
    .from('properties')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !property) {
    console.error('Error fetching property:', error);
    notFound();
  }

  // Add this debugging code to see the exact URLs
  console.log('Raw image data:', property.images);
  
  let imageUrls: string[] = [];

  if (property.images && property.images.length > 0) {
    // Try using the stored URLs directly first
    if (typeof property.images[0] === 'string' && property.images[0].startsWith('http')) {
      console.log('Using stored URLs directly');
      imageUrls = property.images as string[];
    } else {
      // If we have filenames, generate public URLs
      console.log('Generating fresh URLs from filenames');
      imageUrls = property.images.map((filename: string) => {
        const { data } = supabase.storage
          .from('property-images')
          .getPublicUrl(filename);
        return data?.publicUrl || '';
      });
    }
  }
  
  console.log('Final image URLs to use:', imageUrls);

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          &larr; Back to listings
        </Button>
      </Link>
      
      <h1 className="text-3xl font-bold mb-2">{property.title}</h1>
      <p className="text-xl text-gray-500 mb-6">{property.location}</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        {imageUrls && imageUrls.length > 0 ? (
          imageUrls.map((image: string, index: number) => (
            <div key={index} className="aspect-video relative rounded-lg overflow-hidden">
              <img
                src={image}
                alt={`Property image ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          ))
        ) : (
          <div className="aspect-video bg-gray-200 flex items-center justify-center rounded-lg">
            No images available
          </div>
        )}
      </div>
      
      {/* Rest of your component */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="text-2xl font-bold mb-4">About this property</h2>
          <p className="mb-6 whitespace-pre-wrap">{property.description}</p>
          
          <h3 className="text-xl font-bold mb-2">Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-gray-500">Bedrooms</p>
              <p className="font-medium">{property.bedrooms}</p>
            </div>
            <div>
              <p className="text-gray-500">Bathrooms</p>
              <p className="font-medium">{property.bathrooms}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-2xl font-bold mb-2">${property.price}</h2>
          <p className="text-gray-500 mb-6">per month</p>
          
          <Button className="w-full mb-4">Contact Landlord</Button>
          <Button variant="outline" className="w-full">
            Book a viewing
          </Button>
        </div>
      </div>
    </div>
  );
}