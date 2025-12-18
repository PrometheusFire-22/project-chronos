# Project Chronos - Overview

**High-Level Architecture and Technology Stack**

**Last Updated:** 2025-12-12  
**Status:** Active Development - Sprint 10 (Marketing Site)

---

## Quick Navigation

**New to the project?** Start here:
1. Read this overview
2. See [Documentation Index](../../10-DEVELOPMENT/03-CODEBASE/DOCUMENTATION_INDEX.md) for navigation
3. Follow [Developer Onboarding](../../30-OPERATIONS/03-PEOPLE/developer-onboarding.md)

**Looking for something specific?**
- **Frontend Development**: [Frontend Development Guide](../../10-DEVELOPMENT/03-CODEBASE/FRONTEND_DEVELOPMENT.md)
- **Secrets/Credentials**: [Secrets and Credentials](../../10-DEVELOPMENT/02-INFRASTRUCTURE/SECRETS_AND_CREDENTIALS.md)
- **Monorepo Setup**: [Monorepo Complete Guide](../../10-DEVELOPMENT/03-CODEBASE/monorepo-complete-guide.md)
- **Troubleshooting**: [Common Issues](reference/troubleshooting/COMMON_ISSUES.md)

---

## What is Project Chronos?

**Multi-modal relationship intelligence platform for private markets (PE/VC/IB)**

Project Chronos is a sophisticated database application that leverages PostgreSQL's advanced extensions to provide:
- **Graph Database** (Apache AGE) - Multi-hop relationship discovery
- **Vector Search** (pgvector) - Semantic similarity and embeddings
- **Geospatial Analysis** (PostGIS) - Location-based insights
- **Time-Series Tracking** (TimescaleDB) - Temporal pattern analysis

**Target Users**: Private Equity, Venture Capital, and Investment Banking professionals

---

## Current Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     PROJECT CHRONOS                          │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐  │
│  │   Frontend   │    │   Backend    │    │   Database   │  │
│  │              │    │              │    │              │  │
│  │  Next.js 16  │───▶│  FastAPI     │───▶│ PostgreSQL   │  │
│  │  React 19    │    │  Python 3.11 │    │  + Extensions│  │
│  │  Nx Monorepo │    │              │    │              │  │
│  └──────────────┘    └──────────────┘    └──────────────┘  │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Content Management (Sprint 11)          │   │
│  │                  Payload CMS                         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### Technology Stack (Definitive)

#### Frontend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 16.0.9 | React framework with App Router |
| **React** | 19.2.2 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **Nx** | 22.2.0 | Monorepo orchestration |
| **pnpm** | 8.15.0+ | Package manager |
| **Tailwind CSS** | 3.4.3 | Utility-first CSS |
| **shadcn/ui** | Latest | Component library |
| **Framer Motion** | 12.23.26 | Animation library |
| **next-themes** | 0.4.6 | Theme management (light/dark) |
| **Payload CMS** | TBD | Content management (Sprint 11) |

**Design System**: CSS Variables-first approach with Tailwind integration

#### Backend Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **Python** | 3.11 | Backend language |
| **FastAPI** | Latest | API framework |
| **PostgreSQL** | 16+ | Primary database |
| **Apache AGE** | Latest | Graph database extension |
| **pgvector** | Latest | Vector similarity search |
| **PostGIS** | Latest | Geospatial analysis |
| **TimescaleDB** | Latest | Time-series data |
| **pgBackRest** | Latest | Backup solution |

#### Infrastructure

| Service | Purpose |
|---------|---------|
| **AWS Lightsail** | Database hosting (16.52.210.100) |
| **AWS S3** | Backup storage (project-chronos-backups) |
| **Vercel** | Frontend hosting (planned) |
| **Google Workspace** | Email (automatonicai.com) |
| **BlueHost** | Domain registration |

#### Development Tools

| Tool | Purpose |
|------|---------|
| **Git/GitHub** | Version control |
| **Jira** | Project management |
| **Confluence** | Documentation sync |
| **KeePassXC** | Secrets management |
| **Docker** | Containerization |
| **Atlassian CLI** | Jira/Confluence automation |

