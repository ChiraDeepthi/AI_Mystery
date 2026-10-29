
import app from './app.js';
import { connectDatabase } from './config/database.js';
import { env } from './config/env.js';

try {
  await connectDatabase();

  console.log('MongoDB connected successfully!');

  app.listen(env.port, () => {
    console.log(
      `AI Mystery Room API listening on port ${env.port}`
    );
  });
} catch (error) {
  console.error('Startup failed:', error.message);
  process.exit(1);
}
