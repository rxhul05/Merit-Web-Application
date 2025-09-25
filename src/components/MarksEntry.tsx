import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Student, Subject } from '../types';
import { 
  ArrowLeft, 
  Plus, 
  BookOpen, 
  Save,
  X
} from 'lucide-react';

interface MarksEntryProps {
  onBack: () => void;
}

const MarksEntry: React.FC<MarksEntryProps> = ({ onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showSubjectForm, setShowSubjectForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [subjectForm, setSubjectForm] = useState({
    name: '',
    code: '',
    max_marks: 100,
    semester: ''
  });
  const [marksData, setMarksData] = useState<{ [key: string]: number }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [studentsResult, subjectsResult] = await Promise.all([
        supabase.from('students').select('*').order('name'),
        supabase.from('subjects').select('*').order('name')
      ]);

      setStudents(studentsResult.data || []);
      setSubjects(subjectsResult.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const handleSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('subjects')
        .insert([subjectForm]);
      
      if (error) throw error;
      
      setShowSubjectForm(false);
      setSubjectForm({ name: '', code: '', max_marks: 100, semester: '' });
      loadData();
    } catch (error) {
      console.error('Error adding subject:', error);
    }
  };

  const handleMarksSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    try {
      const marksToInsert = Object.entries(marksData).map(([subjectId, marks]) => ({
        student_id: selectedStudent.id,
        subject_id: subjectId,
        marks: marks
      }));

      const { error } = await supabase
        .from('marks')
        .upsert(marksToInsert);

      if (error) throw error;

      setSelectedStudent(null);
      setMarksData({});
    } catch (error) {
      console.error('Error saving marks:', error);
    }
  };

  const getFilteredStudents = () => {
    let filtered = students;

    if (selectedSemester) {
      filtered = filtered.filter(student => student.semester === selectedSemester);
    }

    if (searchTerm) {
      filtered = filtered.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const getSubjectsForSemester = (semester: string) => {
    return subjects.filter(s => s.semester === semester);
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
              <BookOpen className="h-6 w-6 text-accent-400 mr-2" />
              Marks Entry
            </h1>
            <p className="text-gray-400 mt-1">Enter and manage student marks</p>
          </div>
        </div>
        <button
          onClick={() => setShowSubjectForm(true)}
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subject Form */}
      {showSubjectForm && (
        <div className="card p-4 sm:p-6 overflow-hidden">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-100">Add New Subject</h2>
            <button
              onClick={() => setShowSubjectForm(false)}
              className="text-gray-400 hover:text-gray-200 p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSubjectSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject Name
                </label>
                <input
                  type="text"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({...subjectForm, name: e.target.value})}
                  className="input-dark w-full"
                  placeholder="Enter subject name"
                  required
                />
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Subject Code
                </label>
                <input
                  type="text"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({...subjectForm, code: e.target.value})}
                  className="input-dark w-full"
                  placeholder="Enter subject code"
                  required
                />
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Maximum Marks
                </label>
                <input
                  type="number"
                  value={subjectForm.max_marks}
                  onChange={(e) => setSubjectForm({...subjectForm, max_marks: parseInt(e.target.value)})}
                  className="input-dark w-full"
                  placeholder="Enter maximum marks"
                  required
                />
              </div>

              <div className="min-w-0">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Semester
                </label>
                <select
                  value={subjectForm.semester}
                  onChange={(e) => setSubjectForm({...subjectForm, semester: e.target.value})}
                  className="input-dark w-full"
                  required
                >
                  <option value="">Select Semester</option>
                  {semesters.map(semester => (
                    <option key={semester} value={semester}>{semester}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubjectForm(false)}
                className="btn-secondary order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary order-1 sm:order-2"
              >
                Add Subject
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 sm:p-6 overflow-hidden">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search Students</label>
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark w-full"
            />
          </div>
          <div className="w-full lg:w-auto lg:min-w-[200px]">
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
        </div>
      </div>

      {/* Student Selection */}
      {!selectedStudent && (
        <div className="card">
          <div className="px-6 py-4 border-b border-dark-600">
            <h3 className="text-lg font-semibold text-gray-100">
              Students ({getFilteredStudents().length})
            </h3>
          </div>

          {getFilteredStudents().length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-400">No students found for the selected semester.</p>
            </div>
          ) : (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getFilteredStudents().map(student => (
                  <div key={student.id} className="border border-dark-600 bg-dark-800/30 rounded-xl p-4 hover:bg-dark-700/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-semibold text-gray-100">{student.name}</h4>
                        <p className="text-sm text-gray-400">Roll: {student.roll_number}</p>
                      </div>
                      <button
                        onClick={() => setSelectedStudent(student)}
                        className="btn-primary"
                      >
                        Enter Marks
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Marks Entry Form */}
      {selectedStudent && (
        <div className="card p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-xl font-semibold text-gray-100">
                Enter Marks for {selectedStudent.name}
              </h3>
              <p className="text-gray-400">Roll: {selectedStudent.roll_number} | Semester: {selectedStudent.semester}</p>
            </div>
            <button
              onClick={() => {
                setSelectedStudent(null);
                setMarksData({});
              }}
              className="text-gray-400 hover:text-gray-200 p-2 rounded-lg hover:bg-dark-700/50 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleMarksSubmit} className="space-y-4">
            {getSubjectsForSemester(selectedStudent.semester).length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-gray-400">No subjects found for this semester.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {getSubjectsForSemester(selectedStudent.semester).map(subject => (
                    <div key={subject.id} className="border border-dark-600 bg-dark-800/30 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-semibold text-gray-100">{subject.name}</h4>
                          <p className="text-sm text-gray-400">{subject.code} | Max: {subject.max_marks}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <label className="text-sm font-medium text-gray-300">Marks:</label>
                        <input
                          type="number"
                          min="0"
                          max={subject.max_marks}
                          value={marksData[subject.id] || ''}
                          onChange={(e) => setMarksData({...marksData, [subject.id]: parseInt(e.target.value) || 0})}
                          className="input-dark flex-1"
                          placeholder={`Enter marks (0-${subject.max_marks})`}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setSelectedStudent(null)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary flex items-center space-x-2"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save Marks</span>
                  </button>
                </div>
              </>
            )}
          </form>
        </div>
      )}
    </div>
  );
};

export default MarksEntry;
