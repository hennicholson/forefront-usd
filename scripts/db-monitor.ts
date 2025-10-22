#!/usr/bin/env tsx

/**
 * Database Monitoring CLI
 *
 * Usage:
 *   npm run db:monitor          - View database statistics
 *   npm run db:archive-preview  - Preview what would be archived (dry run)
 *   npm run db:archive          - Actually archive old data (CAREFUL!)
 */

import 'dotenv/config'
import { printDatabaseReport } from '../lib/db/monitoring'
import { runArchiveOperation } from '../lib/db/archiving'

const command = process.argv[2] || 'monitor'

async function main() {
  switch (command) {
    case 'monitor':
    case 'stats':
      console.log('📊 Fetching database statistics...\n')
      await printDatabaseReport()
      break

    case 'archive-preview':
    case 'preview':
      console.log('🔍 Running archive preview (dry run)...\n')
      await runArchiveOperation({
        archivePosts: true,
        archiveMessages: true,
        archiveComments: true,
        cleanupOrphaned: true,
        olderThanDays: 365,
        dryRun: true
      })
      break

    case 'archive':
    case 'cleanup':
      console.log('⚠️  WARNING: This will DELETE old data permanently!')
      console.log('⚠️  Make sure you have backups before proceeding!\n')

      // In production, you'd want to add a confirmation prompt here
      console.log('🗑️  Running archive operation...\n')

      await runArchiveOperation({
        archivePosts: true,
        archiveMessages: true,
        archiveComments: true,
        cleanupOrphaned: true,
        olderThanDays: 365,
        dryRun: false
      })
      break

    default:
      console.log('Unknown command:', command)
      console.log('\nAvailable commands:')
      console.log('  monitor          - View database statistics')
      console.log('  archive-preview  - Preview what would be archived')
      console.log('  archive          - Archive old data (DESTRUCTIVE)')
      process.exit(1)
  }

  process.exit(0)
}

main().catch((error) => {
  console.error('Error:', error)
  process.exit(1)
})
