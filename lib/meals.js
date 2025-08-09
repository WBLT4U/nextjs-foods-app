import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;

async function getDatabase() {
  const client = await MongoClient.connect(uri);
  return client.db();
}

export async function getMeals() {
  // If running in build (static generation), fetch from MongoDB directly
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    const db = await getDatabase();
    const meals = await db.collection('meals').find().toArray();
    return meals;
  }

  // Otherwise (browser/client-side), use API route
  const response = await fetch('http://localhost:3000/api/meals');
  if (!response.ok) throw new Error('Failed to fetch meals');
  return response.json();
}

export async function getMeal(slug) {
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    const db = await getDatabase();
    return db.collection('meals').findOne({ slug });
  }

  const response = await fetch('http://localhost:3000/api/meals');
  if (!response.ok) throw new Error('Failed to fetch meal');
  const meals = await response.json();
  const meal = meals.find(meal => meal.slug === slug);
  
  if (!meal) {
    return null;
  }
  
  return meal;
}