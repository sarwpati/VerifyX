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
  XCircle,
  Copy,
  Check,
  Building2,
  FileX,
  Info
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
    revocationDetails,
    reasonCode,
    message
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
      subtitle: 'This certificate has been officially invalidated by the issuing institution.',
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
      title: 'SECURITY ALERT: TAMPER DETECTED',
      subtitle: 'The document or digital signature failed mathematical integrity verification.',
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

      {/* DETAILED FAILURE REASON PANEL (If Revoked, Expired, or Tampered) */}
      {verificationStatus !== 'VALID' && (
        <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs space-y-2">
          <div className="flex items-center gap-2 font-semibold text-slate-200">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Root Cause Analysis & Failure Diagnostic:</span>
          </div>

          {/* Revocation Specific Reason */}
          {verificationStatus === 'REVOKED' && (
            <div className="pl-6 space-y-1 text-slate-300">
              <div><strong className="text-amber-300">Revocation Cause:</strong> {revocationDetails?.reason || certificate?.revocationDetails?.reason || 'Academic Disciplinary Invalidation'}</div>
              {revocationDetails?.revokedAt && (
                <div className="text-[11px] text-slate-400 font-mono">
                  Revoked Date: {new Date(revocationDetails.revokedAt).toLocaleDateString()}
                </div>
              )}
              {revocationDetails?.revocationHash && (
                <div className="text-[10px] text-slate-500 font-mono break-all">
                  Revocation Ledger Proof: {revocationDetails.revocationHash}
                </div>
              )}
            </div>
          )}

          {/* Expiration Specific Reason */}
          {verificationStatus === 'EXPIRED' && (
            <div className="pl-6 space-y-1 text-slate-300">
              <div><strong className="text-yellow-300">Expiration Reason:</strong> Professional certification term completed. Credentials require recertification every 3 years.</div>
              <div className="text-[11px] text-slate-400 font-mono">
                Expired On: {new Date(certificate?.details?.expiryDate).toLocaleDateString()}
              </div>
            </div>
          )}

          {/* Tamper / Modification Specific Reason */}
          {verificationStatus === 'TAMPERED' && (
            <div className="pl-6 space-y-1.5 text-slate-300">
              <div><strong className="text-rose-400">Cryptographic Discrepancy:</strong> {tamperDetails?.reason || 'The visual PDF byte-hash or digital signature does not match the official record.'}</div>
              {tamperDetails?.expectedPdfHash && (
                <div className="text-[11px] font-mono text-slate-400 break-all bg-slate-900 p-2 rounded border border-slate-800">
                  <span className="text-slate-500">Official Registered Hash:</span> {tamperDetails.expectedPdfHash}<br/>
                  <span className="text-rose-400">Uploaded Altered Hash:</span> {tamperDetails.uploadedPdfHash}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Verification Checklist */}
      <div className="mt-4 pt-4 border-t border-slate-700/60 grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          {cryptographicProof?.isSignatureValid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <div className="text-xs">
            <div className="font-semibold text-slate-200">Ed25519 Signature</div>
            <div className="text-[11px] text-slate-400">{cryptographicProof?.isSignatureValid ? 'Valid mathematical proof' : 'Signature mismatch!'}</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          {cryptographicProof?.isDataHashValid ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
          )}
          <div className="text-xs">
            <div className="font-semibold text-slate-200">SHA-256 Hash</div>
            <div className="text-[11px] text-slate-400">{cryptographicProof?.isDataHashValid ? 'Exact byte-match' : 'Payload mismatch!'}</div>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 flex items-center gap-2">
          {issuerOrganization?.verified !== false ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
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
          <span>{showRawCrypto ? 'Hide Technical Proof' : 'View Cryptographic Signatures & Hashes'}</span>
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
