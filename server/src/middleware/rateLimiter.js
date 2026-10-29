import rateLimit from 'express-rate-limit';
import { env } from '../config/env.js';

export const generationLimiter = rateLimit({ windowMs: env.generationWindow, limit: env.generationLimit, standardHeaders: 'draft-7', legacyHeaders: false, message: { success: false, data: null, error: { code: 'RATE_LIMITED', message: 'You have reached the case creation limit. Please try again later.' } } });
