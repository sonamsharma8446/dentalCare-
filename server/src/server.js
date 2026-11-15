import app from './app.js';
import { env } from './config/env.js';
import { connectDB } from './config/db.js';

// Connect to the database first, then start accepting requests
await connectDB();

app.listen(env.port, () => {
  console.log(`Server running in ${env.nodeEnv} mode on http://localhost:${env.port}`);
});
