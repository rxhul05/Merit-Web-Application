import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  Hash,
  GraduationCap,
  Download,
  Upload,
  Grid,
  List,
  SortAsc,
  SortDesc
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
  const [selectedBatch, setSelectedBatch] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'roll_number' | 'semester'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [error, setError] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
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

    if (selectedBatch) {
      filtered = filtered.filter(student => student.batch === selectedBatch);
    }

    // Sort the filtered results
    filtered.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });

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
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-dark-700/50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 text-gray-300" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-100 flex items-center">
              <Users className="h-6 w-6 text-accent-400 mr-2" />
              Student Management
            </h1>
            <p className="text-gray-400 mt-1">Manage student records and information</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="flex items-center bg-dark-800/50 border border-dark-600 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-accent-500 text-white shadow-glow' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <Grid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-colors ${
                viewMode === 'list' 
                  ? 'bg-accent-500 text-white shadow-glow' 
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          
          <button className="btn-secondary flex items-center space-x-2">
            <Upload className="h-4 w-4" />
            <span>Import</span>
          </button>
          
          <button className="btn-secondary flex items-center space-x-2">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
          
          <button
            onClick={() => setShowAddForm(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Student</span>
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search students by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark w-full pl-12 pr-4"
            />
          </div>
          
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary flex items-center space-x-2 ${showFilters ? 'bg-accent-500/20 border-accent-500/30' : ''}`}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </button>
            
            <div className="flex items-center bg-dark-800/50 border border-dark-600 rounded-xl p-1">
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-200 transition-colors"
                title={`Sort ${sortOrder === 'asc' ? 'descending' : 'ascending'}`}
              >
                {sortOrder === 'asc' ? <SortAsc className="h-4 w-4" /> : <SortDesc className="h-4 w-4" />}
              </button>
            </div>
          </div>
        </div>
        
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-dark-600 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
              <select
                value={selectedSemester}
                onChange={(e) => setSelectedSemester(e.target.value)}
                className="input-dark w-full"
              >
                <option value="">All Semesters</option>
                {semesters.map(semester => (
                  <option key={semester} value={semester}>{semester}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Batch</label>
              <select
                value={selectedBatch}
                onChange={(e) => setSelectedBatch(e.target.value)}
                className="input-dark w-full"
              >
                <option value="">All Batches</option>
                {[...new Set(students.map(s => s.batch))].filter(Boolean).map(batch => (
                  <option key={batch} value={batch}>{batch}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'roll_number' | 'semester')}
                className="input-dark w-full"
              >
                <option value="name">Name</option>
                <option value="roll_number">Roll Number</option>
                <option value="semester">Semester</option>
              </select>
            </div>
          </div>
        )}
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
      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="lg" text="Loading students..." />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="card p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-100 mb-2">Error Loading Students</h3>
          <p className="text-gray-400 mb-6">{error}</p>
          <button onClick={loadStudents} className="btn-primary">
            Try Again
          </button>
        </div>
      )}

      {/* Students Grid/List */}
      {!loading && !error && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-100">
              Students ({filteredStudents.length})
            </h2>
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-400">
                Total: {filteredStudents.length} students
              </span>
            </div>
          </div>

          {filteredStudents.length === 0 ? (
            <div className="text-center py-12">
              <Users className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-300 mb-2">No students found</h3>
              <p className="text-gray-400 mb-6">
                {searchTerm || selectedSemester || selectedBatch
                  ? 'Try adjusting your search or filters'
                  : 'Get started by adding your first student'}
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredStudents.map((student) => (
                <div key={student.id} className={viewMode === 'grid' ? 'card-hover p-6' : 'card-hover p-4 flex items-center justify-between'}>
                  {viewMode === 'grid' ? (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gradient-accent rounded-xl flex items-center justify-center shadow-glow">
                          <GraduationCap className="h-6 w-6 text-white" />
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2 rounded-lg hover:bg-dark-700/50 text-gray-400 hover:text-accent-400 transition-colors"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-100 mb-1">{student.name}</h3>
                        <p className="text-sm text-gray-400 mb-3">Roll: {student.roll_number}</p>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm text-gray-400">
                            <Mail className="h-4 w-4 mr-2" />
                            {student.email || 'No email'}
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Phone className="h-4 w-4 mr-2" />
                            {student.phone || 'No phone'}
                          </div>
                          <div className="flex items-center text-sm text-gray-400">
                            <Calendar className="h-4 w-4 mr-2" />
                            Sem {student.semester} • {student.batch}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center shadow-glow">
                          <Hash className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-100">{student.name}</h3>
                          <p className="text-sm text-gray-400">
                            {student.roll_number} • Sem {student.semester} • {student.batch}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(student)}
                          className="p-2 rounded-lg hover:bg-dark-700/50 text-gray-400 hover:text-accent-400 transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(student.id)}
                          className="p-2 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showAddForm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-dark-900/80 backdrop-blur-sm" onClick={resetForm}></div>
            
            <div className="inline-block w-full max-w-md p-6 my-8 overflow-hidden text-left align-middle transition-all transform card shadow-dark-xl">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-100">
                  {editingStudent ? 'Edit Student' : 'Add New Student'}
                </h3>
                <button
                  onClick={resetForm}
                  className="p-2 rounded-lg hover:bg-dark-700/50 text-gray-400 hover:text-gray-200 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="input-dark w-full"
                    placeholder="Enter student name"
                  />
                  {formErrors.name && <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Roll Number</label>
                  <input
                    type="text"
                    value={formData.roll_number}
                    onChange={(e) => setFormData({ ...formData, roll_number: e.target.value })}
                    className="input-dark w-full"
                    placeholder="Enter roll number"
                  />
                  {formErrors.roll_number && <p className="text-red-400 text-sm mt-1">{formErrors.roll_number}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="input-dark w-full"
                    placeholder="Enter email address"
                  />
                  {formErrors.email && <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="input-dark w-full"
                    placeholder="Enter phone number"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Semester</label>
                    <input
                      type="text"
                      value={formData.semester}
                      onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                      className="input-dark w-full"
                      placeholder="e.g., 1"
                    />
                    {formErrors.semester && <p className="text-red-400 text-sm mt-1">{formErrors.semester}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Batch</label>
                    <input
                      type="text"
                      value={formData.batch}
                      onChange={(e) => setFormData({ ...formData, batch: e.target.value })}
                      className="input-dark w-full"
                      placeholder="e.g., 2024"
                    />
                    {formErrors.batch && <p className="text-red-400 text-sm mt-1">{formErrors.batch}</p>}
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Saving...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Save className="h-4 w-4" />
                        <span>{editingStudent ? 'Update' : 'Add'} Student</span>
                      </div>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentManagement;