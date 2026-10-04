/**
 * Aegis Agent OS - Human-in-the-Loop Review & Governance Modal
 * Provides an intuitive, boardroom-grade interactive review interface
 * for approving, requesting changes, or inspecting AI agent recommendations.
 */

import React, { useState } from 'react';
import { Task, TaskApproval } from '../types/agent';
import {
  ShieldAlert,
  Check,
  X,
  FileCheck,
  AlertTriangle,
  Send,
  Eye,
  CheckCircle2,
  Users,
  Layers,
  Sparkles,
  ExternalLink,
  MessageSquare,
  Award,
  ChevronRight,
  TrendingUp,
  FileText,
} from 'lucide-react';

export interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  pendingApproval: { taskId: string; approval: TaskApproval } | null;
  tasks: Task[];
  objective: string;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges?: (feedback: string) => void;
  onNavigateToDeliverable?: () => void;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  isOpen,
  onClose,
  pendingApproval,
  tasks,
  objective,
  onApprove,
  onReject,
  onRequestChanges,
  onNavigateToDeliverable,
}) => {
  const [activeTab, setActiveTab] = useState<'proposal' | 'comparison' | 'verification' | 'guidance'>('proposal');
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [decisionMade, setDecisionMade] = useState<'approved' | 'rejected' | null>(null);

  if (!isOpen) return null;

  const currentTask = pendingApproval ? tasks.find((t) => t.id === pendingApproval.taskId) : null;
  const requestedAction = pendingApproval?.approval.requestedAction || 'Authorize Recommended Strategy and Final Deliverable Synthesis';
  const reason = pendingApproval?.approval.reason || 'Synthesized findings require explicit human sign-off before committing strategic recommendations.';
  const consequences = pendingApproval?.approval.consequences || 'Authorizes the agent to compile the executive report, generate verified citations, and finalize deliverables.';
  const riskLevel = pendingApproval?.approval.riskLevel || 'medium';

  const handleApprove = () => {
    setDecisionMade('approved');
    setTimeout(() => {
      onApprove();
      onClose();
      setDecisionMade(null);
    }, 600);
  };

  const handleReject = () => {
    setDecisionMade('rejected');
    setTimeout(() => {
      onReject();
      onClose();
      setDecisionMade(null);
    }, 600);
  };

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    if (onRequestChanges) {
      onRequestChanges(feedbackText);
    }
    setFeedbackSent(true);
    setTimeout(() => {
      setFeedbackSent(false);
      setFeedbackText('');
      onClose();
    }, 1200);
  };

  // Preset quick feedback suggestions
  const quickPrompts = [
    'Add budget breakdown for 100 creator seats',
    'Include Colossyan in initial pilot cohort',
    'Prioritize FERPA & student privacy compliance',
    'Provide 3-year TCO comparison',
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[#292824]/40 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Card */}
      <div className="relative w-full max-w-3xl max-h-[92vh] flex flex-col rounded-3xl bg-[#FCFAF6] border border-white/90 shadow-2xl overflow-hidden z-10 animate-in zoom-in-95 duration-200">
        
        {/* Modal Header */}
        <div className="px-6 py-4.5 bg-gradient-to-r from-[#FFFBF2] via-[#FAF7F2] to-white border-b border-stone-200/70 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#D5A45C]/15 border border-[#D5A45C]/30 flex items-center justify-center text-[#B88737] shrink-0 mt-0.5 shadow-2xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D5A45C] text-white shadow-2xs">
                  Human Governance Checkpoint
                </span>
                <span className="text-xs text-[#8C6D2D] font-mono">Stage 6 of 7 · Review Gate</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold text-[#292824] mt-1 tracking-tight">
                Review & Authorize Strategy Proposal
              </h2>
              <p className="text-xs text-[#68645D] mt-0.5">
                The AI multi-agent system has paused to let you inspect, steer, or authorize recommendations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-[#918C83] hover:text-[#292824] hover:bg-stone-100 transition-colors"
            title="Close review dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 bg-white/70 border-b border-stone-200/60 flex items-center gap-2 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('proposal')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'proposal'
                ? 'border-[#7C72D8] text-[#292824] font-semibold'
                : 'border-transparent text-[#68645D] hover:text-[#292824]'
            }`}
          >
            1. Proposed Strategy
          </button>
          <button
            onClick={() => setActiveTab('comparison')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'comparison'
                ? 'border-[#7C72D8] text-[#292824] font-semibold'
                : 'border-transparent text-[#68645D] hover:text-[#292824]'
            }`}
          >
            2. Vendor Evaluation Matrix
          </button>
          <button
            onClick={() => setActiveTab('verification')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'verification'
                ? 'border-[#7C72D8] text-[#292824] font-semibold'
                : 'border-transparent text-[#68645D] hover:text-[#292824]'
            }`}
          >
            3. Quality & Verification (94%)
          </button>
          <button
            onClick={() => setActiveTab('guidance')}
            className={`pb-2.5 px-3 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'guidance'
                ? 'border-[#7C72D8] text-[#292824] font-semibold'
                : 'border-transparent text-[#68645D] hover:text-[#292824]'
            }`}
          >
            4. Modify / Add Guidance
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-[#292824]">
          
          {/* TAB 1: Proposed Strategy */}
          {activeTab === 'proposal' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Highlight Action Card */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-[#FEFBF4] to-[#FAF4E8] border border-[#D5A45C]/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#8C6D2D] uppercase tracking-wider font-mono">
                    Requested Authorization
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-[#D5A45C]/20 text-[#8C6D2D]">
                    Risk: {riskLevel.toUpperCase()}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#292824] leading-snug">
                  {requestedAction}
                </h3>
                <div className="pt-2 border-t border-[#D5A45C]/25 text-xs text-[#68645D] space-y-1">
                  <div>
                    <span className="font-semibold text-[#292824]">Why this action: </span>
                    {reason}
                  </div>
                  <div>
                    <span className="font-semibold text-[#292824]">Impact: </span>
                    {consequences}
                  </div>
                </div>
              </div>

              {/* Strategic Recommendation Breakdown */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-[#918C83] uppercase tracking-wider font-mono">
                  Synthesized Recommendation Preview
                </h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#292824]">Enterprise Pilot: Synthesia</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E8F3EC] text-[#4E8B65] font-semibold">Rank #1</span>
                    </div>
                    <p className="text-xs text-[#68645D] leading-relaxed">
                      Deploy for institutional-scale training and multi-lingual compliance videos. SOC2 Type II verified with 140+ language avatars.
                    </p>
                    <div className="pt-1 text-[11px] font-mono text-[#7C72D8]">
                      Est. ROI: $32,000/yr savings vs external agencies
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-stone-200/80 shadow-2xs space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-[#292824]">Agile Pilot: HeyGen / Colossyan</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F0EEFC] text-[#7C72D8] font-semibold">Rank #2</span>
                    </div>
                    <p className="text-xs text-[#68645D] leading-relaxed">
                      Empower instructional designers with fast interactive branching scenarios and rapid slide-to-video conversion.
                    </p>
                    <div className="pt-1 text-[11px] font-mono text-[#7C72D8]">
                      Production turnaround: -78% latency
                    </div>
                  </div>
                </div>
              </div>

              {/* Responsible Governance Agents */}
              <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#7C72D8]" />
                  <span className="text-[#68645D]">
                    Prepared by <strong className="text-[#292824]">Supervisor & Analyst Agents</strong> · Audited by <strong className="text-[#292824]">Governance Sentinel</strong>
                  </span>
                </div>
                <span className="text-[11px] font-mono text-[#918C83]">Checkpoint #01</span>
              </div>
            </div>
          )}

          {/* TAB 2: Vendor Comparison Matrix */}
          {activeTab === 'comparison' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between text-xs">
                <h4 className="font-semibold text-[#292824]">
                  Comparative Multi-Criteria Benchmark (Candidate Tools)
                </h4>
                <span className="text-[#918C83] font-mono">18 Pedagogical Vectors Normalized</span>
              </div>

              <div className="overflow-x-auto rounded-xl border border-stone-200/80 bg-white">
                <table className="w-full text-xs text-left">
                  <thead className="bg-stone-50 text-[11px] font-semibold text-[#68645D] border-b border-stone-200">
                    <tr>
                      <th className="py-2.5 px-3">Platform</th>
                      <th className="py-2.5 px-2">Overall Score</th>
                      <th className="py-2.5 px-2">Avatar Realism</th>
                      <th className="py-2.5 px-2">LMS / SCORM</th>
                      <th className="py-2.5 px-2">FERPA / SOC2</th>
                      <th className="py-2.5 px-3">Best Suited For</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-100 text-[#292824]">
                    <tr className="bg-[#FAF7F2]/40">
                      <td className="py-2.5 px-3 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#4E8B65]" />
                        Synthesia
                      </td>
                      <td className="py-2.5 px-2 font-mono font-bold text-[#4E8B65]">92/100</td>
                      <td className="py-2.5 px-2">9.5 / 10</td>
                      <td className="py-2.5 px-2 text-[#4E8B65]">Full SCORM</td>
                      <td className="py-2.5 px-2 text-[#4E8B65]">SOC2 Type II</td>
                      <td className="py-2.5 px-3 text-[#68645D]">Global enterprise education</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#7C72D8]" />
                        HeyGen
                      </td>
                      <td className="py-2.5 px-2 font-mono font-bold text-[#7C72D8]">89/100</td>
                      <td className="py-2.5 px-2">9.2 / 10</td>
                      <td className="py-2.5 px-2">Web Video / API</td>
                      <td className="py-2.5 px-2">SOC2 Type II</td>
                      <td className="py-2.5 px-3 text-[#68645D]">Rapid creative course modules</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-[#D5A45C]" />
                        Colossyan
                      </td>
                      <td className="py-2.5 px-2 font-mono font-bold text-[#8C6D2D]">85/100</td>
                      <td className="py-2.5 px-2">8.8 / 10</td>
                      <td className="py-2.5 px-2 text-[#4E8B65]">Interactive Branching</td>
                      <td className="py-2.5 px-2">GDPR / FERPA</td>
                      <td className="py-2.5 px-3 text-[#68645D]">Scenario-based decision drills</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-3 font-semibold flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-stone-400" />
                        Elai.io
                      </td>
                      <td className="py-2.5 px-2 font-mono font-medium text-[#68645D]">81/100</td>
                      <td className="py-2.5 px-2">8.1 / 10</td>
                      <td className="py-2.5 px-2">LMS Export</td>
                      <td className="py-2.5 px-2">Standard Cloud</td>
                      <td className="py-2.5 px-3 text-[#68645D]">Blog & article conversions</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: Quality & Verification Scorecard */}
          {activeTab === 'verification' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="p-4 rounded-2xl bg-[#E8F3EC]/50 border border-[#79A98A]/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#E8F3EC] text-[#4E8B65] flex items-center justify-center font-bold font-mono">
                    94%
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-[#292824]">
                      Autonomous Quality Audit Passed
                    </h4>
                    <p className="text-xs text-[#5A876B]">
                      Verified by Verification Agent across 24 empirical citations with zero hallucinations.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-white text-[#4E8B65] border border-[#79A98A]/40 shadow-2xs">
                  PASSED
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                  <span className="text-[11px] text-[#918C83] block">Factual Accuracy</span>
                  <span className="text-lg font-bold font-mono text-[#292824]">96%</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                  <span className="text-[11px] text-[#918C83] block">Completeness</span>
                  <span className="text-lg font-bold font-mono text-[#292824]">94%</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                  <span className="text-[11px] text-[#918C83] block">Safety & Privacy</span>
                  <span className="text-lg font-bold font-mono text-[#4E8B65]">100%</span>
                </div>
                <div className="p-3 rounded-xl bg-white border border-stone-200/80">
                  <span className="text-[11px] text-[#918C83] block">Internal Consistency</span>
                  <span className="text-lg font-bold font-mono text-[#292824]">95%</span>
                </div>
              </div>

              <p className="text-xs text-[#68645D] italic p-3 rounded-xl bg-stone-50 border border-stone-200/60">
                "Audit confirms: Candidate vendor pricing and compliance claims cross-referenced with vendor security disclosures (2025-2026). No conflicting statements found."
              </p>
            </div>
          )}

          {/* TAB 4: Modify / Add Guidance */}
          {activeTab === 'guidance' && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-[#292824] block">
                  Steer the AI: Provide Custom Guidance or Constraints
                </label>
                <p className="text-xs text-[#68645D]">
                  Want the AI to recalculate with specific parameters? Type your feedback below and the supervisor will integrate it before final synthesis.
                </p>
                <textarea
                  value={feedbackText}
                  onChange={(e) => setFeedbackText(e.target.value)}
                  placeholder="e.g., Focus primarily on platforms with direct LMS SCORM export and under $15k annual enterprise commitment..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-[#7C72D8]/40 bg-white"
                />
              </div>

              {/* Quick suggestions */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-semibold text-[#918C83] uppercase tracking-wider font-mono">
                  Quick Directives:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickPrompts.map((qp, idx) => (
                    <button
                      key={idx}
                      onClick={() => setFeedbackText(qp)}
                      className="px-2.5 py-1 rounded-lg text-xs bg-white border border-stone-200 text-[#68645D] hover:bg-stone-50 hover:text-[#292824] transition-colors cursor-pointer"
                    >
                      + {qp}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleSendFeedback}
                disabled={!feedbackText.trim()}
                className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold bg-[#7C72D8] text-white hover:bg-[#6E64CA] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Apply Guidance & Update Proposal</span>
              </button>

              {feedbackSent && (
                <div className="p-3 rounded-xl bg-[#E8F3EC] text-[#4E8B65] text-xs font-medium flex items-center gap-2">
                  <Check className="w-4 h-4" />
                  Guidance received! Supervisor agent is applying your parameters.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-white border-t border-stone-200/70 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-[#68645D]">
            <span className="w-2 h-2 rounded-full bg-[#D5A45C] animate-pulse" />
            <span>Workflow is paused awaiting your sign-off</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-3.5 py-2 text-xs font-medium rounded-xl border border-stone-200 text-[#68645D] hover:bg-stone-50 hover:text-[#292824] transition-all"
            >
              Review Later
            </button>
            <button
              onClick={handleReject}
              className="px-3.5 py-2 text-xs font-medium rounded-xl bg-white border border-rose-300 text-rose-700 hover:bg-rose-50 transition-all"
            >
              Reject Proposal
            </button>
            <button
              onClick={handleApprove}
              className="px-5 py-2 text-xs font-semibold rounded-xl bg-[#D5A45C] hover:bg-[#C48A2C] text-white shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Approve & Continue Workflow</span>
            </button>
          </div>
        </div>

        {/* Feedback Banner when Approved */}
        {decisionMade === 'approved' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-[#E8F3EC] text-[#4E8B65] flex items-center justify-center mb-3">
              <Check className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#292824]">Proposal Approved!</h3>
            <p className="text-xs text-[#68645D] mt-1 max-w-sm">
              Your sign-off has been registered in the immutable audit log. Resuming autonomous execution to compile the final deliverable...
            </p>
          </div>
        )}

        {/* Feedback Banner when Rejected */}
        {decisionMade === 'rejected' && (
          <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mb-3">
              <X className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-[#292824]">Proposal Rejected</h3>
            <p className="text-xs text-[#68645D] mt-1 max-w-sm">
              Workflow paused by operator decision. The supervisor has preserved current findings in memory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
