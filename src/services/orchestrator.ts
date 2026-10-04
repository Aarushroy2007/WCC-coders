/**
 * Aegis Agent OS - Central Orchestrator & State Machine
 */

import {
  AgentPhase,
  AgentRole,
  ActivityLogItem,
  FinalDeliverable,
  MemoryItem,
  PermissionRule,
  Task,
  TaskApproval,
  ToolInvocation,
  ControlFactor,
  ReliabilityFactor,
} from '../types/agent';
import { executeToolCall, SYSTEM_TOOLS } from './tools';
import {
  getEdTechScenarioTasks,
  getEdTechDeliverable,
  generateDynamicPlan,
  INITIAL_MEMORIES,
} from './mockScenarios';

export interface OrchestratorState {
  objective: string;
  phase: AgentPhase;
  tasks: Task[];
  activeTaskId: string | null;
  activeAgent: AgentRole | null;
  activeTool: string | null;
  toolInvocations: ToolInvocation[];
  activityLog: ActivityLogItem[];
  memories: MemoryItem[];
  permissions: PermissionRule[];
  executionTimeSeconds: number;
  simulationMode: boolean;
  autonomyLevel: 'supervised' | 'balanced' | 'autonomous';
  verificationThreshold: number; // e.g. 85
  pendingApproval: { taskId: string; approval: TaskApproval } | null;
  activeRecovery: {
    problem: string;
    response: string;
    recoveryStrategy: string;
    humanInterventionRequired: boolean;
    taskId: string;
  } | null;
  deliverable: FinalDeliverable | null;
  controlScore: number;
  reliabilityScore: number;
  controlFactors: ControlFactor[];
  reliabilityFactors: ReliabilityFactor[];
}

export const INITIAL_PERMISSIONS: PermissionRule[] = [
  {
    capabilityId: 'web_search',
    capabilityName: 'Web Search & External Index',
    description: 'Query search engines, public documentation, and news repositories.',
    riskLevel: 'medium',
    setting: 'always_allow',
  },
  {
    capabilityId: 'data_analyzer',
    capabilityName: 'Data Analytics & Statistics',
    description: 'Process numeric datasets, compute statistical trends, and correlations.',
    riskLevel: 'low',
    setting: 'always_allow',
  },
  {
    capabilityId: 'document_generator',
    capabilityName: 'Executive Document Drafting',
    description: 'Compile reports, synthesis documents, and structured deliverables.',
    riskLevel: 'low',
    setting: 'always_allow',
  },
  {
    capabilityId: 'code_interpreter',
    capabilityName: 'Sandboxed Code Execution',
    description: 'Execute isolated Python or TypeScript scripts for data parsing.',
    riskLevel: 'medium',
    setting: 'ask_every_time',
  },
  {
    capabilityId: 'database_query',
    capabilityName: 'Relational Database Queries',
    description: 'Query enterprise database tables, audit records, and internal caches.',
    riskLevel: 'medium',
    setting: 'ask_every_time',
  },
  {
    capabilityId: 'publish_deliverable',
    capabilityName: 'Publish & Final Deliverable Sign-Off',
    description: 'Sign off external strategy recommendations and financial ROI numbers.',
    riskLevel: 'high',
    setting: 'ask_every_time',
  },
  {
    capabilityId: 'external_api',
    capabilityName: 'Unrestricted External APIs',
    description: 'Perform mutations or trigger webhooks against third-party endpoints.',
    riskLevel: 'high',
    setting: 'never_allow',
  },
];

class OrchestratorService {
  private state: OrchestratorState;
  private listeners: Set<(state: OrchestratorState) => void> = new Set();
  private timerInterval: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;
  private cancelExecution: boolean = false;

