import React, { useState } from 'react';

export default function BroadSheetManager() {
  const [config, setConfig] = useState({
    deptId: '',
    sessionId: '',
    level: '',
    courseIds: []
  });
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    if (!config.deptId || !config.sessionId || !config.level) {
      alert("Please fill in all required fields.");
      return;
    }

    setIsGenerating(true);
    try {
      const response = await fetch('http://localhost:8000/api/reports/download-broadsheet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          department_id: config.deptId,
          session_id: config.sessionId,
          level: config.level,
          course_ids: config.courseIds,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `BroadSheet_${config.deptId}.xlsx`;
        a.click();
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Failed to generate BroadSheet"));
      }
    } catch (error) {
      alert("Network error occurred.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-800">BroadSheet Generator</h1>
        <div className="text-sm text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
          Export to .xlsx
        </div>
      </div>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 max-w-3xl">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Department ID</label>
            <input
              className="w-full p-2 border rounded-md bg-slate-50"
              placeholder="UUID or Name"
              value={config.deptId}
              onChange={(e) => setConfig({...config, deptId: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Session ID</label>
            <input
              className="w-full p-2 border rounded-md bg-slate-50"
              placeholder="UUID or Year"
              value={config.sessionId}
              onChange={(e) => setConfig({...config, sessionId: e.target.value})}
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Academic Level</label>
            <select
              className="w-full p-2 border rounded-md bg-slate-50"
              value={config.level}
              onChange={(e) => setConfig({...config, level: e.target.value})}>
              <option value="">Select Level...</option>
              <option value="100">100</option>
              <option value="200">200</option>
              <option value="300">300</option>
              <option value="400">400</option>
            </select>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <label className="block text-sm font-medium text-slate-700">Course Selection (Comma separated IDs)</label>
          <input
            className="w-full p-2 border rounded-md bg-slate-50"
            placeholder="e.g. EDU101, EDU102, MAT201"
            onChange={(e) => setConfig({...config, courseIds: e.target.value.split(',')})}
          />
          <p className="text-xs text-slate-400 italic">Enter Course Codes separated by commas.</p>
        </div>

        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className={`w-full mt-8 py-3 rounded-lg font-bold transition shadow-lg ${
            isGenerating
              ? 'bg-slate-400 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-200'
          }`}>
          {isGenerating ? 'Generating Excel File...' : 'Generate & Download BroadSheet'}
        </button>
      </div>
    </div>
  );
}
