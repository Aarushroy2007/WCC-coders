/**
 * Aegis Agent OS - Interactive Real-Time Workflow Display
 * Visual pipeline: Goal → Planning → Parallel Agent Assignment → Tool Usage → Execution → Verification → Human Approval → Completion
 * Featuring:
 * - Living workflow reactivity: nodes expand, breathe, and illuminate dynamically
 * - Apple-style spatial hover elevation and connected-path highlighting
 * - Smart SVG connection lines with flowing data pulse particles & hover tooltips
 * - Inline expandable node details (inputs, outputs, tools, confidence, retries)
 * - Focus Mode: isolate individual agent pipelines and dependencies
 * - Floating Current Action spotlight panel
 * - Direct Human-in-the-Loop approval nodes with instantaneous sign-off
 * - Adaptive replanning detour visualization with animated route recovery
 * - Demo mode with auto-simulation and step-through controls
 * - Interactive minimap radar and canvas pan & zoom
 * - Compact live event stream and collapsible milestone timeline
 * - Restrained, premium completion experience
 */

import React, { useState, useRef, useMemo, useEffect } from 'react';
import {
  AgentPhase,
  AgentRole,
  Task,
  TaskApproval,
  ActivityLogItem,
} from '../types/agent';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut,
  Target,
  Compass,
  Search,
  BarChart2,
  Zap,
  RefreshCw,
  CheckCircle2,
  ShieldAlert,
  Award,
  ChevronDown,
  ChevronUp,
  X,
  Check,
  AlertTriangle,
  Clock,
  Sparkles,
  Layers,
  ArrowRight,
  Sliders,
  Activity,
  Cpu,
  Fingerprint,
  Eye,
  Crosshair,
  Info,
  ExternalLink,
  ChevronRight,
  FastForward,
} from 'lucide-react';

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
  onSelectTask?: (taskId: string) => void;
  onNavigateToDeliverable?: () => void;
  className?: string;
  defaultExpanded?: boolean;
}

export type WorkflowFilter = 'all' | 'agents' | 'tools' | 'human_decisions' | 'errors' | 'completed';

export interface WorkflowNodeData {
  id: string;
  type: 'goal' | 'planner' | 'researcher' | 'analyst' | 'executor' | 'recovery' | 'verifier' | 'approval' | 'deliverable';
  title: string;
  role?: AgentRole;
  category: string;
  description: string;
  toolName?: string;
  metricLabel?: string;
  status: 'waiting' | 'running' | 'completed' | 'failed' | 'paused' | 'waiting_approval';
  progress: number;
  confidenceScore?: number;
  x: number;
  y: number;
  associatedTaskId?: string;
  inputSummary?: string;
  outputSummary?: string;
  retryCount?: number;
  lastAction?: string;
  nextAction?: string;
  colorTheme: {
    primary: string;
    glow: string;
    bgSubtle: string;
    borderSubtle: string;
    particleColor: string;
  };
}

