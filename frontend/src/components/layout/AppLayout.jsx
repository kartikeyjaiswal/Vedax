import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import TopBar from './TopBar'
import ChatbotWidget from '../chatbot/ChatbotWidget'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface flex">
      {/* Sidebar (desktop) */}
      <Sidebar />

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:ml-64">
        <TopBar />
        <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>

      {/* Bottom navigation (mobile) */}
      <BottomNav />

      {/* AI Chatbot */}
      <ChatbotWidget />
    </div>
  )
}
