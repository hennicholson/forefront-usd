'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GridBackground } from '@/components/ui/grid-background'

interface WaitlistEntry {
  id: number
  firstName: string
  lastName: string
  email: string
  phone: string
  university: string | null
  year: string | null
  aiProficiency: number
  avatarUrl: string | null
  createdAt: string
}

interface Stats {
  totalSignups: number
  todaySignups: number
  growthRate: number
  avgProficiency: number
  universityStats: { name: string; value: number }[]
  yearStats: { name: string; value: number }[]
  proficiencyStats: { name: string; value: number }[]
  dailySignups: { name: string; value: number }[]
  users: WaitlistEntry[]
}

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [sortBy, setSortBy] = useState<'date' | 'name' | 'proficiency'>('date')
  const [showExportMenu, setShowExportMenu] = useState(false)
  const [showAvatarGallery, setShowAvatarGallery] = useState(false)

  // Check if already authenticated
  useEffect(() => {
    const auth = localStorage.getItem('waitlist_admin_auth')
    if (auth === 'authenticated') {
      setIsAuthenticated(true)
      loadStats()
    }
  }, [])

  // Auto-refresh stats every 30 seconds
  useEffect(() => {
    if (isAuthenticated) {
      const interval = setInterval(loadStats, 30000)
      return () => clearInterval(interval)
    }
  }, [isAuthenticated])

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === 'admin12345') {
      localStorage.setItem('waitlist_admin_auth', 'authenticated')
      setIsAuthenticated(true)
      setError('')
      loadStats()
    } else {
      setError('Invalid password')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('waitlist_admin_auth')
    setIsAuthenticated(false)
    setPassword('')
  }

  const loadStats = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/waitlist/stats')
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      }
    } catch (err) {
      console.error('Error loading stats:', err)
    } finally {
      setLoading(false)
    }
  }

  const exportToCSV = () => {
    if (!stats) return

    const csvContent = [
      ['First Name', 'Last Name', 'Email', 'Phone', 'University', 'Year', 'AI Proficiency', 'Signup Date'],
      ...stats.users.map(user => [
        user.firstName,
        user.lastName,
        user.email,
        user.phone,
        user.university || '',
        user.year || '',
        user.aiProficiency.toString(),
        new Date(user.createdAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `waitlist_export_${new Date().toISOString().split('T')[0]}.csv`
    link.click()
  }

  const downloadAvatar = async (avatarUrl: string, name: string) => {
    try {
      const response = await fetch(avatarUrl)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${name.toLowerCase().replace(/\s+/g, '-')}-avatar.png`
      link.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      console.error('Error downloading avatar:', err)
    }
  }

  const downloadAllAvatars = async () => {
    if (!stats) return

    const usersWithAvatars = stats.users.filter(user => user.avatarUrl)
    if (usersWithAvatars.length === 0) {
      alert('No avatars to download')
      return
    }

    // Download each avatar with a small delay to prevent overwhelming the browser
    for (const user of usersWithAvatars) {
      await downloadAvatar(user.avatarUrl!, `${user.firstName}-${user.lastName}`)
      await new Promise(resolve => setTimeout(resolve, 500)) // 500ms delay between downloads
    }
  }

  const filteredUsers = stats?.users?.filter(user =>
    user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.university?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  const sortedUsers = [...filteredUsers].sort((a, b) => {
    if (sortBy === 'date') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    if (sortBy === 'name') return a.firstName.localeCompare(b.firstName)
    if (sortBy === 'proficiency') return b.aiProficiency - a.aiProficiency
    return 0
  })

  if (!isAuthenticated) {
    return (
      <main className="min-h-screen relative bg-white">
        <GridBackground />
        <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md"
          >
            <div className="bg-white rounded-2xl shadow-2xl p-8 border-2 border-gray-100">
              <h1 className="text-3xl font-bold text-black mb-2">Admin Access</h1>
              <p className="text-gray-600 mb-6">Enter password to access dashboard</p>

              <form onSubmit={handleLogin} className="space-y-4">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
                  autoFocus
                />

                {error && (
                  <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-red-500 text-sm"
                  >
                    {error}
                  </motion.p>
                )}

                <button
                  type="submit"
                  className="w-full py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
                >
                  Login
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen relative bg-white">
      <GridBackground />
      <div className="relative z-10 p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-black">Waitlist Dashboard</h1>
            <p className="text-gray-600">Track your campaign performance</p>
          </div>
          <button
            onClick={handleLogout}
            className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-all"
          >
            Logout
          </button>
        </div>

        {loading && !stats ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
          </div>
        ) : stats ? (
          <div className="space-y-8">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-black to-gray-800 text-white rounded-2xl p-6"
              >
                <p className="text-sm opacity-80">Total Signups</p>
                <p className="text-3xl font-bold mt-2">{stats.totalSignups}</p>
                <p className={`text-sm mt-2 ${stats.growthRate >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {stats.growthRate >= 0 ? '↑' : '↓'} {Math.abs(stats.growthRate)}% growth
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6"
              >
                <p className="text-sm text-gray-600">Today's Signups</p>
                <p className="text-3xl font-bold text-black mt-2">{stats.todaySignups}</p>
                <p className="text-sm text-gray-500 mt-2">
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6"
              >
                <p className="text-sm text-gray-600">Avg AI Proficiency</p>
                <p className="text-3xl font-bold text-black mt-2">{stats.avgProficiency}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all"
                    style={{ width: `${stats.avgProficiency}%` }}
                  />
                </div>
              </motion.div>

            </div>

            {/* Distribution Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* University Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-black mb-4">Top Universities</h3>
                {stats.universityStats.length > 0 ? (
                  <div className="space-y-3">
                    {stats.universityStats.slice(0, 5).map((uni, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700 truncate max-w-[150px]">
                          {uni.name || 'Not specified'}
                        </span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-black h-2 rounded-full"
                              style={{ width: `${(uni.value / stats.totalSignups) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{uni.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No university data yet</p>
                )}
              </motion.div>

              {/* Year Distribution */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-black mb-4">Year Distribution</h3>
                {stats.yearStats.length > 0 ? (
                  <div className="space-y-3">
                    {stats.yearStats.map((year, i) => (
                      <div key={i} className="flex items-center justify-between">
                        <span className="text-sm text-gray-700">{year.name || 'Not specified'}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                              style={{ width: `${(year.value / stats.totalSignups) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-semibold">{year.value}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No year data yet</p>
                )}
              </motion.div>

              {/* Proficiency Ranges */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="bg-white border-2 border-gray-200 rounded-2xl p-6"
              >
                <h3 className="text-lg font-bold text-black mb-4">AI Proficiency Levels</h3>
                <div className="space-y-3">
                  {stats.proficiencyStats.map((range, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-700">{range.name}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-gradient-to-r from-green-500 to-emerald-600 h-2 rounded-full"
                            style={{ width: `${(range.value / stats.totalSignups) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm font-semibold">{range.value}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* Daily Signups Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6"
            >
              <h3 className="text-lg font-bold text-black mb-4">Signup Trend</h3>
              <div className="h-48 flex items-end gap-2">
                {stats.dailySignups.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div className="text-xs font-semibold mb-1">{day.value}</div>
                    <div
                      className="w-full bg-gradient-to-t from-black to-gray-600 rounded-t"
                      style={{ height: `${(day.value / Math.max(...stats.dailySignups.map(d => d.value))) * 100}%` }}
                    />
                    <div className="text-xs text-gray-500 mt-2 rotate-45 origin-left">
                      {day.name}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Avatar Gallery */}
            {showAvatarGallery && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-2xl p-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-black">Character Gallery</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {stats.users.filter(user => user.avatarUrl).length} avatars generated
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={downloadAllAvatars}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                    >
                      Download All ({stats.users.filter(user => user.avatarUrl).length})
                    </button>
                    <button
                      onClick={() => setShowAvatarGallery(false)}
                      className="px-4 py-2 bg-white text-black border-2 border-gray-200 font-semibold rounded-xl hover:bg-gray-50 transition-all"
                    >
                      Close Gallery
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {stats.users
                    .filter(user => user.avatarUrl)
                    .map((user) => (
                      <motion.div
                        key={user.id}
                        whileHover={{ scale: 1.05 }}
                        className="bg-white rounded-xl p-3 shadow-lg"
                      >
                        <div className="aspect-square mb-2 overflow-hidden rounded-lg">
                          <img
                            src={user.avatarUrl!}
                            alt={`${user.firstName} ${user.lastName}`}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <p className="text-xs font-semibold text-center mb-1 truncate">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs text-gray-500 text-center mb-2 truncate">
                          {user.university || 'No university'}
                        </p>
                        <button
                          onClick={() => downloadAvatar(user.avatarUrl!, `${user.firstName}-${user.lastName}`)}
                          className="w-full py-1 text-xs bg-black text-white rounded-lg hover:bg-gray-800 transition-all"
                        >
                          Download
                        </button>
                      </motion.div>
                    ))}
                </div>

                {stats.users.filter(user => user.avatarUrl).length === 0 && (
                  <p className="text-center text-gray-500 py-8">No generated avatars yet</p>
                )}
              </motion.div>
            )}

            {/* User Table */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="bg-white border-2 border-gray-200 rounded-2xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold text-black">Recent Signups</h3>
                <div className="flex gap-3">
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search users..."
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
                  />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-black transition-all"
                  >
                    <option value="date">Sort by Date</option>
                    <option value="name">Sort by Name</option>
                    <option value="proficiency">Sort by Proficiency</option>
                  </select>
                  <button
                    onClick={() => setShowAvatarGallery(!showAvatarGallery)}
                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-semibold rounded-xl hover:opacity-90 transition-all"
                  >
                    {showAvatarGallery ? 'Hide' : 'Show'} Gallery
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="px-6 py-2 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
                  >
                    Export CSV
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Avatar</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Name</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Email</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">University</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Year</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">AI Level</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-700">Date</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedUsers.slice(0, 10).map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50 transition-all">
                        <td className="py-3 px-2">
                          {user.avatarUrl ? (
                            <img
                              src={user.avatarUrl}
                              alt={`${user.firstName} ${user.lastName}`}
                              className="w-12 h-12 rounded-full object-cover border-2 border-gray-200"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-500 flex items-center justify-center text-white text-sm font-bold">
                              {user.firstName[0]}{user.lastName[0]}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-2">
                          <span className="text-sm font-medium">
                            {user.firstName} {user.lastName}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">{user.email}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{user.university || '-'}</td>
                        <td className="py-3 px-2 text-sm text-gray-600">{user.year || '-'}</td>
                        <td className="py-3 px-2">
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                                style={{ width: `${user.aiProficiency}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold">{user.aiProficiency}%</span>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-gray-600">
                          {new Date(user.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {user.avatarUrl ? (
                            <div className="flex gap-2 justify-center">
                              <button
                                onClick={() => window.open(user.avatarUrl!, '_blank')}
                                className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-lg transition-all"
                              >
                                View
                              </button>
                              <button
                                onClick={() => downloadAvatar(user.avatarUrl!, `${user.firstName}-${user.lastName}`)}
                                className="px-3 py-1 text-xs bg-black hover:bg-gray-800 text-white font-semibold rounded-lg transition-all"
                              >
                                Download
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">No avatar</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {sortedUsers.length > 10 && (
                <p className="text-center text-sm text-gray-500 mt-4">
                  Showing 10 of {sortedUsers.length} users
                </p>
              )}
            </motion.div>
          </div>
        ) : null}
      </div>
    </main>
  )
}