import { useState } from 'react'
import { motion } from 'framer-motion'
import { useQuery } from '@tanstack/react-query'
import { Globe, Building2, Users, Shield, Plus, ChevronRight, Loader2, Pause, Play, Trash2, Settings, MessageSquare, CreditCard, Power } from 'lucide-react'
import { collegesAPI, platformAPI } from '../services/api'
import { formatNumber } from '../lib/utils'
import toast from 'react-hot-toast'
import { ticketsAPI } from '../services/api'



function CollegeDetailModal({ college, onClose }) {
  const [status, setStatus] = useState(college.status || 'active')
  const [isUpdating, setIsUpdating] = useState(false)

  const [isEditing, setIsEditing] = useState(false)
  const [editName, setEditName] = useState(college.collegeName)

  const handlePause = async () => {
    const newStatus = status === 'active' ? 'paused' : 'active'
    let reason = null
    if (newStatus === 'paused') {
      reason = window.prompt('Enter reason for suspension:')
      if (reason === null) return // Cancelled
    }
    
    setIsUpdating(true)
    try {
      await collegesAPI.updateStatus(college.$id, newStatus, reason)
      setStatus(newStatus)
      toast.success(`College ${newStatus === 'active' ? 'resumed' : 'paused'} successfully`)
    } catch (err) {
      toast.error('Failed to update college status')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleEditSave = async () => {
    if (!editName.trim()) return toast.error('College name cannot be empty')
    setIsUpdating(true)
    try {
      await collegesAPI.edit(college.$id, { collegeName: editName })
      toast.success('College name updated')
      setIsEditing(false)
      onClose(true) // trigger refetch
    } catch (err) {
      toast.error('Failed to update college')
    } finally {
      setIsUpdating(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${college.collegeName}? This action is irreversible.`)) {
      setIsUpdating(true)
      try {
        await collegesAPI.delete(college.$id)
        toast.success('College deleted successfully')
        onClose(true) // trigger refetch
      } catch (err) {
        toast.error('Failed to delete college')
        setIsUpdating(false)
      }
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => onClose(false)} />
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative glass-card w-full max-w-3xl max-h-[85vh] flex flex-col overflow-hidden border border-slate-700/50 shadow-2xl">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 bg-slate-800/40 shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center gap-3 mb-2">
                {isEditing ? (
                  <input
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="bg-slate-700 text-white px-2 py-1 rounded text-lg font-bold w-full max-w-xs focus:outline-none"
                    autoFocus
                  />
                ) : (
                  <h2 className="text-2xl font-display font-bold text-white">{college.collegeName}</h2>
                )}
                {status === 'paused' && (
                  <span className="px-2 py-1 text-xs font-bold rounded-md bg-yellow-500/20 text-yellow-500 border border-yellow-500/30">
                    PAUSED
                  </span>
                )}
              </div>
              <div className="font-mono text-sm text-eco-400 mt-1">{college.collegeUniqueId}</div>
            </div>
            <div className="flex items-center gap-2">
              {isEditing ? (
                <>
                  <button onClick={handleEditSave} disabled={isUpdating} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-eco-500 hover:bg-eco-600 text-white transition-colors">Save</button>
                  <button onClick={() => setIsEditing(false)} disabled={isUpdating} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-600 hover:bg-slate-500 text-white transition-colors">Cancel</button>
                </>
              ) : (
                <button onClick={() => setIsEditing(true)} disabled={isUpdating} className="px-3 py-1.5 rounded-lg text-sm font-medium bg-slate-700 hover:bg-slate-600 text-white transition-colors">Edit</button>
              )}
              <button 
                onClick={handlePause} 
                disabled={isUpdating}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  status === 'active' 
                    ? 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 border border-yellow-500/30' 
                    : 'bg-eco-500/10 text-eco-400 hover:bg-eco-500/20 border border-eco-500/30'
                }`}
              >
                {status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {status === 'active' ? 'Pause Services' : 'Resume Services'}
              </button>
              <button 
                onClick={handleDelete} 
                disabled={isUpdating}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium bg-red-500/10 text-red-500 hover:bg-red-500/20 border border-red-500/30 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
              <button onClick={() => onClose(false)} className="ml-2 p-2 bg-slate-700 rounded-full hover:bg-slate-600 text-white transition-colors">&times;</button>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-6">
             <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
               <div className="text-xs text-gray-400 uppercase">Registered Students</div>
               <div className="text-xl font-bold text-white mt-1">{college.members || 0}</div>
             </div>
             <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
               <div className="text-xs text-gray-400 uppercase">Total XP Mined</div>
               <div className="text-xl font-bold text-eco-400 mt-1">{formatNumber(college.totalXP || 0)}</div>
             </div>
             <div className="bg-slate-800/60 p-3 rounded-xl border border-slate-700/50">
               <div className="text-xs text-gray-400 uppercase">Admin Contact</div>
               <div className="text-sm font-medium text-white truncate mt-2" title={college.adminEmail}>{college.adminEmail || 'N/A'}</div>
             </div>
          </div>
        </div>

      </motion.div>
    </div>
  )
}

function RegisterCollegeModal({ onClose, onCreated }) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  const handleCreate = async () => {
    if (!name.trim() || !email.trim()) return toast.error('Enter college name and admin email')
    setLoading(true)
    try {
      const res = await collegesAPI.create({ collegeName: name, adminEmail: email })
      setResult(res.data)
      onCreated()
      toast.success('College registered!')
    } catch {
      toast.error('Failed to register college')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-card w-full max-w-md p-6 space-y-4">
        <h2 className="font-display font-bold text-white text-lg">Register New College</h2>
        {!result ? (
          <>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="College/University name" className="input-field" />
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Admin Email" type="email" className="input-field" />
            <div className="flex gap-3">
              <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleCreate} disabled={loading} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                {loading && <Loader2 className="w-4 h-4 animate-spin" />} Register
              </button>
            </div>
          </>
        ) : (
          <div className="glass-card p-4 border border-eco-500/30 space-y-3">
            <div className="text-2xl text-center">🎉</div>
            <div className="font-bold text-white text-center">{result.college.collegeName}</div>
            
            <div className="bg-slate-800 p-3 rounded-lg text-left mt-2">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">College ID</div>
              <div className="font-mono font-bold text-eco-400">{result.college.collegeUniqueId}</div>
            </div>

            <div className="bg-slate-800 p-3 rounded-lg text-left">
              <div className="text-xs text-gray-400 uppercase tracking-widest mb-1">Admin Credentials</div>
              <div className="text-sm text-white">Email: {result.adminEmail}</div>
              <div className="text-sm text-white mt-1 flex gap-2">Password: <span className="font-mono text-yellow-500">{result.adminPassword}</span></div>
            </div>
            
            <button onClick={onClose} className="btn-primary w-full text-sm mt-3">Done</button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

function PlatformSettingsTab({ settings }) {
  const [globalStatus, setGlobalStatus] = useState(settings?.isGlobalServiceActive ?? true)
  const [chatbotStatus, setChatbotStatus] = useState(settings?.isChatbotEnabled ?? true)
  const [reason, setReason] = useState(settings?.globalSuspensionReason || '')
  const [loading, setLoading] = useState(false)

  const handleSave = async () => {
    setLoading(true)
    try {
      await platformAPI.updateSettings({
        isGlobalServiceActive: globalStatus,
        globalSuspensionReason: reason,
        isChatbotEnabled: chatbotStatus
      })
      toast.success('Platform settings updated successfully')
    } catch {
      toast.error('Failed to update platform settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6 animate-slide-up max-w-2xl">
      <div className="glass-card p-6 space-y-6">
        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><Power className="w-5 h-5 text-red-400" /> Global Kill Switch</h3>
          <p className="text-sm text-gray-400 mb-4">Disable all services across the entire platform. Only Super Admins will be able to log in.</p>
          
          <div className="flex items-center gap-4">
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked={globalStatus} onChange={(e) => setGlobalStatus(e.target.checked)} />
              <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-eco-500"></div>
              <span className="ml-3 text-sm font-medium text-white">{globalStatus ? 'Services Active' : 'Services Paused'}</span>
            </label>
          </div>

          {!globalStatus && (
            <div className="mt-4">
              <label className="block text-sm text-gray-400 mb-1">Global Suspension Reason (Visible to all users)</label>
              <textarea 
                value={reason} 
                onChange={(e) => setReason(e.target.value)} 
                placeholder="e.g. Platform is undergoing scheduled maintenance..."
                className="input-field min-h-[80px]"
              />
            </div>
          )}
        </div>

        <div className="h-px bg-slate-700/50" />

        <div>
          <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2"><MessageSquare className="w-5 h-5 text-ocean-400" /> AI Chatbot Control</h3>
          <p className="text-sm text-gray-400 mb-4">Enable or disable the global AI Chatbot for all users.</p>
          
          <label className="relative inline-flex items-center cursor-pointer">
            <input type="checkbox" className="sr-only peer" checked={chatbotStatus} onChange={(e) => setChatbotStatus(e.target.checked)} />
            <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-ocean-500"></div>
            <span className="ml-3 text-sm font-medium text-white">{chatbotStatus ? 'Chatbot Enabled' : 'Chatbot Disabled'}</span>
          </label>
        </div>

        <div className="pt-4 border-t border-slate-700/50">
          <button onClick={handleSave} disabled={loading} className="btn-primary flex items-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />} Save Settings
          </button>
        </div>
      </div>
    </div>
  )
}

function SupportTicketsTab() {
  const [selectedTicket, setSelectedTicket] = useState(null)
  const [replyText, setReplyText] = useState('')
  const [isUpdating, setIsUpdating] = useState(false)

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['admin-tickets'],
    queryFn: () => ticketsAPI.getAll(),
  })

  const tickets = data?.data?.tickets || []

  const handleUpdate = async (status) => {
    setIsUpdating(true)
    try {
      await ticketsAPI.update(selectedTicket.$id, { status, adminReply: replyText })
      toast.success('Ticket updated')
      setSelectedTicket(null)
      refetch()
    } catch {
      toast.error('Failed to update ticket')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {tickets.length === 0 && !isLoading && (
        <div className="text-center p-8 text-gray-500 glass-card">No support tickets found.</div>
      )}
      {tickets.map(ticket => (
        <div key={ticket.$id} className="glass-card p-4 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
                ticket.status === 'open' ? 'bg-yellow-500/20 text-yellow-500' :
                ticket.status === 'approved' ? 'bg-eco-500/20 text-eco-400' :
                ticket.status === 'denied' ? 'bg-red-500/20 text-red-500' :
                'bg-gray-500/20 text-gray-400'
              }`}>{ticket.status}</span>
              <span className={`px-2 py-0.5 text-xs rounded border ${
                ticket.priority === 'critical' ? 'border-red-500 text-red-500' :
                ticket.priority === 'high' ? 'border-orange-500 text-orange-500' :
                'border-gray-500 text-gray-400'
              }`}>{ticket.priority}</span>
              <span className="text-sm text-gray-400">{new Date(ticket.$createdAt).toLocaleDateString()}</span>
            </div>
            <h3 className="text-lg font-bold text-white">{ticket.subject}</h3>
            <div className="text-sm text-gray-400 flex items-center gap-2 mt-1">
              <Building2 className="w-4 h-4" /> {ticket.collegeId}
            </div>
          </div>
          <button onClick={() => { setSelectedTicket(ticket); setReplyText(ticket.adminReply || ''); }} className="btn-secondary text-sm">View Details</button>
        </div>
      ))}

      {selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTicket(null)} />
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="relative glass-card w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
            <div className="p-3 bg-slate-800/50 rounded-lg text-sm text-gray-300 whitespace-pre-wrap">
              {selectedTicket.description}
            </div>
            
            <div className="mt-4">
              <label className="label">Admin Reply</label>
              <textarea 
                value={replyText} 
                onChange={e => setReplyText(e.target.value)} 
                className="input-field min-h-[100px]" 
                placeholder="Write your response here..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button onClick={() => setSelectedTicket(null)} className="btn-secondary flex-1">Cancel</button>
              <button onClick={() => handleUpdate('denied')} disabled={isUpdating} className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 hover:bg-red-500/30 transition-colors flex-1">Deny</button>
              <button onClick={() => handleUpdate('approved')} disabled={isUpdating} className="px-4 py-2 rounded-lg bg-eco-500/20 text-eco-400 hover:bg-eco-500/30 transition-colors flex-1">Approve</button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}

function SubscriptionsTab({ colleges, refetch }) {
  const handlePlanChange = async (collegeId, plan, status) => {
    try {
      await collegesAPI.updateSubscription(collegeId, { subscriptionPlan: plan, paymentStatus: status })
      toast.success('Subscription updated successfully')
      refetch()
    } catch (err) {
      toast.error('Failed to update subscription')
    }
  }

  return (
    <div className="space-y-4 animate-slide-up">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="glass-card p-5">
          <div className="text-sm text-gray-400">Total Revenue (MRR)</div>
          <div className="text-2xl font-bold text-white mt-1">
            ₹{new Intl.NumberFormat('en-IN').format(colleges.filter(c => c.subscriptionPlan === 'premium').length * 1499 + colleges.filter(c => c.subscriptionPlan === 'enterprise').length * 10000)}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-sm text-gray-400">Premium Colleges</div>
          <div className="text-2xl font-bold text-ocean-400 mt-1">
            {colleges.filter(c => c.subscriptionPlan === 'premium' || c.subscriptionPlan === 'enterprise').length}
          </div>
        </div>
        <div className="glass-card p-5">
          <div className="text-sm text-gray-400">Past Due Payments</div>
          <div className="text-2xl font-bold text-red-400 mt-1">
            {colleges.filter(c => c.paymentStatus === 'past_due').length}
          </div>
        </div>
      </div>

      <div className="glass-card overflow-hidden">
        <table className="w-full text-left text-sm text-gray-300">
          <thead className="bg-slate-800/50 text-xs uppercase text-gray-400 border-b border-slate-700/50">
            <tr>
              <th className="px-6 py-4">College Name</th>
              <th className="px-6 py-4">Plan</th>
              <th className="px-6 py-4">Payment Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/50">
            {colleges.map(c => (
              <tr key={c.$id} className="hover:bg-slate-800/20">
                <td className="px-6 py-4 font-medium text-white">{c.collegeName}</td>
                <td className="px-6 py-4">
                  <select 
                    value={c.subscriptionPlan || 'free'} 
                    onChange={(e) => handlePlanChange(c.$id, e.target.value, c.paymentStatus || 'active')}
                    className="bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs"
                  >
                    <option value="free">Free</option>
                    <option value="premium">Premium (₹1,499/month)</option>
                    <option value="enterprise">Enterprise (₹10,000/month)</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  <select 
                    value={c.paymentStatus || 'active'} 
                    onChange={(e) => handlePlanChange(c.$id, c.subscriptionPlan || 'free', e.target.value)}
                    className={`bg-slate-800 border rounded px-2 py-1 text-xs ${
                      c.paymentStatus === 'past_due' ? 'border-red-500 text-red-400' : 'border-slate-700'
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="past_due">Past Due</option>
                    <option value="canceled">Canceled</option>
                  </select>
                </td>
                <td className="px-6 py-4">
                  {c.paymentStatus === 'past_due' && (
                    <button 
                      onClick={() => handlePlanChange(c.$id, 'free', 'canceled')}
                      className="text-xs bg-red-500/10 text-red-400 px-2 py-1 rounded hover:bg-red-500/20"
                    >
                      Downgrade to Free
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default function SuperAdmin() {
  const [activeTab, setActiveTab] = useState('colleges')
  const [showRegister, setShowRegister] = useState(false)
  const [selectedCollege, setSelectedCollege] = useState(null)
  
  const { data, refetch } = useQuery({
    queryKey: ['colleges'],
    queryFn: () => collegesAPI.getAll(),
  })

  const { data: settingsData } = useQuery({
    queryKey: ['platform-settings'],
    queryFn: () => platformAPI.getSettings(),
  })

  const colleges = data?.data?.colleges || []
  const totalUsers = colleges.reduce((a, c) => a + (c.members || 0), 0)
  const totalXP = colleges.reduce((a, c) => a + (c.totalXP || 0), 0)

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title flex items-center gap-2"><Shield className="w-6 h-6 text-purple-400" /> Super Admin Dashboard</h1>
          <p className="page-subtitle">Global platform management and monitoring</p>
        </div>
        {activeTab === 'colleges' && (
          <button onClick={() => setShowRegister(true)} className="btn-primary flex items-center gap-2 text-sm">
            <Plus className="w-4 h-4" /> Register College
          </button>
        )}
      </div>

      <div className="flex gap-4 border-b border-slate-700/50 pb-px mb-6 overflow-x-auto">
        {[
          { id: 'colleges', label: 'Colleges', icon: Building2 },
          { id: 'subscriptions', label: 'Billing & Plans', icon: CreditCard },
          { id: 'settings', label: 'Platform Settings', icon: Settings },
          { id: 'tickets', label: 'Support Tickets', icon: MessageSquare },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-3 font-medium text-sm border-b-2 transition-colors whitespace-nowrap ${
              activeTab === tab.id
                ? 'border-eco-500 text-eco-400'
                : 'border-transparent text-gray-400 hover:text-gray-300'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'colleges' && (
        <div className="space-y-6 animate-slide-up">
          {/* Global stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: 'Total Colleges', value: colleges.length, icon: Building2, color: 'bg-ocean-500' },
          { label: 'Total Users', value: totalUsers, icon: Users, color: 'bg-eco-500' },
          { label: 'Total XP Generated', value: formatNumber(totalXP), icon: Globe, color: 'bg-purple-500' },
          { label: 'Active Today', value: Math.floor(totalUsers * 0.3), icon: Shield, color: 'bg-yellow-500' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="stat-card glass-card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div className="stat-number">{value}</div>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      {/* College list */}
      <div>
        <h2 className="section-title">Registered Colleges</h2>
        <div className="space-y-3">
          {colleges.map((college, i) => (
            <motion.div
              key={college.$id}
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass-card-hover p-5 flex items-center gap-4 cursor-pointer"
              onClick={() => setSelectedCollege(college)}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-ocean-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white flex-shrink-0">
                {college.collegeName?.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-white">{college.collegeName}</div>
                <div className="font-mono text-xs text-eco-400 mt-0.5">{college.collegeUniqueId}</div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <div className="font-bold text-white">{college.members || 0}</div>
                  <div className="text-xs text-gray-500">Members</div>
                </div>
                <div>
                  <div className="font-bold text-eco-400">{formatNumber(college.totalXP || 0)}</div>
                  <div className="text-xs text-gray-500">Total XP</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-white transition-colors" />
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )}

      {activeTab === 'subscriptions' && (
        <SubscriptionsTab colleges={colleges} refetch={refetch} />
      )}

      {activeTab === 'settings' && (
        <PlatformSettingsTab settings={settingsData?.data?.settings} />
      )}

      {activeTab === 'tickets' && (
        <SupportTicketsTab />
      )}

      {showRegister && <RegisterCollegeModal onClose={() => setShowRegister(false)} onCreated={refetch} />}
      {selectedCollege && <CollegeDetailModal college={selectedCollege} onClose={(shouldRefetch) => { setSelectedCollege(null); if(shouldRefetch === true) refetch(); }} />}
    </div>
  )
}
