import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  Search,
  FileCheck,
  UploadCloud,
  ShieldCheck,
  Loader2,
  Clock,
  Building2,
  AlertTriangle
} from 'lucide-react';
import VerificationBadge from '../components/VerificationBadge';
import CertificatePreview from '../components/CertificatePreview';
import PDFInspector from '../components/PDFInspector';

export default function Verify() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('online'); // 'online' | 'pdf'
  const [searchId, setSearchId] = useState(id || '');
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const [error, setError] = useState(null);

  // If certificate ID in URL param, verify automatically on load
  useEffect(() => {
    if (id) {
      setSearchId(id);
      performOnlineVerification(id);
    }
  }, [id]);

  const performOnlineVerification = async (certId) => {
    if (!certId || !certId.trim()) return;

    setLoading(true);
    setError(null);
    setVerificationResult(null);

    try {
      const res = await api.get(`/verify/online/${certId.trim().toUpperCase()}`);
      setVerificationResult(res.data);

      // Trigger confetti if authentic and valid
      if (res.data.isAuthentic && res.data.verificationStatus === 'VALID') {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#38bdf8'],
        });
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setVerificationResult(err.response.data);
      } else {
        setError(err.message || 'Verification service unreachable.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchId.trim()) {
      navigate(`/verify/${searchId.trim().toUpperCase()}`);
    }
  };

  const sampleIds = [
    { id: 'VX-SNOW-2026-7842', label: 'ServiceNow CSA' },
    { id: 'VX-IIITBH-2026-1001', label: 'B.Tech Degree' },
    { id: 'VX-IIITBH-2026-9999', label: 'Revoked Demo' },
    { id: 'VX-GCA-2024-8888', label: 'Expired Demo' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Public Verification Network</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
          Verify Certificate
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Verify authenticity via Certificate ID or upload the PDF document for automatic scanner and tamper inspection.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="p-1 rounded-2xl bg-slate-900/90 border border-slate-800 flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('online')}
            className={`px-4 py-2 rounded-xl text-xs font-medium font-mono transition-all flex items-center gap-2 ${
              activeTab === 'online'
                ? 'bg-emerald-500 text-white shadow-glow-emerald'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Verify by ID</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-4 py-2 rounded-xl text-xs font-medium font-mono transition-all flex items-center gap-2 ${
              activeTab === 'pdf'
                ? 'bg-emerald-500 text-white shadow-glow-emerald'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Upload PDF Certificate</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Online ID Search */}
      {activeTab === 'online' && (
        <div className="max-w-2xl mx-auto space-y-5">
          
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-1.5 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-2.5 w-full px-3 py-2">
              <Search className="w-4 h-4 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. VX-SNOW-2026-7842)..."
                className="w-full bg-transparent text-sm text-white placeholder-slate-400 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-xs font-semibold shadow-glow-emerald transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
              <span>{loading ? 'Verifying...' : 'Verify'}</span>
            </button>
          </form>

          {/* Quick Demo Samples */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs font-mono">
            <span className="text-slate-400 text-[11px]">Quick test:</span>
            {sampleIds.map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  setSearchId(s.id);
                  navigate(`/verify/${s.id}`);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 border border-slate-700 text-xs transition-colors"
              >
                {s.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Verification Results */}
          {verificationResult && (
            <div className="space-y-6 pt-2">
              {verificationResult.certificate ? (
                <>
                  <VerificationBadge verificationData={verificationResult} />
                  <CertificatePreview certificate={verificationResult.certificate} />
                </>
              ) : (
                /* Unrecognized or Organization Not Listed */
                <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700 text-center space-y-4">
                  <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                    <Clock className="w-6 h-6 animate-pulse" />
                  </div>
                  
                  <div className="space-y-1">
                    <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono uppercase tracking-wider mb-1">
                      Pending Verification
                    </div>
                    <h3 className="text-base font-bold text-slate-100">
                      Organization Not Listed
                    </h3>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left max-w-lg mx-auto space-y-2">
                    <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                      Your certificate organization is not listed on VerifyX. We need some time to contact your organization and let you know if your certificate is valid or not.
                    </p>
                    <div className="text-[11px] font-mono text-slate-400">
                      Searched ID: <span className="text-emerald-400 font-bold">{searchId}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: Upload PDF Drag & Drop */}
      {activeTab === 'pdf' && (
        <div className="max-w-2xl mx-auto space-y-6">
          <PDFInspector />
        </div>
      )}

    </div>
  );
}
