/**
 * Aegis Agent OS - Top Bar Component (Premium Liquid Glass Design)
 */

import React from 'react';
import { AgentPhase } from '../types/agent';
import { Square, Play, Sparkles, ShieldCheck, HelpCircle, ShieldAlert } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  phase: AgentPhase;
  simulationMode: boolean;
  onToggleSimulation: (val: boolean) => void;
  onEmergencyStop: () => void;
  onResume: () => void;
  onSelectScenario: (id: string) => void;
  onOpenWhyDifferent: () => void;
  pendingApprovalsCount: number;
  onOpenReview?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  phase,
  simulationMode,
  onToggleSimulation,
  onEmergencyStop,
  onResume,
  onSelectScenario,
  onOpenWhyDifferent,
  pendingApprovalsCount,
  onOpenReview,
}) => {
  const navItems = [
    { id: 'command', label: 'Command Center' },
    { id: 'workflow', label: 'Agent Graph' },
    { id: 'tasks', label: 'Task Plan' },
    { id: 'tools', label: 'Tool Activity' },
    { id: 'memory', label: 'Memory' },
    { id: 'governance', label: 'Governance' },
    { id: 'deliverable', label: 'Final Result' },
    { id: 'audit', label: 'Audit Log' },
  ];

  const isStopped = phase === 'stopped';
  const isPaused = phase === 'paused';
  const isWaitingApproval = phase === 'waiting_approval';
  const isRunning = phase === 'executing' || phase === 'thinking' || phase === 'planning' || phase === 'verifying';

  return (
    <header className="glass-navbar max-w-7xl mx-auto w-full transition-all">
      <div className="flex items-center justify-between gap-4">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#7C72D8] to-[#8E85E2] text-white flex items-center justify-center font-semibold text-xs tracking-wider shadow-2xs">
            Æ
          </div>
          <span className="text-[16px] font-semibold tracking-[-0.02em] text-[#201F1D]">
            Aegis <span className="font-normal text-[#57524A] text-xs tracking-normal ml-1">Agent OS</span>
          </span>
        </div>

        {/* Zone 2: Navigation Links (Clean text with hover/active indicators) */}
        <nav className="hidden md:flex items-center gap-1 text-[13px] font-medium text-[#57524A] overflow-x-auto py-0.5 tracking-[-0.005em]">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3.5 py-1.5 rounded-xl transition-all whitespace-nowrap cursor-pointer text-[13px] ${
                  isActive
                    ? 'text-[#201F1D] bg-white/95 font-semibold shadow-2xs border border-white/90'
                    : 'hover:text-[#201F1D] hover:bg-white/45 text-[#57524A] font-medium'
                }`}
              >
                {item.label}
                {item.id === 'governance' && pendingApprovalsCount > 0 && (
                  <span className="ml-1.5 inline-block w-2 h-2 rounded-full bg-[#D5A45C] animate-ping" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions & Emergency Controls */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Review Needed button if pending approval */}
          {pendingApprovalsCount > 0 && (
            <button
              onClick={() => (onOpenReview ? onOpenReview() : setActiveTab('command'))}
              className="liquid-button text-xs py-1.5 px-3 bg-[#FEF8EC] text-[#8C6D2D] border border-[#D5A45C]/50 hover:bg-[#FDF2D9] flex items-center gap-1.5 font-semibold animate-pulse shadow-2xs cursor-pointer"
              title="A high-priority governance approval requires your review"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-[#D5A45C]" />
              <span>Review Needed</span>
            </button>
          )}

          {/* Why Different button */}
          <button
            onClick={onOpenWhyDifferent}
            title="Architecture & explainability"
            className="hidden sm:inline-flex liquid-button text-xs py-1.5 px-3 font-medium text-[#57524A] hover:text-[#201F1D]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-[#7C72D8]" />
            <span>Why Different</span>
          </button>

          {/* Scenario Selector */}
          <div className="hidden xl:block">
            <select
              aria-label="Preset Scenarios"
              onChange={(e) => onSelectScenario(e.target.value)}
              className="text-xs py-1.5 px-3 bg-white/70 backdrop-blur-md border border-[#EBE4D8] rounded-xl text-[#201F1D] font-medium focus:outline-hidden focus:ring-2 focus:ring-[#7C72D8]/20 shadow-2xs cursor-pointer"
              defaultValue="edtech_video_research"
            >
              <option value="edtech_video_research">Demo: EdTech AI Video Platform</option>
              <option value="enterprise_code_assistants">Scenario: Enterprise Code Assistants</option>
              <option value="cloud_finops_optimization">Scenario: Cloud FinOps Rightsizing</option>
            </select>
          </div>

          {/* Simulation Toggle */}
          <button
            onClick={() => onToggleSimulation(!simulationMode)}
            className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
              simulationMode
                ? 'bg-[#FAF2E2] border-[#D5A45C]/50 text-[#8C6D2D] shadow-2xs font-semibold'
                : 'bg-white/60 border-white/80 text-[#57524A] hover:text-[#201F1D] hover:bg-white/80'
            }`}
            title="Dry-run workflow without committing changes"
          >
            <Sparkles className={`w-3.5 h-3.5 ${simulationMode ? 'text-[#D5A45C]' : 'text-stone-400'}`} />
            <span>Simulation</span>
          </button>

          {/* Emergency Stop Button (Always accessible) */}
          {isRunning || isWaitingApproval ? (
            <button
              onClick={onEmergencyStop}
              className="liquid-button danger text-xs py-1.5 px-3.5 whitespace-nowrap cursor-pointer font-medium"
              title="Immediately freeze all tasks and abort active tool calls"
            >
              <Square className="w-3 h-3 fill-[#8C3B3B] text-[#8C3B3B]" />
              <span>Stop Agent</span>
            </button>
          ) : isStopped || isPaused ? (
            <button
              onClick={onResume}
              className="liquid-button primary text-xs py-1.5 px-3.5 whitespace-nowrap font-medium"
            >
              <Play className="w-3 h-3 fill-white text-white" />
              <span>Resume</span>
            </button>
          ) : (
            <div className="agent-status text-xs py-1 px-3">
              <span className="status-dot" />
              <span className="font-mono text-[#57524A] text-[11px] font-medium">Governed</span>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Nav Drawer Row */}
      <div className="flex md:hidden items-center gap-2 overflow-x-auto pt-2.5 pb-0.5 text-xs">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`px-3 py-1 rounded-lg whitespace-nowrap cursor-pointer ${
              activeTab === item.id ? 'bg-white font-semibold text-[#292824] shadow-2xs' : 'text-[#68645D]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
