# DevOps Cleanup & Git Flow Fix Plan

## Current State (Problems)

1. ❌ `main` branch has divergent history (240 commits ahead, 1 behind)
2. ❌ Production deploys from `production/deploy-2025-12-14` (non-standard naming)
3. ❌ Branch protection on `main` prevents force push
4. ❌ Git repository has 1000+ unreachable loose objects
5. ❌ Work from Dec 13-14 not documented in Jira

## Target State (Textbook Git Flow)

```
main         ← Production (deployed to automatonicai.com)
  ↑ PR merge
develop      ← Integration branch
  ↑ PR merge
feature/*    ← Feature branches (from Jira tickets)
```

## Step-by-Step Fix

### Step 1: Disable Branch Protection on Main (GitHub Web UI)

1. Go to: https://github.com/PrometheusFire-22/project-chronos/settings/branches
2. Click "Edit" on `main` branch protection
3. **Uncheck:** "Do not allow bypassing the above settings"
4. **Uncheck:** "Require status checks to pass"
5. **Save changes**

### Step 2: Force Push Production to Main (CLI)

```bash
# Backup current main (just in case)
git checkout main
git branch main-backup-20251214

# Reset main to production branch
git reset --hard production/deploy-2025-12-14

# Force push to GitHub
git push origin main --force

# Verify it worked
git log --oneline -5
```

### Step 3: Re-enable Branch Protection

1. Go back to: https://github.com/PrometheusFire-22/project-chronos/settings/branches
2. Click "Edit" on `main` branch protection
3. **Re-check:**
   - "Require a pull request before merging"
   - "Require approvals" (1)
   - "Dismiss stale pull request approvals when new commits are pushed"
   - "Require status checks to pass before merging"
   - "Do not allow bypassing the above settings"
4. **Save changes**

### Step 4: Set Main as Default Branch

```bash
# Via CLI
gh repo edit PrometheusFire-22/project-chronos --default-branch main

# Verify
gh repo view PrometheusFire-22/project-chronos --json defaultBranchRef --jq '.defaultBranchRef.name'
```

### Step 5: Update Vercel Production Branch

1. Go to: https://vercel.com/prometheusfire-22s-projects/project-chronos-web/settings/git
2. Under "Production Branch", change from `production/deploy-2025-12-14` to `main`
3. Save

### Step 6: Update Develop Branch

```bash
# Reset develop to match main
git checkout develop
git reset --hard main
git push origin develop --force
```

### Step 7: Delete Temporary Production Branch

```bash
# Close PR #52
gh pr close 52 --comment "Closing - work has been integrated into main via direct push"

# Delete local branch
git branch -D production/deploy-2025-12-14

# Delete remote branch
git push origin --delete production/deploy-2025-12-14
```

### Step 8: Clean Up Git Repository

```bash
# Remove git gc log blocking cleanup
rm .git/gc.log

# Prune unreachable objects
git prune

# Aggressive garbage collection
git gc --aggressive

# Verify clean state
git status
git fsck
```

### Step 9: Tag the Production Release

```bash
git checkout main
git tag -a v1.0.0 -m "Initial production release with Payload CMS

- Next.js 16 with Turbopack
- Payload CMS 3.0 with PostgreSQL and S3
- Deployed to automatonicai.com
- Google Workspace favicons
- Vercel production deployment"

git push origin v1.0.0
```

### Step 10: Delete Stale Feature Branches

```bash
# Delete branches with no unique commits
gh api -X DELETE repos/PrometheusFire-22/project-chronos/git/refs/heads/feature/CHRONOS-300-shared-packages-setup
gh api -X DELETE repos/PrometheusFire-22/project-chronos/git/refs/heads/feature/CHRONOS-303-monorepo-refactoring-phase-1
gh api -X DELETE repos/PrometheusFire-22/project-chronos/git/refs/heads/feature/CHRONOS-304-asset-integration
gh api -X DELETE repos/PrometheusFire-22/project-chronos/git/refs/heads/feature/CHRONOS-305-comprehensive-documentation
gh api -X DELETE repos/PrometheusFire-22/project-chronos/git/refs/heads/feature/CHRONOS-306-design-system-implementation
gh api -X DELETE repos/PrometheusFire-22/project-chronos/git/refs/heads/feature/CHRONOS-307-homepage-hero-section
gh api -X DELETE repos/PrometheusFire-22/project-chronos/git/refs/heads/feature/add-google-favicons
```

## Phase 2: Jira Documentation

Create Epic and tickets for all December 13-14 work:

1. **CHRONOS-400:** Epic: Production Deployment & Infrastructure Setup
2. **CHRONOS-401:** Integrate Payload CMS 3.0 with PostgreSQL and S3
3. **CHRONOS-402:** Migrate build system to Turbopack (Next.js 16)
4. **CHRONOS-403:** Configure Vercel monorepo deployment
5. **CHRONOS-404:** Set up AWS S3 media bucket with CORS
6. **CHRONOS-405:** Deploy to production at automatonicai.com
7. **CHRONOS-406:** Create deployment and Git workflow documentation
8. **CHRONOS-407:** Establish proper Git Flow with branch protection

## Phase 3: Jira-GitHub Integration

1. Install Jira GitHub integration
2. Link repository: PrometheusFire-22/project-chronos
3. Configure smart commits (e.g., `git commit -m "CHRONOS-401: Add Payload CMS"`)
4. Set up auto-transition rules

## Phase 4: Next Sprint Planning

After DevOps is clean, plan sprints in order:

1. **Sprint 1:** Content creation via Payload CMS (Marketing pages)
2. **Sprint 2:** Backend hardening (Security, monitoring, backups)
3. **Sprint 3:** FastAPI integration (API layer)
4. **Sprint 4:** Dynamic frontend features
5. **Sprint 5:** Full SaaS integration

## Verification Checklist

After completing all steps:

- [ ] `git status` shows clean working tree
- [ ] `main` is default branch on GitHub
- [ ] `main` is production branch in Vercel
- [ ] `develop` exists and matches `main`
- [ ] All stale branches deleted
- [ ] `v1.0.0` tag exists
- [ ] Jira tickets created for Dec 13-14 work
- [ ] Jira-GitHub integration active
- [ ] Documentation committed and pushed

## Timeline

- Phase 1 (Git Flow Fix): 10 minutes
- Phase 2 (Jira Documentation): 15 minutes
- Phase 3 (Jira-GitHub Integration): 5 minutes
- Phase 4 (Sprint Planning): 10 minutes

**Total: 40 minutes to perfect DevOps**
