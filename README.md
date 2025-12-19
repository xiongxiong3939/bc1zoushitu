# Tron Proxy + PostgreSQL (Render)

This folder contains a minimal Node/Express proxy to forward requests to TronScan `apilist.tronscanapi.com` with the API key stored in environment variables. It also includes a PostgreSQL migration SQL to create tables.

Deployment notes for Render:
- Create a new Web Service on Render from this repo's `server` folder.
- Set environment variables: `TRON_PRO_API_KEY`, `DATABASE_URL`.
- Render will run `npm install` and `npm start` by default.

Run locally:

1. Install dependencies

```bash
cd server
npm install
```

2. Create a Postgres DB and run migrations:

```bash
psql $DATABASE_URL -f migrations/init.sql
```

3. Start server

```bash
export TRON_PRO_API_KEY=your_key
export DATABASE_URL=postgres://...
npm start
```

Front-end changes

- Change `TRON_BLOCK_API_URL` in front-end to `/api/block` (already handled in this repo). The proxy will add the API key header.

Security

- Never commit `TRON_PRO_API_KEY` to source control. Use Render environment variables or secrets.
