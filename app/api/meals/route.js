import { MongoClient } from 'mongodb';

export async function POST(request) {
  try {
    const data = await request.json();
    
    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB connection string is missing');
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const mealsCollection = db.collection('meals');

    // Ensure required fields exist
    if (!data.title || !data.image || !data.creator || !data.creator_email) {
      throw new Error('Missing required meal data');
    }

    const result = await mealsCollection.insertOne(data);
    await client.close();

    return new Response(JSON.stringify({ 
      message: 'Meal inserted!', 
      id: result.insertedId,
      slug: data.slug
    }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      message: error.message || 'Failed to insert meal!',
      success: false
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MongoDB connection string is missing');
    }

    const client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const mealsCollection = db.collection('meals');

    const meals = await mealsCollection.find().toArray();
    await client.close();

    return new Response(JSON.stringify(meals), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ 
      message: error.message || 'Failed to fetch meals!',
      success: false
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}