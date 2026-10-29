import 'dotenv/config';

const required = ['MONGODB_URI', 'GEMINI_API_KEY', 'GEMINI_MODEL'];
for (const key of required) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}. Copy server/.env.example to server/.env and configure it.`);
}

export const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT || 5000),
  mongoUri: process.env.MONGODB_URI,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL,
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  minScenario: Number(process.env.MIN_SCENARIO_LENGTH || 30),
  maxScenario: Number(process.env.MAX_SCENARIO_LENGTH || 3000),
  generationLimit: Number(process.env.GENERATION_RATE_LIMIT || 5),
  generationWindow: Number(process.env.GENERATION_RATE_WINDOW_MS || 3600000),
};
