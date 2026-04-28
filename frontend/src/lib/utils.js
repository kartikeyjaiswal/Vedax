export function cn(...inputs) {
  return inputs
    .flat()
    .filter(Boolean)
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}

export function formatNumber(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + 'M'
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K'
  return n?.toString() || '0'
}

export function getLevelInfo(points) {
  const levels = [
    { name: 'Seedling', min: 0, max: 200, color: '#86efac', emoji: '🌱' },
    { name: 'Sapling', min: 200, max: 500, color: '#4ade80', emoji: '🌿' },
    { name: 'Green Warrior', min: 500, max: 1000, color: '#22c55e', emoji: '🍃' },
    { name: 'Eco Guardian', min: 1000, max: 2000, color: '#16a34a', emoji: '🌳' },
    { name: 'Nature Champion', min: 2000, max: 4000, color: '#15803d', emoji: '🌲' },
    { name: 'Planet Protector', min: 4000, max: 8000, color: '#166534', emoji: '🌍' },
    { name: 'Eco Legend', min: 8000, max: 15000, color: '#3b82f6', emoji: '⚡' },
    { name: 'Earth Master', min: 15000, max: 30000, color: '#8b5cf6', emoji: '🏆' },
    { name: 'Climate Hero', min: 30000, max: 60000, color: '#f59e0b', emoji: '🦸' },
    { name: 'Eco God', min: 60000, max: Infinity, color: '#ef4444', emoji: '🌟' },
  ]
  const level = levels.findIndex(l => points >= l.min && points < l.max)
  const current = levels[Math.max(0, level)]
  const next = levels[Math.min(levels.length - 1, level + 1)]
  const progress = level === levels.length - 1
    ? 100
    : ((points - current.min) / (current.max - current.min)) * 100
  return { ...current, level: level + 1, progress: Math.round(progress), next }
}

export function getBadgeColor(badge) {
  const colors = {
    'Eco Warrior': 'from-green-500 to-emerald-700',
    'Energy Saver': 'from-yellow-400 to-orange-600',
    'Water Guardian': 'from-blue-400 to-cyan-600',
    'Tree Planter': 'from-green-400 to-lime-600',
    'Quiz Master': 'from-purple-500 to-violet-700',
    'Climate Champion': 'from-sky-400 to-blue-700',
    'Daily Streaker': 'from-orange-400 to-red-600',
    'Community Leader': 'from-pink-400 to-rose-600',
  }
  return colors[badge] || 'from-gray-500 to-gray-700'
}

export function timeAgo(date) {
  const seconds = Math.floor((new Date() - new Date(date)) / 1000)
  if (seconds < 60) return 'just now'
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm ago'
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h ago'
  return Math.floor(seconds / 86400) + 'd ago'
}
