# Project Chronos - LLM Onboarding Guide

**Last Updated**: November 23, 2025
**Purpose**: Comprehensive context transfer for AI assistants working on this project

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Technology Stack](#technology-stack)
3. [Project Structure](#project-structure)
4. [Key Workflows](#key-workflows)
5. [Development Environment](#development-environment)
6. [Important Files](#important-files)
7. [Common Commands](#common-commands)
8. [Code Quality Standards](#code-quality-standards)
9. [Testing Strategy](#testing-strategy)
10. [Documentation Links](#documentation-links)

---

## Project Overview

**Project Chronos** is a universal economic data ingestion and analysis platform designed to collect, store, and analyze time-series economic data from multiple central banks and financial institutions.

### Mission
Enable data-driven financial analysis through automated collection and harmonization of global economic indicators.

### Core Capabilities
- 🌐 **Multi-source ingestion**: FRED (US), Valet (Canada), BOE (UK), ECB, BOJ
- 📊 **Time-series storage**: PostgreSQL with TimescaleDB
- 🔍 **Semantic search**: Vector embeddings for series discovery
- 📈 **Analytics**: Pre-built views and calculations
- 🤖 **AI integration**: LLM-assisted data exploration

### Current Status
- **Sprint**: 4 (completed)
- **Branch**: `develop`
- **Python**: 3.11/3.12
- **Database**: PostgreSQL 16 with TimescaleDB
- **Deployment**: Docker Compose

---

## Technology Stack

### Backend
- **Language**: Python 3.11+
- **Framework**: Click (CLI), SQLAlchemy (ORM)
- **Database**: PostgreSQL 16 + TimescaleDB + PostGIS
- **API Clients**: requests, atlassian-python-api
- **Testing**: pytest, pytest-cov, pytest-mock

### Data Sources
- **FRED API**: Federal Reserve Economic Data (US)
- **Valet API**: Bank of Canada
- **BOE API**: Bank of England (prototype)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Version Control**: Git + GitHub
- **Project Management**: Jira (CHRONOS project)
- **Documentation**: Confluence (PC space)

### Development Tools
- **Code Quality**: black, ruff, bandit, pre-commit
- **Type Checking**: mypy (lenient mode)
- **Embeddings**: sentence-transformers
- **Rich CLI**: click, rich

---

## Project Structure

```
project-chronos/
├── .devcontainer/          # VS Code dev container config
├── .github/
│   └── workflows/
│       └── ci.yml          # GitHub Actions CI pipeline
├── alembic/                # Database migrations
│   ├── versions/           # Migration scripts
│   └── env.py              # Alembic configuration
├── config/
│   └── alembic.ini         # Alembic settings (moved from root)
├── database/
│   ├── schema/             # SQL schema definitions
│   │   ├── 01_extensions.sql
│   │   ├── 02_schemas.sql
│   │   ├── 03_tables.sql
│   │   ├── 04_views.sql
│   │   └── 05_functions.sql
│   └── seeds/              # Seed data
│       └── time-series_catalog.csv
├── scripts/
│   ├── ops/                # Operational scripts (backup/restore)
│   ├── dev/                # Development utilities
│   └── legacy/             # Deprecated scripts (bulk ingest)
├── src/
│   └── chronos/            # Main Python package
│       ├── cli/            # CLI tools
│       │   ├── jira_cli.py
│       │   ├── confluence_cli.py
│       │   ├── jira_ingest.py
│       │   ├── jira_update.py
│       │   └── generate_embeddings.py
│       ├── ingestion/      # Data ingestion plugins
│       │   ├── base.py
│       │   ├── fred.py
│       │   ├── valet.py
│       │   ├── boe.py      # Prototype
│       │   ├── timeseries_cli.py
│       │   └── geospatial_cli.py
│       ├── database/       # Database connection & models
│       │   └── connection.py
│       ├── config/         # Configuration management
│       │   └── settings.py
│       └── utils/          # Utilities
│           ├── logging.py
│           └── exceptions.py
├── tests/
│   ├── unit/               # Unit tests (no DB)
│   ├── integration/        # Integration tests (with DB)
│   └── e2e/                # End-to-end tests
├── workflows/
│   └── jira/
│       └── catalog.csv     # Jira ticket catalog
├── .env                    # Environment variables (not in git)
├── .pre-commit-config.yaml # Pre-commit hooks
├── docker-compose.yml      # Local development stack
├── Dockerfile              # Application container
├── pyproject.toml          # Python project config
└── README.md               # Project documentation
```

---

## Key Workflows

### Git Workflow

```bash
# Standard feature development
git checkout develop
git pull
git checkout -b feat/CHRONOS-XXX-description

# Make changes...

git add .
git commit -m "type(scope): description"  # Follows conventional commits
git push -u origin feat/CHRONOS-XXX-description

# Create PR
gh pr create --title "..." --body "..." --base develop

# Merge (after CI passes)
gh pr merge --squash

# Return to develop
git checkout develop
git pull
```

### Commit Message Format

```
type(scope): description

Detailed explanation of changes.

🤖 Generated with [Claude Code](https://claude.com/claude-code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `ci`

### Jira Workflow

1. **Create Ticket**:
   ```bash
   jira create --summary "..." --description "..." --type Task --priority Medium
   ```

2. **Update Ticket**:
   ```bash
   jira update CHRONOS-XXX --status "In Progress"
   ```

3. **Link to PR**: Mention ticket in commit/PR title

4. **Complete**: Update to "Done" when merged

### Confluence Workflow

1. **Create Page**:
   ```bash
   confluence create --title "..." --space PC --body-file doc.md --jira-ticket CHRONOS-XXX
   ```

2. **Update Page**:
   ```bash
   confluence update "Page Title" --space PC --body "Updated content"
   ```

---

## Development Environment

### Prerequisites

- Docker Desktop
- Python 3.11+
- Git
- GitHub CLI (`gh`)

### Initial Setup

```bash
# Clone repository
git clone https://github.com/PrometheusFire-22/project-chronos.git
cd project-chronos

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Install dependencies
pip install -e ".[dev]"

# Set up pre-commit hooks
pre-commit install

# Configure environment
cp .env.example .env
# Edit .env with your API keys and credentials
```

### Running the Stack

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f app

# Run migrations
docker compose exec app alembic upgrade head

# Stop services
docker compose down
```

### Database Access

```bash
# Connect to PostgreSQL
docker compose exec db psql -U prometheus -d chronos_db

# Common queries
\dt metadata.*         # List tables in metadata schema
\dt timeseries.*       # List tables in timeseries schema
\dv analytics.*        # List views in analytics schema
SELECT * FROM metadata.data_sources;
```

---

## Important Files

### Configuration Files

| File | Purpose |
|------|---------|
| `pyproject.toml` | Python dependencies, tool configs, console scripts |
| `.env` | Environment variables (API keys, DB credentials) |
| `docker-compose.yml` | Local development stack definition |
| `config/alembic.ini` | Database migration settings |
| `.pre-commit-config.yaml` | Code quality hooks |

### Entry Points

| Command | File | Purpose |
|---------|------|---------|
| `jira` | `src/chronos/cli/jira_cli.py` | Jira ticket management |
| `confluence` | `src/chronos/cli/confluence_cli.py` | Confluence page CRUD |
| `jira-ingest` | `src/chronos/cli/jira_ingest.py` | Create tickets from CSV |
| `jira-update` | `src/chronos/cli/jira_update.py` | Update tickets from CSV |

### Data Ingestion

| File | Purpose |
|------|---------|
| `src/chronos/ingestion/base.py` | Plugin interface |
| `src/chronos/ingestion/fred.py` | FRED API client |
| `src/chronos/ingestion/valet.py` | Bank of Canada client |
| `src/chronos/ingestion/boe.py` | Bank of England (prototype) |
| `src/chronos/ingestion/timeseries_cli.py` | Bulk ingestion orchestrator |

### Database Schema

| File | Purpose |
|------|---------|
| `database/schema/01_extensions.sql` | PostGIS, TimescaleDB, pgvector |
| `database/schema/02_schemas.sql` | Namespace creation |
| `database/schema/03_tables.sql` | Table definitions |
| `database/schema/04_views.sql` | Analytics views |
| `database/schema/05_functions.sql` | Stored procedures |

---

## Common Commands

### Testing

```bash
# Run all tests
pytest

# Unit tests only (fast)
pytest tests/unit/ -v

# Integration tests (requires DB)
pytest tests/integration/ -v

# With coverage
pytest --cov=chronos --cov-report=html

# Specific test
pytest tests/unit/test_calculations.py::test_growth_rate -v
```

### Code Quality

```bash
# Format code
black --line-length 100 src/ tests/

# Lint code
ruff check src/ tests/

# Auto-fix linting
ruff check --fix src/ tests/

# Security scan
bandit -r src/

# Run all pre-commit hooks
pre-commit run --all-files
```

### Database

```bash
# Create new migration
alembic revision -m "description"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1

# View history
alembic history
```

### Data Ingestion

```bash
# Ingest from catalog
python src/chronos/ingestion/timeseries_cli.py

# Single series (in Python)
from chronos.ingestion.fred import FREDPlugin
plugin = FREDPlugin("your-api-key")
data = plugin.fetch_observations("GDP")
```

---

## Code Quality Standards

### Formatting
- **Line length**: 100 characters
- **Tool**: black
- **Config**: `pyproject.toml` → `[tool.black]`

### Linting
- **Tool**: ruff
- **Rules**: E, W, F, I, N, UP, B, C4, DTZ, SIM
- **Config**: `pyproject.toml` → `[tool.ruff]`

### Type Checking
- **Tool**: mypy (lenient mode)
- **Config**: `pyproject.toml` → `[tool.mypy]`

### Security
- **Tool**: bandit
- **Config**: `.pre-commit-config.yaml`

### Import Sorting
- **Tool**: ruff (isort)
- **Order**: future → stdlib → third-party → first-party → local
- **Config**: `pyproject.toml` → `[tool.ruff.isort]`

### Test Ignores
Tests have relaxed linting rules for:
- `S101` - Allow `assert` statements
- `DTZ001/005/007` - Allow datetime without timezone
- `B017` - Allow `pytest.raises(Exception)`
- `N806` - Allow non-lowercase variables

---

## Testing Strategy

### Test Structure

```
tests/
├── unit/           # No external dependencies
│   ├── test_calculations.py
│   └── test_connection.py
├── integration/    # Requires database
│   ├── test_database.py
│   ├── test_ingestion_fred.py
│   └── test_ingestion_valet.py
└── e2e/            # Full workflow tests
    └── test_ingestion_workflow.py
```

### Coverage Requirements

- **Target**: 75% (enforced in CI)
- **Current**: ~60% (growing)
- **Excluded**: migrations, __init__.py, test files

### Running Tests

```bash
# Fast unit tests
pytest tests/unit/ -x --tb=short

# Integration tests (requires Docker)
docker compose up -d db
pytest tests/integration/

# E2E tests (full stack)
docker compose up -d
pytest tests/e2e/

# With coverage report
pytest --cov=chronos --cov-report=html --cov-report=term
open htmlcov/index.html  # View coverage report
```

---

## Documentation Links

### Internal Documentation
- **Confluence Space**: [Project Chronos (PC)](https://automatonicai.atlassian.net/wiki/spaces/PC)
- **Jira Project**: [CHRONOS](https://automatonicai.atlassian.net/jira/software/projects/CHRONOS)
- **GitHub Repo**: [PrometheusFire-22/project-chronos](https://github.com/PrometheusFire-22/project-chronos)

### Key Confluence Pages
- [Sprint 4 Completion Summary](https://automatonicai.atlassian.net/wiki/spaces/PC/pages/3997736)
- [CI Code Quality Fix (CHRONOS-163)](https://automatonicai.atlassian.net/wiki/spaces/PC/pages/4030508)

### Reference Documentation
- [FRED API Docs](https://fred.stlouisfed.org/docs/api/fred/)
- [Valet API Docs](https://www.bankofcanada.ca/valet/docs)
- [TimescaleDB Docs](https://docs.timescale.com/)
- [SQLAlchemy Docs](https://docs.sqlalchemy.org/)
- [Click Docs](https://click.palletsprojects.com/)

---

## Context for LLMs

### User's Workflow Preferences

1. **Git → GitHub → Jira → Confluence**: Always follow this sequence
2. **Feature branches**: Always create from `develop`
3. **Commit attribution**: Include Claude Code footer
4. **Testing**: Test in both venv and Docker before PR
5. **Documentation**: Update Confluence after major work
6. **Token awareness**: Use Task tool for exploration to save tokens

### Important Constraints

- **No emojis** unless explicitly requested
- **No documentation files** unless asked (prefer editing existing)
- **No --no-verify** on commits unless necessary
- **Always read files** before editing them
- **Prefer Edit over Write** for existing files
- **Test before commit** (pytest unit tests minimum)

### Sprint 4 Completed Work

1. **CHRONOS-147**: Config consolidation (deleted pytest.ini, .coveragerc)
2. **CHRONOS-148**: Src organization (created src/chronos/cli/)
3. **CHRONOS-149**: Scripts cleanup (organized into ops/dev/legacy/)
4. **CHRONOS-160-162**: Bug fixes (confluence labels, jira Python 3.11, pre-commit path)
5. **CHRONOS-163**: CI quality fixes (black, ruff, isort config)

### Current Branch Status

- **Branch**: `develop`
- **Last Commit**: `4fa1af8` - CI quality fixes
- **CI Status**: ✅ Code Quality passing
- **Clean**: Working tree clean, no pending changes

### Console Commands Available

After `pip install -e .`, these commands are available:

```bash
jira list --limit 10                    # List Jira tickets
jira get CHRONOS-163                    # Get ticket details
jira create --summary "..." --type Task # Create ticket
jira update CHRONOS-163 --status Done   # Update ticket

confluence list --space PC              # List pages
confluence create --title "..." ...     # Create page
confluence update "Page Title" ...      # Update page
```

### Common Gotchas

1. **Script paths**: After CHRONOS-149, bulk ingest scripts are in `scripts/legacy/`
2. **Console scripts**: Defined in `pyproject.toml` → `[project.scripts]`
3. **Import paths**: Use `from chronos.X import Y`, not `sys.path.insert`
4. **DateTime**: Always use `datetime.UTC` or `datetime.now(timezone.utc)`
5. **Exception chaining**: Use `raise ValueError(...) from e`
6. **Test DB**: Integration tests need Docker DB running

---

## Quick Start for New LLM Session

```bash
# 1. Check current state
git status
git branch --show-current

# 2. Check recent work
git log -5 --oneline
gh pr list --state merged --limit 5

# 3. Check CI status
gh run list --branch develop --limit 3

# 4. Read key files for context
cat SPRINT4_SUMMARY.md
cat README.md

# 5. Check Jira tickets
jira list --limit 10

# 6. Check test status
pytest tests/unit/ -q

# 7. Start working
git checkout -b feat/CHRONOS-XXX-your-feature
```

---

## Best Practices for LLMs

### Before Making Changes

1. ✅ Read the file(s) you'll modify
2. ✅ Check git status and current branch
3. ✅ Review recent commits for context
4. ✅ Run tests to establish baseline

### During Development

1. ✅ Use TodoWrite to track multi-step tasks
2. ✅ Test incrementally (don't wait until the end)
3. ✅ Follow code quality standards (black, ruff)
4. ✅ Update tests if changing functionality

### After Completion

1. ✅ Run full test suite
2. ✅ Commit with proper message format
3. ✅ Create PR with detailed description
4. ✅ Update Jira ticket status
5. ✅ Document major work in Confluence

### Token Management

- Use `Task` tool with `subagent_type=Explore` for codebase exploration
- Avoid `sleep` commands (provide commands to user instead)
- Batch read operations when possible
- Use `Grep` with specific patterns vs. reading many files

---

**End of Onboarding Guide**

For questions or issues, check:
1. This document
2. Confluence PC space
3. Recent Jira tickets
4. Recent commits/PRs

**Last Updated**: November 23, 2025
**Maintainer**: Prometheus + Claude Code
