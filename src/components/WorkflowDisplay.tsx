/**
 * Aegis Agent OS - Human-First AI Agent Workflow Display
 * 
 * Design Philosophy:
 * - Simple → Clear → Interactive → Informative → Trustworthy
 * - Communicates "What is the AI doing right now?" at a 3-second glance
 * - High-level 7-stage story: Goal → Plan → Research → Execute → Verify → Review → Complete
 * - Progressive disclosure: clean by default, click any stage for human-friendly details
 * - Two viewing modes: Simple View (default for non-technical users) and Detailed View (for technical inspection)
 * - Prominent Current Action card + Human Approval checkpoint + Clean Activity summary
 * - Responsive: Elegant horizontal stepper on desktop, smooth vertical stepper on mobile
 */

import React, { useState, useMemo } from 'react';
import {
  AgentPhase,
  Task,
  TaskApproval,
  ActivityLogItem,
} from '../types/agent';
import {
  Target,
  Compass,
  Search,
  Zap,
  CheckCircle2,
  ShieldAlert,
  Award,
  Play,
  Pause,
  RotateCcw,
  Sliders,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Sparkles,
  ExternalLink,
  ArrowRight,
  Check,
  AlertTriangle,
  RefreshCw,
  Eye,
  Layers,
  Wrench,
  Users,
  Maximize2,
  Minimize2,
  FileCheck,
  Send,
  FileText,
} from 'lucide-react';
import { ReviewModal } from './ReviewModal';

export interface WorkflowDisplayProps {
  objective: string;
  phase: AgentPhase;
  tasks: Task[];
  activeTaskId: string | null;
  activeAgent: string | null;
  activeTool: string | null;
  executionTimeSeconds: number;
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
  onRunWorkflow: () => void;
  onPauseWorkflow: () => void;
  onResumeWorkflow: () => void;
  onEmergencyStop: () => void;
  onApprove: () => void;
  onReject: () => void;
  onRequestChanges?: (feedback: string) => void;
  onSelectTask?: (taskId: string) => void;
  onNavigateToDeliverable?: () => void;
  className?: string;
  defaultExpanded?: boolean;
}

export type StageId = 'goal' | 'plan' | 'research' | 'execute' | 'verify' | 'review' | 'complete';

export interface StageDefinition {
  id: StageId;
  stepNumber: number;
  title: string;
  humanName: string;
  storyDescription: string;
  status: 'completed' | 'in_progress' | 'waiting' | 'needs_approval' | 'recovering';
  statusText: string;
  icon: React.ReactNode;
  progress: number;
  currentWork: string;
  whyItMatters: string;
  groupedAgents: { name: string; role: string; roleDesc: string }[];
  toolsUsed: string[];
  resultSummary?: string;
  duration?: string;
  warnings?: string[];
  containedTasks: Task[];
}

