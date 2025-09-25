import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  User, 
  GraduationCap, 
  Menu, 
  X, 
  Home, 
  Users, 
  BookOpen, 
  Trophy, 
  Settings, 
  Bell,
  Search,
  ChevronDown,
  Moon,
  Sun
} from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  currentPage?: string;
  onNavigate?: (page: string) => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  title = 'Dashboard', 
  currentPage = 'overview',
  onNavigate 
}) => {
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const navigation = [
    { id: 'overview', name: 'Dashboard', icon: Home, current: currentPage === 'overview' },
    { id: 'students', name: 'Students', icon: Users, current: currentPage === 'students' },
    { id: 'marks', name: 'Marks Entry', icon: BookOpen, current: currentPage === 'marks' },
    { id: 'merit', name: 'Merit List', icon: Trophy, current: currentPage === 'merit' },
  ];

  const handleNavigation = (pageId: string) => {
    if (onNavigate) {
      onNavigate(pageId);
    }
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-gradient-dark relative">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-accent-500/3 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gold-500/3 rounded-full blur-3xl animate-pulse-slow" style={{animationDelay: '2s'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-accent-500/2 to-gold-500/2 rounded-full blur-3xl"></div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute inset-0 bg-dark-900/80 backdrop-blur-sm"></div>
        </div>
      )}

      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full glass-light border-r border-dark-600/50 backdrop-blur-xl">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-dark-600/50">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-accent p-2 rounded-xl shadow-glow">
                <GraduationCap className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold gradient-text">Merit System</h1>
                <p className="text-xs text-gray-400">Academic Platform</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400" />
            </button>
          </div>

          {/* User Profile */}
          {/* <div className="p-6 border-b border-dark-600/50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-100 truncate">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-gray-400 truncate">{user?.email || 'admin@example.com'}</p>
              </div>
              <ChevronDown className="h-4 w-4 text-gray-400" />
            </div>
          </div> */}

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavigation(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-200 group ${
                  item.current
                    ? 'bg-gradient-accent text-white shadow-glow'
                    : 'text-gray-300 hover:text-white hover:bg-dark-700/50'
                }`}
              >
                <item.icon className={`h-5 w-5 ${item.current ? 'text-white' : 'text-gray-400 group-hover:text-accent-400'}`} />
                <span className="font-medium">{item.name}</span>
                {item.current && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </button>
            ))}
          </nav>

          {/* Sidebar Footer */}
          <div className="p-4 border-t border-dark-600/50 space-y-2">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:text-white hover:bg-dark-700/50 transition-all duration-200"
            >
              {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              <span className="font-medium">Theme</span>
            </button>
            <button
              onClick={logout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-gray-300 hover:text-red-400 hover:bg-red-500/10 transition-all duration-200"
            >
              <LogOut className="h-5 w-5" />
              <span className="font-medium">Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-72">
        {/* Top Header */}
        <header className="sticky top-0 z-30 glass-light border-b border-dark-600/50 backdrop-blur-xl">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
              >
                <Menu className="h-6 w-6 text-gray-300" />
              </button>

              {/* Page Title */}
              <div className="flex-1 lg:flex-none">
                <h1 className="text-xl font-bold text-gray-100">{title}</h1>
              </div>

              {/* Header Actions */}
              <div className="flex items-center space-x-4">
                {/* Search */}
                <div className="hidden md:block relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search..."
                    className="input-dark pl-10 pr-4 py-2 w-64 text-sm"
                  />
                </div>

                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-dark-700/50 transition-colors">
                  <Bell className="h-5 w-5 text-gray-300" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full animate-pulse"></div>
                </button>

                {/* User Menu */}
                <div className="hidden sm:flex items-center space-x-3 bg-dark-800/50 border border-dark-600 px-3 py-2 rounded-xl">
                  <div className="w-8 h-8 bg-gradient-accent rounded-lg flex items-center justify-center">
                    <User className="h-4 w-4 text-white" />
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-100">{user?.name || 'Admin'}</p>
                    <p className="text-xs text-gray-400">Administrator</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="relative z-10">
          <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;