---

## Monorepo Structure

```
project-chronos/
├── apps/
│   └── web/                    # Next.js marketing site
│       ├── app/                # Next.js App Router
│       ├── components/         # React components
│       ├── utils/              # Utilities
│       └── package.json        # App dependencies
│
├── packages/
│   ├── ui/                     # Shared UI components (@chronos/ui)
│   ├── config/                 # Shared configs (@chronos/config)
│   ├── types/                  # Shared TypeScript types
│   └── utils/                  # Shared utilities
│
├── docs/                       # Documentation (you are here)
├── marketing/                  # Marketing assets and scripts
├── .backups/                   # Local backups (gitignored)
│
├── nx.json                     # Nx configuration
├── pnpm-workspace.yaml         # pnpm workspace config
├── package.json                # Root package.json
└── tsconfig.json               # Root TypeScript config
```

**Key Conventions**:
- Apps in `apps/` are deployable applications
- Packages in `packages/` are shared libraries
- Use `@chronos/` scope for internal packages
- Use `workspace:*` for internal dependencies

---

## Current Development Phase

### Sprint 10: Marketing Site Development

**Epic**: CHRONOS-280  
**Status**: In Progress  
**Goal**: Launch marketing website (SSG) to collect leads

**Current Story**: CHRONOS-286 - Homepage Development

**Completed**:
- ✅ Nx monorepo setup
- ✅ Next.js 16 with App Router
- ✅ Design system (CSS variables + Tailwind)
- ✅ Theme system (light/dark mode)
- ✅ HeroSection component
- ✅ Build pipeline functional

**In Progress**:
- Navigation/Header component
- Footer component
- Layout components
- SEO infrastructure

**Deferred to Sprint 11**:
- Payload CMS integration
- Blog functionality
- Dynamic content (features, about pages)

### Why This Approach?

**Marketing content will be managed in Payload CMS** (Sprint 11), so we're building the technical foundation now without hardcoding content that will just be moved to CMS later.

**Sprint 10 Scope** (No duplication):
- Technical infrastructure (Next.js, React, Nx, Tailwind, Framer Motion)
- Reusable components (navigation, footer, layouts)
- Theme system
- Animation patterns
- SEO infrastructure
- Deployment to Vercel

**Sprint 11 Scope** (Payload CMS):
- CMS setup with PostgreSQL
- Content models (blog, features, about)
- Content migration
- Dynamic page generation

---

## Key Design Decisions

### ADRs (Architecture Decision Records)

All major decisions are documented in `docs/architecture/adrs/`:

**Active ADRs**:
- **ADR-002**: Project Management Stack (Jira, Confluence, Git)
- **ADR-003**: Pragmatic Agile/Jira Workflow
- **ADR-004**: Git Workflow and Branching Model (GitFlow)
- **ADR-007**: Jira-First Workflow
- **ADR-008**: Backup Architecture
- **ADR-009**: Backup Strategy
- **ADR-011**: Documentation SSOT
- **ADR-012**: Frontend Stack Architecture
- **ADR-013**: Geospatial Ingestion
- **ADR-015**: Frontend Supporting Tools (Framer Motion, Payload CMS, Resend)
- **ADR-016**: Frontend Design System Integration (CSS Variables + Tailwind)
- **ADR-016**: Marketing Site Strategy
- **ADR-017**: Nx Monorepo Tooling

**Archived ADRs** (see `docs/_archive/`):
- ADR-005: Focus Enforcer Protocol (not in use)
- ADR-006: CRM Selection (superseded)

### Design System Approach

**CSS Variables-First Design System**:
- CSS variables defined in `apps/web/app/globals.css`
- Tailwind configured to use CSS variables
- shadcn/ui components styled with CSS variables
- Theme switching via `next-themes` (class-based)

**Why?**:
- Smaller bundle size (no duplicate utility classes)
- Runtime theme switching without rebuilding
- Better shadcn/ui compatibility
- Easier maintenance

