import { MongoClient } from 'mongodb';

async function getDatabase() {
  if (!process.env.MONGODB_URI) {
    throw new Error('MongoDB connection string is missing');
  }
  const client = await MongoClient.connect(process.env.MONGODB_URI);
  return client.db();
}

export async function getMeals() {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    const db = await getDatabase();
    return db.collection('meals').find().toArray();
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/meals`);
    if (!response.ok) throw new Error('Failed to fetch meals');
    return response.json();
  } catch (error) {
    console.error('Error fetching meals:', error);
    return [];
  }
}

export async function getMeal(slug) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    const db = await getDatabase();
    return db.collection('meals').findOne({ slug });
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/meals`);
    if (!response.ok) throw new Error('Failed to fetch meal');
    const meals = await response.json();
    return meals.find(meal => meal.slug === slug) || null;
  } catch (error) {
    console.error('Error fetching meal:', error);
    return null;
  }
}