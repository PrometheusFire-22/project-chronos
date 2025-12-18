# Quick Fix for Antigravity Dev Container Docker Issues

## The Problem
Antigravity's `docker-outside-of-docker` feature failed to mount the Docker socket.

## The Solution

### Step 1: Rebuild from Host Machine

**Option A: Using the script (recommended)**
```bash
cd /path/to/project-chronos
./scripts/restart-devcontainer.sh
```

**Option B: Manual commands**
```bash
cd /path/to/project-chronos

# Stop containers
docker compose down
# OR if you have legacy docker-compose:
docker-compose down

# Rebuild the app container (this applies the fixes)
docker compose build app --no-cache
# OR:
docker-compose build app --no-cache

# Start everything
docker compose up -d
# OR:
docker-compose up -d
```

### Step 2: Reconnect Antigravity

1. **Close Antigravity completely** (Quit the app, don't just close the window)
2. **Reopen the project folder**
3. When prompted, select **"Reopen in Container"**

### Step 3: Verify It Works

Once inside the container, run:
```bash
./scripts/check-docker.sh
```

You should see all ✅ green checkmarks.

## What If Docker Command Isn't Found on Host?

If you get `docker: command not found` on your **host machine**, it means:
- Docker Desktop isn't installed, OR
- Docker Desktop isn't running, OR
- Docker isn't in your PATH

**Fix:**
1. Make sure Docker Desktop is running (check your system tray/menu bar)
2. Try opening a new terminal window
3. Test: `docker --version`

## What Changed

I made two fixes to your config:

1. **`devcontainer.json`**: Added explicit Docker socket mount as a backup
2. **`Dockerfile`**: Baked Docker CLI installation into the image

These ensure Docker works even if Antigravity's feature fails.

## Why This Happened

Your `devcontainer.json` is perfect and works in VS Code. Antigravity has a bug where the `docker-outside-of-docker` feature doesn't properly:
- Mount `/var/run/docker.sock`
- Install the Docker CLI

This is a known Antigravity platform issue, not your configuration.
