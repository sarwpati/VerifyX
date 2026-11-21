import React, { useRef } from 'react';
import {
  Download,
  Printer,
  Share2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Award,
  Sparkles,
  QrCode
} from 'lucide-react';

export default function CertificatePreview({ certificate }) {
  if (!certificate) return null;

  const {
    certificateId,
    recipient,
    issuer,
    details,
    crypto,
    qrCodeDataUrl,
    pdfUrl,
    status,
  } = certificate;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    if (pdfUrl) {
      window.open(pdfUrl, '_blank');
    } else {
      alert('PDF document path unavailable.');
    }
  };

  const formattedDate = new Date(details.issueDate || Date.now()).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="flex flex-col items-center w-full space-y-4">
      
      {/* Top Action Bar */}
      <div className="flex items-center justify-between w-full max-w-4xl px-2">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Certificate ID: <strong className="text-slate-200">{certificateId}</strong></span>
        </div>

        <div className="flex items-center gap-2">
          {pdfUrl && (
            <button
              onClick={handleDownloadPdf}
              className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-medium flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
          )}

          <button
            onClick={handlePrint}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Printer className="w-3.5 h-3.5 text-slate-400" />
            <span>Print</span>
          </button>
        </div>
      </div>

      {/* Visual Certificate Frame */}
      <div className="relative w-full max-w-4xl bg-[#fffdfa] text-slate-900 rounded-xl p-8 sm:p-12 shadow-2xl border-4 border-amber-500/80 overflow-hidden font-serif select-none">
        
        {/* Inner Ornate Border */}
        <div className="absolute inset-3 border-2 border-emerald-900 pointer-events-none"></div>
        <div className="absolute inset-4 border border-amber-600/60 pointer-events-none"></div>

        {/* Corner Ornaments */}
        <div className="absolute top-5 left-5 w-6 h-6 border-t-2 border-l-2 border-amber-600"></div>
        <div className="absolute top-5 right-5 w-6 h-6 border-t-2 border-r-2 border-amber-600"></div>
        <div className="absolute bottom-5 left-5 w-6 h-6 border-b-2 border-l-2 border-amber-600"></div>
        <div className="absolute bottom-5 right-5 w-6 h-6 border-b-2 border-r-2 border-amber-600"></div>

        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none select-none">
          <span className="text-8xl font-bold font-sans tracking-widest uppercase transform -rotate-12">
            VERIFIED CREDENTIAL
          </span>
        </div>

        {/* Certificate Content */}
        <div className="relative z-10 flex flex-col items-center text-center space-y-6">
          
          {/* Header & Institution */}
          <div className="space-y-1">
            <div className="flex items-center justify-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-emerald-800 text-amber-300 flex items-center justify-center text-sm font-bold shadow-sm">
                <Award className="w-5 h-5" />
              </div>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-emerald-950 tracking-wider uppercase font-sans">
              {issuer.orgName}
            </h1>
            <p className="text-xs tracking-widest text-amber-700 uppercase font-sans font-semibold">
              Official Credential of Merit & Completion
            </p>
          </div>

          {/* Title */}
          <div className="pt-2">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              {details.title}
            </h2>
            <div className="w-32 h-0.5 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2"></div>
          </div>

          {/* Presentation Note */}
          <div className="space-y-1">
            <p className="text-sm italic text-slate-600">This is to officially certify that</p>
            <h3 className="text-3xl sm:text-4xl font-bold text-emerald-900 font-sans tracking-tight pt-1">
              {recipient.name}
            </h3>
            <p className="text-xs text-slate-500 font-sans mt-0.5">
              {recipient.rollNumber && `Roll / Student ID: ${recipient.rollNumber}`}
              {recipient.department && ` • Department: ${recipient.department}`}
            </p>
          </div>

          {/* Achievement Description */}
          <div className="max-w-xl text-sm text-slate-700 leading-relaxed font-sans">
            <p>
              has successfully fulfilled all requirements and demonstrated excellence in{' '}
              <span className="font-semibold text-slate-900">
                {details.courseName || details.major || 'the prescribed curriculum'}
              </span>
              {details.gradeOrScore && (
                <span className="block mt-1 font-medium text-emerald-800">
                  Graduating Distinction: {details.gradeOrScore}
                </span>
              )}
            </p>
          </div>

          {/* Bottom Row: Date, Signatory, QR Code & Seal */}
          <div className="w-full pt-8 mt-4 border-t border-slate-200 grid grid-cols-3 items-end text-left font-sans">
            
            {/* Left: Issuance Meta */}
            <div className="space-y-1 text-xs text-slate-600">
              <p><strong>Date of Issuance:</strong> {formattedDate}</p>
              <p className="font-mono text-[11px] text-emerald-800 font-semibold">ID: {certificateId}</p>
              <p className="text-[10px] text-slate-400">Issuer: {issuer.orgCode}</p>
            </div>

            {/* Center: Official Signatory */}
            <div className="flex flex-col items-center text-center">
              <div className="w-32 border-b border-slate-800 pb-1 mb-1">
                <span className="font-serif italic text-sm text-slate-800 font-medium">
                  Prof. D. K. Singh
                </span>
              </div>
              <span className="text-[11px] font-bold text-slate-900">Authorized Signatory</span>
              <span className="text-[10px] text-slate-500">{issuer.orgName}</span>
            </div>

            {/* Right: QR Code & Anti-Counterfeit Seal */}
            <div className="flex flex-col items-end">
              {qrCodeDataUrl ? (
                <div className="p-1 bg-white border border-slate-300 rounded shadow-sm">
                  <img src={qrCodeDataUrl} alt="Verification QR" className="w-16 h-16 sm:w-20 sm:h-20" />
                </div>
              ) : (
                <div className="w-16 h-16 bg-slate-100 flex items-center justify-center border text-slate-400">
                  <QrCode className="w-8 h-8" />
                </div>
              )}
              <span className="text-[9px] font-mono text-emerald-800 font-semibold mt-1">
                Scan to Verify Online
              </span>
            </div>

          </div>

          {/* Cryptographic Bottom Strip */}
          <div className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[8px] font-mono text-slate-400 px-2">
            <span>[VERIFYX PKI] SHA-256: {crypto?.dataHash ? crypto.dataHash.substring(0, 24) : ''}...</span>
            <span>Ed25519 Sig: {crypto?.signature ? crypto.signature.substring(0, 20) : ''}...</span>
          </div>

        </div>
      </div>
    </div>
  );
}
