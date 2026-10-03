import React, { useState, useEffect } from 'react';

const ScoreEntry = () => {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [selectedSession, setSelectedSession] = useState('2023/2024'); // Example default
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mock data for sessions/courses if not yet implemented in API
  const sessions = ['2022/2023', '2023/2024', '2024/2025'];
  const courseList = [
    { id: '1', code: 'EDU 111', name: 'Intro to Education' },
    { id: '2', code: 'EDU 121', name: 'Educational Psychology' },
  ];

  useEffect(() => {
    if (selectedCourse && selectedSession) {
      fetchStudents();
    }
  }, [selectedCourse, selectedSession]);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/results/students-by-course?course_id=${selectedCourse}&session_id=${selectedSession}`);
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
      alert("Failed to load students.");
    }
    setLoading(false);
  };

  const handleScoreChange = async (regId, field, value) => {
    const updatedStudents = students.map(s => {
      if (s.registration_id === regId) {
        return { ...s, [field]: parseFloat(value) || 0 };
      }
      return s;
    });
    setStudents(updatedStudents);

    // Autosave
    try {
      const student = updatedStudents.find(s => s.registration_id === regId);
      await fetch('http://localhost:8000/api/results/save-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          registration_id: regId,
          course_work: student.course_work,
          exam_score: student.exam_score,
        }),
      });
    } catch (error) {
      console.error("Autosave failed:", error);
    }
  };

  const calculatePreviewGrade = (cw, exam) => {
    const total = cw + exam;
    if (total >= 70) return 'A';
    if (total >= 60) return 'B';
    if (total >= 50) return 'C';
    if (total >= 45) return 'D';
    if (total >= 40) return 'E';
    return 'F';
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8 flex gap-4 items-end bg-white p-4 rounded-lg shadow-sm">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Academic Session</label>
          <select
            className="border p-2 rounded-md"
            value={selectedSession}
            onChange={(e) => setSelectedSession(e.target.value)}
          >
            {sessions.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
          <select
            className="border p-2 rounded-md"
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
          >
            <option value="">Select Course</option>
            {courseList.map(c => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10">Loading students...</div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-3 border-b">Matric No</th>
                <th className="p-3 border-b">Student Name</th>
                <th className="p-3 border-b w-32">Course Work (max 30)</th>
                <th className="p-3 border-b w-32">Exam Score (max 70)</th>
                <th className="p-3 border-b w-24">Total</th>
                <th className="p-3 border-b w-24">Grade</th>
              </tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.registration_id} className="hover:bg-gray-50">
                  <td className="p-3 border-b font-mono text-sm">{s.matric_no}</td>
                  <td className="p-3 border-b">{s.name}</td>
                  <td className="p-3 border-b">
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={s.course_work}
                      onChange={(e) => handleScoreChange(s.registration_id, 'course_work', e.target.value)}
                    />
                  </td>
                  <td className="p-3 border-b">
                    <input
                      type="number"
                      className="border p-1 rounded w-full"
                      value={s.exam_score}
                      onChange={(e) => handleScoreChange(s.registration_id, 'exam_score', e.target.value)}
                    />
                  </td>
                  <td className="p-3 border-b font-bold">
                    {s.course_work + s.exam_score}
                  </td>
                  <td className="p-3 border-b">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      calculatePreviewGrade(s.course_work, s.exam_score) === 'F' ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                    }`}>
                      {calculatePreviewGrade(s.course_work, s.exam_score)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {students.length === 0 && !loading && (
            <div className="p-10 text-center text-gray-500">No students registered for this course/session.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default ScoreEntry;
