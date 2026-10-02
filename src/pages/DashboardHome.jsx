import React from 'react';

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-slate-800">Welcome to ARPIS</h1>
      <p className="text-slate-600">System Overview and Quick Stats</p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium">Total Students</div>
          <div className="text-3xl font-bold text-slate-900">1,248</div>
          <div className="text-green-500 text-xs mt-2">↑ 12% from last session</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium">Active Courses</div>
          <div className="text-3xl font-bold text-slate-900">84</div>
          <div className="text-slate-400 text-xs mt-2">Across 12 Departments</div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
          <div className="text-slate-500 text-sm font-medium">Pending Results</div>
          <div className="text-3xl font-bold text-red-600">142</div>
          <div className="text-slate-400 text-xs mt-2">Requires urgent entry</div>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-sm text-slate-700">BroadSheet generated for Dept: Computer Science (L100)</span>
              </div>
              <span className="text-xs text-slate-400">2 hours ago</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
