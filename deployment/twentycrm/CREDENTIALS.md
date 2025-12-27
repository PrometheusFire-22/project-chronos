# TwentyCRM Credentials Reference

**⚠️ This file documents credential locations - actual values are NOT committed to git**

## Database Credentials

**Location**: Lightsail VM `/home/ubuntu/chronos-db/.env` (existing file)

### PostgreSQL User for TwentyCRM
```
User: twenty_user
Password: TwentySecure2025!ChangeMe
Database: chronos
Schema: twenty
```

**Created by**: `setup-database.sql` script
**Used by**: docker-compose.yml

## Security Secrets

**Auto-generated during installation** by `install.sh`:

- `ACCESS_TOKEN_SECRET` - Generated via `openssl rand -base64 32`
- `REFRESH_TOKEN_SECRET` - Generated via `openssl rand -base64 32`
- `LOGIN_TOKEN_SECRET` - Generated via `openssl rand -base64 32`
- `FILE_TOKEN_SECRET` - Generated via `openssl rand -base64 32`

These are **NOT** stored anywhere except in the docker-compose.yml on the VM.

## Admin Account

**Created during first login** at https://crm.automatonicai.com:

- Email: `geoff@automatonicai.com`
- Password: Set by you during initial setup
- Workspace: Automatonic AI

## SSH Access

**Lightsail VM**:
```
Host: admin.automatonicai.com
User: ubuntu
Key: Your SSH key (not in repo)
```

## URLs

- **TwentyCRM**: https://crm.automatonicai.com
- **Directus**: https://admin.automatonicai.com
- **Website**: https://automatonicai.com

## Important Security Notes

1. ✅ **Database password** should be changed from default before deployment
2. ✅ **Security secrets** are auto-generated (never use hardcoded values)
3. ✅ **Admin password** is set by you during first login
4. ❌ **NEVER** commit actual credentials to git
5. ❌ **NEVER** share `.env` files publicly

## Changing Default Password

Before running `install.sh`, edit these files:

**1. Update setup-database.sql:**
```sql
-- Line 10: Change password
CREATE USER twenty_user WITH ENCRYPTED PASSWORD 'YOUR_STRONG_PASSWORD_HERE';
```

**2. Update docker-compose.yml:**
```yaml
# Line 12: Update password in connection string
PG_DATABASE_URL: postgresql://twenty_user:YOUR_STRONG_PASSWORD_HERE@host.docker.internal:5432/chronos?schema=twenty
```

## Backup Credentials

If you need to back up TwentyCRM:

```bash
# Backup database (includes credentials in schema)
sudo -u postgres pg_dump -d chronos -n twenty > twenty_backup.sql

# Backup docker-compose.yml (contains secrets)
sudo cp /opt/twenty/docker-compose.yml /backup/twenty_docker-compose_backup.yml
```

Store backups securely (encrypted, not in git).