**Colors**:
- **Primary**: Purple (#8B5CF6) - Brand color
- **Secondary**: Teal (#06B6D4) - Accent
- **Accent**: Green (#10B981) - Highlights

---

## Development Workflow

### Git Workflow (GitFlow)

**Branches**:
- `main` - Production releases
- `develop` - Integration branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `chore/*` - Maintenance tasks

**Current Branch**: `chore/documentation-refactor`

**Commit Convention**:
```
type(scope): description

- Details
- More details

Related: CHRONOS-XXX
```

**Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`

### Nx Commands

```bash
# Run dev server for web app
pnpm nx run web:dev

# Build web app
pnpm nx run web:build

# Run any nx command
pnpm nx <command>

# Build all projects
pnpm build

# Dev all projects
pnpm dev
```

### Common Tasks

**Start development**:
```bash
cd /workspace
pnpm nx run web:dev
# Visit http://localhost:3000
```

**Create new component**:
See [Component Development Workflow](workflows/COMPONENT_DEVELOPMENT.md)

**Create new feature**:
See [Feature Development Workflow](workflows/FEATURE_DEVELOPMENT.md)

---

## Security \u0026 Secrets

**CRITICAL**: All secrets managed in KeePassXC

**Location**: `~/.secrets/project-chronos.kdbx`

**Documentation**: [Secrets and Credentials](guides/security/SECRETS_AND_CREDENTIALS.md)

**Never commit**:
- Passwords
- API tokens
- Private keys
- AWS credentials
- Database passwords

**Safe to commit**:
- `.env.example` templates
- Public configuration
- Documentation

---

## Deployment

### Current Status

**Frontend**: Not yet deployed (planned for Vercel)  
**Backend**: Running on AWS Lightsail (16.52.210.100)  
**Database**: PostgreSQL on Lightsail  
**Backups**: S3 (project-chronos-backups, ca-central-1)

### Planned Deployment (Sprint 10)

1. **Vercel Deployment**:
   - Connect GitHub repository
   - Configure custom domain (automatonicai.com)
   - Environment variables from KeePassXC
   - Automatic deployments from `main` branch

2. **DNS Configuration**:
   - Update BlueHost DNS to point to Vercel
   - Configure MX records for Google Workspace
   - SSL/TLS via Vercel (automatic)

---

## Getting Help

### Documentation

- **This file**: High-level overview
- **[Documentation Index](DOCUMENTATION_INDEX.md)**: Navigation guide
- **[Developer Onboarding](guides/onboarding/developer-onboarding.md)**: Getting started
- **[Common Issues](reference/troubleshooting/COMMON_ISSUES.md)**: Troubleshooting

### External Resources

- **Next.js**: https://nextjs.org/docs
- **Nx**: https://nx.dev/getting-started/intro
- **Tailwind CSS**: https://tailwindcss.com/docs
- **shadcn/ui**: https://ui.shadcn.com
- **Framer Motion**: https://www.framer.com/motion

### Support

- **Jira**: https://automatonicai.atlassian.net
- **Confluence**: https://automatonicai.atlassian.net/wiki
- **GitHub**: (Repository URL)

---

## Project Status

**Current Sprint**: Sprint 10 - Marketing Site Development  
**Current Story**: CHRONOS-286 - Homepage Development  
**Phase**: Building technical foundation (no hardcoded content)  
**Next Sprint**: Sprint 11 - Payload CMS Integration

**Recent Milestones**:
- ✅ Nx monorepo configured
- ✅ Design system implemented
- ✅ Build errors fixed
- ✅ Documentation refactored (in progress)

**Upcoming Milestones**:
- Complete marketing site infrastructure
- Deploy to Vercel
- Integrate Payload CMS
- Launch beta

---

## Contact

**Project Owner**: Geoff Bevans  
**Email**: geoff@automatonicai.com  
**Company**: AutomatonicAI

---

**Last Updated**: 2025-12-12  
**Part of**: Documentation refactor to create SSOT documentation  
**Related**: [Documentation Index](DOCUMENTATION_INDEX.md), [DOCUMENTATION_REFACTOR_DECISION.md](DOCUMENTATION_REFACTOR_DECISION.md)
