import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, UserPlus, KeyRound, ShieldCheck, Loader2, ShieldOff, ShieldAlert, UserCog,
} from 'lucide-react';
import { PageHeader, Button, Reveal } from '../components/ui';
import { API, authFetch } from '../lib/api';
import { onInstitutionChanged } from '../lib/useInstitution';

const ROLES = ['Admin', 'Developer', 'Lecturer', 'Standard'];
const MANAGE = ['Admin', 'Developer'];

const ROLE_HINT = {
  Admin: 'Full registry control, manages users',
  Developer: 'Registry control, manages users',
  Lecturer: 'Enters scores, views reports',
  Standard: 'Read-only access',
};

export default function UsersManager({ myRole, myUsername }) {
  const [users, setUsers] = useState(null);
  const [loadFail, setLoadFail] = useState(false);
  const [form, setForm] = useState({ username: '', password: '', role: 'Lecturer' });
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState(null);
  const [resetFor, setResetFor] = useState(null);
  const [resetPw, setResetPw] = useState('');
  const canManage = myRole && MANAGE.includes(myRole);

  const load = async () => {
    setLoadFail(false);
    try {
      const r = await authFetch(`${API}/api/users`);
      if (!r.ok) { setLoadFail(true); setUsers([]); return; }
      setUsers(await r.json());
    } catch {
      setLoadFail(true); setUsers([]);
    }
  };
  useEffect(() => { load(); return onInstitutionChanged(load); }, []);

  const post = async (path, body, busyKey, after) => {
    setBusy(busyKey); setNote(null);
    try {
      const r = await authFetch(`${API}/api/users/${path}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
      });
      const data = await r.json();
      if (!r.ok) { setNote({ bad: true, text: data.detail }); return; }
      setNote({ ok: true, text: data.username ? `${data.username} updated.` : 'Done.' });
      after?.();
      await load();
    } catch { setNote({ bad: true, text: 'Action failed' }); }
    finally { setBusy(null); }
  };

  const add = (e) => {
    e.preventDefault();
    post('add', form, 'add', () => setForm({ username: '', password: '', role: 'Lecturer' }));
  };

  return (
    <div>
      <PageHeader
        eyebrow="Registry"
        title="User accounts"
        subtitle="The people at your institution who work with records. Accounts live strictly inside your university's database — no other institution exists as far as this list is concerned."
      />

      {note && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className={`mb-5 rounded-xl border px-5 py-4 text-sm flex items-center gap-2.5 ${
            note.ok ? 'border-pass/30 bg-pass/5 text-pass' : 'border-fail/25 bg-fail/5 text-fail'}`}>
          {note.ok ? <ShieldCheck size={17} /> : <ShieldAlert size={17} />} {note.text}
        </motion.div>
      )}

      {users === null ? (
        <div className="flex items-center gap-2.5 text-mute text-sm py-8"><Loader2 size={16} className="animate-spin" /> Loading…</div>
      ) : loadFail ? (
        <div className="bg-fail/5 border border-fail/25 text-fail rounded-xl px-5 py-4 text-sm">The records server could not be reached — start the backend and reload.</div>
      ) : (
        <>
          {/* accounts table */}
          <Reveal>
            <div className="bg-white border border-line rounded-xl overflow-hidden mb-6">
              <table className="ledger">
                <thead>
                  <tr><th>Username</th><th>Role</th><th>Status</th><th>Last sign-in</th>{canManage && <th className="text-right">Actions</th>}</tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.username}>
                      <td>
                        <div className="font-medium text-ink">{u.username}</div>
                        <div className="text-[11px] text-mute">{ROLE_HINT[u.role] || ''}</div>
                      </td>
                      <td>
                        {canManage ? (
                          <select
                            value={u.role}
                            disabled={busy === `role-${u.username}`}
                            onChange={(e) => post('role', { username: u.username, role: e.target.value }, `role-${u.username}`)}
                            className="appearance-none bg-transparent text-[12.5px] text-ink border border-line rounded-md px-2 py-1 hover:border-ink/30 cursor-pointer"
                          >
                            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                          </select>
                        ) : <span className="text-[12.5px] text-mute">{u.role}</span>}
                      </td>
                      <td>
                        {u.is_active
                          ? <span className="stamp" style={{ color: '#1f7a4d' }}>Active</span>
                          : <span className="stamp" style={{ color: '#b3261e' }}>Deactivated</span>}
                      </td>
                      <td className="text-[12.5px] text-mute">{u.last_login ? new Date(u.last_login).toLocaleString() : 'Never'}</td>
                      {canManage && (
                        <td className="text-right whitespace-nowrap">
                          <button
                            onClick={() => { setResetFor(u.username); setResetPw(''); }}
                            disabled={busy?.startsWith('reset')}
                            className="text-[12px] text-mute hover:text-ink transition-colors inline-flex items-center gap-1.5 mr-4"
                          >
                            <KeyRound size={13} /> Password
                          </button>
                          <button
                            onClick={() => post('toggle', { username: u.username }, `toggle-${u.username}`)}
                            disabled={busy === `toggle-${u.username}` || u.username === myUsername}
                            title={u.username === myUsername ? 'You cannot deactivate yourself' : ''}
                            className={`text-[12px] transition-colors inline-flex items-center gap-1.5 disabled:opacity-40 ${
                              u.is_active ? 'text-fail hover:opacity-70' : 'text-pass'}`}
                          >
                            <ShieldOff size={13} /> {u.is_active ? 'Deactivate' : 'Activate'}
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>

          {/* password reset drawer */}
          {canManage && resetFor && (
            <Reveal>
              <form
                onSubmit={(e) => { e.preventDefault(); post('reset', { username: resetFor, new_password: resetPw }, `reset-${resetFor}`, () => setResetFor(null)); }}
                className="mb-6 bg-white border border-line rounded-xl p-6"
              >
                <h3 className="font-display text-[16px] font-semibold text-ink mb-1">Reset password — <span className="font-mono">{resetFor}</span></h3>
                <p className="text-[12px] text-mute mb-4">The user signs in with the new password immediately.</p>
                <div className="flex gap-3 max-w-md">
                  <input type="password" className="field" placeholder="New password (8+ characters)"
                    value={resetPw} onChange={(e) => setResetPw(e.target.value)} autoComplete="new-password" />
                  <Button type="submit" icon={KeyRound} disabled={resetPw.length < 8 || busy === `reset-${resetFor}`}>
                    {busy === `reset-${resetFor}` ? 'Saving…' : 'Set password'}
                  </Button>
                  <Button variant="ghost" onClick={() => setResetFor(null)}>Cancel</Button>
                </div>
              </form>
            </Reveal>
          )}

          {/* add staff */}
          {canManage && (
            <Reveal>
              <form onSubmit={add} className="bg-white border border-line rounded-xl p-6 max-w-3xl">
                <div className="flex items-center gap-2.5 mb-1">
                  <UserPlus size={17} style={{ color: '#2C5697' }} />
                  <h3 className="font-display text-[16px] font-semibold text-ink">Add a staff account</h3>
                </div>
                <p className="text-[12px] text-mute mb-5">
                  Give the account to one person and the role that matches their duties.
                  Deactivated accounts cannot sign in.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_200px_auto] gap-3 items-start">
                  <div>
                    <label className="block text-[12px] font-semibold text-mute mb-1.5">Username</label>
                    <input className="field" placeholder="e.g. mrs_adeoye" value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="off" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-mute mb-1.5">Password</label>
                    <input type="password" className="field" placeholder="8+ characters" value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="new-password" />
                  </div>
                  <div>
                    <label className="block text-[12px] font-semibold text-mute mb-1.5">Role</label>
                    <select className="field" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                      {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                    </select>
                  </div>
                  <Button type="submit" icon={busy === 'add' ? Loader2 : UserPlus} disabled={busy === 'add'} className="mt-6">
                    {busy === 'add' ? 'Creating…' : 'Create account'}
                  </Button>
                </div>
              </form>
            </Reveal>
          )}

          {!canManage && (
            <p className="mt-8 text-[12px] text-mute flex items-center gap-2">
              <UserCog size={13} /> Ask your registry administrator for account changes.
            </p>
          )}
        </>
      )}
    </div>
  );
}
