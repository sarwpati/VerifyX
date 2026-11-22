import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  AlertTriangle,
  Clock,
  Key,
  Binary,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  Copy,
  Check
} from 'lucide-react';

export default function VerificationBadge({ verificationData }) {
  const [showRawCrypto, setShowRawCrypto] = useState(false);
  const [copiedField, setCopiedField] = useState(null);

  if (!verificationData) return null;

  const {
    verificationStatus,
    certificate,
    cryptographicProof,
    issuerOrganization,
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
    title: 'VERIFIED AUTHENTIC',
    subtitle: 'This credential is mathematically signed and valid on the VerifyX network.',
    icon: ShieldCheck,
    bgClass: 'bg-emerald-950/40 border-emerald-500/40 text-emerald-400',
    glowClass: 'shadow-glow-emerald',
    badgeColor: 'bg-emerald-500 text-white',
  };

  if (verificationStatus === 'REVOKED') {
    statusConfig = {
      title: 'CREDENTIAL REVOKED',
      subtitle: 'This certificate has been invalidated by the issuing institution.',
      icon: AlertTriangle,
      bgClass: 'bg-amber-950/40 border-amber-500/50 text-amber-400',
      glowClass: 'shadow-none',
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
      title: 'TAMPER DETECTED',
      subtitle: 'Digital signature or binary data hash does not match official records.',
      icon: ShieldAlert,
      bgClass: 'bg-rose-950/60 border-rose-500/60 text-rose-400 animate-pulse-slow',
      glowClass: 'shadow-glow-rose',
      badgeColor: 'bg-rose-600 text-white',
    };
  }

  const StatusIcon = statusConfig.icon;

  return (
    <div className={`w-full rounded-2xl border p-5 transition-all duration-300 ${statusConfig.bgClass} ${statusConfig.glowClass}`}>
      
      {/* Top Main Status Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner ${
            verificationStatus === 'VALID' ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' :
            verificationStatus === 'REVOKED' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' :
            verificationStatus === 'EXPIRED' ? 'bg-yellow-500/20 border-yellow-500/40 text-yellow-400' :
            'bg-rose-500/20 border-rose-500/40 text-rose-400'
          }`}>
            <StatusIcon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${statusConfig.badgeColor}`}>
                {verificationStatus}
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-100 tracking-tight">
                {statusConfig.title}
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              {statusConfig.subtitle}
            </p>
          </div>
        </div>

        {/* Certificate ID Pill */}
        {certificate && (
          <div className="flex items-center gap-2 bg-slate-900/80 px-3 py-1.5 rounded-xl border border-slate-700/80 text-xs font-mono">
            <span className="text-slate-400">ID:</span>
            <span className="text-emerald-400 font-bold">{certificate.certificateId}</span>
            <button
              onClick={() => copyToClipboard(certificate.certificateId, 'certId')}
              className="text-slate-400 hover:text-white transition-colors"
              title="Copy Certificate ID"
            >
              {copiedField === 'certId' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>

      {/* Verification Checklist */}
      <div className="mt-5 pt-4 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${cryptographicProof?.isSignatureValid ? 'text-emerald-400' : 'text-rose-400'}`} />
          <div className="text-xs">
            <div className="font-semibold text-slate-200">Ed25519 Signature</div>
            <div className="text-[11px] text-slate-400">{cryptographicProof?.isSignatureValid ? 'Valid mathematical proof' : 'Invalid signature'}</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${cryptographicProof?.isDataHashValid ? 'text-emerald-400' : 'text-rose-400'}`} />
          <div className="text-xs">
            <div className="font-semibold text-slate-200">SHA-256 Hash</div>
            <div className="text-[11px] text-slate-400">{cryptographicProof?.isDataHashValid ? 'Exact byte-match' : 'Payload mismatch'}</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          <CheckCircle2 className={`w-4 h-4 shrink-0 ${issuerOrganization?.verified !== false ? 'text-emerald-400' : 'text-amber-400'}`} />
          <div className="text-xs">
            <div className="font-semibold text-slate-200">Issuing Institution</div>
            <div className="text-[11px] text-slate-400">{issuerOrganization?.name || certificate?.issuer?.orgName || 'Verified Org'}</div>
          </div>
        </div>
      </div>

      {/* Expandable Cryptographic Details */}
      <div className="mt-4 pt-3 border-t border-slate-800/60">
        <button
          onClick={() => setShowRawCrypto(!showRawCrypto)}
          className="text-xs font-mono text-slate-400 hover:text-emerald-400 flex items-center gap-1.5 transition-colors"
        >
          {showRawCrypto ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          <span>{showRawCrypto ? 'Hide Technical Proof' : 'View Cryptographic Signatures'}</span>
        </button>

        {showRawCrypto && cryptographicProof && (
          <div className="mt-3 p-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] font-mono space-y-2 text-slate-300">
            <div>
              <span className="text-slate-500">Algorithm: </span>
              <span className="text-emerald-400">Ed25519 Asymmetric PKI (RFC 8785 Canonical JSON)</span>
            </div>
            {cryptographicProof.computedDataHash && (
              <div className="break-all">
                <span className="text-slate-500">Payload Hash: </span>
                <span className="text-slate-300">{cryptographicProof.computedDataHash}</span>
              </div>
            )}
            {certificate?.crypto?.signature && (
              <div className="break-all">
                <span className="text-slate-500">Signature: </span>
                <span className="text-slate-400">{certificate.crypto.signature}</span>
              </div>
            )}
            {cryptographicProof.keyId && (
              <div>
                <span className="text-slate-500">Issuer Key ID: </span>
                <span className="text-cyan-400">{cryptographicProof.keyId}</span>
              </div>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
