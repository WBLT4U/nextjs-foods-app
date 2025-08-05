import { S3 } from '@aws-sdk/client-s3';
import slugify from 'slugify';
import xss from 'xss';
import clientPromise from './mongodb';

const s3 = new S3({ region: 'us-east-1' });

export async function getMeals() {
  const client = await clientPromise;
  const db = client.db(); // use default db from URI
  const meals = await db.collection('meals').find().toArray();
  return meals.map(meal => ({
    ...meal,
    id: meal._id.toString(), // Convert MongoDB ObjectId to string
  }));
}

export async function getMeal(slug) {
  const client = await clientPromise;
  const db = client.db();
  const meal = await db.collection('meals').findOne({ slug });
  if (!meal) return null;
  meal.id = meal._id.toString();
  return meal;
}

export async function saveMeal(meal) {
  const client = await clientPromise;
  const db = client.db();

  meal.slug = slugify(meal.title, { lower: true });
  meal.instructions = xss(meal.instructions);

  const extension = meal.image.name.split('.').pop();
  const fileName = `${meal.slug}.${extension}`;

  const bufferedImage = await meal.image.arrayBuffer();

  await s3.putObject({
    Bucket: 'maxschwarzmueller-nextjs-demo-users-image',
    Key: fileName,
    Body: Buffer.from(bufferedImage),
    ContentType: meal.image.type,
  });

  meal.image = fileName;

  const result = await db.collection('meals').insertOne(meal);
  return result.insertedId;
}
