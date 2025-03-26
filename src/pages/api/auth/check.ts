import type { NextApiRequest, NextApiResponse } from 'next';
import { verify } from 'jsonwebtoken';
import { env } from '../../lib/env';
import type { AdminJwtPayload } from '../../../types/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const token = req.cookies.admin_token;

  if (!token) {
    return res.status(401).json({ authenticated: false });
  }

  try {
    const decoded = verify(token, env.JWT_SECRET) as AdminJwtPayload;
    
    // Check if token is expired
    if (decoded.exp && decoded.exp < Date.now() / 1000) {
      return res.status(401).json({ authenticated: false });
    }

    return res.status(200).json({ 
      authenticated: true,
      user: {
        username: decoded.username,
        role: decoded.role
      }
    });
  } catch (error) {
    return res.status(401).json({ authenticated: false });
  }
} 