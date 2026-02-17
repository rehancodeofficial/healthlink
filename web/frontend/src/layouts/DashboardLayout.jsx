import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import { useTheme } from '../context/ThemeContext';
import Chatbot from '../components/Chatbot';

export default function DashboardLayout({ children, role, user }) {
  const { theme } = useTheme();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div
      className={`flex min-h-screen bg-[var(--bg-main)] transition-colors duration-300 ${theme}`}
    >
      {/* Sidebar */}
      <Sidebar 
        role={role} 
        isMobileMenuOpen={isMobileMenuOpen}
        setIsMobileMenuOpen={setIsMobileMenuOpen}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <Topbar
          userId={user?.id || ''}
          userName={user?.name || localStorage.getItem('userName') || 'User'}
          isMobileMenuOpen={isMobileMenuOpen}
          setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        {/* Scrollable Content Area */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative">
          <div className="max-w-[1600px] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </main>
        
        {/* AI Medical Chatbot (Only for Patients) */}
        {role === 'PATIENT' && <Chatbot />}
      </div>
    </div>
  );
}
