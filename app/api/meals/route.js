import { MongoClient } from 'mongodb';

export async function POST(request) {
  try {
    const data = await request.json();
    
    let client;
    try {
      client = await MongoClient.connect(process.env.MONGODB_URI);
      const db = client.db();
      const mealsCollection = db.collection('meals');

      const result = await mealsCollection.insertOne(data);
      return new Response(JSON.stringify({ 
        message: 'Meal inserted!', 
        id: result.insertedId,
        slug: data.slug
      }), {
        status: 201,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    } finally {
      if (client) await client.close();
    }
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
  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const mealsCollection = db.collection('meals');

    const meals = await mealsCollection.find().toArray();
    return new Response(JSON.stringify(meals), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to fetch meals!' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    if (client) await client.close();
  }
}