  constructor() {
    this.state = {
      objective: 'Research the best AI tools for creating educational videos, compare them across pedagogical criteria, calculate ROI, verify findings, and prepare an executive recommendation.',
      phase: 'idle',
      tasks: getEdTechScenarioTasks(),
      activeTaskId: null,
      activeAgent: null,
      activeTool: null,
      toolInvocations: [],
      activityLog: [
        {
          id: 'log-init',
          timestamp: new Date().toLocaleTimeString(),
          type: 'info',
          title: 'Aegis Agent OS Initialized',
          detail: 'System ready. 7 specialized agents standing by. Human-in-the-loop governance active.',
        },
      ],
      memories: [...INITIAL_MEMORIES],
      permissions: [...INITIAL_PERMISSIONS],
      executionTimeSeconds: 0,
      simulationMode: false,
      autonomyLevel: 'balanced',
      verificationThreshold: 85,
      pendingApproval: null,
      activeRecovery: null,
      deliverable: null,
      controlScore: 96,
      reliabilityScore: 94,
      controlFactors: [
        { name: 'Approval Gate Compliance', score: 100, weight: 0.35, description: 'All high-risk actions paused for explicit human review.' },
        { name: 'Permission Enforcement', score: 100, weight: 0.25, description: 'Blocked capabilities (External API mutations) strictly sealed.' },
        { name: 'Override & Stop Availability', score: 100, weight: 0.20, description: 'Emergency Stop accessible in all phases without latency.' },
        { name: 'Human Review Checkpoints', score: 85, weight: 0.20, description: '1 explicit gate + interactive task modification enabled.' },
      ],
      reliabilityFactors: [
        { name: 'Task Completion Rate', score: 100, weight: 0.35, description: 'All assigned tasks finished with verified outputs.' },
        { name: 'Autonomous Error Recovery', score: 92, weight: 0.25, description: 'Network timeout resolved via automated fallback query.' },
        { name: 'Verification Quality Score', score: 96, weight: 0.25, description: 'Comprehensive 4-vector quality scorecard passed.' },
        { name: 'Execution Determinism', score: 88, weight: 0.15, description: 'Zero unconstrained hallucinations or scope drift.' },
      ],
    };
  }

  public getState(): OrchestratorState {
    return this.state;
  }

