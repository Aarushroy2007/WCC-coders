/**
 * Aegis Agent OS - Final Result Center & Executive Deliverable (Warm Soft Palette)
 */

import React, { useState } from 'react';
import { FinalDeliverable } from '../types/agent';
import {
  CheckCircle2,
  Copy,
  Download,
  RotateCcw,
  ExternalLink,
  FileText,
  Check,
} from 'lucide-react';

interface DeliverableCenterProps {
  deliverable: FinalDeliverable | null;
  onRunAgain: () => void;
  onModifyWorkflow: () => void;
}

export const DeliverableCenter: React.FC<DeliverableCenterProps> = ({
  deliverable,
  onRunAgain,
}) => {
  const [activeTab, setActiveTab] = useState<'summary' | 'matrix' | 'recommendations' | 'sources' | 'verification'>('summary');
  const [copied, setCopied] = useState(false);

  if (!deliverable) {
    return (
      <div className="glass-card p-12 text-center space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-white/80 border border-white flex items-center justify-center mx-auto text-[#7C72D8] shadow-2xs">
          <FileText className="w-7 h-7" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-[#292824]">
            No Deliverable Generated Yet
          </h3>
          <p className="text-xs text-[#68645D] max-w-md mx-auto">
            Run an autonomous workflow from the Command Center to have the multi-agent system plan, research, verify, and compile a boardroom-ready deliverable.
          </p>
        </div>
        <button
          onClick={onRunAgain}
          className="liquid-button primary text-xs py-2 px-5"
        >
          <span>Run Autonomous Workflow</span>
        </button>
      </div>
    );
  }

  const handleCopyMarkdown = () => {
    const md = `
# Executive Recommendation Report
**Objective:** ${deliverable.objective}

## Executive Summary
${deliverable.executiveSummary}

## Key Findings
${deliverable.keyFindings.map((f) => `- ${f}`).join('\n')}

## Strategic Recommendations
${deliverable.recommendations.map((r) => `### ${r.title} (${r.priority} Priority · ${r.effort} Effort)\n${r.description}\n*Impact:* ${r.impact}`).join('\n\n')}

## Verification Audit
- Accuracy: ${deliverable.verificationScorecard.accuracy}%
- Completeness: ${deliverable.verificationScorecard.completeness}%
- Relevance: ${deliverable.verificationScorecard.relevance}%
- Consistency: ${deliverable.verificationScorecard.consistency}%
- Overall Score: ${deliverable.verificationScorecard.overall}%
- Verified by: Autonomous Verification Agent & Human Approval Signature
    `.trim();

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(deliverable, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegis_deliverable_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-card flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div className="space-y-2.5 flex-1">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="glass-badge py-0.5 px-3 text-xs font-semibold text-[#3B664C] bg-[#79A98A]/15 border-[#79A98A]/30">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3B664C] mr-1.5 inline" />
              Verified Boardroom Deliverable
            </span>
            <span className="text-xs text-[#7D786F] font-mono tabular-nums">
              Quality Score: {deliverable.verificationScorecard.overall}%
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold text-[#201F1D] tracking-[-0.02em] leading-snug">
            Executive Recommendation Memo: AI Video Production Platforms
          </h1>

          <p className="text-xs sm:text-[13px] text-[#57524A] max-w-[65ch] leading-relaxed">
            <span className="font-semibold text-[#201F1D]">Target Objective: </span>
            {deliverable.objective}
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <button
            onClick={handleCopyMarkdown}
            className="liquid-button text-xs py-2 px-3.5 font-medium cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-[#3B664C]" /> : <Copy className="w-3.5 h-3.5 text-[#57524A]" />}
            <span>{copied ? 'Copied' : 'Copy Markdown'}</span>
          </button>
          <button
            onClick={handleDownloadJSON}
            className="liquid-button text-xs py-2 px-3.5 font-medium cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-[#57524A]" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={onRunAgain}
            className="liquid-button primary text-xs py-2 px-4 font-semibold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Run Again</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 text-xs font-medium w-fit overflow-x-auto shadow-2xs">
        <button
          onClick={() => setActiveTab('summary')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap text-xs ${
            activeTab === 'summary' ? 'bg-white text-[#201F1D] shadow-xs font-semibold border border-white/90' : 'text-[#57524A] hover:text-[#201F1D]'
          }`}
        >
          Executive Summary
        </button>
        <button
          onClick={() => setActiveTab('matrix')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap text-xs ${
            activeTab === 'matrix' ? 'bg-white text-[#201F1D] shadow-xs font-semibold border border-white/90' : 'text-[#57524A] hover:text-[#201F1D]'
          }`}
        >
          Comparative Matrix
        </button>
        <button
          onClick={() => setActiveTab('recommendations')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap text-xs ${
            activeTab === 'recommendations' ? 'bg-white text-[#201F1D] shadow-xs font-semibold border border-white/90' : 'text-[#57524A] hover:text-[#201F1D]'
          }`}
        >
          Strategic Roadmap ({deliverable.recommendations.length})
        </button>
        <button
          onClick={() => setActiveTab('sources')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap text-xs ${
            activeTab === 'sources' ? 'bg-white text-[#201F1D] shadow-xs font-semibold border border-white/90' : 'text-[#57524A] hover:text-[#201F1D]'
          }`}
        >
          Verified Sources ({deliverable.sources.length})
        </button>
        <button
          onClick={() => setActiveTab('verification')}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap text-xs ${
            activeTab === 'verification' ? 'bg-white text-[#201F1D] shadow-xs font-semibold border border-white/90' : 'text-[#57524A] hover:text-[#201F1D]'
          }`}
        >
          Verification Scorecard
        </button>
      </div>

      {/* Tab 1: Executive Summary & Findings */}
      {activeTab === 'summary' && (
        <div className="space-y-6">
          <div className="glass-card space-y-4">
            <h3 className="text-sm sm:text-base font-semibold text-[#201F1D] border-b border-white/60 pb-2 tracking-[-0.01em]">
              1. Executive Overview
            </h3>
            <p className="text-[#57524A] text-[14px] sm:text-[15px] leading-[1.65] max-w-[70ch]">
              {deliverable.executiveSummary}
            </p>
          </div>

          <div className="glass-card space-y-4">
            <h3 className="text-sm sm:text-base font-semibold text-[#201F1D] border-b border-white/60 pb-2 tracking-[-0.01em]">
              2. Key Analytical Discoveries
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {deliverable.keyFindings.map((finding, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl border border-white/80 bg-white/40 text-xs space-y-1.5 backdrop-blur-xs"
                >
                  <span className="font-mono text-[11px] text-[#7C72D8] font-semibold">
                    Discovery 0{idx + 1}
                  </span>
                  <p className="text-[#201F1D] leading-relaxed font-medium text-[13px]">
                    {finding}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Comparative Matrix */}
      {activeTab === 'matrix' && deliverable.comparisons && (
        <div className="glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#201F1D] tracking-[-0.01em]">
                Vendor Capability & Pedagogical Benchmark Matrix
              </h3>
              <p className="text-xs text-[#57524A] mt-0.5 max-w-[65ch]">
                Evaluated across FERPA privacy, avatar realism, and LMS quiz integration.
              </p>
            </div>
            <span className="text-xs font-medium text-[#7D786F]">4 Platforms Evaluated</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-white/80 text-[#57524A] text-xs font-semibold">
                  {deliverable.comparisons.headers.map((h, i) => (
                    <th key={i} className="pb-3 pr-3 font-semibold text-[#201F1D] capitalize">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-white/60">
                {deliverable.comparisons.rows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/40 transition-colors">
                    <td className="py-3.5 font-semibold text-[#201F1D] pr-3 whitespace-nowrap text-[13px]">
                      {row.item}
                    </td>
                    <td className="py-3.5 text-[#57524A] pr-3 whitespace-nowrap">
                      {row.category}
                    </td>
                    <td className="py-3.5 font-mono font-bold text-[#7C72D8] pr-3 tabular-nums text-sm">
                      {row.score}
                    </td>
                    <td className="py-3.5 text-[#3B664C] pr-3 max-w-xs font-medium leading-relaxed">
                      {row.pros}
                    </td>
                    <td className="py-3.5 text-[#57524A] pr-3 max-w-xs leading-relaxed">
                      {row.cons}
                    </td>
                    <td className="py-3.5 font-mono text-[#201F1D] whitespace-nowrap tabular-nums">
                      {row.pricing}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Recommendations */}
      {activeTab === 'recommendations' && (
        <div className="space-y-4">
          {deliverable.recommendations.map((rec, idx) => (
            <div
              key={idx}
              className="glass-card space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-[#7C72D8]">
                    REC-0{idx + 1}
                  </span>
                  <h4 className="text-sm sm:text-[15px] font-semibold text-[#201F1D] tracking-tight">
                    {rec.title}
                  </h4>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2.5 py-0.5 rounded-full font-semibold ${
                    rec.priority === 'Immediate' ? 'bg-[#D98282]/15 text-[#8C3B3B] border border-[#D98282]/30' : 'bg-white/80 text-[#201F1D]'
                  }`}>
                    {rec.priority}
                  </span>
                  <span className="text-[#7D786F]">·</span>
                  <span className="text-[#57524A] font-medium">Effort: {rec.effort}</span>
                </div>
              </div>

              <p className="text-xs sm:text-[13px] text-[#57524A] leading-relaxed max-w-[65ch]">
                {rec.description}
              </p>

              <div className="pt-2 border-t border-white/60 text-xs sm:text-[13px] text-[#3B664C] font-semibold">
                Expected Strategic Impact: {rec.impact}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab 4: Sources */}
      {activeTab === 'sources' && (
        <div className="glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#201F1D] tracking-[-0.01em]">
                Verified External Sources & Provenance
              </h3>
              <p className="text-xs text-[#57524A] mt-0.5 max-w-[65ch]">
                Every factual claim is backed by peer-reviewed research or vendor security compliance audits.
              </p>
            </div>
            <span className="text-xs font-medium text-[#7D786F] tabular-nums">{deliverable.sources.length} Citations</span>
          </div>

          <div className="divide-y divide-white/60 text-xs">
            {deliverable.sources.map((source, idx) => (
              <div key={idx} className="py-3.5 flex items-start justify-between gap-4">
                <div className="space-y-0.5">
                  <h4 className="font-semibold text-[#201F1D] text-xs sm:text-[13px]">{source.name}</h4>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#7C72D8] hover:underline font-mono text-[11px] flex items-center gap-1"
                  >
                    <span>{source.url}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="text-right shrink-0">
                  <span className="glass-badge py-0.5 px-2 text-[11px] text-[#57524A] font-medium">
                    {source.reliability}
                  </span>
                  <div className="text-[10px] font-mono text-[#7D786F] mt-1 tabular-nums">{source.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Verification Scorecard */}
      {activeTab === 'verification' && (
        <div className="glass-card space-y-6">
          <div className="flex items-start justify-between border-b border-white/60 pb-4">
            <div>
              <span className="caption-meta">Autonomous Audit Rubric</span>
              <h3 className="text-base sm:text-lg font-semibold text-[#201F1D] mt-0.5 tracking-tight">
                Verification Engine Scorecard
              </h3>
              <p className="text-xs sm:text-[13px] text-[#57524A] mt-0.5 max-w-[65ch]">
                Multi-agent cross-check examining factual consistency, mathematical balance, and completeness.
              </p>
            </div>
            <div className="text-right">
              <span className="text-3xl font-bold font-mono text-[#3B664C] tabular-nums">
                {deliverable.verificationScorecard.overall}%
              </span>
              <div className="text-[10px] font-mono text-[#3B664C] font-semibold tracking-wider">
                AUDIT PASSED
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-white/60 border border-white space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#201F1D]">
                <span>Accuracy</span>
                <span className="font-mono tabular-nums">{deliverable.verificationScorecard.accuracy}%</span>
              </div>
              <div className="w-full bg-[#EBE4D8]/50 rounded-full h-1.5">
                <div className="bg-[#7C72D8] h-full rounded-full" style={{ width: `${deliverable.verificationScorecard.accuracy}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 border border-white space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#201F1D]">
                <span>Completeness</span>
                <span className="font-mono tabular-nums">{deliverable.verificationScorecard.completeness}%</span>
              </div>
              <div className="w-full bg-[#EBE4D8]/50 rounded-full h-1.5">
                <div className="bg-[#7C72D8] h-full rounded-full" style={{ width: `${deliverable.verificationScorecard.completeness}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 border border-white space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#201F1D]">
                <span>Relevance</span>
                <span className="font-mono tabular-nums">{deliverable.verificationScorecard.relevance}%</span>
              </div>
              <div className="w-full bg-[#EBE4D8]/50 rounded-full h-1.5">
                <div className="bg-[#7C72D8] h-full rounded-full" style={{ width: `${deliverable.verificationScorecard.relevance}%` }} />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/60 border border-white space-y-2">
              <div className="flex justify-between text-xs font-semibold text-[#201F1D]">
                <span>Consistency</span>
                <span className="font-mono tabular-nums">{deliverable.verificationScorecard.consistency}%</span>
              </div>
              <div className="w-full bg-[#EBE4D8]/50 rounded-full h-1.5">
                <div className="bg-[#7C72D8] h-full rounded-full" style={{ width: `${deliverable.verificationScorecard.consistency}%` }} />
              </div>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-white/60 border border-white text-xs space-y-1">
            <span className="font-semibold text-[#201F1D]">Lead Auditor Feedback:</span>
            <p className="text-[#57524A] italic leading-relaxed text-xs sm:text-[13px]">
              "{deliverable.verificationScorecard.feedback}"
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