export interface ConnectionInfo {
  id: string;
  from: string;
  to: string;
  tooltipTitle: string;
  tooltipDesc: string;
  isDetour?: boolean;
  replanned?: boolean;
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
  onSelectTask,
  onNavigateToDeliverable,
  className = '',
  defaultExpanded = false,
}) => {
  // Canvas State: Zoom & Pan
  const [zoom, setZoom] = useState<number>(0.92);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: -10 });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [filter, setFilter] = useState<WorkflowFilter>('all');
  const [selectedNode, setSelectedNode] = useState<WorkflowNodeData | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [focusModeNodeId, setFocusModeNodeId] = useState<string | null>(null);
  const [expandedNodeIds, setExpandedNodeIds] = useState<Set<string>>(new Set());
  const [hoveredConnection, setHoveredConnection] = useState<{ text: string; desc: string; x: number; y: number } | null>(null);
  const [isTimelineCollapsed, setIsTimelineCollapsed] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'canvas' | 'linear'>('canvas');
  const [isDemoRunning, setIsDemoRunning] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement>(null);

  const completedTasks = tasks.filter((t) => t.status === 'completed' || t.status === 'recovered');
  const runningTasks = tasks.filter((t) => t.status === 'in_progress');
  const failedTasks = tasks.filter((t) => t.status === 'failed');
  const overallProgress = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  const isRunning = phase === 'executing' || phase === 'thinking' || phase === 'planning' || phase === 'verifying';
  const isPaused = phase === 'paused';
  const isStopped = phase === 'stopped';
  const isCompleted = phase === 'completed';

  // Toggle inline card expansion
  const toggleNodeExpansion = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedNodeIds((prev) => {
      const next = new Set(prev);
      if (next.has(nodeId)) {
        next.delete(nodeId);
      } else {
        next.add(nodeId);
      }
      return next;
    });
  };

  // Compute live node statuses dynamically based on orchestrator state
  const nodes = useMemo<WorkflowNodeData[]>(() => {
    // 1. Goal Node
    const goalStatus: WorkflowNodeData['status'] = objective ? 'completed' : 'waiting';

    // 2. Planner Node
    let plannerStatus: WorkflowNodeData['status'] = 'waiting';
    let plannerProgress = 0;
    if (phase === 'thinking' || phase === 'planning') {
      plannerStatus = 'running';
      plannerProgress = phase === 'thinking' ? 50 : 90;
    } else if (phase === 'executing' || phase === 'verifying' || phase === 'completed' || phase === 'waiting_approval') {
      plannerStatus = 'completed';
      plannerProgress = 100;
    }

    // 3. Research Node (Tasks 1, 2, 3)
    const researchTasks = tasks.filter((t) => t.assignedAgent === 'researcher');
    const researchCompleted = researchTasks.every((t) => t.status === 'completed' || t.status === 'recovered');
    const researchRunning = researchTasks.some((t) => t.status === 'in_progress');
    const researchFailed = researchTasks.some((t) => t.status === 'failed');
    let researchStatus: WorkflowNodeData['status'] = 'waiting';
    let researchProgress = 0;
    if (researchFailed) {
      researchStatus = 'failed';
      researchProgress = 40;
    } else if (researchRunning || activeAgent === 'researcher') {
      researchStatus = 'running';
      researchProgress = Math.round(researchTasks.reduce((acc, t) => acc + t.progress, 0) / (researchTasks.length || 1));
    } else if (researchCompleted && researchTasks.length > 0) {
      researchStatus = 'completed';
      researchProgress = 100;
    }

    // 4. Analysis Node (Tasks 4, 5)
    const analysisTasks = tasks.filter((t) => t.assignedAgent === 'analyst');
    const analysisCompleted = analysisTasks.every((t) => t.status === 'completed' || t.status === 'recovered');
    const analysisRunning = analysisTasks.some((t) => t.status === 'in_progress');
    let analysisStatus: WorkflowNodeData['status'] = 'waiting';
    let analysisProgress = 0;
    if (analysisRunning || activeAgent === 'analyst') {
      analysisStatus = 'running';
      analysisProgress = Math.round(analysisTasks.reduce((acc, t) => acc + t.progress, 0) / (analysisTasks.length || 1));
    } else if (analysisCompleted && analysisTasks.length > 0) {
      analysisStatus = 'completed';
      analysisProgress = 100;
    }

    // 5. Execution Node (Task 6)
    const execTasks = tasks.filter((t) => t.assignedAgent === 'executor');
    const execCompleted = execTasks.every((t) => t.status === 'completed' || t.status === 'recovered');
    const execRunning = execTasks.some((t) => t.status === 'in_progress');
    let execStatus: WorkflowNodeData['status'] = 'waiting';
    let execProgress = 0;
    if (execRunning || activeAgent === 'executor') {
      execStatus = 'running';
      execProgress = Math.round(execTasks.reduce((acc, t) => acc + t.progress, 0) / (execTasks.length || 1));
    } else if (execCompleted && execTasks.length > 0) {
      execStatus = 'completed';
      execProgress = 100;
    }

    // 6. Recovery Node (Active when recovery occurs)
    const isRecovering = !!activeRecovery || researchFailed;
    const isRecoveryDone = researchTasks.some((t) => t.status === 'recovered');
    let recoveryStatus: WorkflowNodeData['status'] = 'waiting';
    if (isRecovering) {
      recoveryStatus = 'running';
    } else if (isRecoveryDone) {
      recoveryStatus = 'completed';
    }

    // 7. Verification Node (Task 7)
    const verifyTasks = tasks.filter((t) => t.assignedAgent === 'verifier');
    const verifyCompleted = verifyTasks.every((t) => t.status === 'completed' || t.status === 'recovered') || phase === 'completed';
    const verifyRunning = verifyTasks.some((t) => t.status === 'in_progress') || phase === 'verifying';
    let verifyStatus: WorkflowNodeData['status'] = 'waiting';
    let verifyProgress = 0;
    if (verifyRunning) {
      verifyStatus = 'running';
      verifyProgress = 75;
    } else if (verifyCompleted && (verifyTasks.length > 0 || phase === 'completed')) {
      verifyStatus = 'completed';
      verifyProgress = 100;
    }

    // 8. Human Approval Node (Task 8 & pendingApproval)
    let approvalStatus: WorkflowNodeData['status'] = 'waiting';
    if (pendingApproval || phase === 'waiting_approval') {
      approvalStatus = 'waiting_approval';
    } else if (completedTasks.some((t) => t.approval?.status === 'approved') || phase === 'completed') {
      approvalStatus = 'completed';
    }

    // 9. Deliverable Node (Final completion)
    const deliverableStatus: WorkflowNodeData['status'] = phase === 'completed' ? 'completed' : 'waiting';

    return [
      {
        id: 'node-goal',
        type: 'goal',
        title: 'User Objective',
        category: 'Intake & Formal Scope',
        description: 'Target requirements parsed into formal validation constraints and deliverables.',
        metricLabel: 'Validated Scope',
        status: goalStatus,
        progress: 100,
        confidenceScore: 99,
        x: 530,
        y: 65,
        inputSummary: 'Natural language prompt from user session',
        outputSummary: 'Objective parameter schemas & target KPIs',
        lastAction: 'Objective validated with deterministic parameters',
        nextAction: 'Decompose into topological sub-graph',
        colorTheme: {
          primary: '#D5A45C',
          glow: 'rgba(213, 164, 92, 0.28)',
          bgSubtle: 'rgba(255, 250, 240, 0.88)',
          borderSubtle: 'rgba(213, 164, 92, 0.40)',
          particleColor: '#D5A45C',
        },
      },
      {
        id: 'node-planner',
        type: 'planner',
        title: 'Planning Agent',
        role: 'planner',
        category: 'Topological DAG Graph',
        description: 'Constructs dependency graph with 9 atomic stages and explicit governance checkpoints.',
        metricLabel: '9-Stage Plan',
        status: plannerStatus,
        progress: plannerProgress,
        confidenceScore: 97,
        x: 530,
        y: 175,
        inputSummary: 'Validated scope & organizational permissions',
        outputSummary: 'Directed Acyclic Graph with 1 approval barrier',
        lastAction: 'Generated parallel schedules & risk thresholds',
        nextAction: 'Dispatch parallel agent workers',
        colorTheme: {
          primary: '#8D82C7',
          glow: 'rgba(141, 130, 199, 0.28)',
          bgSubtle: 'rgba(247, 245, 255, 0.88)',
          borderSubtle: 'rgba(141, 130, 199, 0.35)',
          particleColor: '#8D82C7',
        },
      },
      {
        id: 'node-research',
        type: 'researcher',
        title: 'Research Agent',
        role: 'researcher',
        category: 'Live Index Retrieval',
        description: 'Queries verified search indexes, extracts documentation, and cross-references citations.',
        toolName: 'Web Search & Citations',
        metricLabel: researchStatus === 'completed' ? '12 Sources' : 'Live Crawl',
        status: researchStatus,
        progress: researchProgress,
        confidenceScore: 95,
        x: 230,
        y: 315,
        associatedTaskId: 'task-01',
        inputSummary: 'Query: "AI educational video platforms 2026"',
        outputSummary: '12 verified platform profiles & feature matrix',
        lastAction: researchStatus === 'failed' ? 'Gateway 504 timeout (auto-healing route)' : 'Extracted 12 vendor feature matrices',
        nextAction: researchStatus === 'failed' ? 'Engage Recovery Agent for mirror cache' : 'Synthesize research dataset',
        colorTheme: {
          primary: '#7F9DBB',
          glow: 'rgba(127, 157, 187, 0.28)',
          bgSubtle: 'rgba(242, 246, 250, 0.88)',
          borderSubtle: 'rgba(127, 157, 187, 0.35)',
          particleColor: '#7F9DBB',
        },
      },
      {
        id: 'node-analysis',
        type: 'analyst',
        title: 'Analysis Agent',
        role: 'analyst',
        category: 'Statistical Synthesis',
        description: 'Weights pedagogical suitability, FERPA compliance, and user satisfaction.',
        toolName: 'Data Analyzer',
        metricLabel: '4 Vendors Rated',
        status: analysisStatus,
        progress: analysisProgress,
        confidenceScore: 94,
        x: 530,
        y: 315,
        associatedTaskId: 'task-04',
        inputSummary: 'Normalized feature tables from Research Agent',
        outputSummary: 'Multi-attribute matrix with weighted scores',
        lastAction: 'Computed normalized multi-attribute scoring rubric',
        nextAction: 'Draft comparative benchmark matrix',
        colorTheme: {
          primary: '#E9A98F',
          glow: 'rgba(233, 169, 143, 0.28)',
          bgSubtle: 'rgba(253, 248, 245, 0.88)',
          borderSubtle: 'rgba(233, 169, 143, 0.35)',
          particleColor: '#E9A98F',
        },
      },
      {
        id: 'node-executor',
        type: 'executor',
        title: 'Execution Agent',
        role: 'executor',
        category: 'Synthesis & Math',
        description: 'Simulates 3-year TCO financial models and drafts memo recommendation sections.',
        toolName: 'Doc Generator & Code Runner',
        metricLabel: 'ROI Model Built',
        status: execStatus,
        progress: execProgress,
        confidenceScore: 96,
        x: 830,
        y: 315,
        associatedTaskId: 'task-06',
        inputSummary: 'Vendor pricing tiers & instructor hour metrics',
        outputSummary: '3-year TCO savings table: 420 hrs saved/yr',
        lastAction: 'Calculated 420 hrs/year instructor time savings',
        nextAction: 'Consolidate executive recommendation section',
        colorTheme: {
          primary: '#7C72D8',
          glow: 'rgba(124, 114, 216, 0.28)',
          bgSubtle: 'rgba(247, 245, 255, 0.88)',
          borderSubtle: 'rgba(124, 114, 216, 0.35)',
          particleColor: '#7C72D8',
        },
      },
      {
        id: 'node-recovery',
        type: 'recovery',
        title: 'Recovery Agent',
        role: 'recovery',
        category: 'Autonomous Detour',
        description: 'Switches to verified mirror caches and exponential backoff retry on timeout.',
        toolName: 'Mirror Cache Vector',
        metricLabel: isRecovering ? 'Healing Active' : 'Adaptive Loop',
        status: recoveryStatus,
        progress: isRecovering ? 75 : isRecoveryDone ? 100 : 0,
        confidenceScore: 92,
        x: 75,
        y: 410,
        inputSummary: 'Gateway 504 error packet from Research node',
        outputSummary: 'Verified cached embeddings & secondary mirror',
        retryCount: 1,
        lastAction: isRecovering ? 'Activated backup index mirror for search query' : 'Monitoring pipeline integrity',
        nextAction: isRecovering ? 'Rejoin primary pipeline without human intervention' : 'Standby for alerts',
        colorTheme: {
          primary: '#D98282',
          glow: 'rgba(217, 130, 130, 0.28)',
          bgSubtle: 'rgba(253, 242, 242, 0.88)',
          borderSubtle: 'rgba(217, 130, 130, 0.40)',
          particleColor: '#D98282',
        },
      },
      {
        id: 'node-verifier',
        type: 'verifier',
        title: 'Verification Agent',
        role: 'verifier',
        category: 'Quality Governance',
        description: 'Audits deliverable across Accuracy, Completeness, Relevance, and Consistency.',
        toolName: 'Audit Engine',
        metricLabel: verifyStatus === 'completed' ? '96% Passed' : '4-Vector Rubric',
        status: verifyStatus,
        progress: verifyProgress,
        confidenceScore: 98,
        x: 530,
        y: 445,
        associatedTaskId: 'task-07',
        inputSummary: 'Draft memo, benchmark matrix & ROI model',
        outputSummary: '4-point scorecard: 96% overall rating',
        lastAction: 'Audited 4-point verification scorecard (zero hallucinations)',
        nextAction: 'Transmit certified deliverable to approval checkpoint',
        colorTheme: {
          primary: '#79A98A',
          glow: 'rgba(121, 169, 138, 0.28)',
          bgSubtle: 'rgba(244, 249, 245, 0.88)',
          borderSubtle: 'rgba(121, 169, 138, 0.35)',
          particleColor: '#79A98A',
        },
      },
      {
        id: 'node-approval',
        type: 'approval',
        title: 'Human Approval Gate',
        category: 'Governance Checkpoint',
        description: 'High-risk barrier halting execution until operator grants formal sign-off.',
        metricLabel: approvalStatus === 'completed' ? 'Signed Off' : 'Required',
        status: approvalStatus,
        progress: approvalStatus === 'completed' ? 100 : approvalStatus === 'waiting_approval' ? 50 : 0,
        confidenceScore: 100,
        x: 530,
        y: 555,
        associatedTaskId: 'task-08',
        inputSummary: 'Verified strategy recommendations',
        outputSummary: 'Cryptographic human approval signature',
        lastAction: approvalStatus === 'completed' ? 'Human operator granted formal sign-off' : 'Waiting for human authorization',
        nextAction: 'Release verified deliverable for executive download',
        colorTheme: {
          primary: '#D5A45C',
          glow: 'rgba(213, 164, 92, 0.32)',
          bgSubtle: 'rgba(255, 250, 240, 0.90)',
          borderSubtle: 'rgba(213, 164, 92, 0.45)',
          particleColor: '#D5A45C',
        },
      },
      {
        id: 'node-deliverable',
        type: 'deliverable',
        title: 'Verified Deliverable',
        category: 'Executive Publication',
        description: 'Boardroom-ready recommendation memo with citations, benchmark matrix, and action roadmap.',
        metricLabel: deliverableStatus === 'completed' ? 'Ready' : 'Pending',
        status: deliverableStatus,
        progress: deliverableStatus === 'completed' ? 100 : 0,
        confidenceScore: 97,
        x: 530,
        y: 655,
        inputSummary: 'All verified stages & human sign-off token',
        outputSummary: 'Published executive memo & audit export',
        lastAction: deliverableStatus === 'completed' ? 'Deliverable successfully finalized and verified' : 'Awaiting upstream gate completion',
        nextAction: 'Export JSON, Markdown, or Audit Trail',
        colorTheme: {
          primary: '#5A876B',
          glow: 'rgba(90, 135, 107, 0.28)',
          bgSubtle: 'rgba(242, 248, 243, 0.88)',
          borderSubtle: 'rgba(90, 135, 107, 0.35)',
          particleColor: '#5A876B',
        },
      },
    ];
  }, [objective, phase, tasks, activeTaskId, activeAgent, pendingApproval, activeRecovery]);

  // Connections between nodes with tooltips
  const connections: ConnectionInfo[] = useMemo(() => {
    return [
      {
        id: 'conn-goal-planner',
        from: 'node-goal',
        to: 'node-planner',
        tooltipTitle: 'Objective Schemas',
        tooltipDesc: 'Formal requirements handed off to Planning Agent for DAG decomposition.',
      },
      {
        id: 'conn-planner-research',
        from: 'node-planner',
        to: 'node-research',
        tooltipTitle: 'Research Parameters',
        tooltipDesc: 'Research queries dispatched to evaluate AI video platform tools.',
      },
      {
        id: 'conn-planner-analysis',
        from: 'node-planner',
        to: 'node-analysis',
        tooltipTitle: 'Evaluation Rubric',
        tooltipDesc: 'Analysis Agent receives pedagogical weighting criteria.',
      },
      {
        id: 'conn-planner-executor',
        from: 'node-planner',
        to: 'node-executor',
        tooltipTitle: 'Synthesis Schema',
        tooltipDesc: 'Execution Agent prepped for ROI modeling & documentation drafting.',
      },
      {
        id: 'conn-research-recovery',
        from: 'node-research',
        to: 'node-recovery',
        tooltipTitle: 'Autonomous Detour',
        tooltipDesc: '504 timeout detected: Recovery Agent engages mirror cache.',
        isDetour: true,
        replanned: true,
      },
      {
        id: 'conn-recovery-analysis',
        from: 'node-recovery',
        to: 'node-analysis',
        tooltipTitle: 'Self-Healed Stream',
        tooltipDesc: 'Restored mirror knowledge seamlessly rejoined into analytical flow.',
        isDetour: true,
        replanned: true,
      },
      {
        id: 'conn-research-verifier',
        from: 'node-research',
        to: 'node-verifier',
        tooltipTitle: 'Citations Feed',
        tooltipDesc: '12 verified source citations fed to Verification Agent.',
      },
      {
        id: 'conn-analysis-verifier',
        from: 'node-analysis',
        to: 'node-verifier',
        tooltipTitle: 'Scoring Matrix',
        tooltipDesc: 'Multi-attribute vendor comparison table submitted for audit.',
      },
      {
        id: 'conn-executor-verifier',
        from: 'node-executor',
        to: 'node-verifier',
        tooltipTitle: 'Draft Memo',
        tooltipDesc: 'Executive recommendation memo submitted for 4-point verification.',
      },
      {
        id: 'conn-verifier-approval',
        from: 'node-verifier',
        to: 'node-approval',
        tooltipTitle: 'Certified Scorecard',
        tooltipDesc: 'Audit passed (96% quality): Transmitted to Human Approval Gate.',
      },
      {
        id: 'conn-approval-deliverable',
        from: 'node-approval',
        to: 'node-deliverable',
        tooltipTitle: 'Human Authorization',
        tooltipDesc: 'Formal human sign-off token unseals boardroom memo publication.',
      },
    ];
  }, []);

  // Filter matching logic
  const isNodeVisible = (node: WorkflowNodeData): boolean => {
    if (filter === 'all') return true;
    if (filter === 'agents') return !!node.role && node.type !== 'goal' && node.type !== 'approval';
    if (filter === 'tools') return !!node.toolName;
    if (filter === 'human_decisions') return node.type === 'approval' || node.type === 'goal';
    if (filter === 'errors') return node.status === 'failed' || node.type === 'recovery';
    if (filter === 'completed') return node.status === 'completed';
    return true;
  };

  // Focus Mode relationship check
  const isNodeInFocus = (nodeId: string): boolean => {
    if (!focusModeNodeId) return true;
    if (nodeId === focusModeNodeId) return true;
    return connections.some(
      (c) => (c.from === focusModeNodeId && c.to === nodeId) || (c.to === focusModeNodeId && c.from === nodeId)
    );
  };

  // Zoom & Pan handlers
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.15, 1.75));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.15, 0.55));
  const handleResetZoom = () => {
    setZoom(0.92);
    setPan({ x: 0, y: -10 });
  };
  const handleFit = () => {
    setZoom(0.85);
    setPan({ x: 0, y: -25 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.interactive-node-card')) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY > 0 ? -0.08 : 0.08;
      setZoom((prev) => Math.min(Math.max(prev + delta, 0.55), 1.75));
    }
  };

  // Parallel agents active counter
  const parallelActiveCount = useMemo(() => {
    const parallelIds = ['node-research', 'node-analysis', 'node-executor'];
    return nodes.filter((n) => parallelIds.includes(n.id) && n.status === 'running').length;
  }, [nodes]);

  // Active running node for floating action spotlight
  const activeRunningNode = useMemo(() => {
    return nodes.find((n) => n.status === 'running' || n.status === 'waiting_approval');
  }, [nodes]);

  const getNodeIcon = (type: WorkflowNodeData['type']) => {
    switch (type) {
      case 'goal':
        return <Target className="w-4 h-4 text-[#D5A45C]" />;
      case 'planner':
        return <Compass className="w-4 h-4 text-[#8D82C7]" />;
      case 'researcher':
        return <Search className="w-4 h-4 text-[#7F9DBB]" />;
      case 'analyst':
        return <BarChart2 className="w-4 h-4 text-[#E9A98F]" />;
      case 'executor':
        return <Zap className="w-4 h-4 text-[#7C72D8]" />;
      case 'recovery':
        return <RefreshCw className="w-4 h-4 text-[#D98282]" />;
      case 'verifier':
        return <CheckCircle2 className="w-4 h-4 text-[#79A98A]" />;
      case 'approval':
        return <Fingerprint className="w-4 h-4 text-[#D5A45C]" />;
      case 'deliverable':
        return <Award className="w-4 h-4 text-[#5A876B]" />;
    }
  };

  // Helper to calculate smooth SVG curve path between two nodes
  const calculatePath = (fromNode: WorkflowNodeData, toNode: WorkflowNodeData, isDetour?: boolean) => {
    const startX = fromNode.x;
    const startY = fromNode.y + 44; // bottom pin
    const endX = toNode.x;
    const endY = toNode.y - 44; // top pin

    if (isDetour) {
      // Sweeping curved detour for recovery loop
      const midX = (startX + endX) / 2 - 40;
      const midY = (startY + endY) / 2;
      return `M ${startX} ${startY} Q ${midX} ${midY}, ${endX} ${endY}`;
    }

    if (Math.abs(startX - endX) < 10) {
      return `M ${startX} ${startY} L ${endX} ${endY}`;
    }

    const deltaY = endY - startY;
    const c1X = startX;
    const c1Y = startY + deltaY * 0.52;
    const c2X = endX;
    const c2Y = endY - deltaY * 0.52;

    return `M ${startX} ${startY} C ${c1X} ${c1Y}, ${c2X} ${c2Y}, ${endX} ${endY}`;
  };

  return (
    <section
      aria-label="Agent Workflow Display"
      className={`glass-card relative overflow-hidden transition-all duration-300 ${
        isExpanded ? 'fixed inset-3 z-50 p-6 flex flex-col bg-[#FAF7F2]/96 backdrop-blur-2xl shadow-2xl' : 'p-5 sm:p-6'
      } ${className}`}
    >
      {/* 1. Header with Workflow Controls and Status */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-white/70 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#7C72D8] shadow-[0_0_12px_rgba(124,114,216,0.6)] animate-pulse" />
            <h2 className="text-base sm:text-lg font-bold tracking-tight text-[#292824] flex items-center gap-2">
              <span>Agent Workflow</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-mono font-medium bg-[#7C72D8]/12 text-[#7C72D8] border border-[#7C72D8]/25 shadow-2xs">
                Real-Time DAG
              </span>
              {focusModeNodeId && (
                <span className="text-[11px] px-2 py-0.5 rounded-full font-mono font-semibold bg-[#D5A45C]/15 text-[#8C6D2D] border border-[#D5A45C]/30 flex items-center gap-1">
                  <Crosshair className="w-3 h-3 text-[#D5A45C]" />
                  Focused on {nodes.find((n) => n.id === focusModeNodeId)?.title}
                  <button
                    onClick={() => setFocusModeNodeId(null)}
                    className="hover:text-black ml-1 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              )}
            </h2>
          </div>
          <p className="text-xs text-[#68645D]">
            Visual representation of how your agent is planning, executing, verifying, and recovering the task.
          </p>
        </div>

        {/* Header Right Side: Live Indicator + Controls */}
        <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
          {/* Status Badge */}
          <div className="agent-status py-1 px-3 text-xs">
            <span
              className={`status-dot ${
                isRunning ? 'violet' : isPaused ? 'champagne' : isStopped ? 'coral' : ''
              }`}
            />
            <span className="font-mono font-semibold text-[11px] text-[#292824] uppercase tracking-wider">
              {isRunning ? 'LIVE' : phase.replace('_', ' ')}
            </span>
          </div>

          {/* Parallel Execution Indicator */}
          {parallelActiveCount > 1 && (
            <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold bg-[#7C72D8]/10 text-[#7C72D8] border border-[#7C72D8]/25 shadow-2xs animate-pulse">
              <Sparkles className="w-3.5 h-3.5 text-[#7C72D8]" />
              <span>{parallelActiveCount} Agents Parallel</span>
            </div>
          )}

          {/* Workflow Action Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-white/60 backdrop-blur-md rounded-2xl border border-white/80 shadow-2xs">
            {isRunning ? (
              <button
                onClick={onPauseWorkflow}
                className="liquid-button text-xs py-1.5 px-3"
                title="Pause active agent execution"
              >
                <Pause className="w-3 h-3 text-[#292824]" />
                <span className="hidden sm:inline">Pause</span>
              </button>
            ) : isPaused || isStopped ? (
              <button
                onClick={onResumeWorkflow}
                className="liquid-button primary text-xs py-1.5 px-3"
                title="Resume agent execution"
              >
                <Play className="w-3 h-3 fill-white text-white" />
                <span className="hidden sm:inline">Resume</span>
              </button>
            ) : (
              <button
                onClick={onRunWorkflow}
                className="liquid-button primary text-xs py-1.5 px-3"
                title="Run full workflow"
              >
                <Play className="w-3 h-3 fill-white text-white" />
                <span className="hidden sm:inline">Run</span>
              </button>
            )}

            <button
              onClick={() => {
                if (focusModeNodeId) {
                  setFocusModeNodeId(null);
                } else {
                  setFocusModeNodeId(activeRunningNode ? activeRunningNode.id : 'node-research');
                }
              }}
              className={`liquid-button text-xs py-1.5 px-2.5 ${focusModeNodeId ? 'bg-[#7C72D8]/15 border-[#7C72D8]' : ''}`}
              title="Toggle Focus Mode on active agent"
            >
              <Crosshair className="w-3 h-3 text-[#7C72D8]" />
              <span className="hidden md:inline">Focus</span>
            </button>

            <button
              onClick={onEmergencyStop}
              className="liquid-button danger text-xs py-1.5 px-2.5"
              title="Stop Agent immediately"
            >
              <Square className="w-3 h-3 fill-[#8C3B3B] text-[#8C3B3B]" />
              <span className="hidden md:inline">Stop</span>
            </button>

            <button
              onClick={onRunWorkflow}
              className="liquid-button text-xs py-1.5 px-2.5"
              title="Restart entire workflow"
            >
              <RotateCcw className="w-3 h-3 text-[#68645D]" />
            </button>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="liquid-button text-xs py-1.5 px-2.5"
              title={isExpanded ? 'Collapse canvas' : 'Expand full canvas'}
            >
              {isExpanded ? <Minimize2 className="w-3 h-3 text-[#68645D]" /> : <Maximize2 className="w-3 h-3 text-[#68645D]" />}
            </button>
          </div>
        </div>
      </div>

      {/* 2. Completion Experience Banner (Section 23) */}
      {isCompleted && (
        <aside aria-label="Workflow Complete" className="mt-4 p-4 rounded-3xl bg-gradient-to-r from-[#FAF7F0] via-white to-[#F2F8F4] border border-[#79A98A]/40 shadow-sm animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#79A98A]/15 border border-[#79A98A]/30 flex items-center justify-center text-[#4E765D] shrink-0">
                <CheckCircle2 className="w-5 h-5 text-[#5A876B]" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#292824]">Workflow Complete</h3>
                <div className="flex items-center gap-3 text-[11px] text-[#68645D] font-mono mt-0.5">
                  <span>{tasks.length} / {tasks.length} tasks completed</span>
                  <span>·</span>
                  <span className="text-[#5A876B] font-semibold">Reliability: 96%</span>
                  <span>·</span>
                  <span className="text-[#7C72D8] font-semibold">Verification: 94%</span>
                  <span>·</span>
                  <span className="text-[#8C6D2D] font-semibold">Human Control: 100%</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {onNavigateToDeliverable && (
                <button
                  onClick={onNavigateToDeliverable}
                  className="liquid-button primary text-xs py-2 px-4 shadow-sm"
                >
                  <Award className="w-3.5 h-3.5 text-white" />
                  <span>View Result</span>
                </button>
              )}
              <button
                onClick={onRunWorkflow}
                className="liquid-button text-xs py-2 px-3"
              >
                <span>Run Again</span>
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 3. Overall Progress & Live Statistics Bar */}
      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2.5 text-xs">
        {/* Progress Card with soft glass depth */}
        <div className="p-3 rounded-2xl bg-white/70 border border-white/90 shadow-2xs col-span-2 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-[#68645D] flex items-center gap-1.5">
              <Activity className="w-3.5 h-3.5 text-[#7C72D8]" />
              Workflow Pipeline Health
            </span>
            <span className="font-mono font-bold text-[#292824]">{overallProgress}%</span>
          </div>
          <div className="w-full bg-[#EBE4D8]/60 rounded-full h-2 overflow-hidden shadow-inner">
            <div
              className="bg-gradient-to-r from-[#7C72D8] via-[#8E85E2] to-[#79A98A] h-full rounded-full transition-all duration-500 shadow-[0_0_8px_rgba(124,114,216,0.5)]"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-[#918C83] font-mono">
            <span>{completedTasks.length} / {tasks.length} tasks completed</span>
            <span>Runtime: {Math.floor(executionTimeSeconds / 60)}m {executionTimeSeconds % 60}s</span>
          </div>
        </div>

        {/* Running Stat */}
        <div className="p-3 rounded-2xl bg-white/70 border border-white/90 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] text-[#68645D]">Running Nodes</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-[#7C72D8]">
              {runningTasks.length + (phase === 'thinking' || phase === 'planning' || phase === 'verifying' ? 1 : 0)}
            </span>
            <span className="text-[10px] text-[#918C83]">active</span>
          </div>
        </div>

        {/* Waiting Stat */}
        <div className="p-3 rounded-2xl bg-white/70 border border-white/90 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] text-[#68645D]">Queued</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-[#292824]">
              {tasks.filter((t) => t.status === 'pending').length}
            </span>
            <span className="text-[10px] text-[#918C83]">ready</span>
          </div>
        </div>

        {/* Approval Gate Stat */}
        <div className="p-3 rounded-2xl bg-white/70 border border-white/90 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] text-[#68645D]">Human Gate</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-[#8C6D2D]">
              {pendingApproval ? 1 : 0}
            </span>
            <span className="text-[10px] text-[#918C83]">checkpoint</span>
          </div>
        </div>

        {/* Failed / Self-Corrected Stat */}
        <div className="p-3 rounded-2xl bg-white/70 border border-white/90 shadow-2xs flex flex-col justify-between">
          <span className="text-[11px] text-[#68645D]">Self-Healed</span>
          <div className="flex items-baseline gap-1 mt-1">
            <span className="text-xl font-bold font-mono text-[#3B5773]">
              {tasks.filter((t) => t.status === 'recovered').length + (activeRecovery ? 1 : 0)}
            </span>
            <span className="text-[10px] text-[#7F9DBB]">resilient</span>
          </div>
        </div>
      </div>

      {/* 4. Filter Bar & Viewport Zoom Controls */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Filter Pills */}
        <div className="flex items-center gap-1 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 overflow-x-auto max-w-full shadow-2xs self-stretch sm:self-auto">
          {[
            { id: 'all', label: 'All Stages' },
            { id: 'agents', label: 'Agents' },
            { id: 'tools', label: 'Tools' },
            { id: 'human_decisions', label: 'Human Decisions' },
            { id: 'errors', label: 'Self-Correction' },
            { id: 'completed', label: 'Completed' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setFilter(item.id as WorkflowFilter)}
              className={`px-3 py-1 rounded-xl transition-all whitespace-nowrap cursor-pointer ${
                filter === item.id
                  ? 'bg-white text-[#292824] shadow-xs font-semibold border border-white/95'
                  : 'text-[#68645D] hover:text-[#292824]'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Zoom Controls & Layout Switcher */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          {/* Mobile view switch */}
          <div className="sm:hidden flex items-center p-0.5 bg-white/50 rounded-xl border border-white/80">
            <button
              onClick={() => setViewMode('canvas')}
              className={`px-2.5 py-1 rounded-lg text-[11px] ${viewMode === 'canvas' ? 'bg-white font-semibold text-[#292824]' : 'text-[#68645D]'}`}
            >
              Graph
            </button>
            <button
              onClick={() => setViewMode('linear')}
              className={`px-2.5 py-1 rounded-lg text-[11px] ${viewMode === 'linear' ? 'bg-white font-semibold text-[#292824]' : 'text-[#68645D]'}`}
            >
              Timeline
            </button>
          </div>

          <div className="flex items-center gap-1 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 shadow-2xs text-xs">
            <button
              onClick={handleZoomOut}
              className="p-1.5 rounded-xl hover:bg-white text-[#68645D] hover:text-[#292824] transition-colors"
              title="Zoom out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="px-2 py-1 rounded-xl hover:bg-white text-[11px] font-mono text-[#292824] transition-colors"
              title="Reset Zoom"
            >
              {Math.round(zoom * 100)}%
            </button>
            <button
              onClick={handleZoomIn}
              className="p-1.5 rounded-xl hover:bg-white text-[#68645D] hover:text-[#292824] transition-colors"
              title="Zoom in"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <span className="text-[#EBE4D8]">|</span>
            <button
              onClick={handleFit}
              className="px-2.5 py-1 rounded-xl hover:bg-white text-[11px] font-medium text-[#68645D] hover:text-[#292824] transition-colors"
              title="Fit workflow graph to view"
            >
              Fit
            </button>
          </div>
        </div>
      </div>

      {/* 5. Adaptive Recovery Notification Banner */}
      {(activeRecovery || failedTasks.length > 0) && (
        <div className="mt-3 p-3.5 rounded-2xl bg-[#F2F6FA]/80 border border-[#7F9DBB]/40 shadow-xs flex items-center justify-between gap-3 text-xs animate-in fade-in">
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-[#7F9DBB] animate-spin shrink-0" />
            <span className="font-semibold text-[#3B5773]">
              Self-Correction Engaged:
            </span>
            <span className="text-[#292824] truncate max-w-xl">
              {activeRecovery ? activeRecovery.problem : 'Detected upstream failure. Autonomous replanning active.'}
            </span>
          </div>
          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold bg-[#7F9DBB]/15 text-[#3B5773] shrink-0 border border-[#7F9DBB]/30">
            Alternative Route Active
          </span>
        </div>
      )}

      {/* 6. Main Canvas Viewport (Liquid Glass with Animated Fiber Paths, Anchors & Depth) */}
      <div
        ref={canvasRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        className={`mt-4 relative w-full rounded-3xl border border-white/90 bg-gradient-to-b from-[#FAF7F2]/90 via-[#F6F0E8]/60 to-[#FCFAF6]/90 backdrop-blur-2xl overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all shadow-[inset_0_2px_8px_rgba(255,255,255,0.8),0_12px_36px_rgba(70,56,42,0.06)] ${
          isExpanded ? 'flex-1 min-h-[580px]' : 'h-[580px]'
        }`}
        style={{
          backgroundImage: `radial-gradient(circle at 1.5px 1.5px, rgba(213, 164, 92, 0.15) 1.5px, transparent 0)`,
          backgroundSize: '28px 28px',
        }}
      >
        {/* Soft Ambient Depth Glow Spheres in Background */}
        <div className="absolute w-96 h-96 -top-20 -left-20 bg-gradient-to-br from-[#E9A98F]/15 to-[#FAF2E2]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute w-96 h-96 top-1/3 -right-20 bg-gradient-to-br from-[#7C72D8]/12 to-[#8E85E2]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute w-80 h-80 -bottom-20 left-1/3 bg-gradient-to-br from-[#79A98A]/12 to-[#FAF7F2]/30 rounded-full blur-3xl pointer-events-none" />

        {/* Current Action Spotlight Panel (Section 9) */}
        {activeRunningNode && (
          <aside aria-label="Currently Running Task" className="absolute top-4 left-4 z-30 p-3.5 rounded-2xl glass border-white/95 shadow-md max-w-xs space-y-1.5 animate-in fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-[#7C72D8] font-bold uppercase tracking-wider flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#7C72D8] shadow-[0_0_8px_#7C72D8] animate-ping" />
                Active Agent Stream
              </span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-[#7C72D8]/10 text-[#7C72D8] font-bold">
                {activeRunningNode.progress}%
              </span>
            </div>
            <div className="font-bold text-xs text-[#292824]">
              {activeRunningNode.title}
            </div>
            <p className="text-[11px] text-[#68645D] leading-tight line-clamp-2">
              {activeRunningNode.lastAction || activeRunningNode.description}
            </p>
            <div className="pt-1.5 border-t border-white/60 flex items-center justify-between text-[10px] text-[#918C83] font-mono">
              <span>Tool: {activeRunningNode.toolName || 'Core Reasoning'}</span>
              <span>Next: {activeRunningNode.nextAction?.split(' ')[0] || 'Verification'}</span>
            </div>
          </aside>
        )}

        {/* Connection Hover Tooltip (Section 17) */}
        {hoveredConnection && (
          <div
            style={{
              left: `${hoveredConnection.x}px`,
              top: `${hoveredConnection.y - 12}px`,
              transform: 'translate(-50%, -100%)',
            }}
            className="absolute z-40 p-2.5 rounded-xl glass border-white/95 shadow-xl max-w-xs pointer-events-none animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="flex items-center gap-1.5 text-[10px] font-mono text-[#7C72D8] font-bold uppercase">
              <Info className="w-3 h-3" />
              <span>{hoveredConnection.text}</span>
            </div>
            <p className="text-[11px] text-[#292824] font-medium mt-0.5 leading-snug">
              {hoveredConnection.desc}
            </p>
          </div>
        )}

        {/* Transform Container with Pan and Zoom */}
        <div
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            width: '1060px',
            height: '730px',
            position: 'absolute',
            left: 'calc(50% - 530px)',
            top: '15px',
          }}
        >
          {/* Subtle Visual Grouping Box for Parallel Agents Tier (Section 8) */}
          <div
            style={{
              left: '95px',
              top: '235px',
              width: '870px',
              height: '155px',
            }}
            className="absolute rounded-3xl border border-[#7C72D8]/18 bg-white/30 backdrop-blur-xs pointer-events-none shadow-inner"
          >
            <div className="absolute top-2.5 left-4 flex items-center gap-2 text-[10px] font-mono text-[#7C72D8] font-bold tracking-wider uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7C72D8] animate-pulse" />
              Parallel Multi-Agent Worker Tier (Concurrent DAG Branches)
            </div>
          </div>

          {/* SVG Connection Layer with Smart Interactive Lines (Section 7) */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
            <defs>
              <linearGradient id="activeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#7C72D8" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#8E85E2" stopOpacity="0.9" />
              </linearGradient>
              <linearGradient id="completedGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#79A98A" stopOpacity="0.85" />
                <stop offset="100%" stopColor="#9DB8A5" stopOpacity="0.85" />
              </linearGradient>
              <linearGradient id="hoverGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#D5A45C" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#7C72D8" stopOpacity="0.95" />
              </linearGradient>
              <filter id="softGlow" x="-30%" y="-30%" width="160%" height="160%">
                <feGaussianBlur stdDeviation="3.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Connection Lines between nodes */}
            {connections.map((conn) => {
              const fromNode = nodes.find((n) => n.id === conn.from);
              const toNode = nodes.find((n) => n.id === conn.to);
              if (!fromNode || !toNode) return null;

              const isFromCompleted = fromNode.status === 'completed';
              const isToActive = toNode.status === 'running' || toNode.status === 'waiting_approval';
              const isToCompleted = toNode.status === 'completed';
              const isConnectionActive = isFromCompleted && isToActive;
              const isConnectionFinished = isFromCompleted && isToCompleted;
              const isDetourActive = conn.isDetour && (fromNode.status === 'failed' || activeRecovery);
              const isHovered = hoveredNodeId === fromNode.id || hoveredNodeId === toNode.id;
              const isFocusDimmed = focusModeNodeId && fromNode.id !== focusModeNodeId && toNode.id !== focusModeNodeId;

              const pathString = calculatePath(fromNode, toNode, conn.isDetour);

              let strokeColor = 'rgba(215, 208, 195, 0.70)';
              let strokeWidth = 1.5;
              let isAnimated = false;
              let particleColor = '#7C72D8';

              if (isHovered) {
                strokeColor = 'url(#hoverGrad)';
                strokeWidth = 3;
              } else if (isDetourActive) {
                strokeColor = '#D98282';
                strokeWidth = 2.5;
                isAnimated = true;
                particleColor = '#D98282';
              } else if (isConnectionActive) {
                strokeColor = 'url(#activeGrad)';
                strokeWidth = 2.5;
                isAnimated = true;
                particleColor = toNode.colorTheme.particleColor;
              } else if (isConnectionFinished) {
                strokeColor = 'url(#completedGrad)';
                strokeWidth = 2;
              }

              return (
                <g key={conn.id} opacity={isFocusDimmed ? 0.25 : 1} className="transition-opacity duration-300">
                  {/* Subtle Background Glow Line for Active Flow */}
                  {isConnectionActive && (
                    <path
                      d={pathString}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth="7"
                      strokeOpacity="0.30"
                      filter="url(#softGlow)"
                    />
                  )}

                  {/* Primary Connection Line */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={strokeWidth}
                    strokeDasharray={conn.isDetour ? '5,5' : undefined}
                  />

                  {/* Interactive Invisible Thick Stroke for Tooltip Hover (Section 17) */}
                  <path
                    d={pathString}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="20"
                    className="pointer-events-auto cursor-pointer"
                    onMouseEnter={(e) => {
                      const rect = canvasRef.current?.getBoundingClientRect();
                      if (rect) {
                        setHoveredConnection({
                          text: conn.tooltipTitle,
                          desc: conn.tooltipDesc,
                          x: e.clientX - rect.left,
                          y: e.clientY - rect.top,
                        });
                      }
                    }}
                    onMouseLeave={() => setHoveredConnection(null)}
                  />

                  {/* High-speed optical data pulse particles (Section 3) */}
                  {isAnimated && (
                    <>
                      <circle r="4" fill={particleColor} filter="url(#softGlow)">
                        <animateMotion
                          path={pathString}
                          dur={conn.isDetour ? '1.8s' : '2.2s'}
                          repeatCount="indefinite"
                        />
                      </circle>
                      <circle r="2" fill="#FFFFFF">
                        <animateMotion
                          path={pathString}
                          dur={conn.isDetour ? '1.8s' : '2.2s'}
                          repeatCount="indefinite"
                        />
                      </circle>
                    </>
                  )}
                </g>
              );
            })}
          </svg>

          {/* Interactive Glass Node Cards Layer (Section 4 & 5) */}
          <div className="absolute inset-0 z-10 pointer-events-auto">
            {nodes.map((node) => {
              const visible = isNodeVisible(node);
              const inFocus = isNodeInFocus(node.id);
              const isSelected = selectedNode?.id === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isApprovalNode = node.type === 'approval';
              const isExpandedInline = expandedNodeIds.has(node.id);

              return (
                <div
                  key={node.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedNode(node);
                  }}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  style={{
                    left: `${node.x}px`,
                    top: `${node.y}px`,
                    transform: 'translate(-50%, -50%)',
                    width: isApprovalNode ? '260px' : '235px',
                    borderColor: node.status === 'running' ? node.colorTheme.primary : undefined,
                  }}
                  className={`interactive-node-card group absolute p-4 rounded-3xl transition-all duration-300 cursor-pointer ${
                    !visible ? 'opacity-30 scale-95 pointer-events-none' : ''
                  } ${
                    !inFocus ? 'opacity-35 scale-95 filter saturate-75' : ''
                  } ${
                    node.status === 'running'
                      ? 'bg-white/96 shadow-[0_16px_40px_rgba(124,114,216,0.18)] ring-4 ring-[#7C72D8]/20 animate-[pulse_3s_ease-in-out_infinite]'
                      : node.status === 'waiting_approval'
                      ? 'bg-[#FAF4EA]/96 border-[#D5A45C] shadow-[0_16px_40px_rgba(213,164,92,0.22)] ring-4 ring-[#D5A45C]/30 animate-[pulse_2.2s_ease-in-out_infinite]'
                      : node.status === 'failed'
                      ? 'bg-[#FDF2F2]/96 border-[#D98282] shadow-md ring-3 ring-[#D98282]/25'
                      : node.status === 'completed'
                      ? 'bg-white/88 border-white/95 shadow-sm hover:border-[#79A98A]/50'
                      : 'bg-white/65 border-white/85 shadow-2xs hover:border-[#EBE4D8]'
                  } ${
                    isSelected
                      ? 'ring-4 ring-[#7C72D8] scale-105 shadow-2xl'
                      : isHovered
                      ? 'scale-[1.03] -translate-y-1 shadow-lg border-white'
                      : ''
                  }`}
                >
                  {/* Top Connection Input Pin */}
                  <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#D7D0C3] shadow-2xs group-hover:border-[#7C72D8] transition-colors" />

                  {/* Bottom Connection Output Pin */}
                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-white border-2 border-[#D7D0C3] shadow-2xs group-hover:border-[#7C72D8] transition-colors" />

                  {/* Node Header */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        style={{
                          backgroundColor: node.colorTheme.bgSubtle,
                          borderColor: node.colorTheme.borderSubtle,
                        }}
                        className="w-8 h-8 rounded-2xl border flex items-center justify-center shadow-2xs shrink-0 transition-transform group-hover:scale-110"
                      >
                        {getNodeIcon(node.type)}
                      </div>
                      <div className="min-w-0">
                        <h3 className="text-xs font-bold text-[#292824] truncate tracking-tight">
                          {node.title}
                        </h3>
                        <div className="text-[10px] text-[#918C83] truncate font-mono">
                          {node.category}
                        </div>
                      </div>
                    </div>

                    {/* Metric or Output Tag */}
                    {node.metricLabel && (
                      <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-md bg-white border border-[#EBE4D8] text-[#68645D] font-semibold shrink-0">
                        {node.metricLabel}
                      </span>
                    )}
                  </div>

                  {/* Status Bar */}
                  <div className="mt-2.5 flex items-center justify-between gap-1">
                    {/* Live compute indicator for active node */}
                    <div className="flex items-center gap-1.5">
                      {node.status === 'running' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#7C72D8]/15 text-[#7C72D8] border border-[#7C72D8]/30 shadow-2xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#7C72D8] animate-ping" />
                          <span>Computing</span>
                        </span>
                      ) : node.status === 'completed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#79A98A]/15 text-[#4E765D] border border-[#79A98A]/30">
                          <Check className="w-3 h-3 text-[#5A876B]" />
                          <span>Verified</span>
                        </span>
                      ) : node.status === 'waiting_approval' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FAF2E2] text-[#8C6D2D] border border-[#D5A45C]/50 shadow-2xs animate-pulse">
                          <ShieldAlert className="w-3 h-3 text-[#D5A45C]" />
                          <span>Sign-Off</span>
                        </span>
                      ) : node.status === 'failed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#D98282]/15 text-[#8C3B3B] border border-[#D98282]/35 animate-pulse">
                          <AlertTriangle className="w-3 h-3 text-[#8C3B3B]" />
                          <span>Failed</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white/70 text-[#918C83] border border-[#EBE4D8]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#918C83]/50" />
                          <span>Standby</span>
                        </span>
                      )}
                    </div>

                    <span className="text-[10px] font-mono font-semibold text-[#918C83]">
                      {node.progress}%
                    </span>
                  </div>

                  {/* Micro Progress Bar */}
                  <div className="mt-1.5 w-full bg-[#EBE4D8]/50 rounded-full h-1 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        node.status === 'running'
                          ? 'bg-[#7C72D8]'
                          : node.status === 'waiting_approval'
                          ? 'bg-[#D5A45C]'
                          : node.status === 'failed'
                          ? 'bg-[#D98282]'
                          : 'bg-[#79A98A]'
                      }`}
                      style={{ width: `${node.progress}%` }}
                    />
                  </div>

                  {/* Node Short Description */}
                  <p className="mt-2 text-[10px] text-[#68645D] leading-tight line-clamp-2">
                    {node.description}
                  </p>

                  {/* Embedded Human Approval CTA (Section 11) */}
                  {isApprovalNode && node.status === 'waiting_approval' && (
                    <div className="mt-2.5 pt-2 border-t border-[#D5A45C]/35 flex items-center gap-1.5">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onApprove();
                        }}
                        className="flex-1 liquid-button primary text-[10px] py-1 px-2 font-bold shadow-2xs"
                      >
                        Approve & Continue
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onReject();
                        }}
                        className="liquid-button danger text-[10px] py-1 px-2 font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}

                  {/* Tool Badge & Inline Expand Button (Section 6) */}
                  <div className="mt-2 pt-1.5 border-t border-white/70 flex items-center justify-between text-[9px] font-mono text-[#918C83]">
                    <span className="truncate flex items-center gap-1">
                      {node.toolName ? (
                        <>
                          <Layers className="w-2.5 h-2.5 text-[#7C72D8]" />
                          {node.toolName}
                        </>
                      ) : (
                        <span>Confidence: {node.confidenceScore}%</span>
                      )}
                    </span>
                    <button
                      onClick={(e) => toggleNodeExpansion(node.id, e)}
                      className="hover:text-[#292824] underline cursor-pointer text-[9px]"
                      title="Toggle inline details"
                    >
                      {isExpandedInline ? 'Collapse' : 'Details'}
                    </button>
                  </div>

                  {/* Inline Expanded Details (Section 6) */}
                  {isExpandedInline && (
                    <div className="mt-2 pt-2 border-t border-[#EBE4D8] space-y-1.5 text-[9px] text-[#68645D] animate-in fade-in">
                      {node.inputSummary && (
                        <div>
                          <span className="font-semibold text-[#292824]">Input: </span>
                          <span>{node.inputSummary}</span>
                        </div>
                      )}
                      {node.outputSummary && (
                        <div>
                          <span className="font-semibold text-[#292824]">Output: </span>
                          <span>{node.outputSummary}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between pt-0.5 text-[#918C83]">
                        <span>Confidence: {node.confidenceScore}%</span>
                        <span>Retries: {node.retryCount || 0}</span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 7. Mini Map Radar (Section 15) */}
        <aside aria-label="Workflow Mini Map" className="absolute bottom-4 right-4 z-20 hidden md:block p-2.5 rounded-2xl glass border-white/95 shadow-lg">
          <div className="text-[9px] font-mono font-bold text-[#918C83] uppercase mb-1 flex items-center justify-between">
            <span>Radar View</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#7C72D8] animate-ping" />
          </div>
          <div className="w-36 h-24 rounded-xl bg-white/70 border border-[#EBE4D8] relative overflow-hidden">
            {/* Scaled Mini Nodes */}
            {nodes.map((n) => {
              const mx = (n.x / 1060) * 144;
              const my = (n.y / 730) * 96;

              return (
                <div
                  key={n.id}
                  style={{ left: `${mx}px`, top: `${my}px` }}
                  className={`absolute w-2 h-2 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                    n.status === 'running'
                      ? 'bg-[#7C72D8] animate-ping'
                      : n.status === 'waiting_approval'
                      ? 'bg-[#D5A45C]'
                      : n.status === 'failed'
                      ? 'bg-[#D98282]'
                      : n.status === 'completed'
                      ? 'bg-[#79A98A]'
                      : 'bg-[#918C83]/40'
                  }`}
                />
              );
            })}

            {/* Viewport Indicator */}
            <div
              style={{
                left: `${Math.max(10 - pan.x * 0.08, 0)}px`,
                top: `${Math.max(10 - pan.y * 0.08, 0)}px`,
                width: `${Math.min(90 / zoom, 140)}px`,
                height: `${Math.min(60 / zoom, 90)}px`,
              }}
              className="absolute border border-[#7C72D8]/70 bg-[#7C72D8]/10 rounded-xs pointer-events-none transition-all shadow-xs"
            />
          </div>
        </aside>
      </div>

      {/* 8. Live Event Stream & Collapsible Milestone Timeline (Section 12 & 16) */}
      <div className="mt-4 border-t border-white/70 pt-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-[#918C83]" />
            <span className="text-xs font-semibold text-[#292824]">Execution Milestone Timeline</span>
            <span className="text-[10px] font-mono text-[#918C83]">
              ({activityLog.slice(0, 8).length} recorded events)
            </span>
          </div>
          <button
            onClick={() => setIsTimelineCollapsed(!isTimelineCollapsed)}
            className="text-xs text-[#68645D] hover:text-[#292824] flex items-center gap-1 cursor-pointer"
          >
            <span>{isTimelineCollapsed ? 'Show Milestones' : 'Collapse'}</span>
            {isTimelineCollapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          </button>
        </div>

        {!isTimelineCollapsed && (
          <div className="mt-2.5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 text-xs animate-in fade-in">
            {activityLog.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-2.5 rounded-xl bg-white/50 border border-white/80 space-y-0.5 shadow-2xs backdrop-blur-xs"
              >
                <div className="flex items-center justify-between text-[10px] font-mono text-[#918C83]">
                  <span className="capitalize text-[#7C72D8] font-semibold">{log.type}</span>
                  <span>{log.timestamp}</span>
                </div>
                <div className="font-semibold text-[#292824] truncate">
                  {log.title}
                </div>
                {log.detail && (
                  <p className="text-[11px] text-[#68645D] line-clamp-1 leading-snug">
                    {log.detail}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 9. Interactive Node Detail Modal (Section 4) */}
      {selectedNode && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="node-details-title"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#292824]/30 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="glass max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-white/70 pb-3">
              <div className="flex items-center gap-3">
                <div
                  style={{
                    backgroundColor: selectedNode.colorTheme.bgSubtle,
                    borderColor: selectedNode.colorTheme.borderSubtle,
                  }}
                  className="w-10 h-10 rounded-2xl border flex items-center justify-center shadow-2xs"
                >
                  {getNodeIcon(selectedNode.type)}
                </div>
                <div>
                  <h3 id="node-details-title" className="text-base font-bold text-[#292824]">
                    {selectedNode.title}
                  </h3>
                  <div className="text-xs text-[#68645D]">{selectedNode.category}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                aria-label="Close details"
                className="p-1.5 rounded-xl hover:bg-white text-[#918C83] hover:text-[#292824] cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Status & Metrics */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-white/60 border border-white">
                <span className="text-[10px] text-[#918C83] font-mono">STATUS</span>
                <div className="mt-1 font-semibold text-xs capitalize text-[#292824]">
                  {selectedNode.status.replace('_', ' ')}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-white/60 border border-white">
                <span className="text-[10px] text-[#918C83] font-mono">CONFIDENCE SCORE</span>
                <div className="mt-1 font-mono font-bold text-sm text-[#7C72D8]">
                  {selectedNode.confidenceScore || 95}% Quality
                </div>
              </div>
            </div>

            {/* Description & Operational Role */}
            <div className="space-y-1 text-xs">
              <span className="font-semibold text-[#292824]">Operational Role</span>
              <p className="text-[#68645D] leading-relaxed">
                {selectedNode.description}
              </p>
            </div>

            {/* Last Action & Next Step */}
            <div className="p-3.5 rounded-2xl bg-white/60 border border-[#EBE4D8] space-y-2 text-xs">
              <div>
                <span className="font-semibold text-[#292824]">Last Action: </span>
                <span className="text-[#68645D]">{selectedNode.lastAction || 'Initialized in deterministic parameters'}</span>
              </div>
              <div>
                <span className="font-semibold text-[#292824]">Next Step: </span>
                <span className="text-[#68645D]">{selectedNode.nextAction || 'Awaiting supervisor execution trigger'}</span>
              </div>
              {selectedNode.toolName && (
                <div className="pt-1 border-t border-[#EBE4D8] text-[11px] font-mono text-[#7C72D8] flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  Bound Sandboxed Tool: {selectedNode.toolName}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex items-center justify-between gap-2 text-xs">
              <button
                onClick={() => {
                  setFocusModeNodeId(selectedNode.id);
                  setSelectedNode(null);
                }}
                className="liquid-button text-xs py-2 px-3 flex items-center gap-1.5"
              >
                <Crosshair className="w-3.5 h-3.5 text-[#7C72D8]" />
                <span>Focus Pipeline</span>
              </button>

              <div className="flex items-center gap-2">
                {selectedNode.type === 'approval' && selectedNode.status === 'waiting_approval' && (
                  <>
                    <button
                      onClick={() => {
                        onApprove();
                        setSelectedNode(null);
                      }}
                      className="liquid-button primary text-xs py-2 px-4 shadow-sm"
                    >
                      Approve & Continue
                    </button>
                    <button
                      onClick={() => {
                        onReject();
                        setSelectedNode(null);
                      }}
                      className="liquid-button danger text-xs py-2 px-3"
                    >
                      Reject Action
                    </button>
                  </>
                )}
                {selectedNode.type === 'deliverable' && (
                  <button
                    onClick={() => {
                      setSelectedNode(null);
                      if (onNavigateToDeliverable) onNavigateToDeliverable();
                    }}
                    className="liquid-button primary text-xs py-2 px-4"
                  >
                    View Final Deliverable
                  </button>
                )}
                {selectedNode.associatedTaskId && onSelectTask && (
                  <button
                    onClick={() => {
                      onSelectTask(selectedNode.associatedTaskId!);
                      setSelectedNode(null);
                    }}
                    className="liquid-button text-xs py-2 px-3"
                  >
                    Inspect Task Plan
                  </button>
                )}
                <button
                  onClick={() => setSelectedNode(null)}
                  className="liquid-button text-xs py-2 px-3.5"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
