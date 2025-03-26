import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const dataFilePath = path.join(process.cwd(), 'data', 'categories.json');

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Ensure user is authenticated
  const { adminToken } = req.cookies;
  if (!adminToken || adminToken !== 'authenticated') {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { id } = req.query;

  try {
    // Read current data
    if (!fs.existsSync(dataFilePath)) {
      return res.status(404).json({ error: 'Categories not found' });
    }
    const categories = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

    switch (req.method) {
      case 'GET':
        const category = categories.find((c: any) => c.id === id);
        if (!category) {
          return res.status(404).json({ error: 'Category not found' });
        }
        return res.status(200).json(category);

      case 'PUT':
        const categoryIndex = categories.findIndex((c: any) => c.id === id);
        if (categoryIndex === -1) {
          return res.status(404).json({ error: 'Category not found' });
        }
        categories[categoryIndex] = { ...categories[categoryIndex], ...req.body };
        fs.writeFileSync(dataFilePath, JSON.stringify(categories, null, 2));
        return res.status(200).json(categories[categoryIndex]);

      case 'DELETE':
        const newCategories = categories.filter((c: any) => c.id !== id);
        fs.writeFileSync(dataFilePath, JSON.stringify(newCategories, null, 2));
        return res.status(200).json({ message: 'Category deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 