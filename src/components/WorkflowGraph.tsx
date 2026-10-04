/**
 * Aegis Agent OS - Interactive Multi-Agent Network & Workflow Graph (Warm Soft Palette)
 */

import React, { useState } from 'react';
import {
  AgentPhase,
  AgentRole,
  Task,
  TaskApproval,
  ActivityLogItem,
} from '../types/agent';
import {
  Users,
  Compass,
  Search,
  Zap,
  BarChart2,
  CheckCircle,
  RefreshCw,
  GitBranch,
  Network,
} from 'lucide-react';
import { WorkflowDisplay } from './WorkflowDisplay';

interface WorkflowGraphProps {
  activeAgent: string | null;
  tasks: Task[];
  objective?: string;
  phase?: AgentPhase;
  activeTaskId?: string | null;
  activeTool?: string | null;
  executionTimeSeconds?: number;
  pendingApproval?: { taskId: string; approval: TaskApproval } | null;
  activeRecovery?: {
    problem: string;
    response: string;
    recoveryStrategy: string;
    humanInterventionRequired: boolean;
    taskId: string;
  } | null;
  activityLog?: ActivityLogItem[];
  simulationMode?: boolean;
  onRunWorkflow?: () => void;
  onPauseWorkflow?: () => void;
  onResumeWorkflow?: () => void;
  onEmergencyStop?: () => void;
  onApprove?: () => void;
  onReject?: () => void;
  onRequestChanges?: (feedback?: string) => void;
  onSelectTask?: (taskId: string) => void;
  onNavigateToDeliverable?: () => void;
}

interface AgentNodeInfo {
  role: AgentRole;
  name: string;
  category: string;
  description: string;
  color: string;
  bgLight: string;
  borderLight: string;
  glowColor: string;
  x: number;
  y: number;
  icon: React.ReactNode;
}

