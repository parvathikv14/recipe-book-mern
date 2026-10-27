# Recipe Book — MERN Stack

A small, practical recipe manager built with React + Vite, Express, Mongoose, and MongoDB Atlas. The interface is intentionally simple and editable, with Indian home-cooking examples and no external UI framework.

## Project structure
- `frontend/` — React app
- `backend/` — Express REST API and Mongoose model

## 1. Requirements
Install Node.js LTS. Create a free MongoDB Atlas cluster and database user, then allow your current IP in Atlas Network Access.

## 2. Run locally
Open two VS Code terminals.

### Backend terminal
```bash
cd backend
npm install
```
Open `backend/.env` and replace `YOUR_ATLAS_CONNECTION_STRING` with your MongoDB Atlas connection string. Keep the database name `recipe_book` in the URI if you want, for example:
`mongodb+srv://USERNAME:PASSWORD@cluster.example.mongodb.net/recipe_book?retryWrites=true&w=majority`

Then run:
```bash
npm run dev
```
API health check: http://localhost:5000/api/health

### Frontend terminal
```bash
cd frontend
npm install
npm run dev
```
Open the local URL Vite prints (usually http://localhost:5173).

## 3. API routes
- `GET /api/recipes` — list recipes
- `GET /api/recipes/:id` — recipe details
- `POST /api/recipes` — create
- `PUT /api/recipes/:id` — update
- `DELETE /api/recipes/:id` — delete
- `GET /api/health` — API/database status

## 4. Deploy
### Backend on Render
1. Push this project to GitHub.
2. Create a **Web Service** on Render and connect the repository.
3. Set **Root Directory** to `backend`.
4. Build command: `npm install`
5. Start command: `npm start`
6. Add environment variables in Render:
   - `MONGODB_URI` = your Atlas URI
   - `FRONTEND_ORIGIN` = your Vercel URL (after deploying frontend; temporarily you can use `*` only for a quick test, then replace it)
   - `NODE_ENV` = `production`
7. Deploy and open `https://YOUR-RENDER-SERVICE.onrender.com/api/health`.

### Frontend on Vercel
1. Import the same GitHub repository into Vercel.
2. Set **Root Directory** to `frontend`.
3. Framework preset: Vite.
4. Build command: `npm run build`
5. Output directory: `dist`
6. Add environment variable:
   - `VITE_API_BASE_URL` = `https://YOUR-RENDER-SERVICE.onrender.com/api`
7. Deploy. If you deploy frontend before backend, add the API variable and redeploy after the backend URL is ready.

After deploying, set Render's `FRONTEND_ORIGIN` to the exact Vercel URL, without a trailing slash, and redeploy the backend.

## Important credentials note
The included `.env` is a safe template, not a working database credential. Do not commit real database usernames/passwords. For the assessment, use a dedicated test Atlas user and only share a dummy/test database credential if your evaluator explicitly requires it. For public repositories, keep real `.env` files ignored and provide `.env.example`.
