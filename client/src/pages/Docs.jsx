import React from 'react';
import {
  BookOpen,
  ShieldCheck,
  Key,
  Layers,
  Binary,
  HelpCircle,
  CheckCircle2,
  Lock,
  Cpu,
  Award
} from 'lucide-react';

export default function Docs() {
  const vivaQuestions = [
    {
      q: 'Q1: What happens if an insider or hacker modifies a student’s CGPA directly in your MongoDB database?',
      a: 'The alteration is immediately caught! When a verifier inspects the certificate, VerifyX reconstructs the canonical JSON payload (RFC 8785) from the database record and mathematically checks the Ed25519 digital signature against the issuing institution’s public key. Because the private key was never compromised, the mathematical signature verification will FAIL, immediately flagging the credential as TAMPERED.',
    },
    {
      q: 'Q2: How does the PDF Drag-and-Drop Tamper Inspector work without trusting visual text?',
      a: 'During issuance, the server embeds high-entropy cryptographic metadata and computes a SHA-256 byte-level hash of the entire PDF file binary. When a user drags and drops a PDF into the inspector, VerifyX computes the SHA-256 hash of the uploaded buffer. If even 1 single pixel, font character, or byte was edited using Adobe Acrobat or Photoshop, the checksum will mismatch, triggering a critical security alert with a detailed diff.',
    },
    {
      q: 'Q3: Why did you use Ed25519 Asymmetric Cryptography instead of traditional RSA-2048?',
      a: 'Ed25519 (RFC 8032) is based on Twisted Edwards curves (Curve25519). It provides equivalent 128-bit security to RSA-3072 but with tiny 32-byte public keys and 64-byte signatures. It offers immune constant-time operations resistant to cache timing attacks, and signs/verifies up to 20x faster than RSA.',
    },
    {
      q: 'Q4: Why is RFC 8785 JSON Canonicalization Scheme (JCS) critical for this project?',
      a: 'Standard JSON.stringify() is non-deterministic—different JavaScript engines, Python runtimes, or databases order object keys unpredictably and format whitespace differently. RFC 8785 guarantees lexicographically sorted keys and standardized float/string encodings, ensuring that the hash of the payload is identical across any machine worldwide.',
    },
    {
      q: 'Q5: How does the Merkle Tree Batch Issuance save computation and storage for large graduating classes?',
      a: 'When an institution issues 1,000 degree certificates at once, rather than performing 1,000 separate blockchain/registry transactions, VerifyX constructs a binary Merkle Tree where each certificate hash is a leaf. The resulting Merkle Root serves as the single anchor. Any single certificate can be verified in logarithmic time O(log N)—requiring only ~10 sibling hashes instead of checking all 1,000 records!',
    },
    {
      q: 'Q6: How does Certificate Revocation work in VerifyX?',
      a: 'Revocations are handled via real-time Certificate Revocation status + cryptographic revocation fingerprints. When an authority revokes a credential due to academic malpractice, the status updates to REVOKED, accompanied by an audit timestamp, the revoking officer’s signature, and an immutable log entry in the security audit trail.',
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
          <BookOpen className="w-4 h-4" />
          <span>Major 4th-Year Capstone Project Defense</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          VerifyX Architecture & Viva Defense Guide
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl mx-auto">
          Complete engineering reference, mathematical proofs, and examiner Q&A cheat sheet for Indian Institute of Information Technology Bhagalpur project evaluation.
        </p>
      </div>

      {/* Cryptographic Pipeline Section */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-6">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
          <Cpu className="w-5 h-5 text-emerald-400" />
          <h2 className="text-sm font-bold text-white font-mono uppercase">
            End-to-End Cryptographic Issuance & Verification Flow
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold">Step 1</span>
            <h4 className="font-bold text-slate-200">Canonicalization (RFC 8785)</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Certificate data (Recipient, Roll No, Degree, Issuer) is sorted deterministically into canonical JSON bytes.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 font-bold">Step 2</span>
            <h4 className="font-bold text-slate-200">SHA-256 & Ed25519 Signing</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Computes SHA-256 fingerprint, then signs with Organization's Ed25519 private key to produce digital signature.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 font-bold">Step 3</span>
            <h4 className="font-bold text-slate-200">PDF & QR Embedding</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Generates landscape A4 PDF, injects dynamic high-contrast QR code, security border, and PDF hash into document dictionary.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-bold">Step 4</span>
            <h4 className="font-bold text-slate-200">Dual Verification</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Verifier scans QR code or uploads PDF. VerifyX mathematically verifies asymmetric signature and compares byte hashes.
            </p>
          </div>
        </div>
      </div>

      {/* Top 6 Viva Defense Questions & Answers */}
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-amber-400" />
          <h2 className="text-xl font-bold text-white tracking-tight">
            Top Viva & Examiner Defense Questions
          </h2>
        </div>

        <div className="space-y-4">
          {vivaQuestions.map((item, index) => (
            <div key={index} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5">
              <h3 className="text-sm font-bold text-emerald-300 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>{item.q}</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed pl-6">
                {item.a}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Project Team & Attribution */}
      <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-400">
        <div>
          <span>Department of Computer Science & Engineering</span>
          <p className="text-slate-200 font-bold mt-0.5">Indian Institute of Information Technology Bhagalpur</p>
        </div>
        <div className="text-right">
          <span>Major 4th-Year Capstone Project</span>
          <p className="text-emerald-400 font-bold mt-0.5">Grade Target: A+ (Outstanding Excellence)</p>
        </div>
      </div>

    </div>
  );
}
