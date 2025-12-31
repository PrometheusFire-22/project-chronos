# MCP Server Configuration

This project is configured with 12 Model Context Protocol (MCP) servers to enhance AI-assisted development with structured data access and reduced token usage.

## Configured MCP Servers

### Core Development (Always Active)

#### GitHub
- **Package**: `@modelcontextprotocol/server-github`
- **Capabilities**: PR management, issues, code review, branch operations
- **Token Savings**: ~80% fewer tokens vs CLI text parsing
- **Required Env**: `GITHUB_TOKEN`
- **Setup**: Get token from https://github.com/settings/tokens

#### Filesystem
- **Package**: `@modelcontextprotocol/server-filesystem`
- **Capabilities**: Fast file operations across project directories
- **Paths**: `/home/prometheus/coding/finance/project-chronos`, `/home/prometheus/coding`

#### Git
- **Package**: `@modelcontextprotocol/server-git`
- **Capabilities**: Advanced git operations
- **Configured for**: This repository's `.git` directory

---

### Database Access

#### Postgres
- **Package**: `@modelcontextprotocol/server-postgres`
- **Capabilities**: SQL queries, schema introspection, data operations
- **Default Configuration**: AWS Lightsail production database (`16.52.210.100:5432`)
- **SSL**: Required (`sslmode=require`)
- **Required Env**:
  - `POSTGRES_PASSWORD` (get from KeePassXC)
- **Optional Env** (override defaults):
  - `PGHOST` (default: `16.52.210.100`)
  - `PGPORT` (default: `5432`)
  - `PGDATABASE` (default: `chronos`)
  - `POSTGRES_USER` (default: `chronos`)
  - `PGSSLMODE` (default: `require`)
- **Note**: This connects to your AWS Lightsail production database by default. Set `PGHOST=localhost` to use local development database instead.

---

### Development Tools

#### NX Monorepo
- **Package**: `nx-mcp` (official from `@nrwl/nx-console`)
- **Capabilities**:
  - Project structure and relationships
  - Available generators and their schemas
  - Runnable tasks
  - NX documentation access
  - CI pipeline executions (with NX Cloud)
- **Token Savings**: Structured JSON vs CLI output
- **Setup**: Auto-detects workspace at `/home/prometheus/coding/finance/project-chronos`

#### Sentry (Remote MCP)
- **URL**: `https://mcp.sentry.dev/mcp` (hosted by Sentry)
- **Capabilities**:
  - Error monitoring and analysis
  - Project management
  - Performance insights
  - 16+ specialized tools
- **Authentication**: OAuth via Sentry organization
- **Required Env**: `SENTRY_ORG_SLUG`
- **Note**: This is a remote MCP server with OAuth support

---

### Content Management & CRM

#### Directus CMS
- **Package**: `@directus/content-mcp`
- **Capabilities**:
  - Natural language content management
  - Respects all Directus permissions
  - CRUD operations on collections
  - Schema introspection
- **Requirements**: Directus v11.12+ required for MCP support
- **Required Env**:
  - `DIRECTUS_URL`
  - `DIRECTUS_EMAIL`
  - `DIRECTUS_PASSWORD`
- **Security**: All operations go through standard Directus auth/permissions

#### TwentyCRM
- **Package**: `twenty-crm-mcp-server` (community)
- **Capabilities**:
  - CRUD operations: people, companies, tasks, notes
  - Cross-object search and filtering
  - Dynamic schema discovery
