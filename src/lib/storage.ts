import fs from 'fs';
import path from 'path';
import { Section } from '../types';

const DATA_FILE = path.join(process.cwd(), 'data', 'sections.json');

// Ensure the data directory exists
const ensureDataDir = () => {
  const dir = path.join(process.cwd(), 'data');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

export const loadSections = async (): Promise<Section[]> => {
  try {
    ensureDataDir();
    if (!fs.existsSync(DATA_FILE)) {
      return [];
    }
    const data = await fs.promises.readFile(DATA_FILE, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading sections:', error);
    return [];
  }
};

export const saveSections = async (sections: Section[]): Promise<void> => {
  try {
    ensureDataDir();
    await fs.promises.writeFile(DATA_FILE, JSON.stringify(sections, null, 2));
  } catch (error) {
    console.error('Error saving sections:', error);
    throw new Error('Failed to save sections');
  }
}; 