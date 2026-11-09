import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Building2, Pencil } from 'lucide-react';
import { PageHeader, Modal, Button, EmptyState, Reveal } from '../components/ui';
import { API, authFetch } from '../lib/api';


const emptyDept = { name: '', practical_grouping: '', teaching_1: '', teaching_2: '' };

export default function DepartmentManager() {
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deptData, setDeptData] = useState(emptyDept);

  useEffect(() => { fetchDepartments(); }, []);

  const fetchDepartments = async () => {
    try {
      const response = await authFetch(`${API}/api/departments`);
      const data = await response.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching departments:', error);
      setDepartments([]);
    }
  };

  const filtered = departments.filter(d =>
    !query || d.name.toLowerCase().includes(query.toLowerCase()));

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await authFetch(`${API}/api/departments/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deptData),
      });
      if (response.ok) {
        setIsModalOpen(false);
        setDeptData(emptyDept);
        fetchDepartments();
      } else {
        alert('Error saving department.');
      }
    } catch (error) {
      alert('Network error occurred.');
    }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Configuration"
        title="Departments"
        subtitle="All department codes on record — the full catalogue the broadsheet reports draw from."
        actions={<Button icon={Building2} onClick={() => setIsModalOpen(true)}>Add department</Button>}
      />

      <div className="mb-5 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input className="field" placeholder="Search departments…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="font-mono text-[11px] text-mute tracking-widest uppercase">{departments.length} codes</div>
      </div>

      <Reveal>
        <div className="doc-sheet rounded-xl overflow-hidden">
          <table className="ledger">
            <thead>
              <tr>
                <th className="w-14">No.</th>
                <th>Department</th>
                <th>Practical grouping</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((d, idx) => (
                <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.015, 0.4) }}>
                  <td className="font-mono text-[11px] text-mute">{String(idx + 1).padStart(2, '0')}</td>
                  <td className="font-mono text-[13px] font-semibold text-ink">{d.name}</td>
                  <td className="text-mute">{d.practical_grouping || '—'}</td>
                  <td className="text-right">
                    <button className="p-2 rounded-lg text-mute hover:text-seal hover:bg-seal/5 transition"><Pencil size={15} /></button>
                  </td>
                </motion.tr>
              )) : (
                <tr><td colSpan="4">
                  <EmptyState icon={Building2} title="No departments found" hint="Clear the search, or add a new department code." />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="New department">
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Department code</label>
            <input type="text" required className="field font-mono" placeholder="e.g. PES" value={deptData.name}
              onChange={(e) => setDeptData({ ...deptData, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Practical grouping</label>
            <input type="text" className="field" value={deptData.practical_grouping}
              onChange={(e) => setDeptData({ ...deptData, practical_grouping: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Teaching 1</label>
              <input type="text" className="field" value={deptData.teaching_1}
                onChange={(e) => setDeptData({ ...deptData, teaching_1: e.target.value })} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Teaching 2</label>
              <input type="text" className="field" value={deptData.teaching_2}
                onChange={(e) => setDeptData({ ...deptData, teaching_2: e.target.value })} />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save department</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}