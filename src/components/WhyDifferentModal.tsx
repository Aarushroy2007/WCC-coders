/**
 * Aegis Agent OS - "Why This Agent Is Different" Architectural Showcase (Warm Soft Palette)
 */

import React from 'react';
import {
  X,
  Compass,
  Zap,
  RefreshCw,
  CheckCircle,
  ShieldCheck,
  Eye,
  Award,
  Sparkles,
} from 'lucide-react';

interface WhyDifferentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const WhyDifferentModal: React.FC<WhyDifferentModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const pillars = [
    {
      title: '1. Structured Reasoning over Raw Chat',
      summary: 'Transforms vague human objectives into typed, deterministic execution constraints.',
      contrast: 'Chatbots output stream-of-consciousness text. Aegis outputs formal parameter schemas with risk ratings.',
      icon: <Compass className="w-5 h-5 text-[#7C72D8]" />,
    },
    {
      title: '2. Topological Dependency Planning',
      summary: 'Creates directed acyclic graphs (DAGs) aware of prerequisite data dependencies.',
      contrast: 'Chatbots guess sequential steps. Aegis validates data prerequisites and runs parallel branches safely.',
      icon: <Sparkles className="w-5 h-5 text-[#D5A45C]" />,
    },
    {
      title: '3. Modular Sandboxed Tool-Use',
      summary: 'Invokes real search indexes, calculators, Python runners, and databases with verifiable I/O.',
      contrast: 'Chatbots hallucinate math and facts. Aegis uses deterministic calculators and verified citations.',
      icon: <Zap className="w-5 h-5 text-[#7C72D8]" />,
    },
    {
      title: '4. Autonomous Fault-Tolerance & Self-Healing',
      summary: 'Detects transient upstream timeouts and rate-limits, dynamically switching to fallback routes.',
      contrast: 'Chatbots fail unrecoverably with generic errors. Aegis self-corrects without halting the pipeline.',
      icon: <RefreshCw className="w-5 h-5 text-[#7F9DBB]" />,
    },
    {
      title: '5. Multi-Vector Verification Engine',
      summary: 'Audits its own deliverables across Accuracy, Completeness, Relevance, and Consistency.',
      contrast: 'Chatbots never double-check their own work. Aegis enforces strict verification score thresholds.',
      icon: <CheckCircle className="w-5 h-5 text-[#79A98A]" />,
    },
    {
      title: '6. Meaningful Human-in-the-Loop Governance',
      summary: 'Approval gates halt consequential actions until an operator clicks Approve, Reject, or Modify.',
      contrast: 'Chatbots either act blindly or ask for permission on trivialities. Aegis uses calibrated risk tiers.',
      icon: <ShieldCheck className="w-5 h-5 text-[#E9A98F]" />,
    },
    {
      title: '7. Safe Explainability Summaries',
      summary: 'Provides concise, human-readable rationale without exposing private chain-of-thought tokens.',
      contrast: 'Exposing raw scratchpads creates cognitive overload. Aegis provides Decision, Why, Evidence, and Confidence.',
      icon: <Eye className="w-5 h-5 text-[#8D82C7]" />,
    },
    {
      title: '8. Mathematical Reliability Scoring',
      summary: 'Quantifies success rates, recovery speed, and human oversight adherence objectively.',
      contrast: 'Chatbots boast unverifiable claims. Aegis measures deterministic execution metrics in tabular data.',
      icon: <Award className="w-5 h-5 text-[#D5A45C]" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292824]/30 backdrop-blur-md">
      <div className="glass max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-6 border-b border-white/60 flex items-start justify-between gap-4">
          <div className="space-y-1">
            <span className="glass-badge py-0.5 px-2.5 text-[10px] text-[#7C72D8] bg-[#7C72D8]/10 border-[#7C72D8]/20">
              ARCHITECTURAL MANIFESTO
            </span>
            <h2 className="text-xl font-bold text-[#292824] mt-1">
              Why This Agent Is Different
            </h2>
            <p className="text-xs text-[#68645D]">
              "Don't just build an AI that talks. Build an AI that gets things done — responsibly."
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#918C83] hover:text-[#292824] hover:bg-white/80 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Pillars Grid */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pillars.map((p, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl border border-white/80 bg-white/50 space-y-2 text-xs backdrop-blur-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white flex items-center justify-center border border-white shadow-2xs shrink-0">
                    {p.icon}
                  </div>
                  <h3 className="font-semibold text-[#292824]">{p.title}</h3>
                </div>
                <p className="text-[#292824] font-medium leading-relaxed">
                  {p.summary}
                </p>
                <div className="pt-2 border-t border-white/70 text-[11px] text-[#68645D]">
                  <span className="font-semibold text-[#292824]">Contrast: </span>
                  {p.contrast}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white/40 border-t border-white/60 flex items-center justify-between text-xs">
          <span className="text-[#68645D] font-mono text-[11px]">
            Aegis Agent Operating System · Certified Human Oversight
          </span>
          <button
            onClick={onClose}
            className="liquid-button primary text-xs py-2 px-5"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
