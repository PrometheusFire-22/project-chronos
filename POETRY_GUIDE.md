# Poetry Guide for Project Chronos

Project Chronos now uses [Poetry](https://python-poetry.org/) for Python dependency management and packaging. This guide covers common workflows and commands.

## 🚀 Quick Start

### 1. Install Poetry
If you haven't installed Poetry yet:

**Linux/macOS/WSL:**
```bash
curl -sSL https://install.python-poetry.org | python3 -
```

**Windows (PowerShell):**
```powershell
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | py -
```

### 2. Install Project Dependencies
Navigate to the project root and run:
```bash
poetry install
```
This creates a virtual environment (in `.venv` or cache) and installs all dependencies from `poetry.lock`.

### 3. Activate Virtual Environment
```bash
poetry shell
```
Or run commands directly:
```bash
poetry run python src/chronos/main.py
poetry run pytest
```

---

## 📦 Dependency Management

### Adding a Dependency
Replace `pip install package` with:
```bash
poetry add pandas
```
This updates `pyproject.toml` and `poetry.lock` automatically.

### Adding a Dev Dependency
Tools for testing, linting, etc.:
```bash
poetry add --group dev pytest ruff black
```

### Removing a Dependency
```bash
poetry remove requests
```

### Updating Dependencies
Update all packages to the latest versions allowed by `pyproject.toml`:
```bash
poetry update
```

---

## 🐋 Docker & Deployment

The `Dockerfile` has been updated to use Poetry. 

**Local Build:**
```bash
docker build -t chronos-api -f apps/api/Dockerfile.production .
```

**Key Dockerfile Changes:**
- Uses multi-stage build (Builder -> Runner)
- Installs Poetry in the build stage
- Exports dependencies or installs directly via `poetry install --only main`
- Optimized `.dockerignore` to exclude `poetry.lock` from context if needed (though usually we copy it).

---

## 🔧 Troubleshooting

### "Poetry not found"
Ensure `~/.local/bin` is in your PATH. 
```bash
export PATH="$HOME/.local/bin:$PATH"
```

### Virtual Environment Location
We configured Poetry to create venvs in the project root (`.venv`):
```bash
poetry config virtualenvs.in-project true
```
This makes it easier for VS Code to detect the environment.

### Lock File Conflicts
If you encounter merge conflicts in `poetry.lock`:
1. Checkout `pyproject.toml` from the branch you want to keep (or merge manually)
2. Run `poetry lock --no-update` to regenerate the lock file based on the current TOML.
