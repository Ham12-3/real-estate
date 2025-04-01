'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function NewProperty() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const price = Number(formData.get('price'));
    const location = formData.get('location') as string;
    const description = formData.get('description') as string;
    const bedrooms = Number(formData.get('bedrooms'));
    const bathrooms = Number(formData.get('bathrooms'));

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error('Authentication error:', userError);
      throw new Error('You must be logged in to create a property listing');
    }

    const landlord_id = user.id;
    console.log('Current user ID:', landlord_id);
    
    try {
      // First, test if Supabase is connected properly
      const { data: testConnection, error: connectionError } = await supabase.from('properties').select('count').limit(1);
      
      if (connectionError) {
        console.error('Supabase connection error:', connectionError);
        throw new Error(`Connection error: ${connectionError.message}`);
      }
      
      // Skip bucket checks - assume it exists since you created it manually
      console.log('Using existing property-images bucket...');
      
      // Upload images directly
      setUploading(true);
      const imageUrls = [];
      
      // Add this before your upload loop
      const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

      for (let i = 0; i < images.length; i++) {
        const file = images[i];
        
        if (file.size > MAX_FILE_SIZE) {
          throw new Error(`File '${file.name}' exceeds the 5MB size limit`);
        }
        
        const fileExt = file.name.split('.').pop();
        // Add validation for supported file types
        const supportedTypes = ['jpg', 'jpeg', 'png', 'webp'];
        
        if (!fileExt || !supportedTypes.includes(fileExt.toLowerCase())) {
          throw new Error(`Unsupported file type: ${fileExt}. Please use JPG, PNG or WEBP images.`);
        }
        
        // Generate a more unique filename
        const fileName = `${Date.now()}_${Math.random().toString().substring(2)}.${fileExt}`;
        
        console.log(`Uploading file ${i+1}/${images.length}: ${fileName}`);
        
        try {
          const { error: uploadError, data } = await supabase.storage
            .from('property-imaged')
            .upload(fileName, file);
            
          if (uploadError) {
            console.error('Upload error details:', uploadError);
            throw new Error(`Upload failed: ${uploadError.message}`);
          }
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('property-imaged')
            .getPublicUrl(fileName);
            
          imageUrls.push(publicUrl);
          setUploadProgress(Math.round(((i + 1) / images.length) * 100));
        } catch (uploadError: any) {
          console.error(`Error uploading image ${i+1}:`, uploadError);
          throw new Error(`Failed to upload image ${i+1}: ${uploadError.message}`);
        }
      }
      
      // Create property listing
      console.log('Attempting to insert property with data:', {
        title,
        price,
        location,
        description,
        bedrooms,
        bathrooms,
        images: imageUrls,
        landlord_id: landlord_id
      });
      
      const { error, data } = await supabase
        .from('properties')
        .insert([{
          title,
          price,
          location,
          description,
          bedrooms,
          bathrooms,
          images: imageUrls,
          landlord_id: landlord_id
        }])
        .select();
        
      if (error) {
        console.error('Supabase insert error details:', error);
        throw new Error(`Insert failed: ${error.message}`);
      }
      
      router.push(`/properties/${data[0].id}`);
      router.refresh();
      
    } catch (error) {
      console.error('Error creating property:', error);
      alert(`Error creating property: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
      setUploading(false);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    const selectedFiles = Array.from(e.target.files);
    setImages(selectedFiles);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card>
        <CardHeader>
          <CardTitle>List Your Property</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" required placeholder="Cozy Studio Apartment" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Price per month ($)</Label>
                <Input id="price" name="price" type="number" required placeholder="1200" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" name="location" required placeholder="New York, NY" />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="bedrooms">Bedrooms</Label>
                <Input id="bedrooms" name="bedrooms" type="number" required defaultValue="1" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bathrooms">Bathrooms</Label>
                <Input id="bathrooms" name="bathrooms" type="number" required defaultValue="1" step="0.5" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                required
                placeholder="Describe your property..."
                className="min-h-32"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="images">Upload Images</Label>
              <Input 
                id="images" 
                type="file" 
                multiple 
                accept="image/*" 
                onChange={handleImageChange}
                className="cursor-pointer"
              />
              <p className="text-sm text-gray-500">You can select multiple images</p>
              
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>{uploadProgress === 100 ? 'Upload complete!' : 'Uploading...'}</span>
                    <span>{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              )}
              
              {images.length > 0 && (
                <div className="text-sm">
                  {images.length} files selected
                </div>
              )}
            </div>
            
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || images.length === 0}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin">⏳</span> {uploading ? `Uploading (${uploadProgress}%)` : 'Creating Listing...'}
                </span>
              ) : 'Create Listing'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}