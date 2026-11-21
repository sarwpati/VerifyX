import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Award,
  ShieldCheck,
  Download,
  Share2,
  ExternalLink,
  Linkedin,
  Code2,
  Copy,
  Check,
  Search,
  AlertTriangle,
  User,
  Sparkles,
  Layers,
  FileCheck
} from 'lucide-react';
import CertificatePreview from '../components/CertificatePreview';

export default function StudentWallet() {
  const { user, isAuthenticated } = useAuth();
  
  const [identifier, setIdentifier] = useState(
    user?.role === 'student' ? (user.studentProfile?.rollNumber || user.email) : '220101001'
  );
  const [certificates, setCertificates] = useState([]);
  const [studentInfo, setStudentInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  
  // LinkedIn Modal State
  const [linkedInModalCert, setLinkedInModalCert] = useState(null);
  
  // Embed Badge Modal State
  const [badgeModalCert, setBadgeModalCert] = useState(null);
  const [copiedBadge, setCopiedBadge] = useState(false);

  useEffect(() => {
    if (identifier) {
      fetchWallet(identifier);
    }
  }, []);

  const fetchWallet = async (queryId) => {
    if (!queryId) return;
    setLoading(true);
    try {
      const res = await api.get(`/student/wallet/${queryId}`);
      if (res.data.success) {
        setCertificates(res.data.certificates);
        setStudentInfo(res.data.student);
        if (res.data.certificates.length > 0) {
          setSelectedCert(res.data.certificates[0]);
        } else {
          setSelectedCert(null);
        }
      }
    } catch (err) {
      console.error('Failed to load wallet:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchWallet(identifier);
  };

  // Generate LinkedIn Certification Add URL
  const getLinkedInAddUrl = (cert) => {
    const orgName = encodeURIComponent(cert.issuer.orgName);
    const certName = encodeURIComponent(cert.details.title);
    const certUrl = encodeURIComponent(`http://localhost:5173/verify/${cert.certificateId}`);
    const certId = encodeURIComponent(cert.certificateId);
    const issueDate = new Date(cert.details.issueDate || Date.now());
    const issueYear = issueDate.getFullYear();
    const issueMonth = issueDate.getMonth() + 1;

    return `https://www.linkedin.com/profile/add?startTask=CERTIFICATION_NAME&name=${certName}&organizationName=${orgName}&issueYear=${issueYear}&issueMonth=${issueMonth}&certUrl=${certUrl}&certId=${certId}`;
  };

  // Embed Badge Code (Markdown / HTML)
  const getEmbedMarkdown = (cert) => {
    return `[![VerifyX Verified Credential](https://img.shields.io/badge/VerifyX-Authentic%20Credential-emerald?style=for-the-badge&logo=shield&logoColor=white)](http://localhost:5173/verify/${cert.certificateId})`;
  };

  const getEmbedHtml = (cert) => {
    return `<a href="http://localhost:5173/verify/${cert.certificateId}" target="_blank"><img src="https://img.shields.io/badge/VerifyX-Authentic%20Credential-emerald?style=for-the-badge&logo=shield&logoColor=white" alt="VerifyX Verified Credential" /></a>`;
  };

  const copyBadgeText = (text) => {
    navigator.clipboard.writeText(text);
    setCopiedBadge(true);
    setTimeout(() => setCopiedBadge(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header & Wallet Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold text-lg">
            <Award className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-white tracking-tight">
                {studentInfo?.name || 'Student Credential Locker'}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono">
                DigiLocker Architecture
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-3">
              <span>{studentInfo?.email || 'Public Scholar Portfolio'}</span>
              {studentInfo?.studentProfile?.rollNumber && (
                <>
                  <span>•</span>
                  <span>Roll No: <strong className="text-amber-300 font-mono">{studentInfo.studentProfile.rollNumber}</strong></span>
                </>
              )}
            </p>
          </div>
        </div>

        {/* Lookup Bar */}
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-80">
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="Search Roll No or Email..."
            className="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-mono"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold font-mono transition-colors shadow-sm whitespace-nowrap"
          >
            Fetch
          </button>
        </form>
      </div>

      {/* Main Grid: Left Credential Cards list, Right Active Certificate Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left: Credential Cards */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase">
              Earned Credentials ({certificates.length})
            </h3>
            <span className="text-[11px] font-mono text-emerald-400">100% Tamper-Evident</span>
          </div>

          {loading ? (
            <div className="p-8 text-center text-slate-500 text-xs font-mono">
              Loading credential wallet...
            </div>
          ) : certificates.length === 0 ? (
            <div className="p-8 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-500 text-xs font-mono">
              No credentials found for "{identifier}". Try testing with Roll No: <strong>220101001</strong>.
            </div>
          ) : (
            <div className="space-y-3">
              {certificates.map((cert) => {
                const isSelected = selectedCert?._id === cert._id;

                return (
                  <div
                    key={cert._id}
                    onClick={() => setSelectedCert(cert)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all duration-200 space-y-2.5 ${
                      isSelected
                        ? 'bg-amber-950/20 border-amber-500/60 shadow-glow-emerald'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-0.5">
                        <span className="text-[10px] font-mono text-amber-400 font-bold uppercase">
                          {cert.issuer.orgName}
                        </span>
                        <h4 className="font-semibold text-sm text-slate-100 font-sans leading-tight">
                          {cert.details.title}
                        </h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono shrink-0 ${
                        cert.status === 'valid' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
                        cert.status === 'revoked' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' :
                        'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                      }`}>
                        {cert.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 font-mono flex items-center justify-between pt-1 border-t border-slate-800/80">
                      <span>ID: {cert.certificateId}</span>
                      <span>{new Date(cert.details.issueDate).getFullYear()}</span>
                    </div>

                    {/* Social & Sharing Quick Buttons */}
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setLinkedInModalCert(cert);
                        }}
                        className="px-2.5 py-1 rounded bg-[#0A66C2]/20 hover:bg-[#0A66C2]/30 border border-[#0A66C2]/40 text-[#70B5F9] text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Linkedin className="w-3 h-3" />
                        <span>Add to LinkedIn</span>
                      </button>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setBadgeModalCert(cert);
                        }}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-medium flex items-center gap-1 transition-colors"
                      >
                        <Code2 className="w-3 h-3" />
                        <span>Get Badge</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Active Certificate Detailed View */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase">
              Official Credential Render & Download
            </h3>
            {selectedCert && (
              <a
                href={`/verify/${selectedCert.certificateId}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-emerald-400 hover:underline flex items-center gap-1"
              >
                <span>Open Public Verification Page</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {selectedCert ? (
            <CertificatePreview certificate={selectedCert} />
          ) : (
            <div className="p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center text-slate-500 text-xs font-mono">
              Select a certificate from the left locker to view full details and download.
            </div>
          )}
        </div>

      </div>

      {/* LinkedIn Add Modal */}
      {linkedInModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-[#70B5F9]">
              <Linkedin className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Add Credential to LinkedIn</h3>
            </div>
            <p className="text-xs text-slate-300">
              Directly attach your cryptographically signed credential to your LinkedIn profile Licenses & Certifications section with 1 click!
            </p>
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono space-y-1 text-slate-400">
              <div><strong>Name:</strong> {linkedInModalCert.details.title}</div>
              <div><strong>Issuer:</strong> {linkedInModalCert.issuer.orgName}</div>
              <div><strong>Certificate ID:</strong> {linkedInModalCert.certificateId}</div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setLinkedInModalCert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Close
              </button>
              <a
                href={getLinkedInAddUrl(linkedInModalCert)}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white text-xs font-bold font-mono flex items-center gap-1.5 shadow-sm"
              >
                <span>Proceed to LinkedIn</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Embed Badge Modal */}
      {badgeModalCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-950/80 backdrop-blur-md">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center gap-2.5 text-emerald-400">
              <Code2 className="w-6 h-6" />
              <h3 className="text-base font-bold text-white">Embed Verifiable Badge</h3>
            </div>
            <p className="text-xs text-slate-300">
              Embed this badge on your GitHub profile README, personal portfolio, or resume website. Anyone who clicks will be redirected to the official mathematical verification page!
            </p>

            {/* Badge Preview */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center">
              <img
                src="https://img.shields.io/badge/VerifyX-Authentic%20Credential-emerald?style=for-the-badge&logo=shield&logoColor=white"
                alt="Badge Preview"
              />
            </div>

            {/* Markdown Code */}
            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>GitHub README (Markdown):</span>
                <button
                  onClick={() => copyBadgeText(getEmbedMarkdown(badgeModalCert))}
                  className="text-emerald-400 hover:underline flex items-center gap-1"
                >
                  {copiedBadge ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedBadge ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-2.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                {getEmbedMarkdown(badgeModalCert)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setBadgeModalCert(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-mono"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
