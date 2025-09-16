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
  Calendar,
  AlertCircle
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

  const StatCard = ({ title, value, icon: Icon, color }: {
    title: string;
    value: string | number;
    icon: React.ElementType;
    color: string;
  }) => (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 hover-lift animate-scaleIn">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <p className="text-3xl font-bold gradient-text">{value}</p>
        </div>
        <div className={`p-4 rounded-xl shadow-md ${color} animate-pulse-slow`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
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
      className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 text-left hover-lift transition-all duration-300 w-full group"
    >
      <div className="flex items-start space-x-4">
        <div className={`p-4 rounded-xl shadow-md ${color} group-hover:scale-110 transition-transform duration-200`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">{description}</p>
        </div>
      </div>
    </button>
  );

  if (activeTab === 'students') {
    return <StudentManagement onBack={() => setActiveTab('overview')} />;
  }

  if (activeTab === 'marks') {
    return <MarksEntry onBack={() => setActiveTab('overview')} />;
  }

  if (activeTab === 'merit') {
    return <MeritList onBack={() => setActiveTab('overview')} />;
  }

  if (loading) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <LoadingSpinner size="lg" text="Loading dashboard..." />
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Dashboard">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Dashboard</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={loadDashboardStats}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            color="bg-blue-500"
          />
          <StatCard
            title="Subjects"
            value={stats.totalSubjects}
            icon={BookOpen}
            color="bg-green-500"
          />
          <StatCard
            title="Assessments Done"
            value={stats.completedAssessments}
            icon={FileText}
            color="bg-purple-500"
          />
          <StatCard
            title="Average Score"
            value={`${stats.averagePercentage}%`}
            icon={TrendingUp}
            color="bg-orange-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 animate-slideIn">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <div className="w-1 h-6 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full mr-3"></div>
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <QuickAction
              title="Manage Students"
              description="Add, edit, or remove student records"
              icon={UserPlus}
              onClick={() => setActiveTab('students')}
              color="bg-blue-500"
            />
            <QuickAction
              title="Enter Marks"
              description="Input and manage student marks"
              icon={BookOpen}
              onClick={() => setActiveTab('marks')}
              color="bg-green-500"
            />
            <QuickAction
              title="Generate Merit List"
              description="View and export merit lists"
              icon={Trophy}
              onClick={() => setActiveTab('merit')}
              color="bg-purple-500"
            />
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <div className="w-1 h-6 bg-gradient-to-b from-green-600 to-blue-600 rounded-full mr-3"></div>
              System Overview
            </h2>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="h-5 w-5 text-blue-600" />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center space-x-3 p-4 bg-blue-50 rounded-lg">
              <Award className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-gray-900">Merit List Management System</p>
                <p className="text-sm text-gray-600">Complete academic record management platform ready for use</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Features Available</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• Student record management</li>
                  <li>• Subject-wise marks entry</li>
                  <li>• Automatic merit list generation</li>
                  <li>• Search and filter capabilities</li>
                </ul>
              </div>
              
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Export Options</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  <li>• PDF format reports</li>
                  <li>• Excel spreadsheet export</li>
                  <li>• Multi-semester support</li>
                  <li>• Historical data access</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;