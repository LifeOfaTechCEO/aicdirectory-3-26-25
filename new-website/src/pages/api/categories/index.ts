import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'categories.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    switch (req.method) {
      case 'GET':
        // Read categories from file
        if (!fs.existsSync(dataFilePath)) {
          return res.status(200).json([]);
        }
        const data = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
        return res.status(200).json(data.categories || []);

      case 'PUT':
        // Update categories
        const categories = req.body;
        if (!Array.isArray(categories)) {
          return res.status(400).json({ error: 'Invalid data format' });
        }

        // Ensure data directory exists
        const dataDir = path.join(process.cwd(), 'data');
        if (!fs.existsSync(dataDir)) {
          fs.mkdirSync(dataDir, { recursive: true });
        }

        // Write updated categories to file
        fs.writeFileSync(dataFilePath, JSON.stringify({ categories }, null, 2));
        return res.status(200).json({ message: 'Categories updated successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 