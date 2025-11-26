# 🚀 Antigravity Dev Container Setup Guide

## The Problem

Antigravity (Google's VS Code fork) has compatibility issues with:
1. ❌ Dev Container `features` section (causes freeze during initialization)
2. ❌ Auto-installing extensions from `devcontainer.json`

## The Solution

Your `devcontainer.json` has been modified to work with Antigravity:
- ✅ Removed the `features` section (gh & docker are already installed)
- ⚠️ Extensions must be installed manually (auto-install doesn't work)

---

## 📋 Complete Setup Steps

### Step 1: Start the Dev Container

In Antigravity:
```
Ctrl+Shift+P → "Dev Containers: Rebuild Container"
```

Wait for it to complete. It should **no longer freeze** at the feature installation stage.

### Step 2: Open Integrated Terminal

Once inside the Dev Container, open a terminal:
```
Ctrl+` (backtick) OR View → Terminal
```

### Step 3: Check Current Extensions

```bash
./.devcontainer/check-extensions.sh
```

This shows which critical extensions are installed.

### Step 4: Install Extensions Manually

```bash
./.devcontainer/install-extensions.sh
```

This will install all 32 extensions from your `devcontainer.json`.

**Note:** Some extensions may fail - this is normal if:
- Antigravity doesn't have them in its marketplace
- Google provides alternative extensions (e.g., Gemini instead of others)

### Step 5: Reload Antigravity

```
Ctrl+Shift+P → "Developer: Reload Window"
```

### Step 6: Verify Everything Works

Test your critical tools:
```bash
# GitHub CLI
gh --version

# Docker
docker --version

# Python
python --version

# Database connection
docker compose ps
```

---

## 🔧 Troubleshooting

### Extensions Still Not Loading?

**Option 1: Install one-by-one through UI**
1. Open Extensions panel (Ctrl+Shift+X)
2. Search for extension name
3. Click Install

**Option 2: Check if Antigravity has the extension**
Some extensions might not be available in Antigravity's marketplace. For critical ones:

| Extension | Antigravity Alternative |
|-----------|------------------------|
| GitHub Copilot | Gemini Code Assist (built-in) |
| Some AWS tools | May need manual VSIX install |

**Option 3: Install from VSIX**
For extensions not in Antigravity marketplace:
1. Download .vsix from VS Code marketplace website
2. `code --install-extension extension.vsix`

### "code command not found"?

Install the CLI command:
```
Ctrl+Shift+P → "Shell Command: Install 'code' command in PATH"
```

Then run the install script again.

### Container Still Freezing?

If it's still freezing during startup, the issue might be:

1. **Too many services starting**
   - Edit `devcontainer.json` runServices section
   - Remove metabase, pgadmin, mailhog temporarily
   - Just keep app and timescaledb

2. **Extension installation during startup**
   - Antigravity might still try to auto-install
   - Check the logs to see where it's hanging

3. **SSH mount issue**
   - Comment out the SSH mount line in devcontainer.json
   ```json
   // "source=${localEnv:HOME}/.ssh,target=/home/vscode/.ssh,readonly,type=bind",
   ```

---

## 🎯 Your Critical Extensions

These are essential for your workflow:

**Must Have:**
- ✅ Atlassian.atlascode (Jira integration)
- ✅ GitHub.vscode-pull-request-github (GitHub PRs)
- ✅ ms-python.python (Python)
- ✅ eamodio.gitlens (Git)
- ✅ anthropic.claude-vscode (Claude Code - this one!)

**Nice to Have:**
- Database tools (sqltools, postgresql clients)
- Data science (Jupyter, data wrangler)
- File viewers (CSV, PDF, Excel)
- Diagramming (PlantUML, Mermaid, Excalidraw)

**May Not Work in Antigravity:**
- Some Google extensions might conflict with built-in Gemini
- Some AWS extensions might need VSIX install

---

## 💡 Pro Tips

### 1. Create a Personal Extension List

After you get everything working, export your installed extensions:
```bash
code --list-extensions > ~/.my-extensions.txt
```

Then on any new setup:
```bash
cat ~/.my-extensions.txt | xargs -L 1 code --install-extension
```

### 2. Use Workspace Extension Recommendations

If auto-install keeps failing, use recommendations instead:
1. Create `.vscode/extensions.json` (NOT .devcontainer)
2. Antigravity will PROMPT you to install (doesn't auto-install)
3. You approve each one manually

### 3. Hybrid Approach

- Use Antigravity for coding with AI assistance
- Use regular VS Code for heavy extension work
- Both can connect to the same Dev Container

---

## 🆘 Still Having Issues?

**Quick Workarounds:**

1. **Attach to running container (bypasses Dev Container init):**
   ```bash
   docker compose up -d
   # Then: Ctrl+Shift+P → "Attach to Running Container" → chronos-app
   ```

2. **Use VS Code instead:**
   - Your config works perfectly in regular VS Code
   - Auto-installs all extensions, no issues

3. **Use Cursor:**
   - Another AI-powered editor
   - Better Dev Container compatibility than Antigravity
   - Still has AI features

---

## ✅ What You Should Have Now

After following this guide:
- ✅ Dev Container starts without freezing
- ✅ GitHub CLI works (`gh --version`)
- ✅ Docker works (`docker --version`)
- ✅ All services running (timescaledb, metabase, etc.)
- ✅ Most/all extensions installed
- ✅ Jira integration working
- ✅ GitHub PR integration working
- ✅ Full Python development environment

---

**Last updated:** 2025-11-26
**Config version:** Antigravity-compatible (features removed)
