import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Pencil, Trash2, Search } from 'lucide-react';
import { PageHeader, Modal, Button, EmptyState, Reveal } from '../components/ui';
import { API } from '../lib/api';

const emptyCourse = { id: null, code: '', description: '', units: '' };

export default function CourseManager({ setActivePage }) {
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(emptyCourse);

  const fetchCourses = async () => {
    try {
      const data = await (await fetch(`${API}/api/courses`)).json();
      setCourses(Array.isArray(data) ? data : []);
    } catch (e) { console.error('Error fetching courses:', e); setCourses([]); }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API}/api/courses/save`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: form.id, code: form.code, description: form.description, units: form.units }),
      });
      if (response.ok) {
        setIsModalOpen(false);
        setForm(emptyCourse);
        fetchCourses();
      } else {
        const err = await response.json();
        alert('Save failed: ' + (err?.detail || 'unknown'));
      }
    } catch { alert('Network error occurred.'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course? Registrations pointing at it will also be removed.')) return;
    try {
      await fetch(`${API}/api/courses/${id}`, { method: 'DELETE' });
      fetchCourses();
    } catch { alert('Network error occurred.'); }
  };

  const filtered = courses.filter(c =>
    !query || `${c.code} ${c.description}`.toLowerCase().includes(query.toLowerCase()));

  return (
    <div>
      <PageHeader
        eyebrow="Catalogue"
        title="Courses"
        subtitle="The course catalogue — codes, titles and credit units used by every report."
        actions={<Button icon={BookOpen} onClick={() => { setForm(emptyCourse); setIsModalOpen(true); }}>Add course</Button>}
      />

      <div className="mb-5 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input className="field" placeholder="Search course code or title…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </div>
        <div className="font-mono text-[11px] text-mute tracking-widest uppercase">{courses.length} courses</div>
      </div>

      <Reveal>
        <div className="doc-sheet rounded-xl overflow-hidden">
          <table className="ledger">
            <thead>
              <tr>
                <th>Code</th>
                <th>Description</th>
                <th className="text-center">Credit units</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((c, idx) => (
                <motion.tr key={idx} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: Math.min(idx * 0.015, 0.4) }}>
                  <td className="font-mono text-[13px] font-semibold text-ink">{c.code}</td>
                  <td>{c.description || '—'}</td>
                  <td className="text-center font-mono tabular-nums">{c.units ?? '—'}</td>
                  <td className="text-right whitespace-nowrap">
                    <button className="p-2 rounded-lg text-mute hover:text-seal hover:bg-seal/5 transition"
                      title="Edit"
                      onClick={() => { setForm({ id: c.id, code: c.code, description: c.description || '', units: c.units ?? '' }); setIsModalOpen(true); }}>
                      <Pencil size={15} />
                    </button>
                    <button className="p-2 rounded-lg text-mute hover:text-fail hover:bg-fail/5 transition"
                      title="Delete" onClick={() => handleDelete(c.id)}>
                      <Trash2 size={15} />
                    </button>
                  </td>
                </motion.tr>
              )) : (
                <tr><td colSpan="4">
                  <EmptyState icon={BookOpen} title="No courses found" hint="Add the first course code to the catalogue." />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title={form.id ? 'Edit course' : 'New course'}>
        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Course code</label>
            <input type="text" required className="field font-mono" placeholder="e.g. EDU 111" value={form.code}
              onChange={(e) => setForm({ ...form, code: e.target.value })} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Course description</label>
            <input type="text" className="field" placeholder="Full course title" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="block text-[12px] font-semibold text-mute mb-1.5">Credit units</label>
            <input type="number" min="0" max="20" step="1" className="field" value={form.units}
              onChange={(e) => setForm({ ...form, units: e.target.value })} />
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save course</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}