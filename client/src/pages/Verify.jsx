import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import confetti from 'canvas-confetti';
import {
  Search,
  FileCheck,
  UploadCloud,
  ShieldCheck,
  ShieldAlert,
  Loader2,
  Sparkles,
  AlertTriangle,
  QrCode,
  Layers,
  ArrowRight
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
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#10b981', '#34d399', '#059669', '#fbbf24'],
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
    { id: 'VX-SNOW-2026-7842', label: 'ServiceNow CSA', color: 'cyan' },
    { id: 'VX-IIITBH-2026-1001', label: 'Valid Degree', color: 'emerald' },
    { id: 'VX-IIITBH-2026-9999', label: 'Revoked Certificate', color: 'amber' },
    { id: 'VX-GCA-2024-8888', label: 'Expired Cloud Cert', color: 'yellow' },
    { id: 'VX-IIITBH-2026-3001', label: 'Merkle Batch Anchored', color: 'cyan' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <ShieldCheck className="w-4 h-4" />
          <span>Public Cryptographic Verification Network</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Verify Credential Authenticity
        </h1>
        <p className="text-sm text-slate-400">
          Verify digital credentials instantly via Certificate ID, live QR code, or Drag-and-Drop PDF Tamper Inspector.
        </p>
      </div>

      {/* Mode Switcher Tabs */}
      <div className="flex justify-center">
        <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center gap-1 shadow-inner">
          <button
            onClick={() => setActiveTab('online')}
            className={`px-5 py-2 rounded-xl text-xs font-medium font-mono transition-all flex items-center gap-2 ${
              activeTab === 'online'
                ? 'bg-emerald-500 text-white shadow-glow-emerald'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>Online QR / ID Verification</span>
          </button>

          <button
            onClick={() => setActiveTab('pdf')}
            className={`px-5 py-2 rounded-xl text-xs font-medium font-mono transition-all flex items-center gap-2 ${
              activeTab === 'pdf'
                ? 'bg-emerald-500 text-white shadow-glow-emerald'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>PDF Tamper Inspector</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Online ID Search */}
      {activeTab === 'online' && (
        <div className="max-w-3xl mx-auto space-y-6">
          
          {/* Search Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="p-2 rounded-2xl bg-slate-900/90 border border-slate-700/80 shadow-2xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="flex items-center gap-3 w-full px-4 py-2">
              <Search className="w-5 h-5 text-emerald-400 shrink-0" />
              <input
                type="text"
                value={searchId}
                onChange={(e) => setSearchId(e.target.value)}
                placeholder="Enter Certificate ID (e.g. VX-IIITBH-2026-1001)..."
                className="w-full bg-transparent text-sm sm:text-base text-white placeholder-slate-500 focus:outline-none font-mono"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-600 disabled:opacity-50 text-white text-sm font-semibold shadow-glow-emerald transition-all flex items-center justify-center gap-2 whitespace-nowrap"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              <span>{loading ? 'Verifying...' : 'Verify Now'}</span>
            </button>
          </form>

          {/* Quick Demo Test Pills */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
            <span className="text-slate-400 font-mono flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Demo Presets:
            </span>
            {sampleIds.map((item) => (
              <button
                key={item.id}
                onClick={() => navigate(`/verify/${item.id}`)}
                className={`px-3 py-1 rounded-lg font-mono border transition-all ${
                  item.color === 'emerald' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20' :
                  item.color === 'amber' ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20' :
                  item.color === 'yellow' ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-300 hover:bg-yellow-500/20' :
                  'bg-cyan-500/10 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20'
                }`}
              >
                {item.id} ({item.label})
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Verification Results */}
          {verificationResult && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-300">
              
              {/* Holographic Verification Badge */}
              <VerificationBadge verificationData={verificationResult} />

              {/* Full Certificate Visual Preview if found */}
              {verificationResult.certificate && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-bold text-slate-200 font-mono uppercase tracking-wider">
                      Official Rendered Credential
                    </h3>
                  </div>
                  <CertificatePreview certificate={verificationResult.certificate} />
                </div>
              )}

            </div>
          )}

        </div>
      )}

      {/* TAB 2: PDF Tamper Inspector */}
      {activeTab === 'pdf' && (
        <div className="max-w-3xl mx-auto">
          <PDFInspector onInspectComplete={(data) => console.log('PDF inspect completed', data)} />
        </div>
      )}

    </div>
  );
}
