'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { writeFile } from 'fs/promises';
import path from 'path';

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

  // Save image to public/images folder
  const fileName = `${Date.now()}-${image.name.replace(/\s+/g, '-')}`;
  const filePath = path.join(process.cwd(), 'public', 'images', fileName);
  
  try {
    const imageBuffer = await image.arrayBuffer();
    await writeFile(filePath, Buffer.from(imageBuffer));
    
    // Add image filename and slug to meal data
    meal.image = fileName;
    meal.slug = meal.title.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]+/g, '');

    // Send to API
    const response = await fetch('http://localhost:3000/api/meals', {
      method: 'POST',
      body: JSON.stringify(meal),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { message: errorData.message || 'Failed to share meal.' };
    }

    // Success - revalidate and redirect
    revalidatePath('/meals');
    redirect('/meals');
    
  } catch (error) {
    // Special handling for redirect errors
    if (error.message.includes('NEXT_REDIRECT')) {
      // This means the redirect actually worked, so we don't need to show an error
      return { message: '' };
    }
    
    console.error('Error saving meal:', error);
    return { message: error.message || 'Failed to save meal. Please try again.' };
  }
}