import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { type, name } = req.query;
  
  if (typeof type !== 'string' || typeof name !== 'string') {
    return res.status(400).json({ error: 'Invalid parameters' });
  }

  const dataFile = path.join(process.cwd(), 'data', `${type}.json`);

  try {
    let data = [];
    if (fs.existsSync(dataFile)) {
      data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    }

    switch (req.method) {
      case 'GET':
        const item = data.find((item: any) => item.name === name);
        if (!item) {
          return res.status(404).json({ error: 'Item not found' });
        }
        return res.status(200).json(item);

      case 'POST':
        if (data.some((item: any) => item.name === name)) {
          return res.status(400).json({ error: 'Item already exists' });
        }
        data.push(req.body);
        break;

      case 'PUT':
        const index = data.findIndex((item: any) => item.name === name);
        if (index === -1) {
          return res.status(404).json({ error: 'Item not found' });
        }
        data[index] = req.body;
        break;

      case 'DELETE':
        const newData = data.filter((item: any) => item.name !== name);
        if (newData.length === data.length) {
          return res.status(404).json({ error: 'Item not found' });
        }
        data = newData;
        break;

      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }

    // Ensure the data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // Write the updated data
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error managing data:', error);
    res.status(500).json({ error: 'Error managing data' });
  }
} 