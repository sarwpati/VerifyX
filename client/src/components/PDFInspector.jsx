import React, { useState, useRef } from 'react';
import api from '../services/api';
import {
  UploadCloud,
  FileCheck,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Loader2,
  FileText,
  Binary,
  ArrowRight,
  CheckCircle2,
  HelpCircle,
  Clock,
  Building2,
  QrCode
} from 'lucide-react';
import VerificationBadge from './VerificationBadge';

export default function PDFInspector({ onInspectComplete }) {
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf' || droppedFile.name.endsWith('.pdf')) {
        processFile(droppedFile);
      } else {
        setError('Please upload a valid PDF document.');
      }
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile) => {
    setFile(selectedFile);
    setError(null);
    setResult(null);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('pdfFile', selectedFile);

      const res = await api.post('/verify/pdf-inspect', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setResult(res.data);
      if (onInspectComplete) {
        onInspectComplete(res.data);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setResult(err.response.data);
      } else {
        setError(err.message || 'Failed to inspect PDF file.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6">
      
      {/* Drag & Drop Area */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-7 text-center transition-all duration-200 ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10'
            : 'border-slate-700 bg-slate-900/60 hover:border-emerald-500/50 hover:bg-slate-900/80'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>

          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-100">
              {loading ? 'Inspecting Certificate...' : 'Drop PDF Certificate here or click to browse'}
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Supports standard certificate PDFs (max 10MB)
            </p>
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Binary className="w-3.5 h-3.5" />
            <span>Automatic Scanner Verification & Tamper Check</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Inspection Results Display */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>File: <strong className="text-white">{file?.name}</strong></span>
            </div>
            <div className="text-slate-400">
              {file ? (file.size / 1024).toFixed(1) : 0} KB
            </div>
          </div>

          {/* CASE 1: Authentic Certificate Found & Matches DB */}
          {result.certificate ? (
            <VerificationBadge
              verificationData={{
                verificationStatus: result.verificationStatus,
                isAuthentic: result.verificationStatus === 'VALID',
                certificate: result.certificate,
                cryptographicProof: {
                  algorithm: 'Ed25519',
                  isSignatureValid: !result.isTampered,
                  isDataHashValid: !result.isTampered,
                  isMerkleValid: true,
                  computedDataHash: result.uploadedPdfHash,
                  keyId: result.certificate.issuer.keyId,
                },
                issuerOrganization: {
                  name: result.certificate.issuer.orgName,
                  code: result.certificate.issuer.orgCode,
                },
                tamperVerdict: result.tamperVerdict,
                tamperDetails: result.tamperDetails,
                revocationDetails: result.certificate.revocationDetails,
              }}
            />
          ) : result.verificationStatus === 'NO_SCANNER' ? (
            /* CASE 2: Certificate does NOT contain scanner/QR code */
            <div className="p-6 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto">
                <QrCode className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-amber-200">
                Scanner / QR Code Not Found
              </h3>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
                Certificate doesn't contain a scanner to verify. Please upload a scanner-consistent certificate.
              </p>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] font-mono text-amber-300">
                Tip: Verifiable credentials require an embedded verification QR scanner or URL
              </div>
            </div>
          ) : (
            /* CASE 3: Unable to verify / Organization Not Listed */
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mx-auto">
                <Clock className="w-6 h-6 animate-pulse" />
              </div>
              
              <div className="space-y-1">
                <div className="inline-block px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-[11px] font-mono uppercase tracking-wider mb-1">
                  Pending Verification
                </div>
                <h3 className="text-base font-bold text-slate-100">
                  Unable to Verify: Organization Not Listed
                </h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800 text-left max-w-lg mx-auto space-y-2">
                <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                  Your certificate organization is not listed on VerifyX. We need some time to contact your organization and let you know if your certificate is valid or not.
                </p>
                {result.detectedOrg && (
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono pt-1">
                    <Building2 className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Detected Organization: <span className="text-slate-200 font-bold">{result.detectedOrg}</span></span>
                  </div>
                )}
                {result.uploadedPdfHash && (
                  <div className="text-[10px] font-mono text-slate-500 break-all pt-1 border-t border-slate-800/80">
                    Document Hash: {result.uploadedPdfHash}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

    </div>
  );
}
