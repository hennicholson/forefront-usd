'use client'

import { useEffect, useState } from 'react'
import { WaitlistSphere } from '@/components/ui/waitlist-sphere'

export default function SphereTestPage() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/waitlist')
      .then(res => res.json())
      .then(data => {
        console.log('API Response:', data)
        setData(data)
        setLoading(false)
      })
      .catch(err => {
        console.error('Error:', err)
        setLoading(false)
      })
  }, [])

  if (loading) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl mb-4">Sphere Test Page</h1>

      <div className="mb-4 p-4 bg-gray-900 rounded">
        <h2 className="text-lg font-bold mb-2">API Data:</h2>
        <p>Total entries: {data?.entries?.length || 0}</p>
        <p>Entries with avatars: {data?.entries?.filter((e: any) => e.avatarUrl).length || 0}</p>

        <h3 className="text-md font-bold mt-4 mb-2">First 3 members:</h3>
        <div className="space-y-2">
          {data?.entries?.slice(0, 3).map((member: any, i: number) => (
            <div key={i} className="text-xs">
              <p>{member.firstName} {member.lastName} - Avatar: {member.avatarUrl ? '✅' : '❌'}</p>
              {member.avatarUrl && (
                <div className="mt-1">
                  <img
                    src={member.avatarUrl}
                    alt={member.firstName}
                    className="w-20 h-20 rounded-full object-cover"
                    onError={(e) => console.error(`Failed to load image for ${member.firstName}`)}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-lg font-bold mb-4">Waitlist Sphere Component:</h2>
        <WaitlistSphere
          className="w-full"
          containerSize={600}
        />
      </div>
    </div>
  )
}