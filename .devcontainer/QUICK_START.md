# 🚀 Quick Start - Dev Containers

## Start Working (2 steps)

1. **Open folder in VS Code/Antigravity**
2. **Click "Reopen in Container"**

✅ Done! All containers start automatically.

---

## Stop Working (1 step)

1. **Close VS Code/Antigravity** (or "Reopen Folder Locally")

✅ Done! All containers stop automatically.

---

## 🚫 Never Do This

```bash
# ❌ DON'T run these from your HOST terminal!
docker compose up
docker compose down
```

The Dev Container manages everything automatically.

---

## ✅ If You Need to Manually Control Containers

Run these **INSIDE** the Dev Container terminal (not on your host):

```bash
# Check status
docker compose ps

# Restart a service
docker compose restart timescaledb

# View logs
docker compose logs -f app
```

---

## 🆘 Something Broken?

```bash
# 1. Close Dev Container (reopen locally)

# 2. From HOST terminal:
cd /workspace
docker compose down

# 3. Reopen in Container
```

---

**📖 Full documentation:** [README.md](./README.md)
