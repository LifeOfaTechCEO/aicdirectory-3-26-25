import { JwtPayload } from 'jsonwebtoken';

export interface AdminJwtPayload extends JwtPayload {
  username: string;
  role: string;
  timestamp: number;
} 