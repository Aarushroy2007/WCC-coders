/**
 * Aegis Agent OS - Human-in-the-Loop Governance & Permission Center (Warm Soft Palette)
 */

import React from 'react';
import { PermissionRule, ControlFactor, ReliabilityFactor } from '../types/agent';
import {
  ShieldCheck,
  ShieldAlert,
  Square,
  SlidersHorizontal,
} from 'lucide-react';

interface GovernancePanelProps {
  permissions: PermissionRule[];
  controlScore: number;
  reliabilityScore: number;
  controlFactors: ControlFactor[];
  reliabilityFactors: ReliabilityFactor[];
  autonomyLevel: 'supervised' | 'balanced' | 'autonomous';
  verificationThreshold: number;
  onUpdatePermission: (capabilityId: string, setting: PermissionRule['setting']) => void;
  onSetAutonomyLevel: (level: 'supervised' | 'balanced' | 'autonomous') => void;
  onSetVerificationThreshold: (val: number) => void;
  onEmergencyStop: () => void;
}

export const GovernancePanel: React.FC<GovernancePanelProps> = ({
  permissions,
  controlScore,
  reliabilityScore,
  controlFactors,
  reliabilityFactors,
  autonomyLevel,
  verificationThreshold,
  onUpdatePermission,
  onSetAutonomyLevel,
  onSetVerificationThreshold,
  onEmergencyStop,
}) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="caption-meta">Accountability Framework</span>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#201F1D] tracking-[-0.016em] mt-0.5">
            Human-in-the-Loop Governance & Permission Matrix
          </h2>
          <p className="prose-secondary text-[#57524A] mt-1 max-w-[65ch]">
            "Autonomy with Accountability": Calibrated capability boundaries, gate thresholds, and scoring metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEmergencyStop}
            className="liquid-button danger text-xs py-2 px-3.5 cursor-pointer shadow-xs font-semibold"
          >
            <Square className="w-3.5 h-3.5 fill-[#8C3B3B] text-[#8C3B3B]" />
            <span>Emergency Kill-Switch</span>
          </button>
        </div>
      </div>

      {/* Dual Scores Showcase: Human Control Score vs Agent Reliability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Human Control Score Card */}
        <div className="glass-card space-y-4">
          <div className="flex items-start justify-between border-b border-white/60 pb-3">
            <div>
              <span className="caption-meta">Oversight Audit</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="metric-number text-[#3B664C]">{controlScore}</span>
                <span className="text-xs font-medium text-[#7D786F]">/ 100</span>
              </div>
              <h3 className="text-[15px] font-semibold text-[#201F1D] mt-0.5 tracking-tight">
                Human Agency & Control Score
              </h3>
              <p className="text-xs text-[#57524A] mt-1 max-w-[55ch] leading-relaxed">
                Measures whether human operators retain meaningful agency over critical decisions and high-risk operations.
              </p>
            </div>
            <span className="glass-badge py-1 px-3 text-[#3B664C] bg-[#79A98A]/15 border-[#79A98A]/30 font-semibold text-xs">
              Verified Compliant
            </span>
          </div>

          {/* Breakdown Factors */}
          <div className="space-y-3">
            {controlFactors.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#201F1D]">{factor.name}</span>
                  <span className="font-mono font-semibold text-[#201F1D] tabular-nums">{factor.score}%</span>
                </div>
                <div className="w-full bg-[#EBE4D8]/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#79A98A] to-[#9DB8A5] h-full rounded-full transition-all duration-500"
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#57524A] leading-relaxed">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Reliability Score Card */}
        <div className="glass-card space-y-4">
          <div className="flex items-start justify-between border-b border-white/60 pb-3">
            <div>
              <span className="caption-meta">Quality & Resilience</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="metric-number text-[#7C72D8]">{reliabilityScore}%</span>
              </div>
              <h3 className="text-[15px] font-semibold text-[#201F1D] mt-0.5 tracking-tight">
                Agent Reliability & Factual Score
              </h3>
              <p className="text-xs text-[#57524A] mt-1 max-w-[55ch] leading-relaxed">
                Evaluates task completion fidelity, error recovery success, and verification accuracy.
              </p>
            </div>
            <span className="glass-badge py-1 px-3 text-[#7C72D8] bg-[#7C72D8]/10 border-[#7C72D8]/20 font-semibold text-xs">
              Production Grade
            </span>
          </div>

          {/* Breakdown Factors */}
          <div className="space-y-3">
            {reliabilityFactors.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#201F1D]">{factor.name}</span>
                  <span className="font-mono font-semibold text-[#201F1D] tabular-nums">{factor.score}%</span>
                </div>
                <div className="w-full bg-[#EBE4D8]/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#7C72D8] to-[#8E85E2] h-full rounded-full transition-all duration-500"
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#57524A] leading-relaxed">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Global Autonomy & Verification Threshold Calibration */}
      <div className="glass-card grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Autonomy Level Slider / Segmented Tabs */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] font-semibold text-[#201F1D]">Operational Autonomy Level</span>
            <span className="text-xs font-mono capitalize text-[#7C72D8] font-semibold">{autonomyLevel}</span>
          </div>
          <p className="text-xs text-[#57524A] leading-relaxed max-w-[55ch]">
            Governs how aggressively the agent acts before pausing for human checkpoints.
          </p>

          <div className="grid grid-cols-3 gap-1 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 text-xs font-medium pt-1 shadow-2xs">
            {(['supervised', 'balanced', 'autonomous'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onSetAutonomyLevel(lvl)}
                className={`py-2 px-2 rounded-xl transition-all capitalize cursor-pointer text-center text-xs ${
                  autonomyLevel === lvl
                    ? 'bg-white text-[#201F1D] shadow-xs font-semibold border border-white/90'
                    : 'text-[#57524A] hover:text-[#201F1D]'
                }`}
              >
                {lvl}
              </button>
            ))}
          </div>
        </div>

        {/* Verification Acceptance Threshold */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] font-semibold text-[#201F1D]">Verification Acceptance Threshold</span>
            <span className="text-xs font-mono font-bold text-[#201F1D] tabular-nums">{verificationThreshold}% Quality</span>
          </div>
          <p className="text-xs text-[#57524A] leading-relaxed max-w-[55ch]">
            If verification falls below this score, the agent automatically triggers Review → Re-plan → Re-execute.
          </p>

          <div className="pt-2">
            <input
              type="range"
              min={70}
              max={98}
              value={verificationThreshold}
              onChange={(e) => onSetVerificationThreshold(Number(e.target.value))}
              className="w-full accent-[#7C72D8] cursor-pointer"
            />
            <div className="flex justify-between text-[11px] font-medium text-[#7D786F] mt-1 tabular-nums">
              <span>70% (Permissive)</span>
              <span>85% (Recommended)</span>
              <span>98% (Strict Zero-Tolerance)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Granular Capability Permission Table */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between border-b border-white/60 pb-3">
          <div>
            <span className="caption-meta">Granular Access Controls</span>
            <h3 className="text-sm sm:text-base font-semibold text-[#201F1D] mt-0.5 tracking-[-0.01em]">
              Capability Permission Matrix
            </h3>
          </div>
          <span className="text-xs text-[#7D786F]">
            Rule updates take effect instantaneously
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/80 text-[#57524A] text-xs font-semibold">
                <th className="pb-3 font-semibold text-[#201F1D]">Capability</th>
                <th className="pb-3 font-semibold text-[#201F1D]">Description</th>
                <th className="pb-3 font-semibold text-[#201F1D]">Risk Level</th>
                <th className="pb-3 font-semibold text-[#201F1D] text-right">Governance Enforcement</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {permissions.map((rule) => (
                <tr key={rule.capabilityId} className="hover:bg-white/40 transition-colors">
                  <td className="py-3.5 font-semibold text-[#201F1D] whitespace-nowrap text-[13px]">
                    {rule.capabilityName}
                  </td>
                  <td className="py-3.5 text-[#57524A] pr-4 max-w-xs leading-relaxed text-xs">
                    {rule.description}
                  </td>
                  <td className="py-3.5 whitespace-nowrap">
                    <span
                      className={`text-xs font-semibold capitalize px-2.5 py-0.5 rounded-full ${
                        rule.riskLevel === 'high'
                          ? 'text-[#8C3B3B] bg-[#D98282]/15 border border-[#D98282]/30'
                          : rule.riskLevel === 'medium'
                          ? 'text-[#8C6D2D] bg-[#D5A45C]/15 border border-[#D5A45C]/35'
                          : 'text-[#57524A] bg-white/70 border border-[#EBE4D8]'
                      }`}
                    >
                      {rule.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 shadow-2xs">
                      <button
                        onClick={() => onUpdatePermission(rule.capabilityId, 'always_allow')}
                        className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          rule.setting === 'always_allow'
                            ? 'bg-[#79A98A] text-white shadow-2xs font-semibold'
                            : 'text-[#57524A] hover:text-[#201F1D]'
                        }`}
                      >
                        Always Allow
                      </button>
                      <button
                        onClick={() => onUpdatePermission(rule.capabilityId, 'ask_every_time')}
                        className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          rule.setting === 'ask_every_time'
                            ? 'bg-[#D5A45C] text-white shadow-2xs font-semibold'
                            : 'text-[#57524A] hover:text-[#201F1D]'
                        }`}
                      >
                        Review Gate
                      </button>
                      <button
                        onClick={() => onUpdatePermission(rule.capabilityId, 'never_allow')}
                        className={`px-3 py-1 rounded-xl text-xs font-medium transition-colors cursor-pointer ${
                          rule.setting === 'never_allow'
                            ? 'bg-[#D98282] text-white shadow-2xs font-semibold'
                            : 'text-[#57524A] hover:text-[#201F1D]'
                        }`}
                      >
                        Never Allow
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
