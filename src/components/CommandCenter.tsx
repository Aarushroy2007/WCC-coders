/**
 * Aegis Agent OS - Central Agent Command Center (Premium Liquid Glass Design)
 */

import React, { useState } from 'react';
import {
  AgentPhase,
  Task,
  TaskApproval,
  ActivityLogItem,
  ControlFactor,
  ReliabilityFactor,
} from '../types/agent';
import {
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  AlertTriangle,
  ArrowRight,
  Layers,
  ChevronRight,
  Cpu,
  RefreshCw,
  Search,
  FileCheck,
} from 'lucide-react';
import { WorkflowDisplay } from './WorkflowDisplay';
import { ReviewModal } from './ReviewModal';

interface CommandCenterProps {
  objective: string;
  phase: AgentPhase;
  tasks: Task[];
  activeTaskId: string | null;
  activeAgent: string | null;
  activeTool: string | null;
  executionTimeSeconds: number;
  controlScore: number;
  reliabilityScore: number;
  controlFactors: ControlFactor[];
  reliabilityFactors: ReliabilityFactor[];
  pendingApproval: { taskId: string; approval: TaskApproval } | null;
  activeRecovery: {
    problem: string;
    response: string;
    recoveryStrategy: string;
    humanInterventionRequired: boolean;
    taskId: string;
  } | null;
  activityLog: ActivityLogItem[];
  simulationMode: boolean;
  onSetObjective: (goal: string) => void;
  onRunWorkflow: () => void;
  onPauseWorkflow: () => void;
  onResumeWorkflow: () => void;
  onStepWorkflow: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges?: (feedback: string) => void;
  onEmergencyStop?: () => void;
  onRestartTask: (taskId: string) => void;
  onNavigateToTasks: () => void;
  onNavigateToDeliverable: () => void;
}

