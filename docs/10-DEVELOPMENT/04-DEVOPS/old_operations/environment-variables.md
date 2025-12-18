# Environment Variables

This document lists all environment variables used in Project Chronos.

## Next.js (apps/web)

### Development
```bash
# .env.local (not committed to git)
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_NAME="Project Chronos"
NEXT_PUBLIC_APP_ENV=development
```

### Production
```bash
# .env.production (not committed to git)
NEXT_PUBLIC_API_URL=https://api.projectchronos.com
NEXT_PUBLIC_APP_NAME="Project Chronos"
NEXT_PUBLIC_APP_ENV=production
```

---

## Backend (FastAPI)

### Development
```bash
# .env (not committed to git)
DATABASE_URL=postgresql://chronos:chronos@localhost:5432/chronos
REDIS_URL=redis://localhost:6379
SECRET_KEY=your-secret-key-here
DEBUG=true
```

### Production
```bash
# .env.production (not committed to git)
DATABASE_URL=postgresql://user:pass@prod-host:5432/chronos
REDIS_URL=redis://prod-host:6379
SECRET_KEY=production-secret-key
DEBUG=false
```

---

## Docker Compose

### Development
```bash
# .env (not committed to git)
POSTGRES_USER=chronos
POSTGRES_PASSWORD=chronos
POSTGRES_DB=chronos
PGADMIN_EMAIL=admin@projectchronos.com
PGADMIN_PASSWORD=admin
```

---

## How to Set Up

### 1. Copy Example Files

```bash
# Next.js
cp apps/web/.env.example apps/web/.env.local

# Backend
cp .env.example .env
```

### 2. Update Values

Edit the files with your local values.

### 3. Never Commit

Environment files are in `.gitignore`. Never commit them!

---

## Vercel Deployment

Set these in Vercel dashboard:

- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_NAME`
- `NEXT_PUBLIC_APP_ENV`

---

## Security Notes

- ⚠️ Never commit `.env` files
- ⚠️ Use strong `SECRET_KEY` in production
- ⚠️ Rotate keys regularly
- ⚠️ Use environment-specific values
