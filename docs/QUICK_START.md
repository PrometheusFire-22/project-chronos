# 🚀 Project Chronos Quick Start

## ⚡ 5-Minute Setup

### 1. Prerequisites
- **OS:** Ubuntu 22.04+ (WSL2 supported)
- **Python:** 3.11+
- **Docker:** 24.0+
- **KeePassXC:** 2.7+ (for secrets)

### 2. Clone & Environment
```bash
git clone https://github.com/PrometheusFire-22/project-chronos.git
cd project-chronos
python3 -m venv .venv
source .venv/bin/activate
pip install -e '.[dev]'
```

### 3. Credentials
1. **KeePassXC:** Open `Chronos.kdbx` (Safety Deposit Box / Google Drive).
2. **Environment:** Copy credentials to `.env`:
   ```bash
   cp .env.example .env
   # Edit .env with values from KeePassXC
   ```

### 4. Verify Access
```bash
# Check Jira Access
jira list --limit 1

# Check Confluence Access
confluence list --limit 1

# Check Google Workspace
python3 scripts/ops/verify_google_connection.py
```

### 5. Start Development
```bash
# Run tests
pytest

# Start services
docker-compose up -d
```

---

## 📚 Documentation Index
- **Architecture:** [ADRs](architecture/adrs/README.md)
- **Runbooks:** [Operations](operations/README.md)
- **Guides:** [Developer Guides](guides/README.md)
