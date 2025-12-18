# Git Workflow & Branch Strategy

## Current Branch Structure (As of Dec 14, 2025)

### Production Branch
- **`production/deploy-2025-12-14`** - PRODUCTION (deployed to automatonicai.com)
  - This is the current production branch
  - All production deployments come from here
  - Protected: No direct commits

### Integration Branch
- **`develop`** - DEVELOPMENT INTEGRATION
  - All feature branches merge here first
  - Tested and validated before promoting to production
  - Synced with production/deploy-2025-12-14 as of Dec 14, 2025

### Feature Branches
- **`feature/CHRONOS-XXX-description`** - Individual features
  - Branch from: `develop`
  - Merge to: `develop` via Pull Request
  - Delete after merge

## Workflow

```
1. Create feature branch from develop:
   git checkout develop
   git pull
   git checkout -b feature/CHRONOS-XXX-my-feature

2. Do your work, commit regularly:
   git add .
   git commit -m "feat: description"

3. Push and create PR to develop:
   git push -u origin feature/CHRONOS-XXX-my-feature
   gh pr create --base develop --fill

4. After PR approved and merged:
   git checkout develop
   git pull
   git branch -d feature/CHRONOS-XXX-my-feature

5. Promote to production (when ready):
   - Create PR from develop → production/deploy-2025-12-14
   - After merge, Vercel auto-deploys to automatonicai.com
```

## Future: Migrate to Standard Git Flow

**Goal:** Use `main` as production branch (industry standard)

**Current blocker:** Branch protection and divergent history on `main`

**Future sprint:**
1. Resolve main branch history
2. Rename production/deploy-2025-12-14 → main
3. Update Vercel deployment branch
4. Standard workflow: feature → develop → main

## Branch Naming Conventions

- `feature/CHRONOS-XXX-short-description` - New features
- `bugfix/CHRONOS-XXX-short-description` - Bug fixes
- `chore/CHRONOS-XXX-short-description` - Maintenance tasks
- `hotfix/CHRONOS-XXX-short-description` - Urgent production fixes (branch from production)

## Commit Message Format

Follow Conventional Commits:
```
feat: add user authentication
fix: resolve database connection timeout
chore: update dependencies
docs: add API documentation
test: add unit tests for UserService
```

## Protected Branches

- `production/deploy-2025-12-14` - Requires PR, no force push
- `develop` - Requires PR (recommended)
- `main` - Protected (currently stale, will fix in future sprint)
