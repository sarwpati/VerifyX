import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  ShieldAlert,
  ShieldCheck,
  Building2,
  Lock,
  Search,
  FileCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Activity,
  Globe,
  Loader2,
  RefreshCw
} from 'lucide-react';
import AuditTimeline from '../components/AuditTimeline';

export default function AdminPortal() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState('orgs'); // 'orgs' | 'audit' | 'threats'
  const [stats, setStats] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [auditFilter, setAuditFilter] = useState('all');
  const [auditSearch, setAuditSearch] = useState('');

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, orgsRes, logsRes] = await Promise.all([
        api.get('/admin/dashboard-stats'),
        api.get('/admin/organizations'),
        api.get('/admin/audit-logs'),
      ]);

      if (statsRes.data.success) setStats(statsRes.data.metrics);
      if (orgsRes.data.success) setOrganizations(orgsRes.data.organizations);
      if (logsRes.data.success) setAuditLogs(logsRes.data.logs);
    } catch (err) {
      console.error('Failed to fetch admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOrgStatus = async (orgId, newStatus) => {
    try {
      const res = await api.patch(`/admin/organizations/${orgId}/status`, { status: newStatus });
      if (res.data.success) {
        fetchAdminData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update organization status.');
    }
  };

  const filteredLogs = auditLogs.filter((log) => {
    if (auditFilter !== 'all' && log.status !== auditFilter) return false;
    if (auditSearch) {
      const search = auditSearch.toLowerCase();
      return (
        (log.certificateId && log.certificateId.toLowerCase().includes(search)) ||
        (log.ipAddress && log.ipAddress.toLowerCase().includes(search)) ||
        (log.action && log.action.toLowerCase().includes(search))
      );
    }
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Admin Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-900 border border-purple-500/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 font-bold text-lg">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                VerifyX Network Security & Root Oversight
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono">
                Root Security Shield
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Global authority monitoring issuer vetting, cryptographic key registries, and fraud deterrence.
            </p>
          </div>
        </div>

        <button
          onClick={fetchAdminData}
          className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center gap-2 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Stats</span>
        </button>
      </div>

      {/* Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase">Verified Institutions</span>
            <p className="text-2xl font-extrabold text-purple-400">{stats.verifiedOrgs}</p>
            <span className="text-[10px] text-slate-500 font-mono">Active Key Holders</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase">Network Credentials</span>
            <p className="text-2xl font-extrabold text-emerald-400">{stats.totalCertificates}</p>
            <span className="text-[10px] text-emerald-400 font-mono">{stats.validCertificates} Valid • {stats.revokedCertificates} Revoked</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase">Total Verifications</span>
            <p className="text-2xl font-extrabold text-cyan-400">{stats.totalVerifications}</p>
            <span className="text-[10px] text-cyan-400 font-mono">Public Validations</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-rose-500/30 space-y-1">
            <span className="text-xs text-rose-400 font-mono uppercase flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" /> Tamper Alerts
            </span>
            <p className="text-2xl font-extrabold text-rose-400">{stats.totalTamperAttempts || 1}</p>
            <span className="text-[10px] text-rose-400 font-mono">Counterfeits Blocked</span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-slate-800 flex items-center gap-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('orgs')}
          className={`pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'orgs'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Issuer Institutions ({organizations.length})
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'audit'
              ? 'border-purple-400 text-purple-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Global Audit Trail ({filteredLogs.length})
        </button>
      </div>

      {/* TAB 1: ORGANIZATIONS */}
      {activeTab === 'orgs' && (
        <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
              <tr>
                <th className="p-3.5">Institution</th>
                <th className="p-3.5">Code</th>
                <th className="p-3.5">Ed25519 Key ID</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Issued Certs</th>
                <th className="p-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {organizations.map((org) => (
                <tr key={org._id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="p-3.5 font-sans font-semibold text-white">
                    {org.name}
                    <div className="text-[11px] font-mono text-slate-500 font-normal">{org.email}</div>
                  </td>
                  <td className="p-3.5 text-purple-300 font-bold">{org.code}</td>
                  <td className="p-3.5 text-emerald-400">{org.pki?.keyId}</td>
                  <td className="p-3.5">
                    <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                      org.status === 'verified' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                      org.status === 'suspended' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30' :
                      'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    }`}>
                      {org.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-slate-400">{org.stats?.issuedCount || 0}</td>
                  <td className="p-3.5 text-right space-x-2">
                    {org.status !== 'verified' && (
                      <button
                        onClick={() => handleUpdateOrgStatus(org._id, 'verified')}
                        className="px-2.5 py-1 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 font-semibold"
                      >
                        Approve
                      </button>
                    )}
                    {org.status === 'verified' && (
                      <button
                        onClick={() => handleUpdateOrgStatus(org._id, 'suspended')}
                        className="px-2.5 py-1 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-semibold"
                      >
                        Suspend
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                placeholder="Filter by ID, IP, or action..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 text-xs font-mono">
              {['all', 'SUCCESS', 'WARNING', 'SECURITY_ALERT'].map((st) => (
                <button
                  key={st}
                  onClick={() => setAuditFilter(st)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    auditFilter === st
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {st.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          <AuditTimeline logs={filteredLogs} />
        </div>
      )}

    </div>
  );
}
