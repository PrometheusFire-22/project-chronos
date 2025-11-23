# Alembic Migration Setup Guide

## What is Alembic?

Alembic is the industry-standard database migration tool for SQLAlchemy projects. It:
- Tracks schema changes as versioned migration scripts
- Enables rollback of database changes
- Ensures reproducible deployments across environments
- Prevents the "edit SQL file and hope nothing breaks" anti-pattern

## Setup Steps

### 1. Install Alembic (if not already in requirements)

```bash
pip install alembic
```

Add to `pyproject.toml`:
```toml
dependencies = [
    "alembic>=1.12.0",
    # ... other deps
]
```

### 2. Initialize Alembic

```bash
cd /workspace
alembic init alembic
```

This creates:
```
alembic/
├── env.py           # Migration environment configuration
├── script.py.mako   # Template for new migrations
└── versions/        # Directory for migration scripts

config/alembic.ini   # Alembic configuration file
```

### 3. Configure alembic.ini

Edit `/workspace/config/alembic.ini`:

```ini
# Replace this line:
sqlalchemy.url = driver://user:pass@localhost/dbname

# With this (reads from environment):
sqlalchemy.url = postgresql://%(DATABASE_USER)s:%(DATABASE_PASSWORD)s@%(DATABASE_HOST)s:%(DATABASE_PORT)s/%(DATABASE_NAME)s
```

### 4. Configure env.py

Edit `/workspace/alembic/env.py`:

```python
import os
from logging.config import fileConfig
from sqlalchemy import engine_from_config, pool
from alembic import context

# Load environment variables
from dotenv import load_dotenv
load_dotenv()

# Import your SQLAlchemy models (if using ORM)
# from src.chronos.database.models import Base
# target_metadata = Base.metadata

# OR: For schema-first approach (our current method):
target_metadata = None

config = context.config

# Override config with environment variables
config.set_main_option('DATABASE_USER', os.getenv('DATABASE_USER', 'prometheus'))
config.set_main_option('DATABASE_PASSWORD', os.getenv('DATABASE_PASSWORD', ''))
config.set_main_option('DATABASE_HOST', os.getenv('DATABASE_HOST', 'timescaledb'))
config.set_main_option('DATABASE_PORT', os.getenv('DATABASE_PORT', '5432'))
config.set_main_option('DATABASE_NAME', os.getenv('DATABASE_NAME', 'chronos_db'))

# ... rest of env.py stays the same
```

### 5. Create Baseline Migration

This captures your current schema as the starting point:

```bash
# Method 1: Auto-generate from database
alembic revision --autogenerate -m "initial schema from production"

# Method 2: Manual baseline (recommended for complex schemas)
alembic revision -m "baseline schema v2.0"
```

### 6. Edit the Baseline Migration

The generated file will be in `alembic/versions/xxxxx_baseline_schema_v2_0.py`

```python
"""baseline schema v2.0

Revision ID: xxxxx
Revises: 
Create Date: 2025-11-17 14:30:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers
revision = 'xxxxx'
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    """Apply the baseline schema"""
    
    # Read and execute your schema.sql
    with open('/workspace/database/schema.sql', 'r') as f:
        schema_sql = f.read()
    
    # Execute raw SQL (for complex extensions/schemas)
    op.execute(schema_sql)


def downgrade() -> None:
    """Rollback the baseline schema"""
    
    # Drop all schemas
    op.execute("DROP SCHEMA IF EXISTS analytics CASCADE;")
    op.execute("DROP SCHEMA IF EXISTS timeseries CASCADE;")
    op.execute("DROP SCHEMA IF EXISTS metadata CASCADE;")
    op.execute("DROP EXTENSION IF EXISTS age CASCADE;")
    op.execute("DROP EXTENSION IF EXISTS timescaledb CASCADE;")
    # ... etc
```

### 7. Mark Database as Migrated

```bash
# This tells Alembic "the database is already at this version"
alembic stamp head
```

Verify:
```bash
alembic current
# Should show: xxxxx (head)
```

## Using Alembic Going Forward

### Creating a New Migration

```bash
# For schema changes
alembic revision -m "add investor_relationships table"
```

Edit the generated file:
```python
def upgrade() -> None:
    op.create_table(
        'investor_relationships',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('investor_a', sa.String(length=100), nullable=False),
        sa.Column('investor_b', sa.String(length=100), nullable=False),
        sa.Column('relationship_type', sa.String(length=50)),
        sa.PrimaryKeyConstraint('id')
    )

def downgrade() -> None:
    op.drop_table('investor_relationships')
```

### Applying Migrations

```bash
# Apply all pending migrations
alembic upgrade head

# Apply to specific version
alembic upgrade xxxxx

# Apply one migration at a time
alembic upgrade +1
```

### Rolling Back

```bash
# Rollback one migration
alembic downgrade -1

# Rollback to specific version
alembic downgrade xxxxx

# Rollback everything
alembic downgrade base
```

### Checking Status

```bash
# Show current version
alembic current

# Show migration history
alembic history

# Show pending migrations
alembic history --indicate-current
```

## Best Practices

1. **One Logical Change Per Migration**: Don't mix "add table" and "modify column" in one migration

2. **Always Test Downgrade**: Before committing, test that `downgrade()` works:
   ```bash
   alembic upgrade head
   alembic downgrade -1
   alembic upgrade head
   ```

3. **Never Edit Applied Migrations**: Once a migration is applied, create a new one to fix issues

4. **Descriptive Names**: Use clear migration messages:
   - ✅ "add_investor_relationships_table"
   - ❌ "update_db"

5. **Review Auto-Generated Migrations**: Alembic can't detect everything (like TimescaleDB hypertables)

6. **Commit Migrations to Git**: Unlike `.env`, migration files MUST be in version control

## Integration with Docker

Add to your `Makefile`:

```makefile
.PHONY: db-migrate
db-migrate: ## Apply all pending migrations
	docker compose exec app alembic upgrade head

.PHONY: db-rollback
db-rollback: ## Rollback last migration
	docker compose exec app alembic downgrade -1

.PHONY: db-status
db-status: ## Show current migration status
	docker compose exec app alembic current
	docker compose exec app alembic history --indicate-current
```

## Troubleshooting

**"Can't locate revision identified by 'xxxxx'"**
- Your database is out of sync. Run `alembic stamp head` to reset.

**"Table already exists"**
- You're trying to apply migrations to a database that already has tables.
- Use `alembic stamp head` to mark it as migrated without executing migrations.

**"Target database is not up to date"**
- Someone else applied migrations. Pull latest code and run `alembic upgrade head`.

## Next Steps

1. Initialize Alembic: `alembic init alembic`
2. Configure `config/alembic.ini` and `env.py`
3. Create baseline: `alembic revision -m "baseline"`
4. Stamp database: `alembic stamp head`
5. Test: Create a dummy migration and apply it

From now on, **never** directly edit `database/schema.sql`. Create migrations instead!
