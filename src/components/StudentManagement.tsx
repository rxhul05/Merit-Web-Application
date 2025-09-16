import React, { useState, useEffect } from 'react';
import Layout from './Layout';
import LoadingSpinner from './LoadingSpinner';
import { supabase } from '../lib/supabase';
import { Student } from '../types';
import { useToast } from './Toast';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Save, 
  X,
  Filter,
  Users,
  AlertCircle
} from 'lucide-react';

interface StudentManagementProps {
  onBack: () => void;
}

const StudentManagement: React.FC<StudentManagementProps> = ({ onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSemester, setSelectedSemester] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    roll_number: '',
    email: '',
    phone: '',
    semester: '',
    batch: ''
  });
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const { showToast } = useToast();

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    filterStudents();
  }, [students, searchTerm, selectedSemester]);

  const loadStudents = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data, error } = await supabase
        .from('students')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStudents(data || []);
    } catch (error) {
      console.error('Error loading students:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load students';
      setError(errorMessage);
      showToast({
        type: 'error',
        title: 'Error Loading Students',
        message: errorMessage,
      });
    } finally {
      setLoading(false);
    }
  };

  const filterStudents = () => {
    let filtered = students;

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedSemester) {
      filtered = filtered.filter(student => student.semester === selectedSemester);
    }

    setFilteredStudents(filtered);
  };

  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.roll_number.trim()) {
      errors.roll_number = 'Roll number is required';
    }
    
    if (!formData.semester.trim()) {
      errors.semester = 'Semester is required';
    }
    
    if (!formData.batch.trim()) {
      errors.batch = 'Batch is required';
    }
    
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }
    
    if (formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Please enter a valid phone number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showToast({
        type: 'error',
        title: 'Validation Error',
        message: 'Please fix the errors in the form before submitting.',
      });
      return;
    }

    try {
      setSaving(true);
      
      if (editingStudent) {
        const { error } = await supabase
          .from('students')
          .update({
            ...formData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingStudent.id);

        if (error) throw error;
        
        showToast({
          type: 'success',
          title: 'Student Updated',
          message: 'Student information has been updated successfully.',
        });
      } else {
        const { error } = await supabase
          .from('students')
          .insert([formData]);

        if (error) throw error;
        
        showToast({
          type: 'success',
          title: 'Student Added',
          message: 'New student has been added successfully.',
        });
      }

      setFormData({
        name: '',
        roll_number: '',
        email: '',
        phone: '',
        semester: '',
        batch: ''
      });
      setFormErrors({});
      setShowAddForm(false);
      setEditingStudent(null);
      loadStudents();
    } catch (error) {
      console.error('Error saving student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save student';
      showToast({
        type: 'error',
        title: 'Error Saving Student',
        message: errorMessage,
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (student: Student) => {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      roll_number: student.roll_number,
      email: student.email || '',
      phone: student.phone || '',
      semester: student.semester,
      batch: student.batch
    });
    setShowAddForm(true);
  };

  const handleDelete = async (studentId: string) => {
    if (!confirm('Are you sure you want to delete this student? This action cannot be undone.')) return;

    try {
      const { error } = await supabase
        .from('students')
        .delete()
        .eq('id', studentId);

      if (error) throw error;
      
      showToast({
        type: 'success',
        title: 'Student Deleted',
        message: 'Student has been deleted successfully.',
      });
      
      loadStudents();
    } catch (error) {
      console.error('Error deleting student:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete student';
      showToast({
        type: 'error',
        title: 'Error Deleting Student',
        message: errorMessage,
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      roll_number: '',
      email: '',
      phone: '',
      semester: '',
      batch: ''
    });
    setShowAddForm(false);
    setEditingStudent(null);
  };

  const semesters = [...new Set(students.map(s => s.semester))].filter(Boolean);

  return (
    <Layout title="Student Management">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
            <button
              onClick={onBack}
              className="flex items-center space-x-1 sm:space-x-2 text-gray-600 hover:text-gray-900 flex-shrink-0"
            >
              <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </button>
            <div className="h-4 sm:h-6 border-l border-gray-300 hidden sm:block"></div>
            <div className="flex items-center space-x-2 min-w-0">
              <Users className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 flex-shrink-0" />
              <h1 className="text-lg sm:text-2xl font-bold text-gray-900 truncate">Student Management</h1>
            </div>
          </div>
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center space-x-2 bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors w-full sm:w-auto justify-center sm:justify-start"
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name or roll number..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="relative w-full sm:w-auto sm:min-w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Semesters</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Add/Edit Form */}
        {showAddForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">
                {editingStudent ? 'Edit Student' : 'Add New Student'}
              </h2>
              <button
                onClick={resetForm}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Roll Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.roll_number}
                  onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.roll_number ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.roll_number && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.roll_number}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Phone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.phone && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Semester *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Semester 1, Semester 2"
                  value={formData.semester}
                  onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.semester ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.semester && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.semester}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Batch *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., 2024-2025"
                  value={formData.batch}
                  onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formErrors.batch ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                {formErrors.batch && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.batch}</p>
                )}
              </div>

              <div className="sm:col-span-2 flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={resetForm}
                  className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  <span>{saving ? 'Saving...' : (editingStudent ? 'Update' : 'Save')}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Students Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Students ({filteredStudents.length})
            </h3>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <LoadingSpinner size="lg" text="Loading students..." />
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Students</h3>
              <p className="text-gray-600 mb-4">{error}</p>
              <button
                onClick={loadStudents}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
            </div>
          ) : filteredStudents.length === 0 ? (
            <div className="p-6 text-center">
              <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-500">No students found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Details
                    </th>
                    <th className="hidden sm:table-cell px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Contact
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Academic Info
                    </th>
                    <th className="px-3 sm:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredStudents.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50">
                      <td className="px-3 sm:px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900 truncate">
                            {student.name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Roll: {student.roll_number}
                          </div>
                        </div>
                      </td>
                      <td className="hidden sm:table-cell px-6 py-4">
                        <div className="text-sm text-gray-900 truncate">{student.email || '-'}</div>
                        <div className="text-sm text-gray-500">{student.phone || '-'}</div>
                      </td>
                      <td className="px-3 sm:px-6 py-4">
                        <div className="text-sm text-gray-900">{student.semester}</div>
                        <div className="text-sm text-gray-500">Batch: {student.batch}</div>
                        {/* Show contact info on mobile */}
                        <div className="sm:hidden mt-2 text-xs text-gray-500">
                          <div>{student.email || 'No email'}</div>
                          <div>{student.phone || 'No phone'}</div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4 text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-1 sm:space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                            title="Edit student"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                            title="Delete student"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default StudentManagement;