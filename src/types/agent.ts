/**
 * Aegis Agent OS - Core Type Definitions
 */

export type AgentRole =
  | 'supervisor'
  | 'planner'
  | 'researcher'
  | 'executor'
  | 'analyst'
  | 'verifier'
  | 'recovery';

export type AgentPhase =
  | 'idle'
  | 'thinking'
  | 'planning'
  | 'waiting_approval'
  | 'executing'
  | 'verifying'
  | 'completed'
  | 'paused'
  | 'stopped';

export type TaskStatus =
  | 'pending'
  | 'in_progress'
  | 'waiting_approval'
  | 'completed'
  | 'failed'
  | 'recovered'
  | 'skipped';

export type RiskLevel = 'low' | 'medium' | 'high';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'auto_approved';

export type Priority = 'critical' | 'high' | 'medium' | 'low';

export interface ReasoningSummary {
  decision: string;
  why: string;
  evidence: string;
  confidence: 'high' | 'moderate' | 'low';
  confidenceScore: number; // 0-100
  nextAction: string;
  factors: string[];
}

export interface VerificationScorecard {
  accuracy: number;     // 0-100
  completeness: number; // 0-100
  relevance: number;    // 0-100
  consistency: number;  // 0-100
  quality: number;      // 0-100
  overall: number;      // 0-100
  feedback: string;
  verifiedAt?: string;
  passed: boolean;
}

export interface TaskError {
  message: string;
  code?: string;
  recoverable: boolean;
  retryCount: number;
  maxRetries: number;
  recoveryStrategy?: string;
  timestamp: string;
}

export interface TaskApproval {
  required: boolean;
  riskLevel: RiskLevel;
  status: ApprovalStatus;
  reason: string;
  requestedAction: string;
  consequences: string;
  timestamp?: string;
  resolvedAt?: string;
  resolvedBy?: 'human' | 'auto';
}

export interface Task {
  id: string;
  order: number;
  title: string;
  description: string;
  assignedAgent: AgentRole;
  requiredTool: string;
  riskLevel: RiskLevel;
  priority: Priority;
  dependencies: string[]; // task IDs
  estimatedDuration: string;
  actualDurationMs?: number;
  status: TaskStatus;
  progress: number; // 0-100
  reasoningSummary?: ReasoningSummary;
  result?: {
    summary: string;
    keyPoints?: string[];
    data?: any;
    artifacts?: string[];
  };
  verification?: VerificationScorecard;
  error?: TaskError;
  approval?: TaskApproval;
}

export interface ToolDefinition {
  id: string;
  name: string;
  description: string;
  category: 'search' | 'compute' | 'data' | 'generation' | 'storage' | 'inspection';
  riskLevel: RiskLevel;
  iconName: string;
  callsCount: number;
  lastUsed?: string;
  requiresPermission: boolean;
}

export interface ToolInvocation {
  id: string;
  taskId: string;
  taskTitle: string;
  toolId: string;
  toolName: string;
  timestamp: string;
  input: Record<string, any>;
  output: Record<string, any>;
  durationMs: number;
  status: 'success' | 'failed' | 'retried';
  error?: string;
}

export interface ActivityLogItem {
  id: string;
  timestamp: string;
  type: 'info' | 'goal' | 'plan' | 'agent' | 'tool' | 'approval' | 'verification' | 'recovery' | 'warning' | 'error' | 'success';
  agentRole?: AgentRole;
  taskId?: string;
  title: string;
  detail?: string;
  metadata?: Record<string, any>;
}

export interface MemoryItem {
  id: string;
  type: 'short_term' | 'working' | 'long_term';
  content: string;
  source: string;
  timestamp: string;
  confidence: number; // 0-100
  relevance: number;  // 0-100
  expiresAt?: string;
}

export interface PermissionRule {
  capabilityId: string;
  capabilityName: string;
  description: string;
  riskLevel: RiskLevel;
  setting: 'always_allow' | 'ask_every_time' | 'never_allow';
}

export interface ControlFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface ReliabilityFactor {
  name: string;
  score: number;
  weight: number;
  description: string;
}

export interface FinalDeliverable {
  objective: string;
  executiveSummary: string;
  keyFindings: string[];
  recommendations: {
    title: string;
    priority: 'Immediate' | 'Strategic' | 'Optional';
    effort: 'Low' | 'Medium' | 'High';
    description: string;
    impact: string;
  }[];
  comparisons?: {
    headers: string[];
    rows: {
      item: string;
      category: string;
      score: string;
      pros: string;
      cons: string;
      pricing: string;
    }[];
  };
  sources: {
    name: string;
    url: string;
    reliability: 'Tier 1 Academic/Gov' | 'Verified Industry Report' | 'Technical Benchmark' | 'Direct Vendor Spec';
    date: string;
  }[];
  verificationScorecard: VerificationScorecard;
  executionStats: {
    totalDurationSeconds: number;
    tasksTotal: number;
    tasksCompleted: number;
    toolsInvoked: number;
    approvalsRequested: number;
    approvalsGranted: number;
    recoveriesAttempted: number;
  };
}

export interface ScenarioPreset {
  id: string;
  title: string;
  category: string;
  objective: string;
  description: string;
  estimatedTasks: number;
  recommendedAutonomy: 'supervised' | 'balanced' | 'autonomous';
}
