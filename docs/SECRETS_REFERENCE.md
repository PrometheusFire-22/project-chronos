# Secrets Reference

**⚠️ IMPORTANT:** This file contains references to secrets, not the actual values.
Store actual values in KeepassXC under "Project Chronos / Production".

## Environment Variables (Production)

### Database (AWS Lightsail PostgreSQL)

```bash
POSTGRES_URL=postgresql://chronos:DZ4eNOynmfYVOtG8c8TBlXIGVGlqkvWKQR5ixYYjAMs=@16.52.210.100:5432/chronos
```

**KeepassXC Entry:** "Project Chronos / AWS Lightsail Database"
- Host: 16.52.210.100
- Port: 5432
- Database: chronos
- Username: chronos
- Password: DZ4eNOynmfYVOtG8c8TBlXIGVGlqkvWKQR5ixYYjAMs=

### Payload CMS

```bash
PAYLOAD_SECRET=<32-character random string>
NEXT_PUBLIC_SERVER_URL=https://automatonicai.com
```

**KeepassXC Entry:** "Project Chronos / Payload CMS"
- Secret: (your generated secret from initial setup)
- Public URL: https://automatonicai.com

### AWS S3 Storage

```bash
S3_ACCESS_KEY_ID=<AWS_ACCESS_KEY_ID_FROM_KEEPASSXC>
S3_SECRET_ACCESS_KEY=<AWS_SECRET_ACCESS_KEY_FROM_KEEPASSXC>
S3_BUCKET=project-chronos-media
S3_REGION=ca-central-1
```

**KeepassXC Entry:** "Project Chronos / AWS S3 Media Bucket"
- Access Key ID: (stored in KeepassXC)
- Secret Access Key: (stored in KeepassXC)
- Bucket: project-chronos-media
- Region: ca-central-1

### AWS Lightsail SSH Access

```bash
SSH_USER=ubuntu
SSH_HOST=16.52.210.100
SSH_KEY=~/.ssh/aws-lightsail/chronos-prod-db
```

**KeepassXC Entry:** "Project Chronos / AWS Lightsail SSH"
- Username: ubuntu
- Host: 16.52.210.100
- SSH Key Path: ~/.ssh/aws-lightsail/chronos-prod-db
- SSH Key: (store private key content in KeepassXC attachment)

### GitHub Access

```bash
GITHUB_TOKEN=<your GitHub Personal Access Token>
GITHUB_REPO=PrometheusFire-22/project-chronos
```

**KeepassXC Entry:** "Project Chronos / GitHub"
- Token: (your PAT with repo access)
- Repository: PrometheusFire-22/project-chronos
- Default Branch: production/deploy-2025-12-14

### Vercel Access

```bash
VERCEL_TOKEN=<your Vercel auth token>
VERCEL_ORG=prometheusfire-22s-projects
VERCEL_PROJECT=project-chronos-web
```

**KeepassXC Entry:** "Project Chronos / Vercel"
- Auth Token: (from ~/.vercel/auth.json or Vercel dashboard)
- Organization: prometheusfire-22s-projects
- Project: project-chronos-web
- Project URL: https://vercel.com/prometheusfire-22s-projects/project-chronos-web

### AWS CLI Credentials

```bash
AWS_REGION=ca-central-1
AWS_PROFILE=default
```

**KeepassXC Entry:** "Project Chronos / AWS CLI"
- Access Key ID: (stored in KeepassXC)
- Secret Access Key: (stored in KeepassXC)
- Region: ca-central-1
- SSO Login: aws sso login

## Local Development (.env.local)

```bash
# Database (local)
POSTGRES_URL=postgresql://postgres:postgres@localhost:5432/project_chronos

# Payload CMS
PAYLOAD_SECRET=your-secret-key-here
NEXT_PUBLIC_SERVER_URL=http://localhost:3000

# AWS S3 (same credentials as production - stored in KeepassXC)
S3_ACCESS_KEY_ID=<FROM_KEEPASSXC>
S3_SECRET_ACCESS_KEY=<FROM_KEEPASSXC>
S3_BUCKET=project-chronos-media
S3_REGION=ca-central-1
```

## KeepassXC Organization

```
Project Chronos/
├── Production/
│   ├── AWS Lightsail Database
│   ├── AWS S3 Media Bucket
│   ├── AWS Lightsail SSH
│   ├── Payload CMS
│   ├── GitHub
│   ├── Vercel
│   └── AWS CLI
├── Development/
│   ├── Local Database
│   └── Local Payload Secret
└── Documentation/
    └── Links to docs/DEPLOYMENT.md, docs/GIT_WORKFLOW.md
```

## Security Best Practices

1. ✅ Never commit secrets to Git
2. ✅ Store all secrets in KeepassXC with strong master password
3. ✅ Use different secrets for development and production
4. ✅ Rotate secrets every 90 days
5. ✅ Use AWS IAM roles with minimum permissions
6. ⚠️ TODO: Set up secret rotation automation
7. ⚠️ TODO: Use AWS Secrets Manager for production secrets

## Emergency Access

If you lose access to KeepassXC:

1. **AWS:** Use account root email to reset IAM user
2. **Vercel:** Email support with account verification
3. **GitHub:** Use recovery codes (stored separately)
4. **Database:** SSH to Lightsail instance and retrieve from `~/chronos-db/.env`

## Credential Rotation Schedule

- **AWS S3 Keys:** Every 90 days (Next: March 14, 2026)
- **Payload Secret:** Annually (Next: Dec 14, 2026)
- **Database Password:** Every 180 days (Next: June 14, 2026)
- **SSH Keys:** Every 365 days (Next: Dec 14, 2026)
