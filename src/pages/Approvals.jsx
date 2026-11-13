import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, Inbox } from 'lucide-react';
import { PageHeader, Button } from '../components/ui';
import { API, authFetch } from '../lib/api';

export default function Approvals() {
  const [pending, setPending] = useState(null);
  const [busy, setBusy] = useState(null);
  const [note, setNote] = useState(null);

  const load = async () => {
    try {
      const r = await authFetch(`${API}/api/database/pending`);
      setPending(r.ok ? await r.json() : []);
    } catch {
      setPending([]);
    }
  };
  useEffect(() => { load(); }, []);

  const act = async (code, approve) => {
    setBusy(code); setNote(null);
    try {
      const r = await authFetch(`${API}/api/database/${approve ? 'approve' : 'reject'}/${code}`, { method: 'POST' });
      const data = r.ok ? await r.json() : { detail: 'Action failed' };
      if (!r.ok) setNote(data.detail);
      else setNote({
        ok: true,
        text: approve
          ? `${data.display_name} approved — their registry admin can now sign in.`
          : `${code} rejected and the provisioned database removed.`,
      });
      await load();
    } catch { setNote('Action failed'); }
    finally { setBusy(null); }
  };

  return (
    <div>
      <PageHeader
        eyebrow="Platform operator"
        title="Institution approvals"
        subtitle="Self-service registrations awaiting JasadPlus approval. Approving activates the provisioned database and admin login; rejecting removes the provisioned copy."
      />

      {note && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
          className={`mb-5 rounded-xl border px-5 py-4 text-sm flex items-center gap-2.5 ${
            note.ok ? 'border-pass/30 bg-pass/5 text-pass' : 'border-fail/25 bg-fail/5 text-fail'}`}>
          {note.ok ? <CheckCircle2 size={17} /> : <XCircle size={17} />} {note.text}
        </motion.div>
      )}

      {pending === null ? (
        <div className="flex items-center gap-2.5 text-mute text-sm py-8">
          <Loader2 size={16} className="animate-spin" /> Loading…
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white border border-line rounded-xl p-10 text-center text-mute text-sm">
          <Inbox size={24} className="mx-auto mb-3 opacity-40" />
          No pending registrations — any new institution that signs up appears here.
        </div>
      ) : (
        <div className="space-y-4 max-w-3xl">
          {pending.map((p) => (
            <motion.div
              key={p.code}
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-line rounded-xl p-6 flex flex-wrap items-center justify-between gap-4"
            >
              <div className="min-w-0">
                <div className="font-display text-[17px] font-semibold text-ink">{p.display_name}</div>
                <div className="text-[12px] text-mute mt-1.5 flex flex-wrap gap-x-5 gap-y-1">
                  <span className="font-mono">{p.code}</span>
                  <span>admin: <span className="font-mono text-ink">{p.admin_username}</span></span>
                  {p.contact_email && <span>{p.contact_email}</span>}
                </div>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => act(p.code, true)}
                  icon={busy === p.code ? Loader2 : CheckCircle2}
                  disabled={!!busy}
                  className={busy === p.code ? 'animate-pulse' : ''}
                >
                  {busy === p.code ? 'Approving…' : 'Approve'}
                </Button>
                <Button variant="ghost" onClick={() => act(p.code, false)} icon={XCircle} disabled={!!busy}>
                  Reject
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <p className="mt-8 text-[11.5px] text-mute flex items-center gap-2">
        <ShieldCheck size={13} className="text-brass" />
        Approved institutions are isolated: separate database, separate login accounts, invisible to every other university.
      </p>
    </div>
  );
}