  public subscribe(listener: (state: OrchestratorState) => void): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.recalculateScores();
    this.listeners.forEach((listener) => listener({ ...this.state }));
  }

  private startTimer(): void {
    if (!this.timerInterval) {
      this.timerInterval = setInterval(() => {
        if (this.state.phase === 'executing' || this.state.phase === 'thinking' || this.state.phase === 'planning' || this.state.phase === 'verifying') {
          this.state.executionTimeSeconds += 1;
          this.notify();
        }
      }, 1000);
    }
  }

  private stopTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  private addLog(
    type: ActivityLogItem['type'],
    title: string,
    detail?: string,
    agentRole?: AgentRole,
    taskId?: string,
    metadata?: Record<string, any>
  ): void {
    const item: ActivityLogItem = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      title,
      detail,
      agentRole,
      taskId,
      metadata,
    };
    this.state.activityLog = [item, ...this.state.activityLog];
  }

  public setObjective(newObjective: string): void {
    this.state.objective = newObjective.trim();
    this.state.phase = 'idle';
    this.state.activeTaskId = null;
    this.state.activeAgent = null;
    this.state.activeTool = null;
    this.state.pendingApproval = null;
    this.state.activeRecovery = null;
    this.state.deliverable = null;
    this.state.executionTimeSeconds = 0;

    // Generate dynamic tasks based on custom goal
    if (newObjective.toLowerCase().includes('educational video') || newObjective.toLowerCase().includes('edtech')) {
      this.state.tasks = getEdTechScenarioTasks();
    } else {
      this.state.tasks = generateDynamicPlan(newObjective);
    }

    this.addLog('goal', 'Objective Updated', `User set target goal: "${this.state.objective}"`);
    this.notify();
  }

  public setSimulationMode(enabled: boolean): void {
    this.state.simulationMode = enabled;
    this.addLog(
      'info',
      enabled ? 'Simulation Mode Activated' : 'Live Execution Mode Activated',
      enabled
        ? 'Dry run enabled: Workflow will validate graph and tool paths without mutating live environments.'
        : 'Full operational mode ready.'
    );
    this.notify();
  }

  public setAutonomyLevel(level: 'supervised' | 'balanced' | 'autonomous'): void {
    this.state.autonomyLevel = level;
    this.addLog('info', 'Autonomy Level Changed', `Configured to: ${level.toUpperCase()}`);
    this.notify();
  }

  public setVerificationThreshold(val: number): void {
    this.state.verificationThreshold = val;
    this.notify();
  }

  /**
   * Start or Run the full Autonomous Workflow
   */
  public async runWorkflow(): Promise<void> {
    if (this.isRunning) return;
    this.isRunning = true;
    this.cancelExecution = false;
    this.startTimer();

    // If starting fresh or from idle
    if (this.state.phase === 'idle' || this.state.phase === 'completed' || this.state.phase === 'stopped') {
      this.state.executionTimeSeconds = 0;
      this.state.deliverable = null;
      this.state.pendingApproval = null;
      this.state.activeRecovery = null;
      // Reset task statuses
      this.state.tasks = this.state.tasks.map((t) => ({
        ...t,
        status: 'pending',
        progress: 0,
        result: undefined,
        verification: undefined,
        error: undefined,
        approval: t.approval ? { ...t.approval, status: 'pending' } : undefined,
      }));

      // Phase 1: Thinking & Understanding
      this.state.phase = 'thinking';
      this.state.activeAgent = 'supervisor';
      this.addLog('agent', 'Supervisor Agent Activated', 'Deconstructing natural-language goal into deterministic constraints.', 'supervisor');
      this.notify();
      await this.sleep(900);
      if (this.cancelExecution) return;

      // Phase 2: Planning
      this.state.phase = 'planning';
      this.state.activeAgent = 'planner';
      this.addLog('plan', 'Planning Agent Activated', 'Constructing topological task graph with 9 execution stages and 1 approval gate.', 'planner');
      this.notify();
      await this.sleep(1000);
      if (this.cancelExecution) return;
    }

    // Phase 3: Executing Tasks in sequence
    this.state.phase = 'executing';
    this.notify();

    for (let i = 0; i < this.state.tasks.length; i++) {
      if (this.cancelExecution) {
        this.isRunning = false;
        return;
      }

      const task = this.state.tasks[i];
      if (task.status === 'completed' || task.status === 'skipped') {
        continue;
      }

      this.state.activeTaskId = task.id;
      this.state.activeAgent = task.assignedAgent;
      this.state.activeTool = task.requiredTool;
      task.status = 'in_progress';
      task.progress = 25;
      this.addLog(
        'agent',
        `${this.formatAgentName(task.assignedAgent)} Activated: ${task.title}`,
        `Task #${task.order} initiated using tool: ${task.requiredTool}`,
        task.assignedAgent,
        task.id
      );
      this.notify();
      await this.sleep(600);
      if (this.cancelExecution) return;

      // Check for Permission Gate or Human Approval
      const permission = this.state.permissions.find((p) => p.capabilityId === task.requiredTool);
      const isHighRisk = task.riskLevel === 'high' || task.approval?.required;
      const requiresPermissionApproval = permission?.setting === 'ask_every_time' && isHighRisk;

      if ((isHighRisk || requiresPermissionApproval) && task.approval && task.approval.status === 'pending') {
        // Halt and require human approval
        this.state.phase = 'waiting_approval';
        task.status = 'waiting_approval';
        this.state.pendingApproval = { taskId: task.id, approval: task.approval };
        this.addLog(
          'approval',
          'Human Approval Gate Triggered',
          `Task "${task.title}" requires human confirmation. Reason: ${task.approval.reason}`,
          task.assignedAgent,
          task.id
        );
        this.notify();
        this.isRunning = false;
        return; // Pauses until user clicks Approve in UI
      }

      // Special demonstration: On Task 3 of demo (Web Search), simulate a transient network timeout
      // to demonstrate the Self-Correction & Recovery Engine!
      const isDemoSearch = task.id === 'task-03';
      if (isDemoSearch && !task.error) {
        // Simulate failure first!
        task.progress = 40;
        this.addLog('tool', 'Executing Web Search', 'Querying index for: "AI educational video platforms 2026"', 'researcher', task.id);
        const failedCall = await executeToolCall(task.requiredTool, task.id, task.title, { query: 'AI educational video platforms 2026' }, true);
        this.state.toolInvocations = [failedCall, ...this.state.toolInvocations];

        task.status = 'failed';
        task.error = {
          message: 'Upstream search gateway timeout (504). Primary API endpoint unresponsive.',
          code: 'ERR_SEARCH_TIMEOUT',
          recoverable: true,
          retryCount: 1,
          maxRetries: 3,
          recoveryStrategy: 'Switch to Knowledge Base & Secondary Mirror Query with automated retry.',
          timestamp: new Date().toLocaleTimeString(),
        };

        this.state.activeRecovery = {
          problem: 'Primary Web Search API gateway timeout after 5000ms threshold.',
          response: 'Recovery Agent detected transient network failure. Switching to verified mirror index.',
          recoveryStrategy: 'Dynamic fallback to Knowledge Base vector cache & retry query with exponential backoff.',
          humanInterventionRequired: false,
          taskId: task.id,
        };

        this.addLog(
          'recovery',
          'Self-Correction Activated: Tool Failure Detected',
          'Web Search failed (timeout). Recovery Agent engaged fallback index without halting pipeline.',
          'recovery',
          task.id
        );
        this.notify();
        await this.sleep(1400);
        if (this.cancelExecution) return;

        // Auto-heal recovery!
        this.state.activeRecovery = null;
        task.status = 'recovered';
        this.addLog(
          'success',
          'Self-Correction Succeeded: Recovery Complete',
          'Secondary mirror successfully returned 18 discovered sources and 8 verified candidate platforms.',
          'recovery',
          task.id
        );
      }

      // Execute Tool call
      task.progress = 75;
      const toolCall = await executeToolCall(task.requiredTool, task.id, task.title, {
        taskName: task.title,
        query: 'AI educational tools pedagogical benchmarks 2026',
        sampleSize: 42,
      });
      this.state.toolInvocations = [toolCall, ...this.state.toolInvocations];
      this.addLog('tool', `Tool Completed: ${toolCall.toolName}`, `Execution latency: ${toolCall.durationMs}ms`, task.assignedAgent, task.id);

      task.actualDurationMs = toolCall.durationMs;
      task.progress = 100;
      task.status = 'completed';

      // Set Task Result
      task.result = {
        summary: `Successfully executed ${task.title}. Verified criteria against empirical benchmark datasets.`,
        keyPoints: [
          'Evaluated candidates against Bloom taxonomy & engagement metrics',
          'Normalized multi-variate scores across 18 pedagogical vectors',
          'Citations cross-referenced with institutional compliance catalog',
        ],
        data: toolCall.output,
      };

      // Task Verification
      task.verification = {
        accuracy: 94 + Math.floor(Math.random() * 5),
        completeness: 95 + Math.floor(Math.random() * 5),
        relevance: 96 + Math.floor(Math.random() * 4),
        consistency: 93 + Math.floor(Math.random() * 6),
        quality: 95,
        overall: 95,
        feedback: 'Output matches scope specifications with zero internal contradictions.',
        verifiedAt: new Date().toLocaleTimeString(),
        passed: true,
      };

      this.notify();
      await this.sleep(700);
      if (this.cancelExecution) return;
    }

    // Phase 4: Final Verification Phase
    this.state.phase = 'verifying';
    this.state.activeAgent = 'verifier';
    this.state.activeTaskId = null;
    this.addLog('verification', 'Verification Agent Activated', 'Performing comprehensive 4-vector quality scorecard audit across all deliverables.', 'verifier');
    this.notify();
    await this.sleep(1200);
    if (this.cancelExecution) return;

    // Phase 5: Complete & Generate Final Deliverable
    this.state.phase = 'completed';
    this.state.activeAgent = 'supervisor';
    this.state.activeTool = null;
    this.state.deliverable = getEdTechDeliverable(this.state.executionTimeSeconds);
    this.stopTimer();

    this.addLog(
      'success',
      'Autonomous Workflow Successfully Completed',
      'All tasks verified. Final deliverable compiled and ready for review and export.',
      'supervisor'
    );
    this.isRunning = false;
    this.notify();
  }

  /**
   * Human Approval Actions
   */
  public approvePendingAction(): void {
    if (!this.state.pendingApproval) return;
    const { taskId } = this.state.pendingApproval;
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (task && task.approval) {
      task.approval.status = 'approved';
      task.approval.resolvedAt = new Date().toLocaleTimeString();
      task.approval.resolvedBy = 'human';
      task.status = 'completed';
      task.progress = 100;
      task.result = {
        summary: 'Human operator granted explicit approval. Recommended strategy authorized for final synthesis.',
      };
      this.addLog('approval', 'Human Approval Granted', `Operator approved task #${task.order}: "${task.title}".`, 'supervisor', task.id);
    }
    this.state.pendingApproval = null;
    this.state.phase = 'executing';
    this.notify();

    // Resume execution loop
    setTimeout(() => {
      this.runWorkflow();
    }, 400);
  }

  public rejectPendingAction(reason: string = 'Rejected by human operator.'): void {
    if (!this.state.pendingApproval) return;
    const { taskId } = this.state.pendingApproval;
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (task && task.approval) {
      task.approval.status = 'rejected';
      task.approval.resolvedAt = new Date().toLocaleTimeString();
      task.approval.resolvedBy = 'human';
      task.status = 'skipped';
      this.addLog('approval', 'Human Approval Rejected', `Action halted by operator. Reason: ${reason}`, 'supervisor', task.id);
    }
    this.state.pendingApproval = null;
    this.state.phase = 'paused';
    this.isRunning = false;
    this.stopTimer();
    this.notify();
  }

  /**
   * Emergency Stop: Immediately halts active operations
   */
  public emergencyStop(): void {
    this.cancelExecution = true;
    this.isRunning = false;
    this.stopTimer();
    this.state.phase = 'stopped';
    this.state.activeAgent = null;
    this.state.activeTool = null;
    this.addLog('warning', 'EMERGENCY STOP TRIGGERED', 'All active tasks stopped immediately. Tool calls aborted. Execution state frozen.', 'supervisor');
    this.notify();
  }

  public pauseWorkflow(): void {
    this.cancelExecution = true;
    this.isRunning = false;
    this.stopTimer();
    this.state.phase = 'paused';
    this.addLog('info', 'Workflow Paused', 'Execution paused by human operator.');
    this.notify();
  }

  public resumeWorkflow(): void {
    if (this.state.phase === 'paused' || this.state.phase === 'stopped') {
      this.cancelExecution = false;
      this.runWorkflow();
    }
  }

  public stepWorkflow(): void {
    // Execute a single pending step
    const nextTask = this.state.tasks.find((t) => t.status === 'pending');
    if (!nextTask) return;
    this.runWorkflow();
  }

  public restartFailedTask(taskId: string): void {
    const task = this.state.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'pending';
      task.error = undefined;
      task.progress = 0;
      this.addLog('info', `Task #${task.order} Reset`, `Queued for re-execution: "${task.title}".`);
      this.notify();
    }
  }

  public modifyTask(taskId: string, updates: Partial<Task>): void {
    this.state.tasks = this.state.tasks.map((t) => {
      if (t.id === taskId) {
        return { ...t, ...updates };
      }
      return t;
    });
    this.addLog('info', 'Task Modified by Human', `Updated task configuration for ID: ${taskId}`);
    this.notify();
  }

  public updatePermission(capabilityId: string, setting: PermissionRule['setting']): void {
    this.state.permissions = this.state.permissions.map((p) => {
      if (p.capabilityId === capabilityId) {
        return { ...p, setting };
      }
      return p;
    });
    this.addLog('info', 'Governance Policy Updated', `Permission for "${capabilityId}" set to: ${setting}`);
    this.notify();
  }

  public addMemory(content: string, type: MemoryItem['type']): void {
    const item: MemoryItem = {
      id: `mem-${Date.now()}`,
      type,
      content,
      source: 'Human Operator Input',
      timestamp: new Date().toLocaleTimeString(),
      confidence: 100,
      relevance: 95,
    };
    this.state.memories = [item, ...this.state.memories];
    this.addLog('info', 'Memory Added', `New ${type.replace('_', ' ')} recorded.`);
    this.notify();
  }

  public deleteMemory(id: string): void {
    this.state.memories = this.state.memories.filter((m) => m.id !== id);
    this.notify();
  }

  public clearMemories(): void {
    this.state.memories = [];
    this.addLog('warning', 'Memory Wiped', 'Agent memory buffers cleared by user.');
    this.notify();
  }

  private recalculateScores(): void {
    // Dynamic Human Control Score calculation
    const hasActiveStop = this.state.phase === 'stopped' ? 100 : 100;
    const approvals = this.state.tasks.filter((t) => t.approval?.required);
    const approvedCount = approvals.filter((t) => t.approval?.status === 'approved' || t.approval?.status === 'rejected').length;
    const approvalRatio = approvals.length > 0 ? (approvedCount / approvals.length) * 100 : 100;
    const highRiskPoliciesActive = this.state.permissions.filter((p) => p.riskLevel === 'high' && p.setting !== 'always_allow').length;
    const permissionRatio = (highRiskPoliciesActive / 2) * 100;

    const control = Math.round(approvalRatio * 0.4 + permissionRatio * 0.3 + hasActiveStop * 0.3);
    this.state.controlScore = Math.min(100, Math.max(70, control));

    // Agent Reliability Score calculation
    const completedTasks = this.state.tasks.filter((t) => t.status === 'completed' || t.status === 'recovered').length;
    const totalTasks = this.state.tasks.length || 1;
    const completionRate = (completedTasks / totalTasks) * 100;
    const failedUnrecovered = this.state.tasks.filter((t) => t.status === 'failed').length;
    const penalty = failedUnrecovered * 15;

    const reliability = Math.round(completionRate * 0.6 + (100 - penalty) * 0.4);
    this.state.reliabilityScore = Math.min(99, Math.max(65, reliability));
  }

  private formatAgentName(role: AgentRole): string {
    switch (role) {
      case 'supervisor':
        return 'Supervisor Agent';
      case 'planner':
        return 'Planning Agent';
      case 'researcher':
        return 'Research Agent';
      case 'analyst':
        return 'Analysis Agent';
      case 'executor':
        return 'Execution Agent';
      case 'verifier':
        return 'Verification Agent';
      case 'recovery':
        return 'Recovery Agent';
      default:
        return 'Specialized Agent';
    }
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

export const orchestrator = new OrchestratorService();
