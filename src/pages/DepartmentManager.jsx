import React, { useState, useEffect } from 'react';

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deptData, setDeptData] = useState({ name: '', practical_grouping: '', teaching_1: '', teaching_2: '' });

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/departments');
      const data = await response.json();
      setDepartments(data);
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      // Since there's no specific PUT endpoint yet, we'll use a generic one or implement it in the backend
      const response = await fetch('http://localhost:8000/api/departments/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptData),
      });

      if (response.ok) {
        alert("Department saved successfully!");
        setIsModalOpen(false);
        setDeptData({ name: '', practical_grouping: '', teaching_1: '', teaching_2: '' });
        fetchDepartments();
      } else {
        alert("Error saving department.");
      }
    } catch (error) {
      alert("Network error occurred.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">Department Management</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition shadow-md">
          + Add New Department
        </button>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6 text-slate-800">Department Details</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700">Department Name</label>
                <input
                  type="text" required className="w-full p-2 border rounded-md"
                  value={deptData.name}
                  onChange={(e) => setDeptData({...deptData, name: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700">Practical Grouping</label>
                <input
                  type="text" className="w-full p-2 border rounded-md"
                  value={deptData.practical_grouping}
                  onChange={(e) => setDeptData({...deptData, practical_grouping: e.target.value})}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700">Teaching 1</label>
                  <input
                    type="text" className="w-full p-2 border rounded-md"
                    value={deptData.teaching_1}
                    onChange={(e) => setDeptData({...deptData, teaching_1: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Teaching 2</label>
                  <input
                    type="text" className="w-full p-2 border rounded-md"
                    value={deptData.teaching_2}
                    onChange={(e) => setDeptData({...deptData, teaching_2: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-3 mt-8">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-md transition">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition">Save Department</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr className="text-slate-700">
              <th className="p-4 font-semibold">Department Name</th>
              <th className="p-4 font-semibold">Grouping</th>
              <th className="p-4 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {departments.length > 0 ? departments.map((d, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition">
                <td className="p-4 text-sm font-medium text-slate-900">{d.name}</td>
                <td className="p-4 text-sm text-slate-600">{d.practical_grouping || 'N/A'}</td>
                <td className="p-4 text-sm">
                  <button className="text-blue-600 hover:underline mr-3">Edit</button>
                  <button className="text-red-600 hover:underline">Delete</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan="3" className="p-8 text-center text-slate-400 italic">No departments found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
