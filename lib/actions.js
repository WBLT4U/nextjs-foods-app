'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function isInvalidText(text) {
  return !text || text.trim() === '';
}

export async function shareMeal(prevState, formData) {
  const meal = {
    title: formData.get('title'),
    summary: formData.get('summary'),
    instructions: formData.get('instructions'),
    creator: formData.get('name'),
    creator_email: formData.get('email'),
  };

  const image = formData.get('image');
  
  // Validation
  if (
    isInvalidText(meal.title) ||
    isInvalidText(meal.summary) ||
    isInvalidText(meal.instructions) ||
    isInvalidText(meal.creator) ||
    isInvalidText(meal.creator_email) ||
    !meal.creator_email.includes('@') ||
    !image ||
    image.size === 0
  ) {
    return { message: 'Invalid input.' };
  }

  try {
    // Upload image to Cloudinary
    const imageBuffer = await image.arrayBuffer();
    const imageArray = Array.from(new Uint8Array(imageBuffer));
    const imageData = Buffer.from(imageArray);
    
    const result = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: 'foodies' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(imageData);
    });

    // Add image URL and slug to meal data
    meal.image = result.secure_url;
    meal.slug = meal.title.toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '');

    
    // Use absolute URL for production
    const apiUrl = process.env.NODE_ENV === 'production' 
      ? `${process.env.NEXT_PUBLIC_SITE_URL}/api/meals`
      : 'http://localhost:3000/api/meals';

    const response = await fetch(apiUrl, {
      method: 'POST',
      body: JSON.stringify(meal),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || 'Failed to share meal.');
    }

    // Success - revalidate and redirect
    revalidatePath('/meals');
    redirect('/meals');
    
  } catch (error) {
    console.error('Submission Error:', error);
    return { 
      message: process.env.NODE_ENV === 'development' 
        ? error.message 
        : 'Failed to save meal. Please try again.' 
    };
  }
}