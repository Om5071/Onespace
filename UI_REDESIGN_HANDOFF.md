# OneSpace Product Refresh

The app now ships as a single-user personal operating system workspace for Om. The development bootstrap no longer creates a demo account; it refreshes `om@gmail.com` with password `654321` and removes the retired `demo@onespace.app` user if it exists.

The seed data covers July and August 2026 history plus September 2026 plans across tasks, calendar events, notes, reminders, notifications, documents, daily habits, wellness logs, fitness records, expenses, goals, and goal progress. Finance examples use practical INR amounts and an employed, budget-conscious profile.

The visual refresh moves OneSpace from a generic navy template to a graphite-and-mint product UI: softer surfaces, restrained borders, clearer hierarchy, calmer accents, improved auth copy, responsive navigation, and reduced-motion support.

## Local verification

```bash
npm install
npm --prefix onespace-frontend install
npm run build:frontend
npm run test:backend
```

Login locally with `om@gmail.com` / `654321`. Run `npm run seed` when you want to reset the full history and planning dataset.
