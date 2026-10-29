import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserPlus, Users, Pencil, Trash2 } from 'lucide-react';
import { PageHeader, Modal, Button, EmptyState, Reveal } from '../components/ui';
import { API } from '../lib/api';


const emptyStudent = {
  matric_no: '', surname: '', first_name: '', middle_name: '',
  sex: '', date_of_birth: '', address: '', telephone: '',
  current_level: '', department_id: ''
};

export default function StudentRegistry() {
  const [students, setStudents] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [query, setQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newStudent, setNewStudent] = useState(emptyStudent);

  const fetchStudents = async () => {
    try {
      const response = await fetch(', API}/api/students');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching students:", error);
      setStudents([]);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await fetch(', API}/api/departments');
      const data = await response.json();
      setDepartments(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching departments:", error);
      setDepartments([]);
    }
  };

  React.useEffect(() => { fetchStudents(); fetchDepartments(); }, []);

  const filtered = students.filter(s => {
    if (!query) return true;
    const q = query.toLowerCase();
    return `${s.matric_no} ${s.surname} ${s.first_name} ${s.level || ''}}`.toLowerCase().includes(q);
  });

  const handleAddStudent = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const response = await fetch(', API}/api/students/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newStudent),
      });
      if (response.ok) {
        setIsModalOpen(false);
        setNewStudent(emptyStudent);
        fetchStudents();
      } else {
        const err = await response.json();
        alert("Error: " + (err.detail || "Unknown error"));
      }
    } catch (error) {
      alert("Network error occurred. Is the records server running?");
    } finally {
      setSaving(false);
    }
  };

  const set = (k) => (e) => setNewStudent({ ...newStudent, [k]: e.target.value });

  return (
    <div>
      <PageHeader
        eyebrow="Registry"
        title="Student Registry"
        subtitle="The official enrolment records — matching the legacy StudentDetails register."
        actions={
          <>
            <Button variant="ghost" icon={UserPlus} onClick={() => setIsModalOpen(true)}>Add student</Button>
          </>
        }
      />

      {/* Search + count */}
      <div className="mb-5 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            className="field"
            placeholder="Search matric no, name, level…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="font-mono text-[11px] text-mute tracking-widest uppercase">
          {students.length} records
        </div>
      </div>

      <Reveal>
        <div className="doc-sheet rounded-xl overflow-hidden">
          <table className="ledger">
            <thead>
              <tr>
                <th>Matric No</th>
                <th>Full name</th>
                <th>Level</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length > 0 ? filtered.map((s, idx) => (
                <tr key={idx}>
                  <td className="font-mono text-[12.5px] text-ink font-medium">{s.matric_no}</td>
                  <td>{`${s.surname} ${s.first_name} ${s.name || ''}`.trim().replace(/,$/, '')}</td>
                  <td><span className="font-mono text-[12px] text-mute">{s.level || '—'}</span></td>
                  <td className="text-right whitespace-nowrap">
                    <button className="p-2 rounded-lg text-mute hover:text-seal hover:bg-seal/5 transition" title="Edit"><Pencil size={15} /></button>
                    <button className="p-2 rounded-lg text-mute hover:text-fail hover:bg-fail/5 transition" title="Delete"><Trash2 size={15} /></button>
                  </td>
                </tr>
              )) : (
                <tr><td colSpan="4">
                  <EmptyState icon={Users} title="No students found"
                    hint="Add the first enrolment record, or clear the search."
                    action={<Button variant="ghost" icon={UserPlus} onClick={() => setIsModalOpen(true)}>Add student</Button>} />
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Reveal>

      <Modal open={isModalOpen} onClose={() => setIsModalOpen(false)} title="New student record" wide>
        <form onSubmit={handleAddStudent} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Matric number</label>
              <input type="text" required className="field font-mono" placeholder="e.g. 13/PDBED/30287" value={newStudent.matric_no} onChange={set('matric_no')} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Surname</label>
              <input type="text" required className="field" value={newStudent.surname} onChange={set('surname')} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">First name</label>
              <input type="text" required className="field" value={newStudent.first_name} onChange={set('first_name')} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Middle name</label>
              <input type="text" className="field" value={newStudent.middle_name} onChange={set('middle_name')} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Gender</label>
              <select className="field" value={newStudent.sex} onChange={set('sex')}>
                <option value="">Select…</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Date of birth</label>
              <input type="date" className="field" value={newStudent.date_of_birth} onChange={set('date_of_birth')} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Telephone</label>
              <input type="text" className="field" value={newStudent.telephone} onChange={set('telephone')} />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Address</label>
              <textarea className="field" rows="2" value={newStudent.address} onChange={set('address')} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Current level</label>
              <input type="text" className="field" placeholder="e.g. NCE 1" value={newStudent.current_level} onChange={set('current_level')} />
            </div>
            <div>
              <label className="block text-[12px] font-semibold text-mute mb-1.5">Department</label>
              <select className="field" value={newStudent.department_id} onChange={set('department_id')}>
                <option value="">Select department…</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-6">
            <Button variant="ghost" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit" disabled={saving}>{saving ? 'Saving…' : 'Save student'}</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}