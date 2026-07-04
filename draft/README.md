# MERN MVP - Auth + Authorization

This is a fresh MERN starter with:
- React (Vite) frontend
- Node.js + Express backend
- MongoDB (Mongoose)
- JWT authentication
- Role-based authorization (`user`, `admin`)

## 1) Setup

### Backend env
Copy `server/.env.example` to `server/.env` and update:
- `MONGO_URI`
- `JWT_SECRET`

### Frontend env
Copy `client/.env.example` to `client/.env` if needed.

## 2) Install

Already installed in this scaffold:
- root, `server`, and `client` dependencies

If you clone fresh:
```bash
npm install
npm install --prefix server
npm install --prefix client
```

## 3) Run

From root:
```bash
npm run dev
```

- API: `http://localhost:5000`
- UI: `http://localhost:5173`

## 4) API Endpoints

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me` (auth required)
- `GET /api/auth/admin` (auth + admin role required)
- `GET /api/health`

## 5) Make an Admin User

By default all new users are `user`.
To test `/admin`, update one user role directly in MongoDB to `admin`.
