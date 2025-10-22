// Test Prisma Accelerate connection
import { prisma } from './lib/prisma'

async function testConnection() {
  try {
    console.log('🔌 Testing Prisma Accelerate connection...')

    const userCount = await prisma.user.count()
    console.log(`✅ Connected! Found ${userCount} users in database`)

    const postCount = await prisma.post.count()
    console.log(`✅ Found ${postCount} posts`)

    const messageCount = await prisma.message.count()
    console.log(`✅ Found ${messageCount} messages`)

    console.log('🎉 Prisma Accelerate is working perfectly!')
  } catch (error) {
    console.error('❌ Connection failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testConnection()
