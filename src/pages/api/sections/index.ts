import { NextApiRequest, NextApiResponse } from 'next';
import { connectDB } from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    console.log('Connecting to MongoDB...');
    const db = await connectDB();
    console.log('Connected to MongoDB successfully');

    const sections = await db
      .collection('sections')
      .find({})
      .sort({ order: 1 })
      .toArray();

    console.log(`Found ${sections.length} sections`);

    return res.status(200).json({ sections });
  } catch (error: any) {
    console.error('Error in sections API:', error);
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
} 