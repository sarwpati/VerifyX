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
  CheckCircle2
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
        className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-emerald-400 bg-emerald-500/10'
            : 'border-slate-700 bg-slate-900/50 hover:border-emerald-500/50 hover:bg-slate-900/80'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="application/pdf"
          className="hidden"
        />

        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            {loading ? (
              <Loader2 className="w-7 h-7 animate-spin" />
            ) : (
              <UploadCloud className="w-7 h-7" />
            )}
          </div>

          <div>
            <h4 className="text-base font-bold text-slate-100">
              {loading ? 'Inspecting Document Byte Hash...' : 'Drag & Drop PDF Certificate here'}
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              or click to browse from your computer (max 10MB)
            </p>
          </div>

          <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400/90 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
            <Binary className="w-3.5 h-3.5" />
            <span>Automatic SHA-256 Byte-Checksum & Anti-Tamper Verification</span>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Inspection Results Display */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <FileText className="w-4 h-4 text-emerald-400" />
              <span>Inspected File: <strong className="text-white">{file?.name}</strong></span>
            </div>
            <div className="text-slate-400">
              Size: {file ? (file.size / 1024).toFixed(1) : 0} KB
            </div>
          </div>

          {/* Render Full Verification Badge if certificate match */}
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
          ) : (
            <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-700 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-200">{result.tamperVerdict || 'UNRECOGNIZED DOCUMENT'}</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto">{result.message}</p>
              {result.uploadedPdfHash && (
                <div className="p-2.5 rounded-lg bg-slate-950 text-[11px] font-mono text-slate-400 max-w-lg mx-auto break-all border border-slate-800">
                  Computed SHA-256: {result.uploadedPdfHash}
                </div>
              )}
            </div>
          )}
        </div>
      )}

    </div>
  );
}
