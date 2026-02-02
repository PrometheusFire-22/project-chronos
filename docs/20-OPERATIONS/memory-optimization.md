# Memory Optimization for Project Chronos

## Current Memory Status

**Total RAM**: 9.7GB
**In Use**: 8.3GB (85%)
**Available**: ~1.4GB
**Swap**: 4GB (748MB used)

## Major Memory Consumers

1. **Firefox** (~4GB across 40 tabs) - Close unused tabs
2. **Claude CLI** (~460MB) - Normal for AI workload
3. **GNOME Shell** (~273MB) - System UI
4. **Python Ingestion** (~40-50MB) - Currently running

## Immediate Actions

### 1. Run Memory Optimization Script
```bash
sudo bash scripts/optimize_memory.sh
```

### 2. Close Unused Browser Tabs
Firefox is using ~4GB with 40 tabs. Close tabs you're not actively using.

### 3. Manual Cache Clear (No sudo required)
```bash
# Clear user cache
rm -rf ~/.cache/thumbnails/*
rm -rf ~/.cache/mozilla/*
```

## Optimization Settings Applied

### Kernel Parameters (via sysctl)
- `vm.swappiness=10` - Prefer RAM over swap (was 60)
- `vm.vfs_cache_pressure=50` - Keep cache longer (was 100)
- `vm.dirty_ratio=10` - Write to disk sooner
- `vm.dirty_background_ratio=5` - Background writes

### Why These Help
- **Lower swappiness**: Keeps active data in RAM instead of swapping to slow disk
- **Cache pressure**: Reduces aggressive cache clearing, reuses cached data
- **Dirty ratios**: Prevents memory buildup from delayed disk writes

## Long-Term Recommendations

### 1. Install zram (Compressed Swap in RAM)
```bash
sudo apt install zram-config
sudo systemctl enable zram-config
```
Benefits: 2-3x more effective swap using RAM compression

### 2. Increase Swap Size (if needed)
```bash
# Current: 4GB
# Recommended for 10GB RAM: 6-8GB
sudo swapoff /swap.img
sudo dd if=/dev/zero of=/swap.img bs=1G count=8
sudo mkswap /swap.img
sudo swapon /swap.img
```

### 3. Browser Optimizations
**Firefox**:
- Enable tab unloading: `about:config` → `browser.tabs.unloadOnLowMemory` = true
- Reduce content process limit: `about:config` → `dom.ipc.processCount` = 4 (currently unlimited)

### 4. Disable Unused Services
```bash
# Check running services
systemctl list-units --type=service --state=running

# Disable unused ones
sudo systemctl disable [service-name]
```

## Monitoring Commands

```bash
# Real-time memory monitor
watch -n 2 free -h

# Top memory processes
ps aux --sort=-%mem | head -20

# Detailed memory breakdown
sudo cat /proc/meminfo

# Check swap usage per process
for file in /proc/*/status ; do
    awk '/VmSwap|Name/{printf $2 " " $3}END{ print ""}' $file
done | sort -k 2 -n -r | head -10
```

## Performance Tips for Data Ingestion

### Batch Size Optimization
Current ingestion uses batch size of 100. For better memory usage:

```python
# In timeseries_cli.py, line 165
if len(batch) >= 500:  # Increased from 100
```

### Database Connection Pooling
Consider connection pooling for concurrent ingestions.

## Expected Improvements

After optimization:
- ✅ Faster response time (less swapping)
- ✅ More available RAM for processes
- ✅ Better cache utilization
- ✅ Reduced disk I/O

## Verification

After running optimizations:
```bash
# Check settings
cat /proc/sys/vm/swappiness        # Should be 10
cat /proc/sys/vm/vfs_cache_pressure # Should be 50

# Verify memory improvement
free -h
```
