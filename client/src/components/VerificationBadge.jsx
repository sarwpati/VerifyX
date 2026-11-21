import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Key,
  Binary,
  Cpu,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Copy,
  Check,
  ExternalLink,
  Layers
} from 'lucide-react';

export default function VerificationBadge({ verificationData }) {
  const [showRawCrypto, setShowRawCrypto] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  if (!verificationData) return null;

  const {
    verificationStatus,
    isAuthentic,
    certificate,
    cryptographicProof,
    issuerOrganization,
    revocationDetails,
    tamperVerdict,
    tamperDetails,
  } = verificationData;

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Status Styling Configuration
  let statusConfig = {
    title: 'VERIFIED AUTHENTIC CREDENTIAL',
    subtitle: 'This credential is mathematically signed and valid on the VerifyX PKI network.',
    icon: ShieldCheck,
    bgClass: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400',
    glowClass: 'shadow-glow-emerald',
    badgeColor: 'bg-emerald-500 text-white',
  };

  if (verificationStatus === 'REVOKED') {
    statusConfig = {
      title: 'CREDENTIAL REVOKED',
      subtitle: 'This certificate has been officially invalidated by the issuing institution.',
      icon: AlertTriangle,
      bgClass: 'bg-amber-950/40 border-amber-500/50 text-amber-400',
      glowClass: 'shadow-glow-rose',
      badgeColor: 'bg-amber-500 text-slate-950',
    };
  } else if (verificationStatus === 'EXPIRED') {
    statusConfig = {
      title: 'CREDENTIAL EXPIRED',
      subtitle: 'The validity period for this certification has concluded.',
      icon: Clock,
      bgClass: 'bg-yellow-950/40 border-yellow-500/40 text-yellow-400',
      glowClass: 'shadow-none',
      badgeColor: 'bg-yellow-500 text-slate-950',
    };
  } else if (verificationStatus === 'TAMPERED') {
    statusConfig = {
      title: 'SECURITY ALERT: TAMPER DETECTED',
      subtitle: 'The cryptographic digital signature or binary data hash does not match official records!',
      icon: ShieldAlert,
      bgClass: 'bg-rose-950/60 border-rose-500/60 text-rose-400 animate-pulse-slow',
      glowClass: 'shadow-glow-rose',
      badgeColor: 'bg-rose-600 text-white',
    };
  }

  const StatusIcon = statusConfig.icon;

  return (
    <div className={`w-full rounded-2xl border p-6 transition-all duration-300 ${statusConfig.bgClass} ${statusConfig.glowClass}`}>
      
      {/* Top Main Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border shadow-inner ${
            verificationStatus === 'VALID' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
            verificationStatus === 'REVOKED' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
            verificationStatus === 'EXPIRED' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' :
            'bg-rose-500/20 border-rose-500/40 text-rose-400'
          }`}>
            <StatusIcon className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${statusConfig.badgeColor}`}>
                {verificationStatus}
              </span>
              {certificate?.crypto?.merkle?.isBatch && (
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono flex items-center gap-1">
                  <Layers className="w-3 h-3" /> Merkle Batch Anchored
                </span>
              )}
            </div>
            <h2 className="text-xl font-extrabold tracking-tight text-white mt-1">
              {statusConfig.title}
            </h2>
            <p className="text-xs text-slate-300 mt-0.5 max-w-xl leading-relaxed">
              {statusConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Quick Actions / Proof Toggle */}
        <button
          onClick={() => setShowRawCrypto(!showRawCrypto)}
          className="self-start sm:self-center px-3.5 py-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-2 transition-colors shadow-sm"
        >
          <Cpu className="w-4 h-4 text-emerald-400" />
          <span>{showRawCrypto ? 'Hide Proof' : 'Cryptographic Proof'}</span>
          {showRawCrypto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Revocation Warning Box if revoked */}
      {verificationStatus === 'REVOKED' && revocationDetails && (
        <div className="mt-5 p-4 rounded-xl bg-amber-950/60 border border-amber-500/40 text-amber-200">
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-amber-300">Official Revocation Notice</h4>
              <p className="text-xs text-amber-200/90 mt-1">
                <strong>Reason:</strong> {revocationDetails.reason || 'Revoked by institution authority.'}
              </p>
              <p className="text-[11px] text-amber-300/70 font-mono mt-1">
                Revocation Timestamp: {new Date(revocationDetails.revokedAt).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tamper Alert Box if tampered */}
      {verificationStatus === 'TAMPERED' && (
        <div className="mt-5 p-4 rounded-xl bg-rose-950/80 border border-rose-500/50 text-rose-200">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-rose-300">Cryptographic Integrity Violation</h4>
              <p className="text-xs text-rose-200/90">
                {tamperDetails?.reason || 'The digital signature does not match the canonical document hash. This certificate is invalid or counterfeit.'}
              </p>
              {tamperDetails?.expectedPdfHash && (
                <div className="pt-2 text-[11px] font-mono space-y-1">
                  <div className="text-slate-300">Expected Hash: <span className="text-emerald-400">{tamperDetails.expectedPdfHash}</span></div>
                  <div className="text-slate-300">Uploaded Hash: <span className="text-rose-400">{tamperDetails.uploadedPdfHash}</span></div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Expandable Cryptographic Inspector */}
      {showRawCrypto && cryptographicProof && (
        <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-200 font-mono uppercase tracking-wider flex items-center gap-2">
              <Binary className="w-4 h-4 text-emerald-400" />
              Mathematical Verification Artifacts
            </h3>
            <span className="text-[11px] font-mono text-slate-400">
              Algorithm: {cryptographicProof.algorithm}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
            
            {/* SHA-256 Fingerprint */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px]">Canonical SHA-256 Hash (RFC 8785)</span>
                <button
                  onClick={() => copyToClipboard(cryptographicProof.computedDataHash || certificate?.crypto?.dataHash, 'hash')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {copiedField === 'hash' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-emerald-400 font-mono text-[11px] break-all">
                {cryptographicProof.computedDataHash || certificate?.crypto?.dataHash}
              </div>
              <div className="text-[10px] text-slate-500">
                Data Hash Status: {cryptographicProof.isDataHashValid ? 'MATCHES RECORD' : 'HASH MISMATCH'}
              </div>
            </div>

            {/* Ed25519 Digital Signature */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
              <div className="flex items-center justify-between text-slate-400">
                <span className="text-[11px]">Ed25519 Asymmetric Signature</span>
                <button
                  onClick={() => copyToClipboard(certificate?.crypto?.signature, 'sig')}
                  className="hover:text-emerald-400 transition-colors"
                >
                  {copiedField === 'sig' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
              <div className="text-cyan-400 font-mono text-[11px] break-all line-clamp-2">
                {certificate?.crypto?.signature}
              </div>
              <div className="text-[10px] text-slate-500">
                Key ID: {cryptographicProof.keyId} • Mathematical Validity: {cryptographicProof.isSignatureValid ? 'VALID' : 'INVALID'}
              </div>
            </div>

            {/* Merkle Batch Proof (If available) */}
            {cryptographicProof.merkleRoot && (
              <div className="md:col-span-2 p-3 rounded-xl bg-slate-950/80 border border-slate-800 space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-[11px] flex items-center gap-1.5 text-cyan-300">
                    <Layers className="w-3.5 h-3.5" /> Merkle Tree Batch Root Anchor
                  </span>
                  <button
                    onClick={() => copyToClipboard(cryptographicProof.merkleRoot, 'merkle')}
                    className="hover:text-emerald-400 transition-colors"
                  >
                    {copiedField === 'merkle' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
                <div className="text-cyan-300 font-mono text-[11px] break-all">
                  {cryptographicProof.merkleRoot}
                </div>
                <div className="text-[10px] text-slate-500">
                  Inclusion Proof Steps: {certificate?.crypto?.merkle?.proof?.length || 0} sibling node hashes verified.
                </div>
              </div>
            )}

          </div>

          {/* Canonical Payload Viewer */}
          {certificate?.crypto?.canonicalPayload && (
            <div className="space-y-1">
              <span className="text-[11px] font-mono text-slate-400">Canonical JSON Payload (Deterministic bytes):</span>
              <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40">
                {JSON.stringify(certificate.crypto.canonicalPayload, null, 2)}
              </pre>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
