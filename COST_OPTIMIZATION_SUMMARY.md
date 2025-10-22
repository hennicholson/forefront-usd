# Database Cost Optimization - Quick Start

## ✅ What's Been Set Up

I've implemented a complete database monitoring and cost optimization system for your Neon database.

### 📦 New Files Created

1. **`/lib/db/monitoring.ts`** - Database statistics and cost estimation
2. **`/lib/db/archiving.ts`** - Data archiving and cleanup functions
3. **`/scripts/db-monitor.ts`** - CLI tool for monitoring
4. **`/app/api/db-stats/route.ts`** - API endpoint for stats
5. **`DATABASE_OPTIMIZATION.md`** - Complete documentation

### 🎯 Quick Commands

```bash
# View current database stats and costs
npm run db:monitor

# Preview what would be archived (safe, no deletion)
npm run db:archive-preview

# Actually archive old data (⚠️ deletes data!)
npm run db:archive
```

## 📊 What You Get

### Database Statistics
- User, post, message counts
- Estimated storage usage (MB/GB)
- Storage breakdown by table

### Cost Estimates
- Current monthly storage cost
- Compute cost estimates (low/medium/high usage)
- Total cost projections

### Optimization Insights
- Data older than 1 year (archivable)
- Inactive users (no activity in 6 months)
- Potential cost savings

## 💡 Usage Examples

### 1. Weekly Health Check
```bash
npm run db:monitor
```

**Output Example:**
```
📊 CURRENT USAGE:
  Users: 150
  Posts: 1,245
  Messages: 3,421
  Estimated Storage: 45.32 MB (0.04 GB)

💰 ESTIMATED MONTHLY COSTS:
  Storage: $0.02
  Compute (Low usage): $8.40
  Compute (Medium usage): $25.20
  Total Estimate (Low): $8.42
  Total Estimate (Medium): $25.22
```

### 2. API Integration

```javascript
// Fetch stats in your admin dashboard
const response = await fetch('/api/db-stats?includeArchivable=true')
const { stats, costs, archivable } = await response.json()

console.log(`Monthly cost: $${costs.totalEstimate.medium}`)
console.log(`Can save: ${archivable.estimatedStorageSavingsMB} MB`)
```

### 3. Automated Archiving (Future)

Set up a cron job to run monthly:
```bash
# In your deployment platform (Vercel, etc.)
0 0 1 * * npm run db:archive  # First day of each month
```

## 🚨 Important Safety Features

### Dry Run Mode (Default)
All archive operations default to **dry run** mode:
- Shows what WOULD be deleted
- **Doesn't actually delete** anything
- Safe to run anytime

```typescript
// This is SAFE - just previews
await archiveOldPosts(365, true)  // dryRun = true

// This DELETES data
await archiveOldPosts(365, false) // dryRun = false
```

## 📈 Expected Costs Based on Your Growth

| Timeframe | Users | Monthly Cost | Action |
|-----------|-------|--------------|--------|
| **Months 1-6** | 0-500 | $5-25 | Monitor weekly |
| **Months 7-12** | 500-2K | $25-75 | Start archiving preview |
| **Year 2** | 2K-5K | $50-130 | Run quarterly archives |
| **Year 3** | 5K-20K | $130-315 | Implement automation |

## 🎬 Next Steps

### Immediate (This Week)
1. ✅ Review `DATABASE_OPTIMIZATION.md`
2. ✅ Run `npm run db:monitor` to see current stats
3. ✅ Set up Neon billing alerts ($10, $25, $50)

### Short-term (This Month)
1. Add stats monitoring to your admin dashboard
2. Set calendar reminder for monthly cost review
3. Test archive preview: `npm run db:archive-preview`

### Long-term (Quarterly)
1. Review archivable data
2. Run archives if storage > 1 GB
3. Consider moving images to Cloudflare R2

## 🔧 Customization

### Change Archive Age
Edit `/lib/db/archiving.ts`:
```typescript
// Archive after 2 years instead of 1
await archiveOldPosts(730, false)  // 730 days
```

### Selective Archiving
```typescript
// Only archive messages, keep posts
await runArchiveOperation({
  archivePosts: false,
  archiveMessages: true,
  olderThanDays: 365
})
```

## 💰 Cost Savings Examples

### Scenario 1: Small Growth
- **Current**: 45 MB storage = $0.02/month
- **After 1 year**: 500 MB = $0.18/month
- **With archiving**: Keep at 200 MB = $0.07/month
- **Savings**: $0.11/month ($1.32/year)

### Scenario 2: Rapid Growth
- **Current**: 2 GB storage = $0.70/month
- **After 1 year**: 10 GB = $3.50/month
- **With archiving**: Keep at 5 GB = $1.75/month
- **Savings**: $1.75/month ($21/year)

### Scenario 3: Large Scale
- **Current**: 20 GB storage = $7/month
- **After 1 year**: 50 GB = $17.50/month
- **With archiving**: Keep at 25 GB = $8.75/month
- **Savings**: $8.75/month ($105/year)

## 📞 Support

### Documentation
- **Full guide**: `DATABASE_OPTIMIZATION.md`
- **Code**: `/lib/db/monitoring.ts` and `/lib/db/archiving.ts`
- **Neon docs**: https://neon.tech/docs

### Troubleshooting
```bash
# If commands fail, check:
1. DATABASE_URL is set in .env.local
2. dotenv package is installed
3. Database connection works: npm run db:studio
```

## ✨ Key Benefits

✅ **Visibility**: Know exactly what your database costs
✅ **Control**: Preview before deleting anything
✅ **Automation-ready**: Easy to schedule via cron
✅ **Safe**: Dry run mode prevents accidents
✅ **Scalable**: Works from 10 users to 100,000+

---

**Created**: October 2025
**Status**: ✅ Ready to use
**Next Review**: Run `npm run db:monitor` weekly
