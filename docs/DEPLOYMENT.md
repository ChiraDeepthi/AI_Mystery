# Deployment walkthrough (Render + MongoDB Atlas)

This repository is an npm-workspaces monorepo. Deploy the Express API as a Render Web Service and the Vite client as a Render Static Site. MongoDB Atlas stores cases; Gemini generation runs only in the API.

## 1. Prepare the repository

1. Push the latest code to a GitHub repository that Render can access.
2. Make sure `.env` files and API keys are not committed. Keep the Gemini key and MongoDB connection string out of the client.
3. Create a MongoDB Atlas database user with access only to the application database. Copy the cluster connection string and replace its username, password, and database name. URL-encode special characters in the password.

## 2. Create the API service

In Render, choose **New + → Web Service**, connect the repository, and use:

| Setting | Value |
| --- | --- |
| Root Directory | leave blank (repository root) |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` |
| Health Check Path | `/api/v1/health` |

Add these environment variables under the service's **Environment** tab:

| Key | Value |
| --- | --- |
| `NODE_ENV` | `production` |
| `MONGODB_URI` | Atlas connection string, including the app database name |
| `GEMINI_API_KEY` | Gemini API key from Google AI Studio |
| `GEMINI_MODEL` | `gemini-3.8-flash` (or another model enabled for your key) |
| `CLIENT_ORIGIN` | Set after creating the frontend, to its exact `https://...onrender.com` origin |

The server reads Render's `PORT` automatically and binds to `0.0.0.0`. Wait for the first deploy to finish; Render will show the API URL, for example `https://ai-mystery-room-api.onrender.com`.

## 3. Allow the API to reach Atlas

In Render, open the API service's **Connect** menu and copy its outbound IP ranges. In Atlas, add those ranges to the project's **Network Access** IP access list, then verify the database user can access the application database. Render uses shared outbound ranges by default; dedicated outbound IPs are also available on eligible paid plans. Avoid `0.0.0.0/0` when you can allowlist the service's ranges. Use a long unique database password and restrict the database user's privileges. Do not use your personal Atlas admin account for the app.

## 4. Create the client static site

In Render, choose **New + → Static Site**, connect the same repository, and set:

| Setting | Value |
| --- | --- |
| Root Directory | leave blank (repository root) |
| Build Command | `npm ci && npm run build --workspace client` |
| Publish Directory | `client/dist` |

Add this build environment variable, replacing the URL with the API URL from step 2:

| Key | Value |
| --- | --- |
| `VITE_API_BASE_URL` | `https://ai-mystery-room-api.onrender.com/api/v1` |

Create the site and note its URL, for example `https://ai-mystery-room.onrender.com`.

## 5. Connect the two services

1. Return to the API Web Service's environment settings.
2. Set `CLIENT_ORIGIN` to the frontend origin only (scheme and hostname, no path or trailing slash), for example `https://ai-mystery-room.onrender.com`.
3. Save and redeploy the API.
4. Open the frontend URL and create a case. Check `/api/v1/health` on the API URL; it should report both API and database as healthy.

If you add a custom frontend domain, update `CLIENT_ORIGIN` to that exact domain and redeploy the API. If you change the API URL, update `VITE_API_BASE_URL` and rebuild the static site.

## Common deployment problems

- **API exits at startup:** check Render logs and verify `MONGODB_URI`, `GEMINI_API_KEY`, and `GEMINI_MODEL` are set.
- **Health check returns 503:** the API is running but MongoDB is not connected. Check the Atlas IP access list, database username/password, database name, and encoded password characters.
- **Browser reports a CORS error:** `CLIENT_ORIGIN` must exactly match the deployed frontend origin, with no trailing slash. Save and redeploy the API after changing it.
- **Client calls localhost:** `VITE_API_BASE_URL` was missing or incorrect at build time. Set it on the Static Site and trigger a new deploy.
- **Refresh gives a 404 on a client route:** add a Render rewrite rule from `/*` to `/index.html` with action **Rewrite**.
- **Gemini generation fails while the API is healthy:** verify the Gemini key and model are valid for the Google account and check the API service logs.

The API key must only be set on the Web Service. `VITE_` variables are bundled into public browser code and must never contain secrets.
