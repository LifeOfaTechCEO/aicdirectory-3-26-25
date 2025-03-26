import { NextApiRequest, NextApiResponse } from 'next';
import formidable, { Fields, Files } from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Ensure uploads directory exists
    const uploadDir = path.join(process.cwd(), 'public/uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 5 * 1024 * 1024, // 5MB
      filter: function ({ mimetype }) {
        // Only accept images
        return mimetype && mimetype.includes("image");
      },
    });

    const [fields, files] = await new Promise<[Fields, Files]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) reject(err);
        resolve([fields, files]);
      });
    });

    const file = files.file?.[0];
    if (!file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Generate a safe filename
    const fileName = file.originalFilename || 'uploaded-file';
    const safeFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const newFileName = `${Date.now()}-${safeFileName}`;
    const newPath = path.join(uploadDir, newFileName);

    try {
      // Rename the file to include timestamp
      await fs.promises.rename(file.filepath, newPath);

      const relativePath = `/uploads/${newFileName}`;
      return res.status(200).json({
        url: relativePath,
        message: 'File uploaded successfully',
      });
    } catch (error) {
      // If rename fails, try to clean up
      try {
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
      } catch (cleanupError) {
        console.error('Cleanup error:', cleanupError);
      }
      
      console.error('File processing error:', error);
      return res.status(500).json({ message: 'Error processing file' });
    }
  } catch (error) {
    console.error('Upload error:', error);
    return res.status(500).json({ 
      message: error instanceof Error ? error.message : 'Error uploading file'
    });
  }
} 