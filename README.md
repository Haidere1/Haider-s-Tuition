# Star Tutors – Parent Portal

- `index.html` – the whole frontend (GitHub Pages)
- `server/` – Node + Express API that talks to MongoDB (deploy on Render / Railway)

GitHub Pages can only host static files, and a database string placed in `index.html`
would be readable by every visitor. So the browser talks to the API, and only the API knows the DB string.

## 1. MongoDB Atlas
1. Reset your database user's password (Database Access) and build a new connection string.
2. Network Access -> allow `0.0.0.0/0` (hosts like Render use changing IPs).

## 2. Deploy the API (Render, free tier)
1. Push this repo to GitHub.
2. Render -> New -> Web Service -> pick the repo.
3. Root Directory: `server` | Build: `npm install` | Start: `npm start`
4. Environment variables (see `server/.env.example`):
   `MONGODB_URI`, `JWT_SECRET`, `ADMIN_PASSWORD`, `CLIENT_ORIGIN=https://YOUR-USERNAME.github.io`
5. Copy the service URL, e.g. `https://star-tutors-api.onrender.com`.

## 3. Point the frontend at the API
In `index.html`, find the line starting `const API=` and replace
`http://localhost:3000` with your Render URL.

## 4. GitHub Pages
Repo -> Settings -> Pages -> Deploy from branch -> `main` / root.
Your site: `https://YOUR-USERNAME.github.io/REPO-NAME/`

## Local test
```
cd server && npm install && cp .env.example .env   # fill it in
npm run dev                                         # http://localhost:3000
```
Then open `index.html` in the browser.

## How access works
- Teacher: password checked on the server, 12h token, can add/edit/delete everything.
- Parent: enters their child's code; the server returns only that child, never the private notes.
- Free Render services sleep when idle; the first request after a pause can take ~30s.
