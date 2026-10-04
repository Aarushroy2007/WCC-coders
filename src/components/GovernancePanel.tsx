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
          <span className="text-xs text-[#918C83] font-mono">ACCOUNTABILITY FRAMEWORK</span>
          <h2 className="text-base sm:text-lg font-semibold text-[#292824] mt-0.5">
            Human-in-the-Loop Governance & Permission Matrix
          </h2>
          <p className="text-xs text-[#68645D] mt-0.5">
            "Autonomy with Accountability": Calibrated capability boundaries, gate thresholds, and scoring metrics.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onEmergencyStop}
            className="liquid-button danger text-xs py-2 px-3.5 cursor-pointer shadow-xs"
          >
            <Square className="w-3.5 h-3.5 fill-[#8C3B3B] text-[#8C3B3B]" />
            <span>Test Emergency Stop</span>
          </button>
        </div>
      </div>

      {/* Dual Scores Showcase: Human Control Score vs Agent Reliability */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Human Control Score Card */}
        <div className="glass-card space-y-4">
          <div className="flex items-start justify-between border-b border-white/60 pb-3">
            <div>
              <span className="text-xs text-[#918C83] font-mono">OVERSIGHT AUDIT</span>
              <h3 className="text-base font-semibold text-[#292824] mt-0.5">
                Human Control Score: <span className="font-mono text-[#4E765D]">{controlScore}/100</span>
              </h3>
              <p className="text-xs text-[#68645D] mt-0.5">
                Measures whether human operators retain meaningful agency over critical decisions.
              </p>
            </div>
            <span className="glass-badge py-1 px-3 text-[#4E765D] bg-[#79A98A]/15 border-[#79A98A]/30">
              Verified Compliant
            </span>
          </div>

          {/* Breakdown Factors */}
          <div className="space-y-3">
            {controlFactors.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#292824]">{factor.name}</span>
                  <span className="font-mono font-semibold text-[#292824]">{factor.score}%</span>
                </div>
                <div className="w-full bg-[#EBE4D8]/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#79A98A] to-[#9DB8A5] h-full rounded-full transition-all duration-500"
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#68645D]">{factor.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Agent Reliability Score Card */}
        <div className="glass-card space-y-4">
          <div className="flex items-start justify-between border-b border-white/60 pb-3">
            <div>
              <span className="text-xs text-[#918C83] font-mono">QUALITY & RESILIENCE</span>
              <h3 className="text-base font-semibold text-[#292824] mt-0.5">
                Agent Reliability Score: <span className="font-mono text-[#7C72D8]">{reliabilityScore}%</span>
              </h3>
              <p className="text-xs text-[#68645D] mt-0.5">
                Evaluates task completion fidelity, error recovery success, and verification accuracy.
              </p>
            </div>
            <span className="glass-badge py-1 px-3 text-[#7C72D8] bg-[#7C72D8]/10 border-[#7C72D8]/20">
              Production Grade
            </span>
          </div>

          {/* Breakdown Factors */}
          <div className="space-y-3">
            {reliabilityFactors.map((factor, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-[#292824]">{factor.name}</span>
                  <span className="font-mono font-semibold text-[#292824]">{factor.score}%</span>
                </div>
                <div className="w-full bg-[#EBE4D8]/50 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#7C72D8] to-[#8E85E2] h-full rounded-full transition-all duration-500"
                    style={{ width: `${factor.score}%` }}
                  />
                </div>
                <p className="text-[11px] text-[#68645D]">{factor.description}</p>
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
            <span className="text-xs font-semibold text-[#292824]">Operational Autonomy Level</span>
            <span className="text-xs font-mono capitalize text-[#7C72D8] font-semibold">{autonomyLevel}</span>
          </div>
          <p className="text-xs text-[#68645D]">
            Governs how aggressively the agent acts before pausing for human checkpoints.
          </p>

          <div className="grid grid-cols-3 gap-1 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 text-xs font-medium pt-1 shadow-2xs">
            {(['supervised', 'balanced', 'autonomous'] as const).map((lvl) => (
              <button
                key={lvl}
                onClick={() => onSetAutonomyLevel(lvl)}
                className={`py-2 px-2 rounded-xl transition-all capitalize cursor-pointer text-center ${
                  autonomyLevel === lvl
                    ? 'bg-white text-[#292824] shadow-xs font-semibold border border-white/90'
                    : 'text-[#68645D] hover:text-[#292824]'
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
            <span className="text-xs font-semibold text-[#292824]">Verification Acceptance Threshold</span>
            <span className="text-xs font-mono font-bold text-[#292824]">{verificationThreshold}% Quality</span>
          </div>
          <p className="text-xs text-[#68645D]">
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
            <div className="flex justify-between text-[10px] font-mono text-[#918C83] mt-1">
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
            <span className="text-xs text-[#918C83] font-mono">GRANULAR ACCESS CONTROLS</span>
            <h3 className="text-sm font-semibold text-[#292824] mt-0.5">
              Capability Permission Matrix
            </h3>
          </div>
          <span className="text-xs text-[#68645D]">
            Rule updates take effect instantaneously
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/80 text-[#68645D] font-mono text-[11px]">
                <th className="pb-3 font-medium">CAPABILITY</th>
                <th className="pb-3 font-medium">DESCRIPTION</th>
                <th className="pb-3 font-medium">RISK LEVEL</th>
                <th className="pb-3 font-medium text-right">GOVERNANCE ENFORCEMENT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {permissions.map((rule) => (
                <tr key={rule.capabilityId} className="hover:bg-white/40 transition-colors">
                  <td className="py-3.5 font-semibold text-[#292824] whitespace-nowrap">
                    {rule.capabilityName}
                  </td>
                  <td className="py-3.5 text-[#68645D] pr-4 max-w-xs leading-relaxed">
                    {rule.description}
                  </td>
                  <td className="py-3.5 whitespace-nowrap">
                    <span
                      className={`font-mono text-[11px] font-semibold uppercase px-2.5 py-0.5 rounded-full ${
                        rule.riskLevel === 'high'
                          ? 'text-[#8C3B3B] bg-[#D98282]/15 border border-[#D98282]/30'
                          : rule.riskLevel === 'medium'
                          ? 'text-[#8C6D2D] bg-[#D5A45C]/15 border border-[#D5A45C]/35'
                          : 'text-[#68645D] bg-white/70 border border-[#EBE4D8]'
                      }`}
                    >
                      {rule.riskLevel}
                    </span>
                  </td>
                  <td className="py-3.5 text-right whitespace-nowrap">
                    <div className="inline-flex items-center gap-1 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 shadow-2xs">
                      <button
                        onClick={() => onUpdatePermission(rule.capabilityId, 'always_allow')}
                        className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
                          rule.setting === 'always_allow'
                            ? 'bg-[#79A98A] text-white shadow-2xs font-semibold'
                            : 'text-[#68645D] hover:text-[#292824]'
                        }`}
                      >
                        Always Allow
                      </button>
                      <button
                        onClick={() => onUpdatePermission(rule.capabilityId, 'ask_every_time')}
                        className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
                          rule.setting === 'ask_every_time'
                            ? 'bg-[#D5A45C] text-white shadow-2xs font-semibold'
                            : 'text-[#68645D] hover:text-[#292824]'
                        }`}
                      >
                        Approval Gate
                      </button>
                      <button
                        onClick={() => onUpdatePermission(rule.capabilityId, 'never_allow')}
                        className={`px-3 py-1 rounded-xl text-[11px] font-medium transition-colors cursor-pointer ${
                          rule.setting === 'never_allow'
                            ? 'bg-[#D98282] text-white shadow-2xs font-semibold'
                            : 'text-[#68645D] hover:text-[#292824]'
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
