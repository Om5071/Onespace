# OneSpace — Unified Personal Management System

> A comprehensive 3-tier Personal Operating System built with React, Node.js + Express, and MongoDB.

---

## Features & Modules

1. **Central Dashboard**: Daily agenda, tasks due today, habit quick-logger, upcoming reminders, goal progress, and productivity statistics.
2. **Tasks & Projects**: Dual-view interface with **List View** & **Kanban Board**, priority tags, subtask checklists, and due date filters.
3. **Notes & Knowledge Base**: Split-pane Markdown editor with auto-save, pinning, categorization, and `.txt` export.
4. **Calendar & Scheduler**: Full monthly grid and day agenda views for event planning and task deadlines overlay.
5. **Reminders & Alerts**: Automated background cron worker (`node-cron`) checking every minute, recurring schedules, and snooze controls.
6. **Notification Center**: Dropdown drawer and full notifications page with unread badge counters.
7. **Document Locker**: File management dropzone with tag metadata, local uploads, and in-browser previewer for PDFs & images.
8. **Daily Tracker**: Mood selector (1-5 emoji), sleep & water intake counters, customizable habit checklists, daily journal reflections, and an annual activity heatmap.
9. **Fitness Tracker**: Workout sessions logger, exercise set/rep/kg manager, body weight progression chart (Recharts).
10. **Goals & Milestones**: Goal cards with numerical metric tracking, deadline countdowns, progress logging, and confetti completion animations.
11. **Global Search**: Command palette (`Ctrl+K` / `Cmd+K`) and full search page querying across tasks, notes, events, documents, and goals.
12. **Analytics & Insights**: Time-range filters (7/30/90 days), composite Life Balance Score (0-100), task completion rates, and sleep/water trendlines.
13. **Settings & Data Export**: Dark/Light/System theme toggle, notification preferences, full JSON data export bundle, and account deletion.

---

## Architecture Overview

```
onespace/
├── onespace-backend/             # Express.js REST API Server
│   ├── src/
│   │   ├── config/               # DB & Env configurations (with In-Memory MongoDB fallback)
│   │   ├── controllers/          # 14 Module Controllers
│   │   ├── middlewares/          # JWT Protect, Error Handling, File Uploads, Rate Limiter
│   │   ├── models/               # 12 Mongoose Models
│   │   ├── routes/               # 14 Express Routers mounted under /api/*
│   │   ├── services/             # Background Cron Worker, Notifications, Analytics
│   │   ├── utils/                # Password hashing, JWT token generators, validators
│   │   ├── app.js
│   │   └── server.js
│   └── test/api.test.js          # Automated backend integration test suite
│
└── onespace-frontend/            # React SPA (Vite + Tailwind CSS)
    ├── src/
    │   ├── api/                  # Axios API clients for all modules with auth interceptors
    │   ├── components/           # UI components, modals, dropdowns, command palette
    │   ├── context/              # AuthContext, ThemeContext, NotificationContext
    │   ├── layouts/              # MainLayout (Sidebar + Topbar) & AuthLayout
    │   ├── pages/                # All 14 Module Page views
    │   └── routes/               # AppRouter & ProtectedRoute
    └── public/                   # PWA Manifest & Service Worker
```

---

## Quick Start Guide

From the extracted `onespace` directory, install dependencies once in each application:

```bash
cd onespace-backend
npm install
cd ../onespace-frontend
npm install
```

### 1. Start the Backend API Server
```bash
cd onespace-backend
npm start
```
The server will run at `http://localhost:5000` with automatic connection to your local MongoDB or fallback in-memory MongoDB. In development mode, the server automatically creates the single workspace profile below so a separate seed step is not required for login.

### 2. Start the React Frontend
Open a second terminal:

```bash
cd onespace-frontend
npm run dev
```
The frontend will start at `http://localhost:5173`.

### 3. Local Workspace Login

Use the single seeded workspace profile on the login screen:

| Email | Password | Role |
| --- | --- | --- |
| `om@gmail.com` | `654321` | User |

### 4. Run Backend Self-Test Suite
```bash
cd onespace-backend
npm test
```

---

## Environment Variables

### Backend (`onespace-backend/.env`)
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/onespace_db
JWT_SECRET=onespace_super_secure_jwt_secret_key_2026
JWT_EXPIRES_IN=7d
REFRESH_TOKEN_SECRET=onespace_super_secure_refresh_secret_key_2026
REFRESH_TOKEN_EXPIRES_IN=30d
FRONTEND_URL=http://localhost:5173
```
