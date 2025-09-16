import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LogOut, User, GraduationCap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title = 'Dashboard' }) => {
  const { user, logout } = useAuth();

  return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200/50 sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center space-x-2 sm:space-x-3 min-w-0 flex-1">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-2 rounded-lg flex-shrink-0">
                  <GraduationCap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent truncate">
                    Merit List System
                  </h1>
                  <p className="text-xs sm:text-sm text-gray-500 font-medium truncate">{title}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0">
                <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-700 bg-gray-100 px-3 py-2 rounded-lg">
                  <User className="h-4 w-4" />
                  <span className="font-medium truncate max-w-24">{user?.name}</span>
                </div>
                <button
                  onClick={logout}
                  className="flex items-center space-x-1 sm:space-x-2 px-2 sm:px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 hover:shadow-md"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
          <div className="animate-fadeIn">
            {children}
          </div>
        </main>
      </div>
  );
};

export default Layout;