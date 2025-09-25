import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { MeritListEntry } from '../types';
import { 
  ArrowLeft, 
  Trophy, 
  Download, 
  Medal,
  Award,
  Star
} from 'lucide-react';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';

interface MeritListProps {
  onBack: () => void;
}

const MeritList: React.FC<MeritListProps> = ({ onBack }) => {
  const [meritList, setMeritList] = useState<MeritListEntry[]>([]);
  const [filteredList, setFilteredList] = useState<MeritListEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSemester, setSelectedSemester] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [minPercentage, setMinPercentage] = useState('');
  const [maxPercentage, setMaxPercentage] = useState('');

  useEffect(() => {
    loadMeritList();
  }, []);

  useEffect(() => {
    filterList();
  }, [meritList, selectedSemester, searchTerm, minPercentage, maxPercentage]);

  const loadMeritList = async () => {
    try {
      setLoading(true);
      
      // Get all students with their marks
      const { data: students, error: studentsError } = await supabase
        .from('students')
        .select('*');

      if (studentsError) throw studentsError;

      const { data: marks, error: marksError } = await supabase
        .from('marks')
        .select(`
          *,
          subject:subjects(*)
        `);

      if (marksError) throw marksError;

      // Calculate merit list
      const meritData: MeritListEntry[] = students?.map(student => {
        const studentMarks = marks?.filter(mark => mark.student_id === student.id) || [];
        const totalMarks = studentMarks.reduce((sum, mark) => sum + (mark.marks || 0), 0);
        const maxMarks = studentMarks.reduce((sum, mark) => sum + (mark.subject?.max_marks || 0), 0);
        const percentage = maxMarks > 0 ? (totalMarks / maxMarks) * 100 : 0;

        return {
          student,
          total_marks: totalMarks,
          max_marks: maxMarks,
          percentage,
          subjects: studentMarks.map(mark => mark.subject).filter(Boolean),
          rank: 0 // Will be set after sorting
        };
      }).sort((a, b) => b.percentage - a.percentage) || [];

      // Set ranks
      meritData.forEach((entry, index) => {
        entry.rank = index + 1;
      });

      setMeritList(meritData);
    } catch (error) {
      console.error('Error loading merit list:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterList = () => {
    let filtered = meritList;

    if (selectedSemester) {
      filtered = filtered.filter(entry => entry.student.semester === selectedSemester);
    }

    if (searchTerm) {
      filtered = filtered.filter(entry =>
        entry.student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entry.student.roll_number.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (minPercentage) {
      filtered = filtered.filter(entry => entry.percentage >= parseFloat(minPercentage));
    }

    if (maxPercentage) {
      filtered = filtered.filter(entry => entry.percentage <= parseFloat(maxPercentage));
    }

    setFilteredList(filtered);
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text('Merit List', 20, 20);
    
    let yPosition = 40;
    filteredList.forEach((entry, index) => {
      doc.text(
        `${index + 1}. ${entry.student.name} - ${entry.percentage.toFixed(2)}%`,
        20,
        yPosition
      );
      yPosition += 10;
    });

    doc.save('merit-list.pdf');
  };

  const exportToExcel = () => {
    const data = filteredList.map((entry, index) => ({
      Rank: index + 1,
      Name: entry.student.name,
      'Roll Number': entry.student.roll_number,
      Semester: entry.student.semester,
      'Total Marks': entry.total_marks,
      'Max Marks': entry.max_marks,
      'Percentage': entry.percentage.toFixed(2) + '%'
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Merit List');
    XLSX.writeFile(wb, 'merit-list.xlsx');
  };


  const semesters = [...new Set(meritList.map(entry => entry.student.semester))];

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
              <Trophy className="h-6 w-6 text-gold-400 mr-2" />
              Merit List
            </h1>
            <p className="text-gray-400 mt-1">View and export merit rankings</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={exportToPDF}
            disabled={filteredList.length === 0}
            className="btn-danger flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span>PDF</span>
          </button>
          <button
            onClick={exportToExcel}
            disabled={filteredList.length === 0}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4" />
            <span>Excel</span>
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 sm:p-6 overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="min-w-0">
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
          
          <div className="min-w-0 sm:col-span-2 lg:col-span-1">
            <label className="block text-sm font-medium text-gray-300 mb-2">Search</label>
            <input
              type="text"
              placeholder="Search by name or roll number..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-dark w-full"
            />
          </div>
          
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-300 mb-2">Min %</label>
            <input
              type="number"
              placeholder="Min percentage"
              value={minPercentage}
              onChange={(e) => setMinPercentage(e.target.value)}
              className="input-dark w-full"
              min="0"
              max="100"
            />
          </div>
          
          <div className="min-w-0">
            <label className="block text-sm font-medium text-gray-300 mb-2">Max %</label>
            <input
              type="number"
              placeholder="Max percentage"
              value={maxPercentage}
              onChange={(e) => setMaxPercentage(e.target.value)}
              className="input-dark w-full"
              min="0"
              max="100"
            />
          </div>
        </div>
        
        <div className="mt-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="text-sm text-gray-400">
            Showing {filteredList.length} of {meritList.length} students
          </div>
          <button
            onClick={() => {
              setSelectedSemester('');
              setSearchTerm('');
              setMinPercentage('');
              setMaxPercentage('');
            }}
            className="btn-secondary w-full sm:w-auto"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Merit List */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-dark-600">
          <h3 className="text-lg font-semibold text-gray-100">
            Merit List ({filteredList.length} students)
          </h3>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-accent-500 mx-auto"></div>
            <p className="text-gray-400 mt-2">Loading merit list...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="p-6 text-center">
            <Trophy className="h-12 w-12 text-gray-500 mx-auto mb-3" />
            <p className="text-gray-400">No students found matching the criteria.</p>
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredList.map((entry, index) => (
                <div key={entry.student.id} className="card-hover p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold shadow-glow ${
                        index === 0 ? 'bg-gradient-to-r from-yellow-500 to-yellow-600' :
                        index === 1 ? 'bg-gradient-to-r from-gray-400 to-gray-500' :
                        index === 2 ? 'bg-gradient-to-r from-orange-500 to-orange-600' :
                        'bg-gradient-accent'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-100">{entry.student.name}</h4>
                        <p className="text-sm text-gray-400">Semester {entry.student.semester}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      {index === 0 && <Medal className="h-5 w-5 text-yellow-400" />}
                      {index === 1 && <Award className="h-5 w-5 text-gray-400" />}
                      {index === 2 && <Star className="h-5 w-5 text-orange-400" />}
                    </div>
                  </div>
                  <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium mb-3 ${
                    entry.percentage >= 90 ? 'bg-emerald-500/20 text-emerald-400' :
                    entry.percentage >= 80 ? 'bg-accent-500/20 text-accent-400' :
                    entry.percentage >= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                    entry.percentage >= 60 ? 'bg-orange-500/20 text-orange-400' :
                    'bg-red-500/20 text-red-400'
                  }`}>
                    {entry.percentage.toFixed(2)}%
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-400">Roll: <span className="text-gray-300">{entry.student.roll_number}</span></p>
                    <p className="text-sm text-gray-400">Marks: <span className="text-gray-300">{entry.total_marks}/{entry.max_marks}</span></p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MeritList;
