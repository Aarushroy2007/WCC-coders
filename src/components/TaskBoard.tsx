/**
 * Aegis Agent OS - Dynamic Task Board & Dependency Pipeline (Liquid Glass Design)
 */

import React, { useState } from 'react';
import { Task, Priority } from '../types/agent';
import {
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from 'lucide-react';

interface TaskBoardProps {
  tasks: Task[];
  activeTaskId: string | null;
  onRestartTask: (taskId: string) => void;
  onModifyTask: (taskId: string, updates: Partial<Task>) => void;
  onApproveAction: () => void;
}

export const TaskBoard: React.FC<TaskBoardProps> = ({
  tasks,
  activeTaskId,
  onRestartTask,
  onModifyTask,
  onApproveAction,
}) => {
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(activeTaskId || tasks[0]?.id || null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const filteredTasks = tasks.filter((t) => {
    if (filterStatus === 'all') return true;
    if (filterStatus === 'completed') return t.status === 'completed' || t.status === 'recovered';
    if (filterStatus === 'pending') return t.status === 'pending';
    if (filterStatus === 'approval') return t.status === 'waiting_approval' || t.approval?.required;
    return true;
  });

  const getStatusBadge = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <span className="text-[#3B664C] bg-[#79A98A]/15 px-3 py-1 rounded-full text-xs font-semibold border border-[#79A98A]/30 shadow-2xs">Completed</span>;
      case 'recovered':
        return <span className="text-[#324C65] bg-[#7F9DBB]/15 px-3 py-1 rounded-full text-xs font-semibold border border-[#7F9DBB]/30 shadow-2xs">Self-Healed</span>;
      case 'in_progress':
        return <span className="text-[#8C6D2D] bg-[#D5A45C]/15 px-3 py-1 rounded-full text-xs font-semibold border border-[#D5A45C]/35 shadow-2xs animate-pulse">Working</span>;
      case 'waiting_approval':
        return <span className="text-[#8C6D2D] bg-[#FAF2E2] px-3 py-1 rounded-full text-xs font-semibold border border-[#D5A45C]/40 shadow-2xs">Needs Review</span>;
      case 'failed':
        return <span className="text-[#8C3B3B] bg-[#D98282]/15 px-3 py-1 rounded-full text-xs font-semibold border border-[#D98282]/30 shadow-2xs">Failed</span>;
      default:
        return <span className="text-[#57524A] bg-white/70 px-3 py-1 rounded-full text-xs font-medium border border-[#EBE4D8]">Pending</span>;
    }
  };

  const getPriorityBadge = (priority: Priority) => {
    switch (priority) {
      case 'critical':
        return <span className="text-[#8C3B3B] font-semibold text-xs tracking-tight">Critical</span>;
      case 'high':
        return <span className="text-[#8C6D2D] font-semibold text-xs tracking-tight">High</span>;
      default:
        return <span className="text-[#7D786F] font-medium text-xs capitalize">{priority}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Board Header & Segmented Filters */}
      <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="caption-meta">Execution Plan</span>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#201F1D] tracking-[-0.016em] mt-0.5">
            Topological Task Graph
          </h2>
          <p className="prose-secondary text-[#57524A] mt-1 max-w-[65ch]">
            Individual task stages assigned to specialized agents with explicit dependency bounds.
          </p>
        </div>

        {/* Segmented Filter Buttons in Glass */}
        <div className="flex items-center gap-1 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 text-xs font-medium self-start md:self-auto shadow-2xs">
          {['all', 'completed', 'pending', 'approval'].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3.5 py-1.5 rounded-xl transition-all capitalize cursor-pointer text-xs ${
                filterStatus === st
                  ? 'bg-white text-[#201F1D] shadow-xs font-semibold border border-white/90'
                  : 'text-[#57524A] hover:text-[#201F1D]'
              }`}
            >
              {st === 'approval' ? 'Needs Review' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Task List in Glass Cards */}
      <div className="space-y-3.5">
        {filteredTasks.map((task) => {
          const isExpanded = expandedTaskId === task.id;
          const isCurrentActive = activeTaskId === task.id;

          return (
            <div
              key={task.id}
              className={`glass transition-all duration-300 ${
                isCurrentActive
                  ? 'border-[#D5A45C]/50 shadow-md ring-2 ring-[#D5A45C]/20 bg-[#FAF7F0]/40'
                  : 'hover:border-white'
              }`}
            >
              {/* Task Header Row */}
              <div
                onClick={() => setExpandedTaskId(isExpanded ? null : task.id)}
                className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-mono text-xs font-bold shrink-0 shadow-2xs tabular-nums ${
                      task.status === 'completed' || task.status === 'recovered'
                        ? 'bg-gradient-to-tr from-[#7C72D8] to-[#8E85E2] text-white'
                        : isCurrentActive
                        ? 'bg-[#D5A45C] text-white animate-pulse'
                        : 'bg-white/80 text-[#201F1D] border border-white'
                    }`}
                  >
                    0{task.order}
                  </div>

                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm sm:text-[15px] font-semibold text-[#201F1D] truncate tracking-[-0.005em]">
                        {task.title}
                      </h3>
                      {task.approval?.required && (
                        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-[#8C6D2D] bg-[#FAF2E2] px-2 py-0.5 rounded-full border border-[#D5A45C]/40">
                          Review Gate
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-[#57524A]">
                      <span className="capitalize font-medium">{task.assignedAgent} Agent</span>
                      <span aria-hidden="true" className="text-[#7D786F]">·</span>
                      <span>Tool: {task.requiredTool.replace('_', ' ')}</span>
                      {task.dependencies.length > 0 && (
                        <>
                          <span aria-hidden="true" className="text-[#7D786F]">·</span>
                          <span className="text-[11px] text-[#7D786F] tabular-nums">
                            Deps: #{task.dependencies.join(', #').replace(/task-/g, '')}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {getStatusBadge(task.status)}
                  <span className="hidden sm:block text-xs font-mono text-[#7D786F] tabular-nums">
                    {task.actualDurationMs ? `${task.actualDurationMs}ms` : task.estimatedDuration}
                  </span>
                  {isExpanded ? (
                    <ChevronUp className="w-4 h-4 text-stone-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-stone-400" />
                  )}
                </div>
              </div>

              {/* Task Details Drawer */}
              {isExpanded && (
                <div className="px-5 pb-5 pt-2 border-t border-white/60 space-y-4 text-xs">
                  <p className="prose-body text-[#57524A] leading-relaxed max-w-[65ch]">
                    {task.description}
                  </p>

                  {/* Metadata Chips */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white/40 p-3.5 rounded-2xl border border-white/70 backdrop-blur-xs">
                    <div>
                      <span className="text-[11px] text-[#7D786F] font-medium">Risk Rating</span>
                      <p className="font-semibold text-[#201F1D] capitalize mt-0.5">{task.riskLevel}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#7D786F] font-medium">Priority</span>
                      <p className="font-semibold mt-0.5">{getPriorityBadge(task.priority)}</p>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#7D786F] font-medium">Estimated / Actual</span>
                      <p className="font-mono font-medium text-[#201F1D] mt-0.5 tabular-nums">
                        {task.actualDurationMs ? `${task.actualDurationMs}ms` : task.estimatedDuration}
                      </p>
                    </div>
                    <div>
                      <span className="text-[11px] text-[#7D786F] font-medium">Progress</span>
                      <p className="font-mono font-medium text-[#201F1D] mt-0.5 tabular-nums">{task.progress}%</p>
                    </div>
                  </div>

                  {/* Explainability Reasoning */}
                  {task.reasoningSummary && (
                    <div className="bg-white/60 rounded-2xl p-4 border border-[#EBE4D8] space-y-1.5 backdrop-blur-md">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[#201F1D]">Agent Reasoning</span>
                        <span className="text-[11px] font-mono text-[#3B664C] font-semibold bg-[#79A98A]/10 px-2.5 py-0.5 rounded-full border border-[#79A98A]/25 tabular-nums">
                          Confidence: {task.reasoningSummary.confidenceScore}%
                        </span>
                      </div>
                      <p className="text-[#57524A] leading-relaxed">
                        <span className="font-semibold text-[#201F1D]">Decision: </span>
                        {task.reasoningSummary.decision}
                      </p>
                      <p className="text-[#57524A] leading-relaxed">
                        <span className="font-semibold text-[#201F1D]">Why: </span>
                        {task.reasoningSummary.why}
                      </p>
                      <p className="text-[#57524A] leading-relaxed">
                        <span className="font-semibold text-[#201F1D]">Evidence: </span>
                        {task.reasoningSummary.evidence}
                      </p>
                    </div>
                  )}

                  {/* Task Execution Result */}
                  {task.result && (
                    <div className="bg-[#79A98A]/10 rounded-2xl p-4 border border-[#79A98A]/25 space-y-1.5">
                      <span className="text-[12px] font-semibold text-[#3B664C]">Execution Output</span>
                      <p className="text-[#201F1D] font-medium">{task.result.summary}</p>
                      {task.result.keyPoints && (
                        <ul className="list-disc list-inside text-[#57524A] space-y-0.5 pt-1 text-xs">
                          {task.result.keyPoints.map((kp, idx) => (
                            <li key={idx}>{kp}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {/* Verification Result */}
                  {task.verification && (
                    <div className="bg-white/60 rounded-2xl p-4 border border-[#EBE4D8] space-y-2.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[12px] font-semibold text-[#201F1D]">
                          Verification Scorecard
                        </span>
                        <span className="font-mono text-xs font-bold text-[#3B664C] tabular-nums">
                          Overall: {task.verification.overall}%
                        </span>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-center font-mono text-[11px]">
                        <div className="bg-white/80 p-2 rounded-xl border border-white">
                          <div className="text-[#7D786F] text-[10px]">Accuracy</div>
                          <div className="font-semibold text-[#201F1D] tabular-nums">{task.verification.accuracy}%</div>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-white">
                          <div className="text-[#7D786F] text-[10px]">Completeness</div>
                          <div className="font-semibold text-[#201F1D] tabular-nums">{task.verification.completeness}%</div>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-white">
                          <div className="text-[#7D786F] text-[10px]">Relevance</div>
                          <div className="font-semibold text-[#201F1D] tabular-nums">{task.verification.relevance}%</div>
                        </div>
                        <div className="bg-white/80 p-2 rounded-xl border border-white">
                          <div className="text-[#7D786F] text-[10px]">Consistency</div>
                          <div className="font-semibold text-[#201F1D] tabular-nums">{task.verification.consistency}%</div>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#57524A] italic leading-relaxed">
                        "{task.verification.feedback}"
                      </p>
                    </div>
                  )}

                  {/* Human Controls for this task */}
                  <div className="flex items-center justify-between pt-2 border-t border-white/60">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onRestartTask(task.id)}
                        className="liquid-button text-xs py-1.5 px-3 font-medium cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3 text-[#57524A]" />
                        <span>Restart Task</span>
                      </button>

                      {task.approval?.required && task.status === 'waiting_approval' && (
                        <button
                          onClick={onApproveAction}
                          className="liquid-button primary text-xs py-1.5 px-3.5 font-semibold cursor-pointer"
                        >
                          <span>Approve Action</span>
                        </button>
                      )}
                    </div>

                    <span className="text-[11px] font-mono text-[#7D786F]">
                      ID: {task.id}
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
