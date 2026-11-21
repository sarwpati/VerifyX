import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Building2,
  FileCheck,
  Award,
  Layers,
  Key,
  PlusCircle,
  Upload,
  RefreshCw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Download,
  QrCode,
  Eye,
  Trash2,
  FileText,
  ShieldAlert,
  Sparkles,
  Copy,
  Check,
  Loader2,
  X
} from 'lucide-react';
import CertificatePreview from '../components/CertificatePreview';
import MerkleTreeVisualizer from '../components/MerkleTreeVisualizer';

export default function OrganizationDashboard() {
  const { user, organization, refreshUser } = useAuth();
  
  const [activeTab, setActiveTab] = useState('manage'); // 'manage' | 'single' | 'batch' | 'keys'
  const [stats, setStats] = useState(null);
  const [certificates, setCertificates] = useState([]);
  const [loadingCerts, setLoadingCerts] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Single Issue Form State
  const [singleForm, setSingleForm] = useState({
    recipientName: '',
    recipientEmail: '',
    rollNumber: '',
    department: '',
    title: 'Bachelor of Technology in Computer Science & Engineering',
    courseName: 'Four-Year Undergraduate Degree Program',
    gradeOrScore: '9.20 CGPA (First Class with Distinction)',
    issueDate: new Date().toISOString().split('T')[0],
  });
  const [issuingSingle, setIssuingSingle] = useState(false);
  const [issuedCertResult, setIssuedCertResult] = useState(null);

  // Batch Issue State
  const [batchFile, setBatchFile] = useState(null);
  const [batchTitle, setBatchTitle] = useState('Bachelor of Technology - Class of 2026');
  const [issuingBatch, setIssuingBatch] = useState(false);
  const [batchResult, setBatchResult] = useState(null);

  // Revocation Modal State
  const [revokeModalOpen, setRevokeModalOpen] = useState(false);
  const [certToRevoke, setCertToRevoke] = useState(null);
  const [revocationReason, setRevocationReason] = useState('');
  const [revoking, setRevoking] = useState(false);

  // QR Modal State
  const [qrModalCert, setQrModalCert] = useState(null);

  // Key Rotation State
  const [rotatingKeys, setRotatingKeys] = useState(false);
  const [copiedKey, setCopiedKey] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchCertificates();
  }, [statusFilter]);

  const fetchStats = async () => {
    try {
      const res = await api.get('/org/stats');
      if (res.data.success) {
        setStats(res.data.stats);
      }
    } catch (err) {
      console.error('Failed to fetch org stats:', err);
    }
  };

  const fetchCertificates = async () => {
    setLoadingCerts(true);
    try {
      const res = await api.get(`/certificates/organization?status=${statusFilter}&search=${searchTerm}`);
      if (res.data.success) {
        setCertificates(res.data.certificates);
      }
    } catch (err) {
      console.error('Failed to fetch certificates:', err);
    } finally {
      setLoadingCerts(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchCertificates();
  };

  // Handle Single Issue
  const handleSingleSubmit = async (e) => {
    e.preventDefault();
    setIssuingSingle(true);
    setIssuedCertResult(null);

    try {
      const res = await api.post('/certificates/issue', singleForm);
      if (res.data.success) {
        setIssuedCertResult(res.data.certificate);
        fetchStats();
        fetchCertificates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Issuance failed.');
    } finally {
      setIssuingSingle(false);
    }
  };

  // Handle Batch Issue
  const handleBatchSubmit = async (e) => {
    e.preventDefault();
    if (!batchFile) {
      alert('Please select a CSV file to upload.');
      return;
    }

    setIssuingBatch(true);
    setBatchResult(null);

    try {
      const formData = new FormData();
      formData.append('file', batchFile);
      formData.append('batchTitle', batchTitle);

      const res = await api.post('/certificates/batch-issue', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        setBatchResult(res.data.batch);
        fetchStats();
        fetchCertificates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Batch issuance failed.');
    } finally {
      setIssuingBatch(false);
    }
  };

  // Handle Revocation
  const handleConfirmRevoke = async () => {
    if (!certToRevoke) return;
    setRevoking(true);

    try {
      const res = await api.post(`/certificates/revoke/${certToRevoke.certificateId}`, {
        reason: revocationReason || 'Revoked by institution authority.',
      });

      if (res.data.success) {
        setRevokeModalOpen(false);
        setCertToRevoke(null);
        setRevocationReason('');
        fetchStats();
        fetchCertificates();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Revocation failed.');
    } finally {
      setRevoking(false);
    }
  };

  // Handle Key Rotation
  const handleRotateKeys = async () => {
    if (!window.confirm('Are you sure you want to rotate your organization Ed25519 PKI keys? New certificates will be signed with the new keypair.')) {
      return;
    }

    setRotatingKeys(true);
    try {
      const res = await api.post('/org/rotate-keys', {
        reason: 'Scheduled manual key rotation',
      });
      if (res.data.success) {
        alert('Ed25519 cryptographic keys rotated successfully.');
        refreshUser();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Key rotation failed.');
    } finally {
      setRotatingKeys(false);
    }
  };

  const copyPublicKey = () => {
    if (organization?.pki?.publicKey) {
      navigator.clipboard.writeText(organization.pki.publicKey);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Organization Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-navy-900 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold text-lg">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {organization?.name || 'Institution Issuance Authority'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-mono">
                Verified Authority
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>Org Code: <strong className="text-slate-200 font-mono">{organization?.code}</strong></span>
              <span>•</span>
              <span>Active PKI KeyID: <strong className="text-emerald-400 font-mono">{organization?.pki?.keyId}</strong></span>
            </p>
          </div>
        </div>

        {/* Top Right Stats Pills */}
        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={() => setActiveTab('single')}
            className="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold flex items-center gap-1.5 shadow-glow-emerald transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Issue Certificate</span>
          </button>
          <button
            onClick={() => setActiveTab('batch')}
            className="px-4 py-2 rounded-xl bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/40 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
          >
            <Layers className="w-4 h-4" />
            <span>Batch Merkle CSV</span>
          </button>
        </div>
      </div>

      {/* Metrics Row */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase">Total Issued</span>
            <p className="text-2xl font-extrabold text-white">{stats.totalIssued}</p>
            <span className="text-[10px] text-emerald-400 font-mono">100% Ed25519 Signed</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase">Verifications</span>
            <p className="text-2xl font-extrabold text-cyan-400">{stats.totalVerifications}</p>
            <span className="text-[10px] text-cyan-400 font-mono">Public Checks</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase">Merkle Batched</span>
            <p className="text-2xl font-extrabold text-purple-400">{stats.batchIssued}</p>
            <span className="text-[10px] text-purple-400 font-mono">Batch Anchored</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
            <span className="text-xs text-slate-400 font-mono uppercase">Revoked</span>
            <p className="text-2xl font-extrabold text-amber-400">{stats.totalRevoked}</p>
            <span className="text-[10px] text-amber-400 font-mono">Audit Invalidation</span>
          </div>
        </div>
      )}

      {/* Main Tabs Navigation */}
      <div className="border-b border-slate-800 flex items-center gap-4 text-xs font-mono">
        <button
          onClick={() => setActiveTab('manage')}
          className={`pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'manage'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Manage Issued ({certificates.length})
        </button>

        <button
          onClick={() => setActiveTab('single')}
          className={`pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'single'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Single Issuance Engine
        </button>

        <button
          onClick={() => setActiveTab('batch')}
          className={`pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'batch'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Batch Merkle CSV Issuance
        </button>

        <button
          onClick={() => setActiveTab('keys')}
          className={`pb-3 font-semibold transition-colors border-b-2 ${
            activeTab === 'keys'
              ? 'border-emerald-400 text-emerald-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Ed25519 PKI Keys
        </button>
      </div>

      {/* TAB 1: MANAGE CERTIFICATES */}
      {activeTab === 'manage' && (
        <div className="space-y-6">
          
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <form onSubmit={handleSearch} className="flex items-center gap-2 w-full sm:w-80">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search student, ID, or title..."
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 font-mono"
              >
                Search
              </button>
            </form>

            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 text-xs font-mono self-start sm:self-auto">
              {['all', 'valid', 'revoked', 'expired'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3 py-1 rounded-lg capitalize transition-colors ${
                    statusFilter === st
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold'
                      : 'text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {/* Certificates Table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-950/70">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-900 border-b border-slate-800 text-slate-400">
                <tr>
                  <th className="p-3.5">Certificate ID</th>
                  <th className="p-3.5">Recipient</th>
                  <th className="p-3.5">Degree / Title</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Verifications</th>
                  <th className="p-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {loadingCerts ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-emerald-400" />
                      <p className="mt-2 text-xs">Loading certificates...</p>
                    </td>
                  </tr>
                ) : certificates.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-500">
                      No certificates found. Issue your first credential to get started!
                    </td>
                  </tr>
                ) : (
                  certificates.map((cert) => (
                    <tr key={cert._id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="p-3.5 font-bold text-emerald-400">
                        {cert.certificateId}
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-white font-sans">{cert.recipient.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{cert.recipient.email}</div>
                      </td>
                      <td className="p-3.5 font-sans max-w-xs truncate text-slate-200">
                        {cert.details.title}
                      </td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                          cert.status === 'valid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                          cert.status === 'revoked' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                          'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        }`}>
                          {cert.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">
                        {cert.verificationCount || 0} scans
                      </td>
                      <td className="p-3.5 text-right space-x-2">
                        {/* View in Verify Portal */}
                        <a
                          href={`/verify/${cert.certificateId}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 inline-block"
                          title="View Verification Portal"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </a>

                        {/* Download PDF */}
                        {cert.pdfUrl && (
                          <a
                            href={cert.pdfUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 inline-block"
                            title="Download Signed PDF"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </a>
                        )}

                        {/* Show QR */}
                        <button
                          onClick={() => setQrModalCert(cert)}
                          className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                          title="View Dynamic QR"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                        </button>

                        {/* Revoke Button if valid */}
                        {cert.status === 'valid' && (
                          <button
                            onClick={() => {
                              setCertToRevoke(cert);
                              setRevokeModalOpen(true);
                            }}
                            className="p-1.5 rounded bg-rose-500/20 hover:bg-rose-500/30 text-rose-300"
                            title="Revoke Certificate"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      )}

      {/* TAB 2: SINGLE ISSUANCE */}
      {activeTab === 'single' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Form */}
          <form onSubmit={handleSingleSubmit} className="space-y-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <Award className="w-5 h-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase">
                Issue Tamper-Evident Credential
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Student Full Name *</label>
                <input
                  type="text"
                  required
                  value={singleForm.recipientName}
                  onChange={(e) => setSingleForm({ ...singleForm, recipientName: e.target.value })}
                  placeholder="e.g. Aarav Sharma"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Student Email *</label>
                <input
                  type="email"
                  required
                  value={singleForm.recipientEmail}
                  onChange={(e) => setSingleForm({ ...singleForm, recipientEmail: e.target.value })}
                  placeholder="aarav.sharma@domain.edu"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Roll / Student ID</label>
                <input
                  type="text"
                  value={singleForm.rollNumber}
                  onChange={(e) => setSingleForm({ ...singleForm, rollNumber: e.target.value })}
                  placeholder="e.g. 220101001"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Department / Branch</label>
                <input
                  type="text"
                  value={singleForm.department}
                  onChange={(e) => setSingleForm({ ...singleForm, department: e.target.value })}
                  placeholder="Computer Science & Engineering"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Certificate Title *</label>
              <input
                type="text"
                required
                value={singleForm.title}
                onChange={(e) => setSingleForm({ ...singleForm, title: e.target.value })}
                placeholder="Bachelor of Technology in Computer Science"
                className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Course / Curriculum</label>
                <input
                  type="text"
                  value={singleForm.courseName}
                  onChange={(e) => setSingleForm({ ...singleForm, courseName: e.target.value })}
                  placeholder="Four-Year Undergraduate Degree Program"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Grade / Distinction</label>
                <input
                  type="text"
                  value={singleForm.gradeOrScore}
                  onChange={(e) => setSingleForm({ ...singleForm, gradeOrScore: e.target.value })}
                  placeholder="9.42 CGPA (First Class with Distinction)"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={issuingSingle}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-bold font-mono shadow-glow-emerald transition-all flex items-center justify-center gap-2"
            >
              {issuingSingle ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
              <span>{issuingSingle ? 'Digitally Signing & Generating PDF...' : 'Sign with Ed25519 & Issue Credential'}</span>
            </button>
          </form>

          {/* Real-time Preview / Result */}
          <div className="space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">
              {issuedCertResult ? 'Issued Certificate (Cryptographically Anchored)' : 'Live Certificate Preview'}
            </h4>

            {issuedCertResult ? (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center justify-between">
                  <span>Certificate Issued! ID: <strong>{issuedCertResult.certificateId}</strong></span>
                  <a
                    href={issuedCertResult.pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1 rounded bg-emerald-500 text-white font-bold"
                  >
                    Download PDF
                  </a>
                </div>
                <CertificatePreview certificate={issuedCertResult} />
              </div>
            ) : (
              <div className="p-6 rounded-2xl bg-slate-950/70 border border-slate-800 text-center space-y-4">
                <p className="text-xs text-slate-400 font-mono">
                  Fill out the form on the left to sign and generate an official PDF certificate with embedded QR code.
                </p>
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left font-mono text-[11px] text-slate-400 space-y-1">
                  <div><strong>Issuer:</strong> {organization?.name}</div>
                  <div><strong>Algorithm:</strong> Ed25519 (Edwards-curve)</div>
                  <div><strong>Canonicalizer:</strong> RFC 8785 (JCS)</div>
                  <div><strong>Target Student:</strong> {singleForm.recipientName || '(Recipient Name)'}</div>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

      {/* TAB 3: BATCH MERKLE ISSUANCE */}
      {activeTab === 'batch' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Batch Upload Form */}
            <form onSubmit={handleBatchSubmit} className="space-y-4 p-6 rounded-2xl bg-slate-900/60 border border-slate-800">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
                <Layers className="w-5 h-5 text-cyan-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Batch Merkle Tree CSV Engine
                </h3>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Batch Award Title *</label>
                <input
                  type="text"
                  required
                  value={batchTitle}
                  onChange={(e) => setBatchTitle(e.target.value)}
                  placeholder="Graduating Class of 2026 - B.Tech"
                  className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* CSV Drop Area */}
              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1">Upload Student Roster CSV *</label>
                <div className="p-6 rounded-xl border-2 border-dashed border-slate-700 bg-slate-950/60 text-center cursor-pointer hover:border-cyan-400 transition-colors">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={(e) => setBatchFile(e.target.files[0])}
                    className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-cyan-500 file:text-white hover:file:bg-cyan-600 cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500 mt-2 font-mono">
                    Expected columns: name, email, rollNumber, department, grade
                  </p>
                </div>
              </div>

              <button
                type="submit"
                disabled={issuingBatch || !batchFile}
                className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-slate-950 text-xs font-bold font-mono shadow-glow-blue transition-all flex items-center justify-center gap-2"
              >
                {issuingBatch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                <span>{issuingBatch ? 'Computing Merkle Tree & Issuing Batch...' : 'Generate Merkle Tree & Batch Issue'}</span>
              </button>
            </form>

            {/* Merkle Batch Explanation Box */}
            <div className="p-6 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-4">
              <h4 className="text-xs font-mono font-bold text-cyan-400 uppercase flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" /> How Batch Merkle Proofs Function
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                When issuing certificates in bulk (e.g. 500 college graduates), VerifyX constructs a <strong>Cryptographic Binary Merkle Tree</strong>:
              </p>
              <ul className="text-xs text-slate-400 space-y-2 list-disc pl-4 font-mono">
                <li>Every student certificate is canonicalized and hashed into a leaf node.</li>
                <li>Leaf nodes are combined in pairs via SHA-256 up to the single <strong>Merkle Root</strong>.</li>
                <li>The organization digitally signs the Merkle Root with Ed25519.</li>
                <li>Verifiers can verify any individual certificate with \(O(\log N)\) Merkle inclusion proofs without needing the full student roster!</li>
              </ul>
            </div>

          </div>

          {/* Batch Result & Merkle Tree Visualizer */}
          {batchResult && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="p-4 rounded-xl bg-cyan-950/40 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center justify-between">
                <span>Batch Issued Successfully! {batchResult.count} credentials anchored.</span>
                <span>Batch ID: {batchResult.batchId}</span>
              </div>

              <MerkleTreeVisualizer
                merkleRoot={batchResult.merkleRoot}
                batchCount={batchResult.count}
                sampleLeaves={batchResult.certificates.map((c, i) => ({
                  id: `Leaf ${i + 1} (${c.recipient.name})`,
                  hash: c.crypto.dataHash,
                  certId: c.certificateId,
                }))}
              />
            </div>
          )}

        </div>
      )}

      {/* TAB 4: CRYPTOGRAPHIC KEYS */}
      {activeTab === 'keys' && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-mono uppercase">
                  Ed25519 PKI Public Key Certificate
                </h3>
              </div>
              <button
                onClick={handleRotateKeys}
                disabled={rotatingKeys}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-300 text-xs font-mono flex items-center gap-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${rotatingKeys ? 'animate-spin' : ''}`} />
                <span>Rotate Keypair</span>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                <span>Active Public Key PEM (RFC 8032)</span>
                <button
                  onClick={copyPublicKey}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  {copiedKey ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey ? 'Copied' : 'Copy Key'}</span>
                </button>
              </div>
              <pre className="text-[11px] font-mono text-emerald-400 overflow-x-auto p-2 bg-slate-900/80 rounded border border-slate-800">
                {organization?.pki?.publicKey || '-----BEGIN PUBLIC KEY-----\n...\n-----END PUBLIC KEY-----'}
              </pre>
              <div className="text-[10px] font-mono text-slate-500">
                Key Fingerprint ID: {organization?.pki?.keyId} • Algorithm: Ed25519
              </div>
            </div>
          </div>

        </div>
      )}

      {/* Revocation Modal */}
      {revokeModalOpen && certToRevoke && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-rose-500/40 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-rose-400">
              <AlertTriangle className="w-6 h-6 shrink-0" />
              <h3 className="text-base font-bold text-white">Revoke Credential</h3>
            </div>
            <p className="text-xs text-slate-300">
              You are about to officially revoke Certificate <strong>{certToRevoke.certificateId}</strong> issued to <strong>{certToRevoke.recipient.name}</strong>.
            </p>
            <div>
              <label className="block text-xs font-mono text-slate-400 mb-1">Reason for Revocation *</label>
              <textarea
                rows={3}
                required
                value={revocationReason}
                onChange={(e) => setRevocationReason(e.target.value)}
                placeholder="e.g. Academic Integrity Violation / Fraudulent transcript detected during audit."
                className="w-full p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-rose-500 font-mono"
              />
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setRevokeModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmRevoke}
                disabled={revoking || !revocationReason.trim()}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-mono font-bold flex items-center gap-1.5"
              >
                {revoking ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                <span>Confirm Revocation</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl text-center space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white font-mono">{qrModalCert.certificateId}</h3>
              <button onClick={() => setQrModalCert(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            {qrModalCert.qrCodeDataUrl ? (
              <div className="p-4 bg-white rounded-xl max-w-[220px] mx-auto shadow-inner">
                <img src={qrModalCert.qrCodeDataUrl} alt="Certificate QR" className="w-full h-auto" />
              </div>
            ) : (
              <div className="p-8 text-slate-500 text-xs">QR unavailable</div>
            )}
            <p className="text-xs text-slate-400">Scan with any mobile device camera to verify real-time status.</p>
          </div>
        </div>
      )}

    </div>
  );
}
