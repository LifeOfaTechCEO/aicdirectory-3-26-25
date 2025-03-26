import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type } = req.query;
  
  if (typeof type !== 'string') {
    return res.status(400).json({ error: 'Invalid type parameter' });
  }

  const dataFile = path.join(process.cwd(), 'data', `${type}.json`);

  try {
    if (!fs.existsSync(dataFile)) {
      return res.status(200).json([]);
    }

    const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    res.status(200).json(data);
  } catch (error) {
    console.error('Error reading data:', error);
    res.status(500).json({ error: 'Error reading data' });
  }
} 