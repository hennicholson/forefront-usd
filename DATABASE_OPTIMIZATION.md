# Database Cost Optimization Guide

This guide explains how to monitor and optimize your Neon database costs for the Forefront USD platform.

## 📊 Monitoring Commands

### View Current Database Statistics
```bash
npm run db:monitor
```

This will show:
- Total users, posts, messages, etc.
- Estimated storage usage
- **Estimated monthly costs** (storage + compute)
- Data that can be archived
- Inactive users

### Preview What Would Be Archived (Safe - No Deletion)
```bash
npm run db:archive-preview
```

This dry run shows:
- How many posts/messages/comments would be deleted
- How much storage would be freed
- Estimated cost savings

### Actually Archive Old Data (⚠️ DESTRUCTIVE!)
```bash
npm run db:archive
```

**WARNING**: This **permanently deletes** data older than 365 days!
- Make sure you have backups
- Run `db:archive-preview` first
- Only run this in production with proper authorization

## 📈 API Endpoint

You can also fetch statistics via API:

```bash
# Basic stats
GET /api/db-stats

# Include archivable data analysis
GET /api/db-stats?includeArchivable=true

# Include inactive user count
GET /api/db-stats?includeInactive=true
```

Example response:
```json
{
  "stats": {
    "totalUsers": 150,
    "totalPosts": 1200,
    "totalMessages": 3400,
    "estimatedStorageMB": 45.32
  },
  "costs": {
    "storageCostPerMonth": 0.02,
    "estimatedComputeCostPerMonth": {
      "low": 8.40,
      "medium": 25.20,
      "high": 42.00
    },
    "totalEstimate": {
      "low": 8.42,
      "medium": 25.22,
      "high": 42.02
    }
  }
}
```

## 💰 Cost Optimization Strategies

### 1. Regular Monitoring (Weekly)
```bash
# Add to your weekly routine
npm run db:monitor
```

Track growth trends and identify issues early.

### 2. Archive Old Data (Quarterly)
```bash
# Every 3 months, preview and archive
npm run db:archive-preview
npm run db:archive  # Only if savings are significant
```

**When to archive:**
- Storage > 1 GB
- Old posts cost > $0.10/month
- Data is older than 1 year

### 3. Connection Pooling (✅ Already Enabled)
Your `DATABASE_URL` uses the `-pooler` endpoint, which:
- Reduces connection overhead
- Enables "scale to zero" after 5 minutes
- **Saves ~30-50% on compute costs**

### 4. Query Optimization

**BAD** - Wastes compute:
```typescript
// Polling every second
setInterval(() => {
  db.query(...)
}, 1000)
```

**GOOD** - On-demand queries:
```typescript
// Only query when user takes action
onClick={() => {
  db.query(...)
})
```

### 5. Offload Large Files

Store images/videos in cheap storage:
- **Cloudflare R2**: $0.015/GB/month
- **AWS S3**: $0.023/GB/month
- **Neon**: $0.35/GB/month ❌

Only store URLs in your database.

## 📅 Recommended Schedule

| Frequency | Task | Command |
|-----------|------|---------|
| **Weekly** | Check stats | `npm run db:monitor` |
| **Monthly** | Review costs | Check Neon dashboard |
| **Quarterly** | Archive preview | `npm run db:archive-preview` |
| **Yearly** | Archive old data | `npm run db:archive` |

## 🚨 Cost Alerts

### Neon Dashboard Setup

1. Go to https://console.neon.tech
2. Select your project
3. Click "Settings" → "Billing"
4. Set up alerts:
   - **$10/month** - Early warning
   - **$25/month** - Review optimization
   - **$50/month** - Urgent action needed

### Email Notifications

Neon will email you when:
- Storage exceeds thresholds
- Compute usage spikes
- Monthly bill projection increases

## 🔧 Customizing Archiving

Edit `/lib/db/archiving.ts` to change:

```typescript
// Archive data older than 2 years instead of 1
await archiveOldPosts(730, false)  // 730 days = 2 years

// Only archive messages, keep posts
await runArchiveOperation({
  archivePosts: false,      // Keep posts
  archiveMessages: true,    // Archive messages
  archiveComments: true,
  olderThanDays: 365,
  dryRun: false
})
```

## 📊 Understanding Costs

### Neon Scale Pricing
- **Storage**: $0.35 per GB per month
- **Compute**: $0.14 per CU (compute unit) per hour
- **Scale to zero**: After 5 minutes of inactivity (SAVES MONEY!)

### Example: 1,000 Users
- **Storage**: ~2 GB = $0.70/month
- **Compute**: 12 hrs/day @ 0.5 CU = $25/month
- **Total**: ~$26/month

### Cost Breakdown by Data Type
| Data Type | Size per Item | 1,000 Items | 10,000 Items |
|-----------|---------------|-------------|--------------|
| User profiles | 5 KB | 5 MB | 50 MB |
| Posts | 2 KB | 2 MB | 20 MB |
| Messages | 1 KB | 1 MB | 10 MB |
| Comments | 500 B | 500 KB | 5 MB |
| Reactions | 100 B | 100 KB | 1 MB |

## 🆘 Troubleshooting

### Storage Growing Too Fast?
1. Check for duplicate data
2. Look for large JSONB fields
3. Consider moving images to R2/S3

### Compute Costs High?
1. Check for polling loops
2. Review query efficiency
3. Ensure connections are closed
4. Verify autosuspend is working

### Need Help?
- Check Neon docs: https://neon.tech/docs
- Review query logs in Neon dashboard
- Run `npm run db:monitor` to identify issues

## 📝 Best Practices

✅ **DO:**
- Monitor weekly
- Archive annually
- Use connection pooling
- Close idle connections
- Set up billing alerts

❌ **DON'T:**
- Run constant polling
- Store files in database
- Ignore growing storage
- Delete data without backups
- Skip dry runs before archiving

## 🎯 Target Costs

Based on user count, target these monthly costs:

| Users | Target Cost | Action if Exceeded |
|-------|-------------|-------------------|
| 0-500 | $0-15 | Review queries |
| 500-2K | $15-40 | Start archiving |
| 2K-5K | $40-75 | Optimize heavily |
| 5K-10K | $75-150 | Consider scaling strategy |
| 10K+ | $150-300 | Enterprise planning |

---

**Last Updated**: October 2025
**Neon Pricing**: https://neon.tech/pricing
