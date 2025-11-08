'use client'

import { useEffect, useState } from 'react'

export default function AvatarTestPage() {
  const [members, setMembers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => {
        console.log('Full API Response:', data)
        if (data.entries) {
          setMembers(data.entries)
          // Log avatar data for debugging
          data.entries.forEach((m: any, i: number) => {
            if (m.avatarUrl) {
              console.log(`Member ${i} (${m.firstName}): Avatar length = ${m.avatarUrl.length} chars`)
            }
          })
        }
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8 text-white">Loading...</div>

  const membersWithAvatars = members.filter(m => m.avatarUrl)

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl mb-4">Avatar Test Page</h1>

      <div className="mb-4">
        <p>Total members: {members.length}</p>
        <p>Members with avatars: {membersWithAvatars.length}</p>
      </div>

      <h2 className="text-xl mb-4">All Avatars ({membersWithAvatars.length}):</h2>

      <div className="grid grid-cols-5 gap-4">
        {membersWithAvatars.map((member, i) => (
          <div key={i} className="text-center">
            <div className="relative w-32 h-32 mx-auto mb-2">
              <img
                src={member.avatarUrl}
                alt={`${member.firstName} ${member.lastName}`}
                className="w-full h-full rounded-full object-cover border-2 border-white/20"
                onLoad={() => console.log(`✅ Loaded avatar for ${member.firstName}`)}
                onError={(e) => {
                  console.error(`❌ Failed to load avatar for ${member.firstName}`)
                  console.error('Avatar URL start:', member.avatarUrl.substring(0, 100))
                }}
              />
            </div>
            <p className="text-xs">{member.firstName} {member.lastName}</p>
            <p className="text-xs opacity-50">AI: {member.aiProficiency}%</p>
          </div>
        ))}
      </div>
    </div>
  )
}