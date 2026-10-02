import React, { useState, useEffect } from 'react';

export default function StudentRegistry() {
  const [students, setStudents] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStudent, setNewStudent] = useState({
    matric_no: '',
    surname: '',
    first_name: '',
    current_level: '',
    department_id: ''
  });

  const fetchStudents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/students');
      const data = await response.json();
      setStudents(data);
    } catch (error) {
      console.error("Error fetching students:", error);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:8000/api/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });

      if (response.ok) {
        alert("Student added successfully!");
        setIsModalOpen(false);
        setNewStudent({ matric_no: '', surname: '', first_name: '', current_level: '', department_id: '' });
        fetchStudents();
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Unknown error"));
      }
    } catch (error) {
      alert("Network error occurred. Is the Python server running?");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Student Registry</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md">
          + Add New Student
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Add New Student</h2>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Matric Number</label>
                <input
                  type="text" required className="w-full p-2 border rounded-md"
                  value={newStudent.matric_no}
                  onChange={(e) => setNewStudent({...newStudent, matric_no: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Surname</label>
                  <input
                    type="text" required className="w-full p-2 border rounded-md"
                    value={newStudent.surname}
                    onChange={(e) => setNewStudent({...newStudent, surname: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">First Name</label>
                  <input
                    type="text" required className="w-full p-2 border rounded-md"
                    value={newStudent.first_name}
                    onChange={(e) => setNewStudent({...newStudent, first_name: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Current Level</label>
                <select
                  className="w-full p-2 border rounded-md"
                  value={newStudent.current_level}
                  onChange={(e) => setNewStudent({...newStudent, current_level: e.target.value})}>
                  <option value="">Select Level...</option>
                  <option value="100">100</option>
                  <option value="200">200</option>
                  <option value="300">300</option>
                  <option value="400">400</option>
                </select>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-700">
              <th className="p-4 font-semibold">Matric No</th>
              <th className="p-4 font-semibold">Full Name</th>
              <th className="p-4 font-semibold">Level</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length > 0 ? students.map((s, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="p-4 text-sm font-medium text-slate-900">{s.matric_no}</td>
                <td className="p-4 text-sm text-slate-600">{`${s.name} ${s.first_name || ''}`}</td>
                <td className="p-4 text-sm text-slate-600">{s.level}</td>
                <td className="p-4 text-sm">
                  <button className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="4" className="p-8 text-center text-slate-400 italic">No students found. Click "+ Add New Student" to begin.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