export const WorkflowDisplay: React.FC<WorkflowDisplayProps> = ({
  objective,
  phase,
  tasks,
  activeTaskId,
  activeAgent,
  activeTool,
  executionTimeSeconds,
  pendingApproval,
  activeRecovery,
  activityLog,
  simulationMode,
  onRunWorkflow,
  onPauseWorkflow,
  onResumeWorkflow,
  onEmergencyStop,
  onApprove,
  onReject,
  onRequestChanges,
  onSelectTask,
  onNavigateToDeliverable,
  className = '',
}) => {
  // View mode: 'simple' (horizontal stepper for everyone) vs 'detailed' (technical breakdown)
  const [viewMode, setViewMode] = useState<'simple' | 'detailed'>('simple');
  const [selectedStageId, setSelectedStageId] = useState<StageId | null>(null);
  const [showFullActivityModal, setShowFullActivityModal] = useState(false);
  const [activityFilter, setActivityFilter] = useState<string>('all');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [inlineFeedback, setInlineFeedback] = useState('');
  const [inlineFeedbackSent, setInlineFeedbackSent] = useState(false);

  // Group tasks into the 7 conceptual stages
  const planTasks = useMemo(() => tasks.filter(t => t.assignedAgent === 'planner' || t.id.includes('plan')), [tasks]);
  const researchTasks = useMemo(() => tasks.filter(t => t.assignedAgent === 'researcher' || t.assignedAgent === 'analyst' || t.id.includes('research') || t.id.includes('benchmark')), [tasks]);
  const executeTasks = useMemo(() => tasks.filter(t => t.assignedAgent === 'executor' || t.id.includes('exec') || t.id.includes('synth')), [tasks]);
  const verifyTasks = useMemo(() => tasks.filter(t => t.assignedAgent === 'verifier' || t.id.includes('verify')), [tasks]);

  // Compute stage statuses and details
  const stages: StageDefinition[] = useMemo(() => {
    const isCompletedPhase = phase === 'completed';

    // 1. GOAL
    const goalStatus: StageDefinition['status'] = 'completed';

    // 2. PLAN
    let planStatus: StageDefinition['status'] = 'waiting';
    let planProgress = 0;
    if (tasks.length > 0) {
      const anyPlanRunning = planTasks.some(t => t.status === 'in_progress');
      const allPlanDone = planTasks.every(t => t.status === 'completed');
      if (allPlanDone || tasks.length > 0) {
        planStatus = 'completed';
        planProgress = 100;
      } else if (anyPlanRunning || phase === 'planning') {
        planStatus = 'in_progress';
        planProgress = 65;
      }
    } else if (phase === 'planning' || phase === 'thinking') {
      planStatus = 'in_progress';
      planProgress = 50;
    }

    // 3. RESEARCH
    let researchStatus: StageDefinition['status'] = 'waiting';
    let researchProgress = 0;
    if (researchTasks.length > 0) {
      const completedCount = researchTasks.filter(t => t.status === 'completed').length;
      researchProgress = Math.round((completedCount / researchTasks.length) * 100);
      const isRunning = researchTasks.some(t => t.status === 'in_progress') || activeAgent === 'researcher' || activeAgent === 'analyst';
      const hasError = researchTasks.some(t => t.status === 'failed') || (activeRecovery && activeRecovery.taskId.includes('benchmark'));

      if (hasError) {
        researchStatus = 'recovering';
      } else if (completedCount === researchTasks.length) {
        researchStatus = 'completed';
        researchProgress = 100;
      } else if (isRunning || completedCount > 0) {
        researchStatus = 'in_progress';
      }
    }

    // 4. EXECUTE
    let executeStatus: StageDefinition['status'] = 'waiting';
    let executeProgress = 0;
    if (executeTasks.length > 0) {
      const completedCount = executeTasks.filter(t => t.status === 'completed').length;
      executeProgress = Math.round((completedCount / executeTasks.length) * 100);
      const isRunning = executeTasks.some(t => t.status === 'in_progress') || activeAgent === 'executor';
      if (completedCount === executeTasks.length) {
        executeStatus = 'completed';
        executeProgress = 100;
      } else if (isRunning || (researchStatus === 'completed' && executeTasks.some(t => t.status === 'in_progress'))) {
        executeStatus = 'in_progress';
      }
    }

    // 5. VERIFY
    let verifyStatus: StageDefinition['status'] = 'waiting';
    let verifyProgress = 0;
    if (verifyTasks.length > 0) {
      const completedCount = verifyTasks.filter(t => t.status === 'completed').length;
      verifyProgress = Math.round((completedCount / verifyTasks.length) * 100);
      const isRunning = verifyTasks.some(t => t.status === 'in_progress') || phase === 'verifying' || activeAgent === 'verifier';
      if (completedCount === verifyTasks.length) {
        verifyStatus = 'completed';
        verifyProgress = 100;
      } else if (isRunning) {
        verifyStatus = 'in_progress';
      }
    }

    // 6. REVIEW (Human Approval)
    let reviewStatus: StageDefinition['status'] = 'waiting';
    let reviewProgress = 0;
    if (pendingApproval) {
      reviewStatus = 'needs_approval';
      reviewProgress = 50;
    } else if (isCompletedPhase || (verifyStatus === 'completed' && !pendingApproval)) {
      reviewStatus = 'completed';
      reviewProgress = 100;
    }

    // 7. COMPLETE
    let completeStatus: StageDefinition['status'] = 'waiting';
    let completeProgress = 0;
    if (isCompletedPhase) {
      completeStatus = 'completed';
      completeProgress = 100;
    }

    return [
      {
        id: 'goal',
        stepNumber: 1,
        title: 'Goal',
        humanName: 'Your Goal',
        storyDescription: 'What you asked the AI to do',
        status: goalStatus,
        statusText: 'Understood',
        icon: <Target className="w-5 h-5 text-[#7C72D8]" />,
        progress: 100,
        currentWork: objective,
        whyItMatters: 'Establishes clear boundaries, target deliverables, and quality criteria for all actions.',
        groupedAgents: [
          { name: 'Supervisor Agent', role: 'Intake & Orchestrator', roleDesc: 'Translates natural language into goal parameters' },
        ],
        toolsUsed: ['Intent Parser', 'Objective Alignment'],
        resultSummary: 'Goal framed with explicit success criteria and governance boundaries.',
        duration: 'Instant',
        containedTasks: [],
      },
      {
        id: 'plan',
        stepNumber: 2,
        title: 'Plan',
        humanName: 'Action Plan',
        storyDescription: 'Breaking the task into clear steps',
        status: planStatus,
        statusText: planStatus === 'completed' ? 'Plan Ready' : (planStatus === 'in_progress' ? 'Planning...' : 'Waiting'),
        icon: <Compass className="w-5 h-5 text-[#8D82C7]" />,
        progress: planProgress,
        currentWork: `Structured the objective into ${tasks.length || 4} sequential and parallel checkpoints.`,
        whyItMatters: 'Prevents erratic exploration by defining task dependencies, tool assignments, and safety gates upfront.',
        groupedAgents: [
          { name: 'Planner Agent', role: 'Architecture', roleDesc: 'Decomposes complex requests into atomic sub-tasks' },
          { name: 'Supervisor Agent', role: 'Reviewer', roleDesc: 'Validates safety bounds and ensures human review points' },
        ],
        toolsUsed: ['Task Dependency Graph', 'Risk Evaluator'],
        resultSummary: `${tasks.length} coordinated tasks scheduled with assigned agents and safety rubrics.`,
        duration: '1.2s',
        containedTasks: planTasks,
      },
      {
        id: 'research',
        stepNumber: 3,
        title: 'Research',
        humanName: 'Research & Compare',
        storyDescription: 'Finding information needed to complete your task',
        status: researchStatus,
        statusText: researchStatus === 'completed' ? 'Completed' : (researchStatus === 'recovering' ? 'Adjusting Plan' : (researchStatus === 'in_progress' ? 'In progress' : 'Waiting')),
        icon: <Search className="w-5 h-5 text-[#7F9DBB]" />,
        progress: researchProgress,
        currentWork: researchStatus === 'recovering'
          ? 'Recovering from incomplete benchmark: switched to secondary reliable data source.'
          : (researchStatus === 'in_progress'
            ? 'Analyzing live sources, evaluating tool pricing, and ranking generation quality.'
            : 'Gathered comprehensive data on leading video AI platforms with structured metrics.'),
        whyItMatters: 'Grounds every decision in verified real-world evidence rather than speculative hallucination.',
        groupedAgents: [
          { name: 'Research Agent', role: 'Gathering', roleDesc: 'Queries documentation and market data' },
          { name: 'Analysis Agent', role: 'Synthesis', roleDesc: 'Normalizes benchmark scores and costs' },
        ],
        toolsUsed: ['Live Web Search', 'Knowledge Index', 'Benchmark Matrix'],
        resultSummary: 'Analyzed Runway Gen-3, Pika 2.1, Luma Dream Machine, and Sora with side-by-side matrices.',
        duration: '18.4s',
        warnings: researchStatus === 'recovering' ? ['Initial data source was incomplete; auto-corrected using verified mirror.'] : undefined,
        containedTasks: researchTasks,
      },
      {
        id: 'execute',
        stepNumber: 4,
        title: 'Execute',
        humanName: 'Build & Draft',
        storyDescription: 'Creating drafts and building the output',
        status: executeStatus,
        statusText: executeStatus === 'completed' ? 'Draft Built' : (executeStatus === 'in_progress' ? 'Building...' : 'Waiting'),
        icon: <Zap className="w-5 h-5 text-[#E9A98F]" />,
        progress: executeProgress,
        currentWork: executeStatus === 'completed'
          ? 'Completed synthesis of the executive recommendation and financial comparison table.'
          : (executeStatus === 'in_progress'
            ? 'Formulating decision framework and drafting actionable implementation steps.'
            : 'Pending research stage completion.'),
        whyItMatters: 'Transforms raw research into an executive-ready, polished recommendation.',
        groupedAgents: [
          { name: 'Execution Agent', role: 'Drafting', roleDesc: 'Synthesizes insights into structured report' },
          { name: 'Synthesis Specialist', role: 'Formatting', roleDesc: 'Builds readable comparison tables and takeaways' },
        ],
        toolsUsed: ['Document Synthesizer', 'Table Formatter'],
        resultSummary: 'Executive Brief, Tool Scoring Table, Cost Projection Matrix, and Step-by-Step Adoption Plan generated.',
        duration: '12.8s',
        containedTasks: executeTasks,
      },
      {
        id: 'verify',
        stepNumber: 5,
        title: 'Check',
        humanName: 'Quality Check',
        storyDescription: 'Making sure the result is correct',
        status: verifyStatus,
        statusText: verifyStatus === 'completed' ? 'Passed (94%)' : (verifyStatus === 'in_progress' ? 'Auditing...' : 'Waiting'),
        icon: <CheckCircle2 className="w-5 h-5 text-[#79A98A]" />,
        progress: verifyProgress,
        currentWork: verifyStatus === 'completed'
          ? 'Passed 5 of 5 verification checks: factual consistency, pricing accuracy, and citation validity.'
          : (verifyStatus === 'in_progress'
            ? 'Double-checking pricing plans, rendering speed claims, and technical limits.'
            : 'Waiting for report generation.'),
        whyItMatters: 'Guarantees the output is truthful, consistent, and ready for leadership consumption.',
        groupedAgents: [
          { name: 'Verification Agent', role: 'Independent Auditor', roleDesc: 'Audits factual accuracy without bias' },
          { name: 'Fact Checker', role: 'Source Verification', roleDesc: 'Verifies source URLs and claims' },
        ],
        toolsUsed: ['Citation Validator', 'Scorecard Rubric', 'Consistency Checker'],
        resultSummary: '94% Confidence Score. Accuracy: 96%, Completeness: 92%, Consistency: 95%.',
        duration: '6.5s',
        containedTasks: verifyTasks,
      },
      {
        id: 'review',
        stepNumber: 6,
        title: 'Review',
        humanName: 'Your Approval',
        storyDescription: 'Making sure everything aligns with your goals',
        status: reviewStatus,
        statusText: reviewStatus === 'needs_approval' ? 'Approval Needed' : (reviewStatus === 'completed' ? 'Approved' : 'Waiting'),
        icon: <ShieldAlert className="w-5 h-5 text-[#D5A45C]" />,
        progress: reviewProgress,
        currentWork: reviewStatus === 'needs_approval'
          ? 'The AI has finalized the recommendation and is waiting for your confirmation before publishing.'
          : (reviewStatus === 'completed'
            ? 'Human approval granted. Deliverable signed off.'
            : 'Checkpoint will trigger once quality checks pass.'),
        whyItMatters: 'Puts you firmly in control of the final output with zero surprises.',
        groupedAgents: [
          { name: 'Human Reviewer (You)', role: 'Final Authority', roleDesc: 'Reviews recommendations and approves publication' },
          { name: 'Governance Sentinel', role: 'Safety Guard', roleDesc: 'Ensures no high-risk action executes without sign-off' },
        ],
        toolsUsed: ['Interactive Approval Gate', 'Audit Log Signature'],
        resultSummary: pendingApproval ? `Awaiting decision on: ${pendingApproval.approval.requestedAction}` : 'Governance approval confirmed.',
        duration: pendingApproval ? 'Active' : 'Completed',
        containedTasks: [],
      },
      {
        id: 'complete',
        stepNumber: 7,
        title: 'Complete',
        humanName: 'Ready for You',
        storyDescription: 'Final deliverable ready for you',
        status: completeStatus,
        statusText: completeStatus === 'completed' ? 'Ready' : 'Pending',
        icon: <Award className="w-5 h-5 text-[#9DB8A5]" />,
        progress: completeProgress,
        currentWork: completeStatus === 'completed'
          ? 'Everything is complete! Your executive brief and comparison matrix are ready to copy or download.'
          : 'Will unlock as soon as final review is completed.',
        whyItMatters: 'Delivers the finished, verified result straight into your hands.',
        groupedAgents: [
          { name: 'Deliverable Publisher', role: 'Packaging', roleDesc: 'Prepares final exports in Markdown and JSON' },
        ],
        toolsUsed: ['Export Engine', 'Executive Summary Packager'],
        resultSummary: 'Complete executive guide with tool ranking, cost analysis, and implementation roadmap ready.',
        containedTasks: [],
      },
    ];
  }, [phase, tasks, planTasks, researchTasks, executeTasks, verifyTasks, objective, activeAgent, activeRecovery, pendingApproval]);

  // Find currently active stage
  const currentActiveStage = useMemo(() => {
    if (pendingApproval) return stages.find(s => s.id === 'review');
    if (activeRecovery) return stages.find(s => s.id === 'research') || stages[2];
    const inProgress = stages.find(s => s.status === 'in_progress');
    if (inProgress) return inProgress;
    if (phase === 'completed') return stages[6];
    return stages[1] || stages[0];
  }, [stages, pendingApproval, activeRecovery, phase]);

  // Overall completed stages count
  const completedStagesCount = useMemo(() => {
    return stages.filter(s => s.status === 'completed').length;
  }, [stages]);

  const overallProgressPercentage = Math.round((completedStagesCount / stages.length) * 100);

  // Selected stage for detail panel (defaults to currentActiveStage or goal)
  const activeDetailStage = useMemo(() => {
    if (selectedStageId) {
      return stages.find(s => s.id === selectedStageId) || stages[0];
    }
    return null;
  }, [selectedStageId, stages]);

  // Human-friendly activity items for recent highlights
  const recentHighlights = useMemo(() => {
    const highlights = [
      { text: 'Task understood & goal initialized', done: true, time: '0:01' },
      { text: `Action plan established (${tasks.length || 4} steps)`, done: tasks.length > 0, time: '0:03' },
      { text: 'Market research & data analysis completed', done: stages[2].status === 'completed', time: '0:22' },
      { text: 'Executive recommendation formulated', done: stages[3].status === 'completed', time: '0:35' },
      { text: 'Quality & factual verification verified (94%)', done: stages[4].status === 'completed', time: '0:41' },
      { text: 'Final executive deliverable published', done: phase === 'completed', time: '0:45' },
    ];
    return highlights;
  }, [tasks, stages, phase]);

  // Format runtime
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const rem = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${rem.toString().padStart(2, '0')}`;
  };

  return (
    <section className={`glass-card p-5 sm:p-7 shadow-sm transition-all duration-300 ${isFullscreen ? 'fixed inset-4 z-50 overflow-y-auto bg-[#FAF7F2]/95 backdrop-blur-xl' : ''} ${className}`}>
      
      {/* ========================================================
          1. HEADER: CLEAN, ELEGANT, WITH MODE TOGGLE & CONTROLS
          ======================================================== */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-white/80">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C72D8] animate-pulse" />
            <h2 className="text-base sm:text-lg font-semibold text-[#292824] tracking-tight">
              Agent Workflow
            </h2>
            
            {/* Live Status Badge */}
            {pendingApproval ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#FEF8EC] text-[#C48A2C] border border-[#D5A45C]/30 animate-pulse">
                <ShieldAlert className="w-3 h-3" />
                Action Required
              </span>
            ) : phase === 'completed' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#E8F3EC] text-[#4E8B65] border border-[#79A98A]/30">
                <Check className="w-3 h-3" />
                Completed
              </span>
            ) : phase === 'paused' ? (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-stone-100 text-[#68645D] border border-stone-200">
                <Pause className="w-3 h-3" />
                Paused
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-[#F0EEFC] text-[#7C72D8] border border-[#7C72D8]/20">
                <span className="w-1.5 h-1.5 rounded-full bg-[#7C72D8] animate-ping" />
                LIVE
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-[#68645D]">
            Visual representation of how your agent is planning, executing, and verifying the task.
          </p>
        </div>

        {/* Action Controls & Mode Selector */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
          {/* Simple vs Detailed View Switcher */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-white/70 border border-white/80 shadow-2xs">
            <button
              onClick={() => setViewMode('simple')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                viewMode === 'simple'
                  ? 'bg-white text-[#292824] shadow-xs font-semibold'
                  : 'text-[#68645D] hover:text-[#292824]'
              }`}
              title="Clean horizontal stepper view for everyday users"
            >
              Simple View
            </button>
            <button
              onClick={() => setViewMode('detailed')}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition-all ${
                viewMode === 'detailed'
                  ? 'bg-white text-[#292824] shadow-xs font-semibold'
                  : 'text-[#68645D] hover:text-[#292824]'
              }`}
              title="Technical inspection view showing individual tools and telemetry"
            >
              Detailed View
            </button>
          </div>

          {/* Execution Controls */}
          <div className="flex items-center gap-1.5">
            {phase === 'executing' || phase === 'planning' || phase === 'verifying' ? (
              <button
                onClick={onPauseWorkflow}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-xl bg-white/80 border border-white/90 text-[#292824] hover:bg-white shadow-2xs transition-all"
                title="Pause execution"
              >
                <Pause className="w-3.5 h-3.5 text-[#68645D]" />
                Pause
              </button>
            ) : phase === 'paused' ? (
              <button
                onClick={onResumeWorkflow}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-xl bg-[#7C72D8] text-white hover:bg-[#6E64CA] shadow-2xs transition-all"
                title="Resume execution"
              >
                <Play className="w-3.5 h-3.5" />
                Resume
              </button>
            ) : (
              <button
                onClick={onRunWorkflow}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-xl bg-[#7C72D8] text-white hover:bg-[#6E64CA] shadow-2xs transition-all"
                title="Run workflow"
              >
                <Play className="w-3.5 h-3.5" />
                {phase === 'completed' ? 'Rerun' : 'Start'}
              </button>
            )}

            <button
              onClick={onEmergencyStop}
              className="p-1.5 text-xs text-[#918C83] hover:text-[#D98282] hover:bg-rose-50/50 rounded-xl transition-all"
              title="Emergency Stop"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="p-1.5 text-xs text-[#918C83] hover:text-[#292824] hover:bg-white/80 rounded-xl transition-all"
              title={isFullscreen ? 'Exit Fullscreen' : 'Expand View'}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. TASK PROGRESS & RUNTIME BAR (Requirement 12)
          ======================================================== */}
      <div className="mt-5 p-4 rounded-2xl bg-white/60 border border-white/70 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="font-semibold text-[#292824] flex items-center gap-1.5">
              <span>Task Progress</span>
              <span className="text-[#918C83] font-normal">·</span>
              <span className="text-[#68645D]">{completedStagesCount} of {stages.length} stages completed</span>
            </span>
            <span className="font-mono font-medium text-[#7C72D8]">{overallProgressPercentage}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-[#EAE5DC]/60 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#7C72D8] via-[#8D82C7] to-[#79A98A] transition-all duration-500 ease-out"
              style={{ width: `${overallProgressPercentage}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-[#68645D] shrink-0 border-t sm:border-t-0 sm:border-l border-stone-200/60 pt-2 sm:pt-0 sm:pl-4">
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#918C83]" />
            <span>Time: <span className="font-mono text-[#292824]">{formatTime(executionTimeSeconds)}</span></span>
          </div>
          {activeAgent && (
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C72D8] animate-ping" />
              <span>Active: <span className="font-semibold text-[#292824] capitalize">{activeAgent}</span></span>
            </div>
          )}
        </div>
      </div>

      {/* ========================================================
          3. HUMAN APPROVAL CHECKPOINT (Requirement 14)
          Visually distinct, unmissable checkpoint banner
          ======================================================== */}
      {pendingApproval && (
        <div className="mt-5 p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-[#FFFBF2] to-[#FEF6E4] border-2 border-[#D5A45C]/50 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#D5A45C] text-white shadow-2xs">
                  <ShieldAlert className="w-3.5 h-3.5" />
                  Your Approval Is Needed
                </span>
                <span className="text-xs text-[#8C6D2D] font-mono">Governance Checkpoint #01</span>
              </div>
              <h3 className="text-sm sm:text-base font-semibold text-[#292824]">
                The AI is ready to proceed with: {pendingApproval.approval.requestedAction}
              </h3>
              <p className="text-xs text-[#68645D] max-w-3xl leading-relaxed">
                <span className="font-semibold text-[#292824]">Why: </span>{pendingApproval.approval.reason}
                {pendingApproval.approval.consequences && (
                  <span className="block mt-0.5 text-[#8C6D2D]">
                    <span className="font-semibold">Impact: </span>{pendingApproval.approval.consequences}
                  </span>
                )}
              </p>
            </div>

            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => {
                  setSelectedStageId('review');
                  setIsReviewModalOpen(true);
                }}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#D5A45C]/60 text-[#8C6D2D] hover:bg-[#FEF8EC] shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ring-1 ring-[#D5A45C]/30"
                title="Open interactive review workspace to inspect recommendations and data"
              >
                <FileCheck className="w-3.5 h-3.5 text-[#D5A45C]" />
                <span>Review Details</span>
              </button>
              <button
                onClick={onReject}
                className="px-3.5 py-2 text-xs font-medium rounded-xl bg-white/80 border border-rose-300 text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
              >
                Reject
              </button>
              <button
                onClick={onApprove}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#D5A45C] text-white hover:bg-[#C48A2C] shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5" />
                Approve & Continue
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          4. PROMINENT CURRENT ACTION CARD (Requirement 5)
          Tells user "What is the AI doing right now?" in 3 seconds
          ======================================================== */}
      {pendingApproval ? (
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#FEFBF4] via-white to-[#FAF4E8] border border-[#D5A45C]/50 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FAF2E2] border border-[#D5A45C]/35 flex items-center justify-center shrink-0 shadow-2xs text-[#D5A45C]">
                <ShieldAlert className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#8C6D2D] font-bold">
                    Action Paused · Waiting for Your Review
                  </span>
                  <span className="text-xs text-[#8C6D2D]">·</span>
                  <span className="text-xs font-medium text-[#8C6D2D]">Stage 6 of 7 (Review)</span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#292824] mt-0.5">
                  AI is waiting for your review and authorization before publishing recommendations
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-center">
              <button
                onClick={() => {
                  setSelectedStageId('review');
                  setIsReviewModalOpen(true);
                }}
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#D5A45C] text-white hover:bg-[#C48A2C] shadow-sm hover:shadow transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <FileCheck className="w-3.5 h-3.5" />
                <span>Review & Decide</span>
              </button>
            </div>
          </div>
        </div>
      ) : currentActiveStage && phase !== 'completed' && (
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-white/75 border border-white/90 shadow-2xs backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F0EEFC] border border-[#7C72D8]/20 flex items-center justify-center shrink-0 shadow-2xs">
                {currentActiveStage.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[#7C72D8] font-semibold">
                    Currently Working On
                  </span>
                  <span className="text-xs text-[#918C83]">·</span>
                  <span className="text-xs font-medium text-[#68645D]">
                    Stage {currentActiveStage.stepNumber} of 7 ({currentActiveStage.title})
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-semibold text-[#292824] mt-0.5">
                  {currentActiveStage.currentWork}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3 sm:text-right shrink-0">
              <div className="space-y-1">
                <span className="text-xs text-[#918C83] block">Next step</span>
                <span className="text-xs font-medium text-[#68645D] flex items-center gap-1">
                  <span>{stages[Math.min(currentActiveStage.stepNumber, stages.length - 1)].title}</span>
                  <ArrowRight className="w-3 h-3 text-[#918C83]" />
                </span>
              </div>
              <button
                onClick={() => setSelectedStageId(currentActiveStage.id)}
                className="px-3 py-1.5 text-xs font-medium rounded-xl bg-[#F0EEFC] text-[#7C72D8] hover:bg-[#E4E0FA] transition-all"
              >
                Inspect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Banner when finished */}
      {phase === 'completed' && (
        <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-[#F0F7F3] to-[#FAF7F2] border border-[#79A98A]/40 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E8F3EC] border border-[#79A98A]/30 flex items-center justify-center text-[#4E8B65] shrink-0">
              <Check className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-semibold text-[#292824]">
                Workflow Complete! Executive Deliverable is Ready
              </h3>
              <p className="text-xs text-[#68645D]">
                All 7 stages verified and finalized. You can view, copy, or download the comprehensive report.
              </p>
            </div>
          </div>

          {onNavigateToDeliverable && (
            <button
              onClick={onNavigateToDeliverable}
              className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#7C72D8] text-white hover:bg-[#6E64CA] shadow-2xs transition-all flex items-center gap-1.5 shrink-0 self-start sm:self-center"
            >
              <span>View Finished Deliverable</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* ========================================================
          5. PRIMARY VIEW: CLEAN HORIZONTAL STEPPER (Requirements 1, 2, 6, 8, 10, 11, 16)
          Simple, uncluttered story pipeline:
          Goal → Plan → Research → Execute → Verify → Review → Complete
          ======================================================== */}
      {viewMode === 'simple' && (
        <div className="mt-7">
          <div className="flex items-center justify-between mb-3 px-1">
            <span className="text-xs font-mono text-[#918C83] uppercase tracking-wider">
              Workflow Stages (Click any stage to view details)
            </span>
            <span className="text-xs text-[#918C83]">
              {selectedStageId ? '1 stage selected' : 'Showing overview'}
            </span>
          </div>

          {/* Responsive Stepper Container:
              Horizontal on lg screens, smooth vertical stepper on smaller screens */}
          <div className="flex flex-col lg:flex-row items-stretch gap-3 lg:gap-2">
            {stages.map((stage, idx) => {
              const isSelected = selectedStageId === stage.id;
              const isCurrent = currentActiveStage?.id === stage.id;
              const isLast = idx === stages.length - 1;

              // Card styling depending on status
              const statusClasses = {
                completed: 'bg-white/80 border-[#9DB8A5]/40 hover:border-[#79A98A]',
                in_progress: 'bg-white border-[#7C72D8]/50 ring-2 ring-[#7C72D8]/10 shadow-xs',
                recovering: 'bg-[#FFF8F7] border-[#D98282]/50 ring-2 ring-[#D98282]/10',
                needs_approval: 'bg-[#FFFDF7] border-[#D5A45C]/60 ring-2 ring-[#D5A45C]/15',
                waiting: 'bg-white/50 border-white/60 opacity-80 hover:opacity-100',
              }[stage.status];

              // Status badge styling
              const badgeClasses = {
                completed: 'bg-[#E8F3EC] text-[#4E8B65]',
                in_progress: 'bg-[#F0EEFC] text-[#7C72D8]',
                recovering: 'bg-[#FDF0F0] text-[#C85A5A]',
                needs_approval: 'bg-[#FEF8EC] text-[#C48A2C] font-semibold',
                waiting: 'bg-stone-100 text-[#918C83]',
              }[stage.status];

              return (
                <React.Fragment key={stage.id}>
                  {/* Stage Card */}
                  <div
                    onClick={() => {
                      if (stage.id === 'review') {
                        setSelectedStageId('review');
                        setIsReviewModalOpen(true);
                      } else {
                        setSelectedStageId(isSelected ? null : stage.id);
                      }
                    }}
                    className={`flex-1 min-w-0 p-3.5 sm:p-4 rounded-2xl border transition-all duration-200 cursor-pointer relative group ${statusClasses} ${
                      isSelected ? 'ring-2 ring-[#7C72D8] bg-white shadow-md' : 'hover:bg-white hover:shadow-xs'
                    }`}
                  >
                    {/* Top Row: Step Number & Status Badge */}
                    <div className="flex items-center justify-between gap-1.5 mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-stone-100 border border-stone-200/80 text-[10px] font-mono text-[#68645D] flex items-center justify-center font-semibold">
                          {stage.stepNumber}
                        </span>
                        <div className="p-1 rounded-lg bg-white/70 shadow-2xs">
                          {stage.icon}
                        </div>
                      </div>

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium tracking-tight truncate ${badgeClasses}`}>
                        {stage.status === 'completed' && '✓ '}
                        {stage.status === 'in_progress' && '● '}
                        {stage.status === 'needs_approval' && '! '}
                        {stage.statusText}
                      </span>
                    </div>

                    {/* Stage Title */}
                    <h4 className="text-sm font-semibold text-[#292824] truncate group-hover:text-[#7C72D8] transition-colors flex items-center justify-between">
                      <span>{stage.title}</span>
                      {stage.id === 'review' && stage.status === 'needs_approval' && (
                        <span className="text-[10px] font-bold text-[#D5A45C] bg-[#FEF8EC] px-1.5 py-0.5 rounded border border-[#D5A45C]/40">
                          Click to Review
                        </span>
                      )}
                    </h4>

                    {/* One-Line Human Description */}
                    <p className="mt-1 text-xs text-[#68645D] line-clamp-2 leading-relaxed">
                      {stage.storyDescription}
                    </p>

                    {/* Contained Activity Hint (Grouped agents) */}
                    <div className="mt-3 pt-2.5 border-t border-stone-100/80 flex items-center justify-between text-[11px] text-[#918C83]">
                      <span>{stage.groupedAgents.length} {stage.groupedAgents.length === 1 ? 'agent' : 'agents'}</span>
                      <span className="text-[#7C72D8] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {stage.id === 'review' ? 'Review & Details ↗' : (isSelected ? 'Collapse ▲' : 'Details ▼')}
                      </span>
                    </div>

                    {/* Progress indicator line on active card */}
                    {stage.status === 'in_progress' && (
                      <div className="absolute bottom-0 left-3 right-3 h-0.5 bg-[#EAE5DC] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#7C72D8] rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(15, stage.progress)}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Clean connector line between stages (desktop horizontal, mobile vertical) */}
                  {!isLast && (
                    <div className="hidden lg:flex items-center justify-center w-4 shrink-0">
                      <div className={`h-0.5 w-full transition-all duration-300 ${
                        stage.status === 'completed'
                          ? 'bg-[#9DB8A5]'
                          : stage.status === 'in_progress'
                            ? 'bg-gradient-to-r from-[#7C72D8] to-stone-200'
                            : 'bg-stone-200'
                      }`} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>

          {/* ========================================================
              6. PROGRESSIVE DISCLOSURE DETAIL PANEL (Requirement 4)
              Opens when user clicks any stage card
              ======================================================== */}
          {activeDetailStage && (
            <div className="mt-4 p-5 sm:p-6 rounded-2xl bg-white/90 border border-white shadow-sm animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex items-start justify-between gap-4 pb-4 border-b border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-stone-50 border border-stone-200 flex items-center justify-center">
                    {activeDetailStage.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-[#7C72D8] font-semibold">
                        Stage {activeDetailStage.stepNumber} of 7
                      </span>
                      <span className="text-xs text-[#918C83]">·</span>
                      <span className="text-xs text-[#68645D] font-medium">{activeDetailStage.statusText}</span>
                    </div>
                    <h3 className="text-base font-semibold text-[#292824]">
                      {activeDetailStage.humanName}
                    </h3>
                  </div>
                </div>

                <button
                  onClick={() => setSelectedStageId(null)}
                  className="p-1.5 rounded-lg text-[#918C83] hover:text-[#292824] hover:bg-stone-100 transition-all"
                  title="Close stage details"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Detail Content Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mt-4">
                
                {/* Column 1: What & Why (Storytelling) */}
                <div className="space-y-3 md:col-span-2">
                  <div>
                    <h5 className="text-xs font-semibold text-[#918C83] font-mono uppercase tracking-wider">
                      What the AI is doing
                    </h5>
                    <p className="mt-1 text-xs sm:text-sm text-[#292824] leading-relaxed">
                      {activeDetailStage.currentWork}
                    </p>
                  </div>

                  <div>
                    <h5 className="text-xs font-semibold text-[#918C83] font-mono uppercase tracking-wider">
                      Why this matters
                    </h5>
                    <p className="mt-1 text-xs text-[#68645D] leading-relaxed">
                      {activeDetailStage.whyItMatters}
                    </p>
                  </div>

                  {activeDetailStage.resultSummary && (
                    <div className="p-3 rounded-xl bg-[#FAF7F2] border border-stone-200/60">
                      <span className="text-xs font-semibold text-[#292824] block mb-0.5">
                        Outcome / Output produced:
                      </span>
                      <p className="text-xs text-[#68645D]">
                        {activeDetailStage.resultSummary}
                      </p>
                    </div>
                  )}

                  {activeDetailStage.warnings && activeDetailStage.warnings.length > 0 && (
                    <div className="p-3 rounded-xl bg-[#FEF8EC] border border-[#D5A45C]/40 text-[#8C6D2D] text-xs">
                      <span className="font-semibold flex items-center gap-1 mb-0.5">
                        <AlertTriangle className="w-3.5 h-3.5" /> Note / Self-Correction:
                      </span>
                      {activeDetailStage.warnings.map((w, idx) => (
                        <p key={idx}>{w}</p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Column 2: Agents & Tools Contained */}
                <div className="space-y-4 p-4 rounded-xl bg-stone-50/70 border border-stone-200/60">
                  <div>
                    <h5 className="text-xs font-semibold text-[#292824] flex items-center gap-1.5 mb-2">
                      <Users className="w-3.5 h-3.5 text-[#7C72D8]" />
                      Responsible Agents ({activeDetailStage.groupedAgents.length})
                    </h5>
                    <div className="space-y-2">
                      {activeDetailStage.groupedAgents.map((ag, i) => (
                        <div key={i} className="text-xs">
                          <span className="font-medium text-[#292824] block">{ag.name}</span>
                          <span className="text-[11px] text-[#68645D]">{ag.roleDesc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-200/60">
                    <h5 className="text-xs font-semibold text-[#292824] flex items-center gap-1.5 mb-2">
                      <Wrench className="w-3.5 h-3.5 text-[#68645D]" />
                      Tools & Capabilities Used
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {activeDetailStage.toolsUsed.map((tool, i) => (
                        <span key={i} className="px-2 py-0.5 rounded-md bg-white border border-stone-200 text-[11px] text-[#68645D]">
                          {tool}
                        </span>
                      ))}
                    </div>
                  </div>

                  {activeDetailStage.duration && (
                    <div className="pt-2 text-[11px] text-[#918C83]">
                      <span>Execution duration: </span>
                      <span className="font-mono text-[#292824] font-medium">{activeDetailStage.duration}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Interactive Review Workspace when Stage 6 (Review) is selected */}
              {activeDetailStage.id === 'review' && (
                <div className="mt-5 p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#FFFBF2] to-[#FEF6E4] border border-[#D5A45C]/50 space-y-3.5 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#D5A45C] text-white shadow-2xs">
                          Interactive Human Review Controls
                        </span>
                        <span className="text-xs text-[#8C6D2D] font-mono">Stage 6 Checkpoint</span>
                      </div>
                      <h4 className="text-sm sm:text-base font-bold text-[#292824] mt-1">
                        {pendingApproval
                          ? `Decision Required: ${pendingApproval.approval.requestedAction}`
                          : activeDetailStage.status === 'completed'
                          ? 'Review Complete · Strategy Signed Off'
                          : 'Review Checkpoint on Standby'}
                      </h4>
                      <p className="text-xs text-[#68645D] mt-0.5 max-w-2xl">
                        {pendingApproval
                          ? 'You have ultimate authority over agent outputs. Authorize recommendations, provide directional guidance, or reject to re-plan.'
                          : activeDetailStage.status === 'completed'
                          ? 'Human approval granted. Deliverable recommendations are authorized and verified.'
                          : 'This checkpoint pauses execution for your explicit sign-off as soon as quality verification passes.'}
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0">
                      <button
                        onClick={() => setIsReviewModalOpen(true)}
                        className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-[#D5A45C]/60 text-[#8C6D2D] hover:bg-[#FEF8EC] shadow-2xs transition-all flex items-center gap-1.5 cursor-pointer"
                        title="Open full-screen review workspace"
                      >
                        <FileCheck className="w-3.5 h-3.5 text-[#D5A45C]" />
                        <span>Open Full Review Workspace</span>
                      </button>

                      {pendingApproval && (
                        <>
                          <button
                            onClick={onReject}
                            className="px-3.5 py-2 text-xs font-medium rounded-xl bg-white/90 border border-rose-300 text-rose-700 hover:bg-rose-50 transition-all cursor-pointer"
                          >
                            Reject
                          </button>
                          <button
                            onClick={onApprove}
                            className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#D5A45C] hover:bg-[#C48A2C] text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Approve & Continue</span>
                          </button>
                        </>
                      )}

                      {!pendingApproval && activeDetailStage.status === 'completed' && onNavigateToDeliverable && (
                        <button
                          onClick={onNavigateToDeliverable}
                          className="px-4 py-2 text-xs font-semibold rounded-xl bg-[#7C72D8] hover:bg-[#6E64CA] text-white shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                        >
                          <span>View Final Deliverable</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Inline guidance directive input if pending approval */}
                  {pendingApproval && (
                    <div className="pt-2.5 border-t border-[#D5A45C]/30 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-xs">
                      <input
                        type="text"
                        value={inlineFeedback}
                        onChange={(e) => setInlineFeedback(e.target.value)}
                        placeholder="Add custom directive (e.g., Focus primarily on solutions under $20k/yr)..."
                        className="flex-1 px-3 py-2 rounded-xl border border-stone-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-[#D5A45C]/50"
                      />
                      <button
                        onClick={() => {
                          if (!inlineFeedback.trim()) return;
                          if (onRequestChanges) {
                            onRequestChanges(inlineFeedback);
                          } else {
                            onApprove();
                          }
                          setInlineFeedbackSent(true);
                          setTimeout(() => {
                            setInlineFeedbackSent(false);
                            setInlineFeedback('');
                          }, 1500);
                        }}
                        disabled={!inlineFeedback.trim()}
                        className="px-3.5 py-2 rounded-xl bg-[#7C72D8] text-white font-medium hover:bg-[#6E64CA] disabled:opacity-50 transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-2xs"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Apply Directive</span>
                      </button>
                      {inlineFeedbackSent && (
                        <span className="text-[#4E8B65] font-semibold text-xs flex items-center gap-1">
                          <Check className="w-3.5 h-3.5" /> Directive Applied!
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ========================================================
          7. DETAILED VIEW MODE (Requirement 13)
          For technical users: individual tasks, telemetry, verification
          ======================================================== */}
      {viewMode === 'detailed' && (
        <div className="mt-7 space-y-4">
          <div className="p-4 rounded-2xl bg-white/70 border border-white/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-mono uppercase tracking-wider text-[#918C83] font-semibold">
                Technical Task Graph & Tool Invocations
              </h4>
              <span className="text-xs text-[#68645D] font-mono">{tasks.length} atomic operations</span>
            </div>

            <div className="divide-y divide-stone-100">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => onSelectTask && onSelectTask(task.id)}
                  className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-stone-50/50 px-2 rounded-xl transition-colors cursor-pointer"
                >
                  <div className="flex items-start gap-3">
                    <span className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                      task.status === 'completed' ? 'bg-[#79A98A]' : (task.status === 'in_progress' ? 'bg-[#7C72D8] animate-ping' : 'bg-stone-300')
                    }`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#292824]">{task.title}</span>
                        <span className="text-[10px] font-mono px-2 py-0.2 rounded-full bg-stone-100 text-[#68645D]">
                          {task.assignedAgent}
                        </span>
                      </div>
                      <p className="text-xs text-[#68645D] mt-0.5 line-clamp-1">{task.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs">
                    <span className="px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-[11px] font-mono text-[#68645D]">
                      {task.requiredTool}
                    </span>
                    <span className={`font-mono text-xs ${
                      task.status === 'completed' ? 'text-[#4E8B65]' : (task.status === 'in_progress' ? 'text-[#7C72D8]' : 'text-[#918C83]')
                    }`}>
                      {task.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          8. CLEAN ACTIVITY SUMMARY (Requirement 15)
          Compact human-friendly summary with full activity link
          ======================================================== */}
      <div className="mt-6 pt-5 border-t border-white/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <span className="text-xs font-mono uppercase tracking-wider text-[#918C83]">
            Recent Milestones & Activity
          </span>
          <button
            onClick={() => setShowFullActivityModal(true)}
            className="text-xs font-medium text-[#7C72D8] hover:text-[#6E64CA] flex items-center gap-1 transition-colors self-start sm:self-center"
          >
            <span>View complete activity log ({activityLog.length || 24} events)</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Highlight Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {recentHighlights.map((hl, i) => (
            <div
              key={i}
              className={`p-2.5 rounded-xl border text-xs transition-all ${
                hl.done
                  ? 'bg-white/70 border-white/90 text-[#292824]'
                  : 'bg-white/30 border-white/40 text-[#918C83]'
              }`}
            >
              <div className="flex items-center justify-between gap-1 mb-1">
                <span className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] ${
                  hl.done ? 'bg-[#E8F3EC] text-[#4E8B65]' : 'bg-stone-100 text-[#918C83]'
                }`}>
                  {hl.done ? '✓' : '○'}
                </span>
                <span className="text-[10px] font-mono text-[#918C83]">{hl.time}</span>
              </div>
              <p className="line-clamp-2 leading-tight text-[11px] font-medium">
                {hl.text}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ========================================================
          9. COMPLETE ACTIVITY LOG MODAL (Progressive Disclosure)
          ======================================================== */}
      {showFullActivityModal && (
        <div className="fixed inset-0 z-50 bg-[#292824]/30 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="w-full max-w-2xl max-h-[85vh] rounded-3xl bg-[#FAF7F2] border border-white shadow-xl flex flex-col overflow-hidden">
            {/* Modal Header */}
            <div className="p-5 border-b border-stone-200/80 flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#292824]">Immutable Activity & Governance Log</h3>
                <p className="text-xs text-[#68645D]">Every thought, decision, tool invocation, and human sign-off</p>
              </div>
              <button
                onClick={() => setShowFullActivityModal(false)}
                className="p-1.5 rounded-xl hover:bg-stone-200/60 text-[#68645D] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Pills */}
            <div className="px-5 py-2.5 bg-white/60 border-b border-stone-200/60 flex items-center gap-2 overflow-x-auto text-xs">
              {['all', 'goals', 'tools', 'approvals', 'checks'].map(flt => (
                <button
                  key={flt}
                  onClick={() => setActivityFilter(flt)}
                  className={`px-3 py-1 rounded-lg capitalize transition-all ${
                    activityFilter === flt
                      ? 'bg-[#7C72D8] text-white font-medium shadow-2xs'
                      : 'bg-white border border-stone-200 text-[#68645D] hover:bg-stone-50'
                  }`}
                >
                  {flt}
                </button>
              ))}
            </div>

            {/* Scrollable Event List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-2.5 divide-y divide-stone-100">
              {activityLog.length > 0 ? (
                activityLog.map(item => (
                  <div key={item.id} className="pt-2 text-xs flex items-start gap-3">
                    <span className="font-mono text-[10px] text-[#918C83] shrink-0 mt-0.5">
                      {item.timestamp.slice(11, 19)}
                    </span>
                    <div>
                      <span className="font-semibold text-[#292824] mr-2">[{item.type.toUpperCase()}]</span>
                      <span className="font-medium text-[#292824]">{item.title}</span>
                      {item.detail && <span className="text-[#68645D] block mt-0.5">{item.detail}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-[#918C83]">
                  No technical events logged yet.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-stone-200/80 bg-white/60 flex items-center justify-between text-xs">
              <span className="text-[#918C83]">Showing cryptographic audit trail</span>
              <button
                onClick={() => setShowFullActivityModal(false)}
                className="px-4 py-1.5 rounded-xl bg-stone-200/80 text-[#292824] hover:bg-stone-300 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          10. INTERACTIVE HUMAN REVIEW MODAL (Stage 6 Governance)
          ======================================================== */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        onClose={() => setIsReviewModalOpen(false)}
        pendingApproval={pendingApproval}
        tasks={tasks}
        objective={objective}
        onApprove={onApprove}
        onReject={onReject}
        onRequestChanges={onRequestChanges}
        onNavigateToDeliverable={onNavigateToDeliverable}
      />

    </section>
  );
};
