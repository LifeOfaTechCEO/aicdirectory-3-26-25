import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { username, password } = req.body;

  if (
    username === process.env.NEXT_PUBLIC_ADMIN_USERNAME &&
    password === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
  ) {
    const { SignJWT } = await import('jose');
    const { serialize } = await import('cookie');
    
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const token = await new SignJWT({ username })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('24h')
      .sign(secret);

    const isProduction = process.env.NODE_ENV === 'production';
    const host = req.headers.host || '';
    const domain = host.includes('localhost') ? 'localhost' : host;

    res.setHeader(
      'Set-Cookie',
      serialize('token', token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? 'none' : 'lax',
        path: '/',
        domain: domain,
        maxAge: 86400 // 24 hours
      })
    );

    return res.status(200).json({ message: 'Login successful' });
  }

  return res.status(401).json({ message: 'Invalid credentials' });
} 