export const CommandCenter: React.FC<CommandCenterProps> = ({
  objective,
  phase,
  tasks,
  activeTaskId,
  activeAgent,
  activeTool,
  executionTimeSeconds,
  controlScore,
  reliabilityScore,
  pendingApproval,
  activeRecovery,
  activityLog,
  simulationMode,
  onSetObjective,
  onRunWorkflow,
  onPauseWorkflow,
  onResumeWorkflow,
  onStepWorkflow,
  onApprove,
  onReject,
  onRequestChanges,
  onEmergencyStop = () => {},
  onRestartTask,
  onNavigateToTasks,
  onNavigateToDeliverable,
}) => {
  const [isEditingGoal, setIsEditingGoal] = useState(false);
  const [customGoalInput, setCustomGoalInput] = useState(objective);
  const [showConfidenceDetail, setShowConfidenceDetail] = useState(false);
  const [isCommandReviewOpen, setIsCommandReviewOpen] = useState(false);

  const completedTasksCount = tasks.filter((t) => t.status === 'completed' || t.status === 'recovered').length;
  const totalTasksCount = tasks.length;
  const progressPercent = totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0;

  const currentTask = tasks.find((t) => t.id === activeTaskId) || tasks.find((t) => t.status === 'in_progress') || tasks[0];

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const s = sec % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const phasesList: { key: AgentPhase; label: string }[] = [
    { key: 'thinking', label: 'Thinking' },
    { key: 'planning', label: 'Planning' },
    { key: 'waiting_approval', label: 'Approval Gate' },
    { key: 'executing', label: 'Executing' },
    { key: 'verifying', label: 'Verifying' },
    { key: 'completed', label: 'Completed' },
  ];

  const isRunning = phase === 'executing' || phase === 'thinking' || phase === 'planning' || phase === 'verifying';
  const isCompleted = phase === 'completed';

  const handleGoalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (customGoalInput.trim()) {
      onSetObjective(customGoalInput.trim());
      setIsEditingGoal(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Major Page Title (Requirement 5) */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 pt-1">
        <div className="space-y-1">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-[-0.022em] text-[#201F1D] leading-tight">
            AI Agent Workspace
          </h1>
          <p className="text-[14px] text-[#57524A] font-normal leading-normal max-w-[65ch]">
            Monitor, steer, and understand your autonomous multi-agent system in real time.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-stone-200/80 font-mono text-[11px] font-medium text-[#57524A] shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-[#79A98A] animate-pulse" />
            <span>Multi-Agent Engine Ready</span>
          </span>
        </div>
      </div>

      {/* 1. Objective Glass Card */}
      <section className="glass-card">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 text-xs text-[#57524A]">
              <span className="glass-badge py-0.5 px-2.5 text-[11px] font-semibold text-[#7C72D8] bg-[#7C72D8]/10 border-[#7C72D8]/20 tracking-[0.01em]">
                Target Objective
              </span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="font-mono text-[12px]">{tasks.length} Structured Tasks</span>
              <span aria-hidden="true" className="text-stone-300">·</span>
              <span className="font-mono text-[12px] text-[#57524A]">Multi-Agent Graph</span>
            </div>

            {isEditingGoal ? (
              <form onSubmit={handleGoalSubmit} className="mt-2 space-y-3">
                <textarea
                  value={customGoalInput}
                  onChange={(e) => setCustomGoalInput(e.target.value)}
                  rows={2}
                  className="glass-input text-sm leading-relaxed"
                  placeholder="Enter any complex natural language objective for the agents to plan, execute, and verify..."
                />
                <div className="flex items-center gap-2">
                  <button
                    type="submit"
                    className="liquid-button primary text-xs py-1.5 px-4 font-semibold"
                  >
                    Generate Agent Plan
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setCustomGoalInput(objective);
                      setIsEditingGoal(false);
                    }}
                    className="liquid-button text-xs py-1.5 px-3"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="group flex items-start gap-2.5">
                <h2 className="text-base sm:text-lg font-semibold text-[#201F1D] leading-snug tracking-[-0.012em]">
                  {objective}
                </h2>
                <button
                  onClick={() => setIsEditingGoal(true)}
                  className="text-xs text-[#7D786F] hover:text-[#7C72D8] underline decoration-[#EBE4D8] underline-offset-2 shrink-0 pt-1 cursor-pointer transition-colors font-medium"
                >
                  Edit
                </button>
              </div>
            )}
          </div>

          {/* Workflow Action CTAs */}
          <div className="flex items-center gap-2 shrink-0">
            {isRunning ? (
              <button
                onClick={onPauseWorkflow}
                className="liquid-button text-xs py-2 px-4"
              >
                <Pause className="w-3.5 h-3.5 text-[#201F1D]" />
                <span>Pause</span>
              </button>
            ) : isCompleted ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={onNavigateToDeliverable}
                  className="liquid-button primary text-xs py-2 px-4"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  <span>View Deliverable</span>
                </button>
                <button
                  onClick={onRunWorkflow}
                  className="liquid-button text-xs py-2 px-3"
                  title="Re-run entire workflow"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-[#57524A]" />
                  <span>Re-run</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={onRunWorkflow}
                  className="liquid-button primary text-xs py-2.5 px-5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{phase === 'paused' ? 'Resume Workflow' : simulationMode ? 'Run Simulation' : 'Run Autonomous Workflow'}</span>
                </button>
                <button
                  onClick={onStepWorkflow}
                  className="hidden sm:inline-flex liquid-button text-xs py-2 px-3"
                  title="Step through one task at a time"
                >
                  <span>Step</span>
                  <ChevronRight className="w-3 h-3 text-[#57524A]" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* 2. Visual Phase Stepper Pipeline */}
        <div className="mt-6 pt-5 border-t border-white/60">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {phasesList.map((item, idx) => {
              const isCurrent = phase === item.key;
              const isPast =
                (phase === 'planning' && idx === 0) ||
                (phase === 'waiting_approval' && idx <= 1) ||
                (phase === 'executing' && idx <= 2) ||
                (phase === 'verifying' && idx <= 3) ||
                (phase === 'completed' && idx <= 5);

              return (
                <div
                  key={item.key}
                  className={`flex items-center gap-2 p-2.5 rounded-2xl border text-xs transition-all ${
                    isCurrent
                      ? 'bg-[#FAF4EC] border-[#D5A45C]/50 text-[#201F1D] font-semibold shadow-2xs ring-2 ring-[#D5A45C]/20'
                      : isPast
                      ? 'bg-white/70 border-[#EBE4D8] text-[#201F1D] font-medium'
                      : 'bg-white/20 border-white/40 text-[#7D786F]'
                  }`}
                >
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 transition-colors ${
                      isCurrent
                        ? 'bg-[#7C72D8] text-white animate-pulse font-semibold'
                        : isPast
                        ? 'bg-[#57524A] text-white font-semibold'
                        : 'bg-stone-200/80 text-[#7D786F]'
                    }`}
                  >
                    {isPast && !isCurrent ? '✓' : idx + 1}
                  </span>
                  <span className="truncate whitespace-nowrap tracking-[-0.005em]">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Core Metrics Grid in Liquid Glass */}
      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
        {/* Human Control Score */}
        <div className="glass-card p-4!">
          <div className="text-[12px] text-[#57524A] font-medium tracking-[-0.005em]">Human Control Score</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#201F1D] tracking-[-0.02em]">{controlScore}</span>
            <span className="text-xs text-[#7D786F] font-mono">/100</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#4E8B65] font-medium">
            <span className="status-dot" style={{ width: '7px', height: '7px' }} />
            <span>High Oversight</span>
          </div>
        </div>

        {/* Agent Reliability */}
        <div className="glass-card p-4!">
          <div className="text-[12px] text-[#57524A] font-medium tracking-[-0.005em]">Agent Reliability</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#201F1D] tracking-[-0.02em]">{reliabilityScore}%</span>
          </div>
          <div className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#7C72D8] font-medium">
            <span className="status-dot violet" style={{ width: '7px', height: '7px' }} />
            <span>Deterministic</span>
          </div>
        </div>

        {/* Execution Time */}
        <div className="glass-card p-4!">
          <div className="text-[12px] text-[#57524A] font-medium tracking-[-0.005em]">Execution Runtime</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#201F1D] tracking-[-0.02em]">
              {formatSeconds(executionTimeSeconds)}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#57524A]">
            <Clock className="w-3 h-3 text-[#7D786F]" />
            <span>{phase === 'executing' ? 'Live Telemetry' : 'Total Latency'}</span>
          </div>
        </div>

        {/* Task Progress */}
        <div className="glass-card p-4!">
          <div className="text-[12px] text-[#57524A] font-medium tracking-[-0.005em]">Tasks Progress</div>
          <div className="mt-1 flex items-baseline gap-1.5">
            <span className="text-2xl sm:text-[26px] font-bold font-mono tabular-nums text-[#201F1D] tracking-[-0.02em]">
              {completedTasksCount}
            </span>
            <span className="text-xs text-[#7D786F] font-mono">/ {totalTasksCount}</span>
          </div>
          <div className="mt-2 w-full bg-stone-200/50 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[#7C72D8] to-[#9DB8A5] h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Active Agent */}
        <div className="glass-card p-4!">
          <div className="text-[12px] text-[#57524A] font-medium tracking-[-0.005em]">Active Agent</div>
          <div className="mt-1 truncate font-semibold text-xs text-[#201F1D] tracking-[-0.005em]">
            {activeAgent ? `${activeAgent.toUpperCase()}` : 'SUPERVISOR'}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#57524A]">
            <Cpu className="w-3 h-3 text-[#7C72D8]" />
            <span>Specialized Node</span>
          </div>
        </div>

        {/* Active Tool */}
        <div className="glass-card p-4!">
          <div className="text-[12px] text-[#57524A] font-medium tracking-[-0.005em]">Active Tool</div>
          <div className="mt-1 truncate font-semibold text-xs text-[#201F1D] tracking-[-0.005em]">
            {activeTool ? activeTool.replace('_', ' ') : 'Standby'}
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-[11px] text-[#57524A]">
            <Layers className="w-3 h-3 text-[#7D786F]" />
            <span>Sandboxed Call</span>
          </div>
        </div>
      </section>

      {/* 4. HERO: Interactive Real-Time Workflow Display */}
      <WorkflowDisplay
        objective={objective}
        phase={phase}
        tasks={tasks}
        activeTaskId={activeTaskId}
        activeAgent={activeAgent}
        activeTool={activeTool}
        executionTimeSeconds={executionTimeSeconds}
        pendingApproval={pendingApproval}
        activeRecovery={activeRecovery}
        activityLog={activityLog}
        simulationMode={simulationMode}
        onRunWorkflow={onRunWorkflow}
        onPauseWorkflow={onPauseWorkflow}
        onResumeWorkflow={onResumeWorkflow}
        onEmergencyStop={onEmergencyStop}
        onApprove={onApprove}
        onReject={onReject}
        onRequestChanges={onRequestChanges}
        onSelectTask={(id) => onNavigateToTasks()}
        onNavigateToDeliverable={onNavigateToDeliverable}
      />

      {/* 5. HIGH PRIORITY: Human Approval Gate Banner (Warm Champagne) */}
      {pendingApproval && (
        <section className="glass-approval p-6! shadow-sm">
          <div className="flex items-start justify-between gap-5">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[#D5A45C] text-white shadow-2xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Human Attention Required
                </span>
                <span className="text-xs text-[#8C6D2D] font-semibold font-mono">
                  Governance Gate · High Priority
                </span>
              </div>

              <div>
                <h3 className="text-sm sm:text-base font-semibold text-[#292824]">
                  Agent Requests Sign-Off: {pendingApproval.approval.requestedAction}
                </h3>
                <p className="mt-1 text-xs text-[#68645D] leading-relaxed">
                  <span className="font-semibold text-[#292824]">Reason: </span>
                  {pendingApproval.approval.reason}
                </p>
                <p className="mt-1 text-xs text-[#68645D]">
                  <span className="font-semibold text-[#292824]">Consequences: </span>
                  {pendingApproval.approval.consequences}
                </p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
              <button
                onClick={() => setIsCommandReviewOpen(true)}
                className="w-full sm:w-auto liquid-button text-xs py-2 px-3.5 flex items-center gap-1.5 border-[#D5A45C]/50 bg-white"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#D5A45C]" />
                <span>Review Details</span>
              </button>
              <button
                onClick={onApprove}
                className="w-full sm:w-auto liquid-button primary text-xs py-2 px-4 shadow-sm"
              >
                Approve Action
              </button>
              <button
                onClick={onReject}
                className="w-full sm:w-auto liquid-button danger text-xs py-2 px-3"
              >
                Reject
              </button>
              <button
                onClick={onNavigateToTasks}
                className="w-full sm:w-auto liquid-button text-xs py-2 px-3"
              >
                Modify Plan
              </button>
            </div>
          </div>
        </section>
      )}

      {/* 5. Self-Correction & Recovery Alert Banner (Dusty Blue) */}
      {activeRecovery && (
        <section className="glass p-5! border-[#7F9DBB]/40 bg-[#F2F6FA]/70 shadow-xs">
          <div className="flex items-start gap-3.5">
            <RefreshCw className="w-5 h-5 text-[#7F9DBB] animate-spin shrink-0 mt-0.5" />
            <div className="space-y-1 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-[#3B5773]">
                  Tool Failure Detected · Self-Correction Activated
                </span>
                <span className="text-[11px] text-[#557697] font-mono">
                  Recovery Agent Engaged
                </span>
              </div>
              <p className="text-xs text-[#292824]">
                <span className="font-semibold text-[#292824]">Problem: </span>
                {activeRecovery.problem}
              </p>
              <p className="text-xs text-[#68645D]">
                <span className="font-semibold text-[#292824]">Agent Response: </span>
                {activeRecovery.response}
              </p>
              <div className="flex items-center gap-4 text-[11px] text-[#68645D] pt-1">
                <span>Strategy: {activeRecovery.recoveryStrategy}</span>
                <span>·</span>
                <span className="text-[#5A876B] font-medium">Human intervention required: NO</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 6. Active Task Spotlight & Safe Explainability Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Current Task Spotlight & Explainability */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-card space-y-4">
            <div className="flex items-center justify-between border-b border-white/60 pb-3">
              <div>
                <span className="text-[11px] text-[#7D786F] font-mono tracking-[0.015em] uppercase font-semibold">Task Execution Spotlight</span>
                <h2 className="text-base sm:text-lg font-semibold text-[#201F1D] tracking-[-0.012em] flex items-center gap-2 mt-0.5">
                  <span>#{currentTask?.order || 1}. {currentTask?.title}</span>
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                  currentTask?.status === 'completed'
                    ? 'bg-[#79A98A]/15 text-[#4E765D] border border-[#79A98A]/30'
                    : currentTask?.status === 'in_progress'
                    ? 'bg-[#D5A45C]/15 text-[#8C6D2D] border border-[#D5A45C]/35 animate-pulse'
                    : 'bg-white/70 text-[#57524A]'
                }`}>
                  {currentTask?.status === 'in_progress' ? 'Working' : (currentTask?.status === 'completed' ? 'Completed' : (currentTask?.status === 'waiting_approval' ? 'Needs Review' : 'Pending'))}
                </span>
                <button
                  onClick={onNavigateToTasks}
                  className="text-xs text-[#57524A] hover:text-[#201F1D] font-medium flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>All Tasks</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#57524A] leading-relaxed max-w-[65ch]">
              {currentTask?.description}
            </p>

            <div className="grid grid-cols-3 gap-2 py-2.5 border-y border-white/70 text-xs">
              <div>
                <span className="text-[11px] text-[#7D786F] font-medium">Assigned Agent</span>
                <p className="font-semibold text-[#201F1D] capitalize mt-0.5">{currentTask?.assignedAgent} Agent</p>
              </div>
              <div>
                <span className="text-[11px] text-[#7D786F] font-medium">Required Tool</span>
                <p className="font-semibold text-[#201F1D] mt-0.5">{currentTask?.requiredTool.replace('_', ' ')}</p>
              </div>
              <div>
                <span className="text-[11px] text-[#7D786F] font-medium">Risk & Priority</span>
                <p className="font-semibold text-[#201F1D] mt-0.5 capitalize">{currentTask?.riskLevel} / {currentTask?.priority}</p>
              </div>
            </div>

            {/* Explainability Reasoning Card (Concise, Safe, High-Level Summary) */}
            {currentTask?.reasoningSummary && (
              <div className="bg-white/60 rounded-2xl p-4 border border-[#EBE4D8] space-y-2.5 backdrop-blur-md">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-[#57524A] tracking-[0.01em]">
                    Supervisor Reasoning Summary
                  </span>
                  <button
                    onClick={() => setShowConfidenceDetail(!showConfidenceDetail)}
                    className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-[#79A98A]/10 border border-[#79A98A]/25 text-[#4E765D] hover:bg-[#79A98A]/20 cursor-pointer shadow-2xs transition-colors"
                  >
                    <span>Confidence: {currentTask.reasoningSummary.confidenceScore}%</span>
                  </button>
                </div>

                <div className="space-y-1.5 text-xs text-[#57524A] leading-relaxed">
                  <div>
                    <span className="font-semibold text-[#201F1D]">Decision: </span>
                    <span className="text-[#201F1D]">{currentTask.reasoningSummary.decision}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#201F1D]">Why: </span>
                    <span>{currentTask.reasoningSummary.why}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#201F1D]">Evidence: </span>
                    <span className="text-[#57524A]">{currentTask.reasoningSummary.evidence}</span>
                  </div>
                  <div>
                    <span className="font-semibold text-[#201F1D]">Next Action: </span>
                    <span className="text-[#201F1D]">{currentTask.reasoningSummary.nextAction}</span>
                  </div>
                </div>

                {/* Optional Expanded Confidence Factors */}
                {showConfidenceDetail && (
                  <div className="pt-2 border-t border-[#EBE4D8] text-[11px] space-y-1">
                    <span className="text-[#57524A] font-medium">Confidence Factors Grounded:</span>
                    <ul className="list-disc list-inside text-[#57524A] space-y-0.5">
                      {currentTask.reasoningSummary.factors.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Live Activity Feed */}
        <div className="glass-card flex flex-col h-[440px]">
          <div className="flex items-center justify-between border-b border-white/60 pb-3 mb-3">
            <div>
              <span className="text-[11px] text-[#7D786F] font-mono tracking-[0.015em] uppercase font-semibold">Live Execution Timeline</span>
              <h3 className="text-base font-semibold text-[#201F1D] tracking-[-0.01em] mt-0.5">Activity Stream</h3>
            </div>
            <span className="text-[11px] font-mono text-[#7D786F]">
              {activityLog.length} events
            </span>
          </div>

          <div className="space-y-3 overflow-y-auto flex-1 pr-1 text-xs">
            {activityLog.map((log) => (
              <div key={log.id} className="flex items-start gap-2.5 group">
                <span
                  className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    log.type === 'goal'
                      ? 'bg-[#7C72D8]'
                      : log.type === 'tool'
                      ? 'bg-[#D5A45C]'
                      : log.type === 'approval'
                      ? 'bg-[#E9A98F]'
                      : log.type === 'recovery'
                      ? 'bg-[#7F9DBB]'
                      : log.type === 'success'
                      ? 'bg-[#79A98A]'
                      : 'bg-[#8D82C7]'
                  }`}
                />
                <div className="space-y-0.5 flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <span className="font-semibold text-[#201F1D] truncate tracking-[-0.005em]">{log.title}</span>
                    <span className="text-[10px] font-mono text-[#7D786F] shrink-0">{log.timestamp}</span>
                  </div>
                  {log.detail && (
                    <p className="text-[11px] text-[#57524A] leading-snug line-clamp-2">
                      {log.detail}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Review Modal */}
      <ReviewModal
        isOpen={isCommandReviewOpen}
        onClose={() => setIsCommandReviewOpen(false)}
        pendingApproval={pendingApproval}
        tasks={tasks}
        objective={objective}
        onApprove={onApprove}
        onReject={onReject}
        onRequestChanges={onRequestChanges}
        onNavigateToDeliverable={onNavigateToDeliverable}
      />
    </div>
  );
};
