import React, { useState } from 'react';
import { Layers, Binary, ShieldCheck, CheckCircle2, ChevronRight, Copy, Check } from 'lucide-react';

export default function MerkleTreeVisualizer({ merkleRoot, batchCount = 3, sampleLeaves = [] }) {
  const [selectedLeafIndex, setSelectedLeafIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const defaultLeaves = sampleLeaves.length > 0 ? sampleLeaves : [
    { id: 'Leaf 1 (Priya Singh)', hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855', certId: 'VX-IIITBH-2026-3001' },
    { id: 'Leaf 2 (Rohan Verma)', hash: '8729832049c30f40ab9892cfa4884920401824982aebc9483018204981048201', certId: 'VX-IIITBH-2026-3002' },
    { id: 'Leaf 3 (Ananya Gupta)', hash: '9901428590148209418290481204981209481209481209481209481209481209', certId: 'VX-IIITBH-2026-3003' },
  ];

  const handleCopyRoot = () => {
    if (merkleRoot) {
      navigator.clipboard.writeText(merkleRoot);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full rounded-2xl border border-slate-800 bg-slate-950/70 p-6 space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
              <span>Merkle Tree Batch Cryptographic Structure</span>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                {batchCount} Batched Credentials
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Binary hash tree anchoring all batch certificates into one immutable Merkle Root
            </p>
          </div>
        </div>

        {merkleRoot && (
          <button
            onClick={handleCopyRoot}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-mono flex items-center gap-1.5 transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy Root Hash</span>
          </button>
        )}
      </div>

      {/* Visual Tree Representation */}
      <div className="relative flex flex-col items-center space-y-5 py-4 px-2">
        
        {/* Merkle Root Node */}
        <div className="relative group p-4 rounded-xl bg-gradient-to-b from-cyan-950/80 to-slate-900 border-2 border-cyan-500/60 shadow-glow-blue max-w-lg w-full text-center space-y-1">
          <div className="text-[10px] font-mono uppercase tracking-widest text-cyan-400 font-bold flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Merkle Tree Root (Top-Level Cryptographic Anchor)</span>
          </div>
          <div className="text-xs font-mono text-white break-all font-semibold">
            {merkleRoot || 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'}
          </div>
        </div>

        {/* Tree Connectors */}
        <div className="w-0.5 h-6 bg-cyan-500/40"></div>

        {/* Intermediate Hash Layer */}
        <div className="grid grid-cols-2 gap-4 max-w-xl w-full text-center">
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-mono text-slate-300">
            <span className="text-[9px] text-slate-500 block uppercase">Intermediate Node H(0,1)</span>
            <span className="text-slate-400 break-all text-[10px]">sha256(leaf0 + leaf1)</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-700 text-[11px] font-mono text-slate-300">
            <span className="text-[9px] text-slate-500 block uppercase">Intermediate Node H(2,3)</span>
            <span className="text-slate-400 break-all text-[10px]">sha256(leaf2 + leaf3)</span>
          </div>
        </div>

        {/* Connectors */}
        <div className="w-0.5 h-6 bg-slate-700"></div>

        {/* Leaf Nodes (Certificates) */}
        <div className="w-full space-y-2">
          <div className="text-xs font-semibold text-slate-300 font-mono flex items-center justify-between">
            <span>Leaf Nodes (Click to simulate Merkle Inclusion Proof):</span>
            <span className="text-slate-500 text-[11px]">Selected: Leaf {selectedLeafIndex + 1}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {defaultLeaves.map((leaf, idx) => {
              const isSelected = selectedLeafIndex === idx;
              return (
                <div
                  key={idx}
                  onClick={() => setSelectedLeafIndex(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all duration-200 text-left font-mono ${
                    isSelected
                      ? 'border-cyan-400 bg-cyan-950/40 shadow-glow-blue'
                      : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-200">
                    <span className="text-[11px] text-cyan-400">{leaf.id}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <div className="text-[10px] text-slate-400 mt-1">ID: {leaf.certId}</div>
                  <div className="text-[9px] text-slate-500 break-all mt-1 truncate">
                    Hash: {leaf.hash}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Merkle Proof Explanation Footer */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
        <p className="font-semibold text-slate-300 flex items-center gap-1.5">
          <Binary className="w-3.5 h-3.5 text-emerald-400" />
          Why Merkle Proofs Matter for Large Batches:
        </p>
        <p className="text-[11px] leading-relaxed">
          Instead of storing hundreds of certificate signatures separately, VerifyX computes a cryptographic Merkle Root. Any single certificate can be proven authentic in logarithmic time \(O(\log N)\) using only a few sibling hashes!
        </p>
      </div>

    </div>
  );
}
