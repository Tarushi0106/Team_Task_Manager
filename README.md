# TaskFlow — Team Task Manager

A full-stack web app for managing projects and tasks with your team. Built with Node.js, React, and PostgreSQL.

## Features

- **Authentication** — JWT-based signup/login, persistent sessions
- **Projects** — Create and manage projects, invite teammates
- **Tasks** — Kanban board with To Do / In Progress / Done columns, priorities, due dates, assignees
- **Role-Based Access** — Project owners, Admins, and Members with different permissions
- **Dashboard** — Personal overview of tasks, overdue items, and upcoming deadlines with charts

## Tech Stack

**Backend**
- Node.js + Express + TypeScript
- PostgreSQL + Prisma ORM
- JWT authentication, bcrypt password hashing
- express-validator for request validation

**Frontend**
- React 18 + TypeScript + Vite
- Tailwind CSS for styling
- TanStack Query for server state
- React Hook Form
- Recharts for the dashboard chart
- React Router v6

## Running locally

### Prerequisites
- Node.js 18+
- PostgreSQL database

### Setup

```bash
# 1. clone and install root deps
git clone <your-repo>
cd team-task-manager
npm install

# 2. set up the server
cd server
npm install
cp ../.env.example .env
# edit .env with your DATABASE_URL and JWT_SECRET

# 3. run migrations
npx prisma migrate deploy

# 4. install frontend deps
cd ../client
npm install

# 5. start everything from the root
cd ..
npm run dev
```

The app runs at `http://localhost:5173` (frontend) with the API at `http://localhost:5000`.

## Deployment (Railway)

1. Push this repo to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Add a PostgreSQL database service
4. Add a web service pointing to this repo
5. Set environment variables:
   - `DATABASE_URL` — copy from your Railway PostgreSQL service
   - `JWT_SECRET` — any long random string
   - `NODE_ENV=production`
6. Railway will auto-detect and run `npm run build` then `npm start`

## Project Structure

```
├── client/          React frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── context/
│       └── lib/
├── server/          Express API
│   ├── prisma/      Database schema + migrations
│   └── src/
│       ├── controllers/
│       ├── middleware/
│       └── routes/
└── railway.toml     Deployment config
```

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Sign in |
| GET | /api/auth/me | Current user |
| GET | /api/projects | List my projects |
| POST | /api/projects | Create project |
| GET | /api/projects/:id | Project detail with tasks |
| PUT | /api/projects/:id | Update project |
| DELETE | /api/projects/:id | Delete project (owner only) |
| POST | /api/projects/:id/members | Invite member |
| DELETE | /api/projects/:id/members/:userId | Remove member |
| POST | /api/projects/:id/tasks | Create task |
| PUT | /api/tasks/:id | Update task |
| DELETE | /api/tasks/:id | Delete task |
| GET | /api/dashboard | Dashboard stats |

## Role Permissions

| Action | Owner | Admin | Member |
|--------|-------|-------|--------|
| Create tasks | ✓ | ✓ | ✓ |
| Assign tasks to others | ✓ | ✓ | — |
| Edit/delete any task | ✓ | ✓ | own tasks only |
| Invite members | ✓ | ✓ | — |
| Remove members | ✓ | ✓ | — |
| Delete project | ✓ | — | — |
