# School Backend (Express + SQLite)

This is a minimal backend for the School Management System demo. It provides:

- SQLite database `school.db` with `users` and `activities` tables
- Auth endpoint (`/api/auth/login`) returning JWT
- Admin endpoints (`/api/admin/users`) protected by JWT requiring `role: admin`
- Email sending endpoint (`/api/email/send`) using SMTP via `nodemailer`

Quick start

1. Install dependencies

```bash
cd server
npm install
```

2. Copy `.env.example` to `.env` and set SMTP credentials and `JWT_SECRET`.

3. Start server

```bash
npm start
```

4. The server runs on `http://localhost:4000` (or the port in `.env`).

Notes

- To create admin users you can insert directly into the `users` table or call `/api/admin/users` after creating a JWT for an existing admin.
- This is a demo scaffold — adapt authentication, role checks, and email templates as needed for production.
