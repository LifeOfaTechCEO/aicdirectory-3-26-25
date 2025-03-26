import { NextApiRequest, NextApiResponse } from 'next';
import { sign } from 'jsonwebtoken';
import { env } from '@/lib/env';
import { connectDB } from '@/lib/mongodb';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { username, password } = req.body;

    // Connect to database
    const db = await connectDB();
    const adminCollection = db.collection('admins');

    // Find admin by username
    const admin = await adminCollection.findOne({ username });

    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Create token
    const token = sign(
      { 
        username: admin.username,
        role: admin.role,
        id: admin._id
      },
      env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Set cookie with token
    res.setHeader(
      'Set-Cookie',
      `adminToken=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400`
    );

    return res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 