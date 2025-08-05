import { MongoClient } from 'mongodb';

export async function POST(request) {
  const data = await request.json();

  let client;
  try {
    client = await MongoClient.connect(process.env.MONGODB_URI);
    const db = client.db();
    const mealsCollection = db.collection('meals');

    const result = await mealsCollection.insertOne(data);
    return new Response(JSON.stringify({ message: 'Meal inserted!', id: result.insertedId }), {
      status: 201,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ message: 'Failed to insert meal!' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } finally {
    if (client) await client.close();
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