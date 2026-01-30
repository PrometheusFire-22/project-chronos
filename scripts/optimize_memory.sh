#!/bin/bash
# Memory Optimization Script for Ubuntu
# Run with: sudo bash optimize_memory.sh

echo "=== Ubuntu Memory Optimization ==="
echo

# 1. Reduce swappiness (prefer RAM over swap)
echo "[1/6] Reducing swappiness from 60 to 10..."
sysctl vm.swappiness=10
echo "vm.swappiness=10" >> /etc/sysctl.conf

# 2. Reduce cache pressure
echo "[2/6] Reducing cache pressure..."
sysctl vm.vfs_cache_pressure=50
echo "vm.vfs_cache_pressure=50" >> /etc/sysctl.conf

# 3. Clear page cache
echo "[3/6] Clearing page cache..."
sync && sysctl -w vm.drop_caches=3

# 4. Install and configure zram for compressed swap
echo "[4/6] Setting up zram (compressed RAM)..."
if ! command -v zramctl &> /dev/null; then
    apt-get update && apt-get install -y zram-config
fi

# 5. Optimize dirty page writebacks
echo "[5/6] Optimizing dirty page settings..."
sysctl vm.dirty_ratio=10
sysctl vm.dirty_background_ratio=5
echo "vm.dirty_ratio=10" >> /etc/sysctl.conf
echo "vm.dirty_background_ratio=5" >> /etc/sysctl.conf

# 6. Enable memory compaction
echo "[6/6] Enabling memory compaction..."
sysctl vm.compact_memory=1

echo
echo "=== Memory State After Optimization ==="
free -h
echo
echo "=== Current Settings ==="
echo "Swappiness: $(cat /proc/sys/vm/swappiness)"
echo "Cache Pressure: $(cat /proc/sys/vm/vfs_cache_pressure)"
echo
echo "✅ Memory optimization complete!"
echo "Changes persist across reboots via /etc/sysctl.conf"
