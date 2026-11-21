import React from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  FileCheck,
  Key,
  Layers,
  UserCheck,
  Clock,
  Globe
} from 'lucide-react';

export default function AuditTimeline({ logs = [] }) {
  if (!logs || logs.length === 0) {
    return (
      <div className="p-8 text-center text-slate-500 text-xs font-mono">
        No audit log entries recorded yet.
      </div>
    );
  }

  const getActionConfig = (action) => {
    switch (action) {
      case 'CERTIFICATE_ISSUED':
        return { icon: FileCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/30' };
      case 'BATCH_CERTIFICATES_ISSUED':
        return { icon: Layers, color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/30' };
      case 'CERTIFICATE_REVOKED':
        return { icon: AlertTriangle, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' };
      case 'TAMPER_ATTEMPT_DETECTED':
        return { icon: ShieldAlert, color: 'text-rose-400', bg: 'bg-rose-500/15 border-rose-500/40' };
      case 'KEY_ROTATED':
        return { icon: Key, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' };
      case 'ORGANIZATION_VERIFIED':
        return { icon: UserCheck, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' };
      default:
        return { icon: ShieldCheck, color: 'text-slate-400', bg: 'bg-slate-800 border-slate-700' };
    }
  };

  return (
    <div className="space-y-3">
      {logs.map((log, index) => {
        const config = getActionConfig(log.action);
        const Icon = config.icon;

        return (
          <div
            key={log._id || index}
            className={`p-4 rounded-xl border transition-all ${
              log.status === 'SECURITY_ALERT' ? 'bg-rose-950/30 border-rose-500/40' : 'bg-slate-900/60 border-slate-800'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${config.bg} ${config.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono text-slate-200">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                      log.status === 'SECURITY_ALERT' ? 'bg-rose-500 text-white' :
                      log.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                      'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}>
                      {log.status}
                    </span>
                  </div>
                  {log.certificateId && (
                    <p className="text-[11px] font-mono text-emerald-400 mt-0.5">
                      Target Certificate: {log.certificateId}
                    </p>
                  )}
                </div>
              </div>

              {/* IP & Timestamp */}
              <div className="flex items-center gap-4 text-[11px] font-mono text-slate-400 sm:text-right">
                <div className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-500" />
                  <span>{log.ipAddress}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span>{new Date(log.createdAt || log.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
            </div>

            {/* Details Preview */}
            {log.details && Object.keys(log.details).length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] font-mono text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                {Object.entries(log.details).map(([k, v]) => (
                  <span key={k}>
                    <strong className="text-slate-300">{k}:</strong> {typeof v === 'object' ? JSON.stringify(v) : String(v)}
                  </span>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
