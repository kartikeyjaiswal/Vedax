import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import BottomNav from './BottomNav'
import TopBar from './TopBar'
import ChatbotWidget from '../chatbot/ChatbotWidget'

export default function AppLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => window.innerWidth > 1024)

  return (
    <div className="min-h-screen bg-surface flex flex-col overflow-hidden">
      {/* Fixed TopBar */}
      <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-slate-900 border-b border-slate-700/50 px-4 md:px-6 flex items-center">
        <TopBar toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} isSidebarOpen={isSidebarOpen} />
      </header>

      <div className="flex flex-1 pt-16 h-[calc(100vh-4rem)]">
        {/* Sidebar */}
        <div className="z-40">
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
        </div>

        {/* Main content */}
        <div 
          className={`flex-1 flex flex-col h-full overflow-y-auto transition-all duration-300 ease-in-out ${
            isSidebarOpen ? 'lg:ml-64' : 'ml-0'
          }`}
        >
          <main className="flex-1 p-4 md:p-6 pb-24 lg:pb-6 max-w-7xl mx-auto w-full">
            <Outlet />
          </main>
        </div>
      </div>

      {/* Bottom navigation (mobile) */}
      <BottomNav />

      {/* AI Chatbot */}
      <ChatbotWidget />
    </div>
  )
}
