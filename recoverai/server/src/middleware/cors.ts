import cors from 'cors';
import { config } from '../config/env';

export const corsMiddleware = cors({
  origin: [config.clientUrl, 'http://localhost:5173', 'http://localhost:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});
