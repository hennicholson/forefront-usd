import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

let dbInstance: ReturnType<typeof drizzle> | null = null

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(target, prop) {
    if (!dbInstance) {
      if (!process.env.DATABASE_URL) {
        throw new Error('DATABASE_URL is not set')
      }
      const sql = neon(process.env.DATABASE_URL)
      dbInstance = drizzle(sql, { schema })
    }
    return Reflect.get(dbInstance, prop)
  }
})