export const WorkflowGraph: React.FC<WorkflowGraphProps> = ({
  activeAgent,
  tasks,
  objective = 'Research the best AI tools for creating educational videos, compare them, organize findings, and prepare an executive recommendation.',
  phase = 'idle',
  activeTaskId = null,
  activeTool = null,
  executionTimeSeconds = 0,
  pendingApproval = null,
  activeRecovery = null,
  activityLog = [],
  simulationMode = false,
  onRunWorkflow = () => {},
  onPauseWorkflow = () => {},
  onResumeWorkflow = () => {},
  onEmergencyStop = () => {},
  onApprove = () => {},
  onReject = () => {},
  onRequestChanges,
  onSelectTask,
  onNavigateToDeliverable,
}) => {
  const [selectedAgentRole, setSelectedAgentRole] = useState<AgentRole>('supervisor');
  const [activeSubView, setActiveSubView] = useState<'pipeline' | 'topology'>('pipeline');

  const agentNodes: AgentNodeInfo[] = [
    {
      role: 'supervisor',
      name: 'Supervisor Agent',
      category: 'Coordination & Intake',
      description: 'Deconstructs user objectives, maintains global state, decides next agent activations, and coordinates final deliverables.',
      color: '#7C72D8',
      bgLight: 'rgba(124, 114, 216, 0.12)',
      borderLight: 'rgba(124, 114, 216, 0.35)',
      glowColor: 'rgba(124, 114, 216, 0.25)',
      x: 50,
      y: 16,
      icon: <Users className="w-5 h-5" />,
    },
    {
      role: 'planner',
      name: 'Planning Agent',
      category: 'Topological Decomposition',
      description: 'Converts objectives into actionable dependency graphs, defines safety gates, and sets verification rubrics.',
      color: '#B7A9D6',
      bgLight: 'rgba(183, 169, 214, 0.18)',
      borderLight: 'rgba(183, 169, 214, 0.45)',
      glowColor: 'rgba(183, 169, 214, 0.30)',
      x: 20,
      y: 42,
      icon: <Compass className="w-5 h-5" />,
    },
    {
      role: 'researcher',
      name: 'Research Agent',
      category: 'Information Retrieval',
      description: 'Queries live search indexes, parses documentation, verifies citations, and extracts structured facts.',
      color: '#7F9DBB',
      bgLight: 'rgba(127, 157, 187, 0.18)',
      borderLight: 'rgba(127, 157, 187, 0.45)',
      glowColor: 'rgba(127, 157, 187, 0.30)',
      x: 50,
      y: 42,
      icon: <Search className="w-5 h-5" />,
    },
    {
      role: 'analyst',
      name: 'Analysis Agent',
      category: 'Synthesis & Modeling',
      description: 'Applies statistical normalization, multi-attribute scoring matrices, and financial projections.',
      color: '#E9A98F',
      bgLight: 'rgba(233, 169, 143, 0.18)',
      borderLight: 'rgba(233, 169, 143, 0.45)',
      glowColor: 'rgba(233, 169, 143, 0.30)',
      x: 80,
      y: 42,
      icon: <BarChart2 className="w-5 h-5" />,
    },
    {
      role: 'executor',
      name: 'Execution Agent',
      category: 'Tool Runtime',
      description: 'Executes approved actions with tools, performs calculations, and drafts intermediate documents.',
      color: '#7C72D8',
      bgLight: 'rgba(124, 114, 216, 0.16)',
      borderLight: 'rgba(124, 114, 216, 0.45)',
      glowColor: 'rgba(124, 114, 216, 0.30)',
      x: 35,
      y: 72,
      icon: <Zap className="w-5 h-5" />,
    },
    {
      role: 'recovery',
      name: 'Recovery Agent',
      category: 'Fault Tolerance',
      description: 'Monitors failures, calculates fallback strategies, switches tools, and replans without pipeline halt.',
      color: '#D98282',
      bgLight: 'rgba(217, 130, 130, 0.18)',
      borderLight: 'rgba(217, 130, 130, 0.45)',
      glowColor: 'rgba(217, 130, 130, 0.30)',
      x: 65,
      y: 72,
      icon: <RefreshCw className="w-5 h-5" />,
    },
    {
      role: 'verifier',
      name: 'Verification Agent',
      category: 'Quality Governance',
      description: 'Audits outputs against accuracy, completeness, relevance, and consistency rubrics before final delivery.',
      color: '#79A98A',
      bgLight: 'rgba(121, 169, 138, 0.20)',
      borderLight: 'rgba(121, 169, 138, 0.45)',
      glowColor: 'rgba(121, 169, 138, 0.30)',
      x: 50,
      y: 92,
      icon: <CheckCircle className="w-5 h-5" />,
    },
  ];

  // Connections in the agent network
  const edges = [
    { from: 'supervisor', to: 'planner' },
    { from: 'supervisor', to: 'researcher' },
    { from: 'supervisor', to: 'analyst' },
    { from: 'planner', to: 'executor' },
    { from: 'researcher', to: 'analyst' },
    { from: 'analyst', to: 'executor' },
    { from: 'executor', to: 'recovery' },
    { from: 'recovery', to: 'executor' },
    { from: 'executor', to: 'verifier' },
    { from: 'verifier', to: 'supervisor' },
  ];

  const selectedAgent = agentNodes.find((a) => a.role === selectedAgentRole) || agentNodes[0];
  const assignedTasks = tasks.filter((t) => t.assignedAgent === selectedAgentRole);

  return (
    <div className="space-y-6">
      {/* View Switcher Bar */}
      <div className="glass-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#918C83] font-mono">AGENT ARCHITECTURE & WORKFLOW</span>
          <h2 className="text-base sm:text-lg font-semibold text-[#292824] mt-0.5">
            {activeSubView === 'pipeline' ? 'Real-Time Execution Pipeline' : 'Multi-Agent Network Topology'}
          </h2>
          <p className="text-xs text-[#68645D] mt-0.5">
            {activeSubView === 'pipeline'
              ? 'Interactive execution graph tracking data flow, tool usage, verification, and human checkpoints.'
              : 'Structural network layout depicting inter-agent communication protocols and fallback recovery paths.'}
          </p>
        </div>

        {/* View Toggle Buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 shadow-2xs self-start sm:self-auto text-xs">
          <button
            onClick={() => setActiveSubView('pipeline')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              activeSubView === 'pipeline'
                ? 'bg-white text-[#292824] font-semibold shadow-xs border border-white/90'
                : 'text-[#68645D] hover:text-[#292824]'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5 text-[#7C72D8]" />
            <span>Execution Pipeline</span>
          </button>
          <button
            onClick={() => setActiveSubView('topology')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-medium transition-all cursor-pointer ${
              activeSubView === 'topology'
                ? 'bg-white text-[#292824] font-semibold shadow-xs border border-white/90'
                : 'text-[#68645D] hover:text-[#292824]'
            }`}
          >
            <Network className="w-3.5 h-3.5 text-[#79A98A]" />
            <span>Agent Topology</span>
          </button>
        </div>
      </div>

      {/* VIEW 1: Full-Featured Live Execution Pipeline */}
      {activeSubView === 'pipeline' && (
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
          onSelectTask={onSelectTask}
          onNavigateToDeliverable={onNavigateToDeliverable}
        />
      )}

      {/* VIEW 2: Multi-Agent Network Topology Graph */}
      {activeSubView === 'topology' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Left 2 Cols: SVG Graph Canvas */}
          <div className="lg:col-span-2 glass-card relative overflow-hidden min-h-[480px] flex items-center justify-center">
            {/* Subtle warm champagne grid backdrop */}
            <div className="absolute inset-0 bg-[radial-gradient(#E8DFC8_1px,transparent_1px)] [background-size:20px_20px] opacity-45 pointer-events-none" />

            {/* SVG Connection Lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {edges.map((edge, idx) => {
                const fromNode = agentNodes.find((n) => n.role === edge.from);
                const toNode = agentNodes.find((n) => n.role === edge.to);
                if (!fromNode || !toNode) return null;

                const isEdgeActive = activeAgent === edge.from || activeAgent === edge.to;

                return (
                  <line
                    key={idx}
                    x1={`${fromNode.x}%`}
                    y1={`${fromNode.y}%`}
                    x2={`${toNode.x}%`}
                    y2={`${toNode.y}%`}
                    stroke={isEdgeActive ? '#7C72D8' : 'rgba(225, 218, 205, 0.65)'}
                    strokeWidth={isEdgeActive ? 2 : 1}
                    strokeDasharray={edge.from === 'recovery' || edge.to === 'recovery' ? '4,4' : undefined}
                    className="transition-colors duration-500"
                  />
                );
              })}
            </svg>

            {/* Interactive Agent Nodes */}
            <div className="relative w-full h-full min-h-[440px]">
              {agentNodes.map((node) => {
                const isActive = activeAgent === node.role;
                const isSelected = selectedAgentRole === node.role;
                const taskCount = tasks.filter((t) => t.assignedAgent === node.role).length;

                return (
                  <div
                    key={node.role}
                    onClick={() => setSelectedAgentRole(node.role)}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    className={`absolute z-10 flex flex-col items-center cursor-pointer transition-all duration-300 group`}
                  >
                    <div
                      style={{
                        borderColor: isSelected ? node.color : isActive ? node.borderLight : 'rgba(255, 255, 255, 0.95)',
                        boxShadow: isSelected
                          ? `0 10px 25px ${node.glowColor}`
                          : isActive
                          ? `0 0 0 4px ${node.glowColor}, 0 8px 20px rgba(70,56,42,0.06)`
                          : '0 4px 14px rgba(70, 56, 42, 0.04)',
                      }}
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center border transition-all ${
                        isSelected
                          ? 'text-white scale-110'
                          : isActive
                          ? 'animate-pulse'
                          : 'hover:scale-105'
                      }`}
                    >
                      <div
                        style={{
                          backgroundColor: isSelected ? node.color : node.bgLight,
                          color: isSelected ? '#FFFFFF' : node.color,
                        }}
                        className="w-full h-full rounded-2xl flex items-center justify-center backdrop-blur-md transition-colors"
                      >
                        {node.icon}
                      </div>
                    </div>

                    <span
                      className={`mt-2 text-xs font-semibold tracking-tight whitespace-nowrap px-2.5 py-0.5 rounded-full transition-colors ${
                        isSelected
                          ? 'text-[#292824] font-bold bg-white/90 shadow-2xs'
                          : 'text-[#68645D] group-hover:text-[#292824]'
                      }`}
                    >
                      {node.name.replace(' Agent', '')}
                    </span>

                    {taskCount > 0 && (
                      <span className="text-[10px] font-mono text-[#918C83]">
                        {taskCount} task{taskCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Selected Agent Inspector */}
          <div className="glass-card space-y-4">
            <div className="flex items-start justify-between border-b border-white/60 pb-3">
              <div>
                <span className="text-[10px] font-mono text-[#918C83]">NODE INSPECTOR</span>
                <h3 className="text-base font-semibold text-[#292824] mt-0.5">
                  {selectedAgent.name}
                </h3>
                <span className="text-xs text-[#68645D]">{selectedAgent.category}</span>
              </div>
              <span
                style={{
                  backgroundColor: selectedAgent.bgLight,
                  borderColor: selectedAgent.borderLight,
                  color: selectedAgent.color,
                }}
                className="text-xs px-2.5 py-1 rounded-full font-semibold border"
              >
                {activeAgent === selectedAgent.role ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-[#292824]">Operational Role</span>
              <p className="text-xs text-[#68645D] leading-relaxed">
                {selectedAgent.description}
              </p>
            </div>

            <div className="border-t border-white/60 pt-3 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#292824]">
                  Assigned Tasks ({assignedTasks.length})
                </span>
                <span className="text-[11px] font-mono text-[#918C83]">Pipeline stages</span>
              </div>

              {assignedTasks.length > 0 ? (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {assignedTasks.map((t) => (
                    <div
                      key={t.id}
                      className="p-3 rounded-xl border border-white/80 bg-white/50 text-xs space-y-1 backdrop-blur-xs shadow-2xs"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-medium text-[#292824] truncate">
                          #{t.order}. {t.title}
                        </span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                            t.status === 'completed'
                              ? 'text-[#4E765D] bg-[#79A98A]/15 border border-[#79A98A]/25'
                              : t.status === 'in_progress'
                              ? 'text-[#8C6D2D] bg-[#D5A45C]/15 border border-[#D5A45C]/25'
                              : 'text-[#918C83] bg-white/70'
                          }`}
                        >
                          {t.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-[#68645D]">
                        <span>Tool: {t.requiredTool.replace('_', ' ')}</span>
                        <span>·</span>
                        <span>Risk: {t.riskLevel}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-[#918C83] italic py-2">
                  No active tasks assigned to this specialized agent in current workflow.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
