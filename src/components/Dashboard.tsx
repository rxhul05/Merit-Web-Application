import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import StudentManagement from './StudentManagement';
import MarksEntry from './MarksEntry';
import MeritList from './MeritList';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '../lib/supabase';
import { useToast } from './Toast';
import { 
  Users, 
  BookOpen, 
  Trophy, 
  TrendingUp,
  UserPlus,
  FileText,
  Award,
  AlertCircle,
  BarChart3,
  Activity,
  Clock,
  Star,
  ArrowUp,
  ArrowDown,
  Plus,
  Download,
  RefreshCw
} from 'lucide-react';

interface DashboardStats {
  totalStudents: number;
  totalSubjects: number;
  completedAssessments: number;
  averagePercentage: number;
}

const Dashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState<DashboardStats>({
    totalStudents: 0,
    totalSubjects: 0,
    completedAssessments: 0,
    averagePercentage: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Get total students
      const { count: studentsCount, error: studentsError } = await supabase
        .from('students')
        .select('*', { count: 'exact', head: true });

      if (studentsError) throw studentsError;

      // Get total subjects
      const { count: subjectsCount, error: subjectsError } = await supabase
        .from('subjects')
        .select('*', { count: 'exact', head: true });

      if (subjectsError) throw subjectsError;

      // Get completed assessments (students with marks)
      const { data: marksData, error: marksError } = await supabase
        .from('marks')
        //@ts-ignore
        .select('student_id', { distinct: true });

      if (marksError) throw marksError;

      // Calculate average percentage
      const { data: allMarks, error: allMarksError } = await supabase
        .from('marks')
        .select(`
          marks,
          subjects!inner(max_marks)
        `);

      if (allMarksError) throw allMarksError;

      let totalPercentage = 0;
      if (allMarks && allMarks.length > 0) {
        allMarks.forEach(mark => {
          //@ts-ignore
          const percentage = (mark.marks / mark.subjects.max_marks) * 100;
          totalPercentage += percentage;
        });
        totalPercentage = totalPercentage / allMarks.length;
      }

      setStats({
        totalStudents: studentsCount || 0,
        totalSubjects: subjectsCount || 0,
        completedAssessments: marksData?.length || 0,
        averagePercentage: Math.round(totalPercentage * 100) / 100
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load dashboard statistics';
      setError(errorMessage);
      showToast({
        type: 'error',
        title: 'Error Loading Dashboard',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon: Icon, color, trend, trendUp }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
    trend?: string;
    trendUp?: boolean;
  }) => (
    <div className="card-hover p-6 animate-scaleIn">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-2xl shadow-glow ${color} animate-glow`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        {trend && (
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-lg text-xs font-medium ${
            trendUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {trendUp ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />}
            <span>{trend}</span>
          </div>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-400 mb-1 uppercase tracking-wider">{title}</p>
        <p className="text-3xl font-bold gradient-text">{value}</p>
      </div>
    </div>
  );

  const QuickAction = ({ title, description, icon: Icon, onClick, color }: {
    title: string;
    description: string;
    icon: React.ElementType;
    onClick: () => void;
    color: string;
  }) => (
    <button
      onClick={onClick}
      className="p-4 bg-dark-800/50 border border-dark-600 rounded-2xl text-left transition-all duration-300 w-full group hover:border-accent-500/30 hover:bg-dark-700/50"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-3 rounded-xl shadow-glow ${color} group-hover:scale-110 transition-all duration-300 flex-shrink-0`}>
          <Icon className="h-5 w-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-semibold text-gray-100 group-hover:text-accent-300 transition-colors mb-1">{title}</h3>
          <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">{description}</p>
        </div>
        <ArrowUp className="h-4 w-4 text-gray-500 group-hover:text-accent-400 transform group-hover:rotate-45 transition-all duration-300" />
      </div>
    </button>
  );

  const handleNavigation = (page: string) => {
    setActiveTab(page);
  };

  if (activeTab === 'students') {
    return (
      <Layout title="Student Management" currentPage="students" onNavigate={handleNavigation}>
        <StudentManagement onBack={() => setActiveTab('overview')} />
      </Layout>
    );
  }

  if (activeTab === 'marks') {
    return (
      <Layout title="Marks Entry" currentPage="marks" onNavigate={handleNavigation}>
        <MarksEntry onBack={() => setActiveTab('overview')} />
      </Layout>
    );
  }

  if (activeTab === 'merit') {
    return (
      <Layout title="Merit List" currentPage="merit" onNavigate={handleNavigation}>
        <MeritList onBack={() => setActiveTab('overview')} />
      </Layout>
    );
  }

  if (loading) {
    return (
      <Layout title="Dashboard" currentPage="overview" onNavigate={handleNavigation}>
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard" currentPage="overview" onNavigate={handleNavigation}>
        <div className="flex items-center justify-center py-20">
          <div className="text-center card p-8 max-w-md mx-auto">
            <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-100 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-400 mb-6">{error}</p>
            <button
              onClick={loadDashboardStats}
              className="btn-primary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Try Again</span>
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard" currentPage="overview" onNavigate={handleNavigation}>
      <div className="p-6 space-y-8">
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-100 mb-2">Welcome back, Admin!</h1>
            <p className="text-gray-400">Here's what's happening with your academic system today.</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="bg-gradient-accent"
            trend="+12%"
            trendUp={true}
          />
          <StatCard
            title="Active Subjects"
            value={stats.totalSubjects}
            icon={BookOpen}
            color="bg-gradient-to-r from-emerald-500 to-teal-600"
            trend="+3%"
            trendUp={true}
          />
          <StatCard
            title="Assessments"
            value={stats.completedAssessments}
            icon={FileText}
            color="bg-gradient-to-r from-purple-500 to-indigo-600"
            trend="+8%"
            trendUp={true}
          />
          <StatCard
            title="Average Score"
            value={`${stats.averagePercentage}%`}
            icon={TrendingUp}
            color="bg-gradient-gold"
            trend="+2.3%"
            trendUp={true}
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Quick Actions */}
          <div className="xl:col-span-2">
            <div className="card p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-100 flex items-center">
                  <Activity className="h-5 w-5 text-accent-400 mr-2" />
                  Quick Actions
                </h2>
                <button className="text-accent-400 hover:text-accent-300 text-sm font-medium">
                  View All
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <QuickAction
                  title="Manage Students"
                  description="Add, edit, or remove student records"
                  icon={UserPlus}
                  onClick={() => setActiveTab('students')}
                  color="bg-gradient-accent"
                />
                <QuickAction
                  title="Enter Marks"
                  description="Input and manage student marks"
                  icon={BookOpen}
                  onClick={() => setActiveTab('marks')}
                  color="bg-gradient-to-r from-emerald-500 to-teal-600"
                />
                <QuickAction
                  title="Generate Merit List"
                  description="View and export merit lists"
                  icon={Trophy}
                  onClick={() => setActiveTab('merit')}
                  color="bg-gradient-gold"
                />
                <QuickAction
                  title="View Analytics"
                  description="Performance insights and reports"
                  icon={BarChart3}
                  onClick={() => console.log('Analytics')}
                  color="bg-gradient-to-r from-pink-500 to-rose-600"
                />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="space-y-6">
            {/* Performance Overview */}
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-100 flex items-center">
                  <Star className="h-4 w-4 text-gold-400 mr-2" />
                  Performance
                </h3>
                <Clock className="h-4 w-4 text-gray-400" />
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Top Performer</span>
                  <span className="text-sm font-medium text-gray-100">95.2%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Class Average</span>
                  <span className="text-sm font-medium text-gray-100">{stats.averagePercentage}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Improvement</span>
                  <div className="flex items-center space-x-1">
                    <ArrowUp className="h-3 w-3 text-emerald-400" />
                    <span className="text-sm font-medium text-emerald-400">+2.3%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* System Status */}
            <div className="card p-6">
              <h3 className="font-semibold text-gray-100 mb-4 flex items-center">
                <Award className="h-4 w-4 text-accent-400 mr-2" />
                System Status
              </h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">All systems operational</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Database synced</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-gold-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-300">Backup completed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;