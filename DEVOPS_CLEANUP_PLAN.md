# DevOps Cleanup & Hardening Plan
**Date**: 2025-12-16
**Status**: Planning
**Priority**: High

## Executive Summary
After successfully deploying Payload CMS, the project requires comprehensive cleanup of orphaned artifacts and DevOps hardening to ensure reproducibility and best practices across all environments.

## Issues Identified

### Git Repository
- **24 local branches** - many obsolete fix/* branches from Payload CMS troubleshooting
- **Uncommitted changes** - package.json, pnpm-lock.yaml
- **Untracked files** - 8 temporary scripts, 2 env files, 2 audit docs

### Vercel Projects
- **3 projects** instead of 1:
  1. project-chronos-web (✅ KEEP)
  2. project-chronos → DELETE
  3. web → DELETE

### Temporary Scripts (To Remove)
- scripts/check-all-tables.mjs
- scripts/check-db-state.mjs
- scripts/check-user-sessions.mjs
- scripts/create-admin-direct.mjs
- scripts/create-admin-sql.sh
- scripts/delete-malformed-user.mjs
- apps/web/scripts/create-user-properly.mjs

## Cleanup Phases
1. Git Cleanup
2. Vercel Consolidation
3. Script Cleanup
4. Documentation
5. Environment Harmonization
6. Final Verification
