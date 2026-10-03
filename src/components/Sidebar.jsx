import React from 'react';

export default function Sidebar({ setActivePage, activePage }) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'students', label: 'Student Registry', icon: '🎓' },
    { id: 'results', label: 'Result Entry', icon: '📝' },
    { id: 'transcript', label: 'Transcripts', icon: '📜' },
    { id: 'broadsheet', label: 'BroadSheet Mgr', icon: '📑' },
  ];

  return (
    <div className="w-64 bg-slate-900 text-white h-full flex flex-col">
      <div className="p-6 text-2xl font-bold border-b border-slate-800 text-blue-400">
        ARPIS v2.0
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActivePage(item.id)}
            className={`w-full flex items-center space-x-3 p-3 rounded-lg transition ${
              activePage === item.id
                ? 'bg-blue-600 text-white'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <span>{item.icon}</span>
            <span className="font-medium">{item.label}</span>
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-800 text-xs text-slate-500 text-center">
        Modernized Academic System
      </div>
    </div>
  );
}
