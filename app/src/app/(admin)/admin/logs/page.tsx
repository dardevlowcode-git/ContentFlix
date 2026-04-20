import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

export const metadata: Metadata = { title: 'Admin — Log' }

export default async function AdminLogsPage() {
  const supabase = createAdminClient()

  const [{ data: appLogs }, { data: auditLogs }] = await Promise.all([
    supabase
      .from('app_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('audit_logs')
      .select('*, users(email, display_name)')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const levelColor: Record<string, string> = {
    info: 'text-primary',
    warn: 'text-amber-500',
    error: 'text-error',
    debug: 'text-on-surface-variant',
  }

  return (
    <div className="p-8 max-w-6xl">
      <header className="mb-10">
        <h1 className="font-headline text-3xl font-extrabold tracking-tight text-on-surface mb-1">
          Log e audit
        </h1>
        <p className="text-on-surface-variant text-sm">Retention: 7 giorni. Log eliminati automaticamente.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* App logs */}
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Log applicazione</h2>
          <div className="bg-surface-container-lowest rounded-2xl p-4 shadow-ambient font-mono text-xs space-y-1 max-h-[600px] overflow-y-auto">
            {!appLogs || appLogs.length === 0 ? (
              <p className="text-on-surface-variant text-center py-8">Nessun log disponibile.</p>
            ) : (
              appLogs.map((log) => (
                <div key={log.id} className="flex gap-2 py-1 border-b border-surface-container-high last:border-0">
                  <span className="text-outline shrink-0 w-14">
                    {new Date(log.created_at).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className={`w-12 shrink-0 font-bold uppercase ${levelColor[log.level] ?? ''}`}>
                    {log.level}
                  </span>
                  <span className="text-on-surface-variant leading-relaxed flex-1 line-clamp-2">
                    {log.message}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Audit trail */}
        <div>
          <h2 className="font-headline text-lg font-bold text-on-surface mb-4">Audit trail</h2>
          <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient max-h-[600px] overflow-y-auto">
            {!auditLogs || auditLogs.length === 0 ? (
              <p className="text-on-surface-variant text-center py-8 px-4">Nessun audit log.</p>
            ) : (
              auditLogs.map((log, i) => (
                <div
                  key={log.id}
                  className={`px-5 py-3 border-b border-surface-container-high last:border-0
                               ${i % 2 === 0 ? 'bg-surface-container-lowest' : 'bg-surface-container-low'}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-on-surface">{log.action}</p>
                      <p className="text-xs text-on-surface-variant">
                        {/* @ts-expect-error — joined users */}
                        {log.users?.email ?? 'sistema'} · {log.resource_type}
                        {log.resource_id ? ` / ${log.resource_id.slice(0, 8)}…` : ''}
                      </p>
                    </div>
                    <span className="text-xs text-outline shrink-0">
                      {new Date(log.created_at).toLocaleDateString('it-IT')}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
