import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

interface Item {
  name: string;
  description: string;
  logo?: string;
  slug?: string;
  longDescription?: string[];
  pros?: string[];
  cons?: string[];
}

interface Category {
  id: string;
  title: string;
  count: number;
  icon: string;
  items: Item[];
}

interface Section {
  id: string;
  title: string;
  categories: Category[];
}

interface Data {
  sections: Section[];
}

const dataFilePath = path.join(process.cwd(), 'data', 'categories.json');
const ADMIN_TOKEN = 'authenticated'; // In production, this should be an environment variable

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // Verify authentication
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== ADMIN_TOKEN) {
    console.log('Auth header:', authHeader); // Debug log
    return res.status(401).json({ error: 'Unauthorized' });
  }

  if (typeof id !== 'string') {
    return res.status(400).json({ error: 'Invalid section ID' });
  }

  try {
    switch (req.method) {
      case 'DELETE':
        // Read existing data
        if (!fs.existsSync(dataFilePath)) {
          return res.status(404).json({ error: 'No sections found' });
        }

        const fileContent = fs.readFileSync(dataFilePath, 'utf8');
        const data: Data = JSON.parse(fileContent);

        // Find and remove the section
        const sectionIndex = data.sections.findIndex(s => s.id === id);
        if (sectionIndex === -1) {
          return res.status(404).json({ error: 'Section not found' });
        }

        // Remove the section
        data.sections.splice(sectionIndex, 1);

        // Write updated data back to file
        fs.writeFileSync(dataFilePath, JSON.stringify(data, null, 2));
        return res.status(200).json({ message: 'Section deleted successfully' });

      default:
        res.setHeader('Allow', ['DELETE']);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error('API Error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
} 