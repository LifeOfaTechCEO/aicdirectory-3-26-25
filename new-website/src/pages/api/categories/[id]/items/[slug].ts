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

  const { id, slug } = req.query;

  try {
    // Read current data
    if (!fs.existsSync(dataFilePath)) {
      return res.status(404).json({ error: 'Categories not found' });
    }
    const categories = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));

    // Find category
    const categoryIndex = categories.findIndex((c: any) => c.id === id);
    if (categoryIndex === -1) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const category = categories[categoryIndex];

    switch (req.method) {
      case 'GET':
        const item = category.items.find((i: any) => i.slug === slug);
        if (!item) {
          return res.status(404).json({ error: 'Item not found' });
        }
        return res.status(200).json(item);

      case 'PUT':
        const itemIndex = category.items.findIndex((i: any) => i.slug === slug);
        if (itemIndex === -1) {
          return res.status(404).json({ error: 'Item not found' });
        }
        category.items[itemIndex] = { ...category.items[itemIndex], ...req.body };
        fs.writeFileSync(dataFilePath, JSON.stringify(categories, null, 2));
        return res.status(200).json(category.items[itemIndex]);

      case 'DELETE':
        category.items = category.items.filter((i: any) => i.slug !== slug);
        fs.writeFileSync(dataFilePath, JSON.stringify(categories, null, 2));
        return res.status(200).json({ message: 'Item deleted successfully' });

      default:
        res.setHeader('Allow', ['GET', 'PUT', 'DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 