- **Required Env**:
  - `TWENTY_API_URL` (default: https://api.twenty.com)
  - `TWENTY_API_KEY`
- **Source**: https://github.com/mhenry3164/twenty-crm-mcp-server

---

### Productivity Tools

#### Atlassian (Jira/Confluence)
- **Package**: `@atlassian/mcp-server-atlassian` (official)
- **Capabilities**:
  - Jira issue management
  - Confluence page access
  - Sprint and project tracking
- **Required Env**:
  - `ATLASSIAN_INSTANCE_URL` (your Jira/Confluence URL)
  - `ATLASSIAN_EMAIL`
  - `ATLASSIAN_API_TOKEN`
- **Setup**: Get API token from Atlassian account settings

#### Google Workspace
- **Package**: `@taylorwilsdon/google_workspace_mcp`
- **Capabilities**:
  - Gmail: Read, send, search emails
  - Calendar: Create, update, manage events
  - Drive: Upload, download, search files with permissions
  - Docs/Sheets: Read and edit documents
- **Description**: "10 MCPs in 1" - comprehensive Google Workspace integration
- **Required Env**:
  - `GOOGLE_CLIENT_ID`
  - `GOOGLE_CLIENT_SECRET`
- **Authentication**: OAuth 2.1 with multi-user support
- **Source**: https://workspacemcp.com

---

### Search

#### Brave Search
- **Package**: `@modelcontextprotocol/server-brave-search`
- **Capabilities**: Web search with structured results
- **Required Env**: `BRAVE_API_KEY`
- **Setup**: Get API key from https://brave.com/search/api/

---

## Usage in Claude Code

MCPs automatically load when you start Claude Code in this directory. The `.mcp.json` file in the project root defines all configurations.

### Enabling/Disabling MCPs

Use the `@mention` syntax to enable/disable specific MCP servers:
- `@github` - Enable GitHub MCP
- `@nx` - Enable NX MCP
- `@sentry` - Enable Sentry MCP

### Checking MCP Status

Use `/mcp` command to see which MCPs are active and their status.

---

## Token Efficiency

MCPs provide structured data access instead of parsing CLI text output:

- **GitHub Operations**: ~80% token reduction
  - Structured JSON responses vs `gh pr view` text output
  - Intelligent caching of PR data
  - No need to parse markdown tables

- **NX Operations**: ~70% token reduction
  - Direct access to workspace graph
  - Structured task configurations
  - No CLI output parsing

- **Database Queries**: ~60% token reduction
  - Direct SQL results as structured data
  - Schema introspection without manual inspection
  - Efficient result pagination

---

## Environment Variables Setup

Add these to your `~/.bashrc` or `~/.zshrc`:

```bash
# Core (Required)
export GITHUB_TOKEN="your_github_token"

# Database (AWS Lightsail - defaults configured, only password required)
export POSTGRES_PASSWORD="DZ4eNOynmfYVOtG8c8TBlXIGVGlqkvWKQR5ixYYjAMs="
# Optional overrides (uncomment to use local database):
# export PGHOST="localhost"
# export PGSSLMODE="disable"

# Development (Optional)
export SENTRY_ORG_SLUG="your-org-slug"

# Content & CRM (Optional)
export DIRECTUS_URL="https://your-directus-instance.com"
export DIRECTUS_EMAIL="your@email.com"
export DIRECTUS_PASSWORD="your_directus_password"
export TWENTY_API_URL="https://api.twenty.com"
export TWENTY_API_KEY="your_twenty_api_key"

# Productivity (Optional)
export ATLASSIAN_INSTANCE_URL="https://your-domain.atlassian.net"
export ATLASSIAN_EMAIL="your@email.com"
export ATLASSIAN_API_TOKEN="your_atlassian_token"
export GOOGLE_CLIENT_ID="your_google_client_id"
export GOOGLE_CLIENT_SECRET="your_google_client_secret"

# Search (Optional)
export BRAVE_API_KEY="your_brave_api_key"
```

---

## Next Steps

1. **Set Environment Variables**: Add required credentials to `~/.bashrc` or `~/.zshrc`
   - **Required**: `GITHUB_TOKEN`, `POSTGRES_PASSWORD`
   - **Optional**: Configure additional MCPs as needed (Sentry, Directus, TwentyCRM, etc.)
2. **Test MCP Connections**: Start Claude Code and verify MCPs load successfully
   - Run `./scripts/setup-mcps.sh` to check environment variable status
3. **Enable as Needed**: Use `@mention` to activate specific MCPs during sessions
   - Example: `@postgres` for database queries, `@nx` for monorepo operations

---

## Sources

- [Atlassian MCP Server](https://github.com/atlassian/atlassian-mcp-server)
- [Directus MCP Documentation](https://directus.io/docs/guides/ai/mcp)
- [Google Workspace MCP](https://workspacemcp.com)
- [NX MCP Server](https://nx.dev/blog/nx-made-cursor-smarter)
- [Sentry MCP Documentation](https://docs.sentry.io/product/sentry-mcp/)
- [TwentyCRM MCP Server](https://github.com/mhenry3164/twenty-crm-mcp-server)
