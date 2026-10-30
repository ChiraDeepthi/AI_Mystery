# AI Mystery Room

An interactive mystery investigation app. Write a scenario, receive a generated case with suspects and evidence, investigate, and submit a verdict.

## Stack

- React, Vite, React Router
- Node.js, Express, Mongoose, MongoDB
- Google Gemini through the official `@google/genai` TypeScript SDK

## Requirements

- Node.js 20 or later and npm
- MongoDB running locally or a MongoDB connection string
- A Google API key and a model available to that key

## Run locally

1. Install dependencies from the project root:

   ```sh
   npm install
   ```

2. Configure the server:

   ```sh
   cp server/.env.example server/.env
   ```

   Set `MONGODB_URI`, `GEMINI_API_KEY`, and `GEMINI_MODEL` in `server/.env`. The Gemini key is server-only. The example uses `gemini-3.5-flash`; choose a model enabled for your Google account if needed.

3. Configure the client (the default works for local development):

   ```sh
   cp client/.env.example client/.env
   ```

4. Start MongoDB, then start both app services:

   ```sh
   npm run dev
   ```

   The client runs at <http://localhost:5173> and the API at <http://localhost:5000>.

5. For a production client bundle:

   ```sh
   npm run build
   ```

The server exits with a clear configuration error if required environment variables are missing, and it will not start if MongoDB cannot connect. Mystery creation requires a working Gemini API key. The app does not substitute a fixed demo mystery when the provider is unavailable.

## API

The versioned API is rooted at `/api/v1`. See [docs/API.md](docs/API.md). The health endpoint is `/api/v1/health`.

## Deployment

See [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) for a step-by-step Render and MongoDB Atlas deployment guide.

## Media

Image evidence uses an explicitly labeled visual brief when no image provider is configured. CCTV evidence is a clearly labeled simulated sequence. The product does not claim these to be generated photographs or video files.

## Data and security

Generated cases and anonymous investigation progress are stored in MongoDB. The canonical culprit and solution remain server-side until a session explicitly requests the reveal endpoint. Never commit `.env` files or place the Gemini key in the client environment.
