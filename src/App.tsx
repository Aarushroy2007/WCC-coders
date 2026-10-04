/**
 * Aegis Agent OS - Master Application Shell (Liquid Glass Design)
 */

import React, { useState, useEffect } from 'react';
import { orchestrator, OrchestratorState } from './services/orchestrator';
import { SCENARIO_PRESETS } from './services/mockScenarios';
import { TopBar } from './components/TopBar';
import { CommandCenter } from './components/CommandCenter';
import { WorkflowGraph } from './components/WorkflowGraph';
import { TaskBoard } from './components/TaskBoard';
import { ToolMonitor } from './components/ToolMonitor';
import { GovernancePanel } from './components/GovernancePanel';
import { MemoryPanel } from './components/MemoryPanel';
import { DeliverableCenter } from './components/DeliverableCenter';
import { AuditLog } from './components/AuditLog';
import { WhyDifferentModal } from './components/WhyDifferentModal';
import { ShieldAlert } from 'lucide-react';

export default function App() {
  const [state, setState] = useState<OrchestratorState>(orchestrator.getState());
  const [activeTab, setActiveTab] = useState<string>('command');
  const [isWhyDifferentOpen, setIsWhyDifferentOpen] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = orchestrator.subscribe((newState) => {
      setState(newState);
    });
    return unsubscribe;
  }, []);

  const handleSelectScenario = (scenarioId: string) => {
    const scenario = SCENARIO_PRESETS.find((s) => s.id === scenarioId);
    if (scenario) {
      orchestrator.setObjective(scenario.objective);
      orchestrator.setAutonomyLevel(scenario.recommendedAutonomy);
      setActiveTab('command');
    }
  };

  return (
    <div className="min-h-screen text-[#292824] flex flex-col font-sans selection:bg-[#7C72D8]/18 selection:text-[#7C72D8]">
      {/* 1. Header (Strict Top Bar Contract with Glass Navbar) */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        phase={state.phase}
        simulationMode={state.simulationMode}
        onToggleSimulation={(val) => orchestrator.setSimulationMode(val)}
        onEmergencyStop={() => orchestrator.emergencyStop()}
        onResume={() => orchestrator.resumeWorkflow()}
        onSelectScenario={handleSelectScenario}
        onOpenWhyDifferent={() => setIsWhyDifferentOpen(true)}
        pendingApprovalsCount={state.pendingApproval ? 1 : 0}
      />

      {/* Floating Global Approval Notification if user is browsing another tab */}
      {state.pendingApproval && activeTab !== 'command' && (
        <aside aria-label="Approval Notification" className="glass-approval mx-4 sm:mx-8 mb-4 p-3.5 shadow-sm">
          <div className="max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D5A45C] shadow-[0_0_8px_rgba(213,164,92,0.45)] shrink-0" />
              <span className="font-semibold text-[#292824]">
                Human Attention Required · Task #{state.tasks.find((t) => t.id === state.pendingApproval?.taskId)?.order}:
              </span>
              <span className="text-[#68645D] truncate max-w-md">{state.pendingApproval.approval.requestedAction}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={() => orchestrator.approvePendingAction()}
                className="liquid-button primary text-xs py-1.5 px-3.5 shadow-2xs"
              >
                Approve Action
              </button>
              <button
                onClick={() => setActiveTab('command')}
                className="liquid-button text-xs py-1.5 px-3 border-[#D5A45C]/40 bg-white"
              >
                Review Details
              </button>
            </div>
          </div>
        </aside>
      )}

      {/* 2. Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-4 sm:py-6">
        {activeTab === 'command' && (
          <CommandCenter
            objective={state.objective}
            phase={state.phase}
            tasks={state.tasks}
            activeTaskId={state.activeTaskId}
            activeAgent={state.activeAgent}
            activeTool={state.activeTool}
            executionTimeSeconds={state.executionTimeSeconds}
            controlScore={state.controlScore}
            reliabilityScore={state.reliabilityScore}
            controlFactors={state.controlFactors}
            reliabilityFactors={state.reliabilityFactors}
            pendingApproval={state.pendingApproval}
            activeRecovery={state.activeRecovery}
            activityLog={state.activityLog}
            simulationMode={state.simulationMode}
            onSetObjective={(goal) => orchestrator.setObjective(goal)}
            onRunWorkflow={() => orchestrator.runWorkflow()}
            onPauseWorkflow={() => orchestrator.pauseWorkflow()}
            onResumeWorkflow={() => orchestrator.resumeWorkflow()}
            onStepWorkflow={() => orchestrator.stepWorkflow()}
            onEmergencyStop={() => orchestrator.emergencyStop()}
            onApprove={() => orchestrator.approvePendingAction()}
            onReject={() => orchestrator.rejectPendingAction()}
            onRequestChanges={(feedback) => orchestrator.requestChangesOnPendingAction(feedback)}
            onRestartTask={(id) => orchestrator.restartFailedTask(id)}
            onNavigateToTasks={() => setActiveTab('tasks')}
            onNavigateToDeliverable={() => setActiveTab('deliverable')}
          />
        )}

        {activeTab === 'workflow' && (
          <WorkflowGraph
            activeAgent={state.activeAgent}
            tasks={state.tasks}
            objective={state.objective}
            phase={state.phase}
            activeTaskId={state.activeTaskId}
            activeTool={state.activeTool}
            executionTimeSeconds={state.executionTimeSeconds}
            pendingApproval={state.pendingApproval}
            activeRecovery={state.activeRecovery}
            activityLog={state.activityLog}
            simulationMode={state.simulationMode}
            onRunWorkflow={() => orchestrator.runWorkflow()}
            onPauseWorkflow={() => orchestrator.pauseWorkflow()}
            onResumeWorkflow={() => orchestrator.resumeWorkflow()}
            onEmergencyStop={() => orchestrator.emergencyStop()}
            onApprove={() => orchestrator.approvePendingAction()}
            onReject={() => orchestrator.rejectPendingAction()}
            onSelectTask={(id) => {
              setActiveTab('tasks');
            }}
            onNavigateToDeliverable={() => setActiveTab('deliverable')}
          />
        )}

        {activeTab === 'tasks' && (
          <TaskBoard
            tasks={state.tasks}
            activeTaskId={state.activeTaskId}
            onRestartTask={(id) => orchestrator.restartFailedTask(id)}
            onModifyTask={(id, updates) => orchestrator.modifyTask(id, updates)}
            onApproveAction={() => orchestrator.approvePendingAction()}
          />
        )}

        {activeTab === 'tools' && (
          <ToolMonitor toolInvocations={state.toolInvocations} />
        )}

        {activeTab === 'memory' && (
          <MemoryPanel
            memories={state.memories}
            onAddMemory={(content, type) => orchestrator.addMemory(content, type)}
            onDeleteMemory={(id) => orchestrator.deleteMemory(id)}
            onClearMemories={() => orchestrator.clearMemories()}
          />
        )}

        {activeTab === 'governance' && (
          <GovernancePanel
            permissions={state.permissions}
            controlScore={state.controlScore}
            reliabilityScore={state.reliabilityScore}
            controlFactors={state.controlFactors}
            reliabilityFactors={state.reliabilityFactors}
            autonomyLevel={state.autonomyLevel}
            verificationThreshold={state.verificationThreshold}
            onUpdatePermission={(id, setting) => orchestrator.updatePermission(id, setting)}
            onSetAutonomyLevel={(lvl) => orchestrator.setAutonomyLevel(lvl)}
            onSetVerificationThreshold={(val) => orchestrator.setVerificationThreshold(val)}
            onEmergencyStop={() => orchestrator.emergencyStop()}
          />
        )}

        {activeTab === 'deliverable' && (
          <DeliverableCenter
            deliverable={state.deliverable}
            onRunAgain={() => orchestrator.runWorkflow()}
            onModifyWorkflow={() => setActiveTab('tasks')}
          />
        )}

        {activeTab === 'audit' && (
          <AuditLog activityLog={state.activityLog} />
        )}
      </main>

      {/* 3. Quiet Editorial Glass Footer */}
      <footer className="mt-8 border-t border-white/60 bg-white/40 backdrop-blur-md py-4 px-4 lg:px-8 text-xs text-[#68645D]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#292824]">Aegis Agent Operating System</span>
            <span>·</span>
            <span>Autonomy with Accountability</span>
          </div>
          <div className="flex items-center gap-4 text-[#68645D] font-mono text-[11px]">
            <span>Human Control: {state.controlScore}/100</span>
            <span>·</span>
            <span>Agent Reliability: {state.reliabilityScore}%</span>
            <span>·</span>
            <button
              onClick={() => setIsWhyDifferentOpen(true)}
              className="hover:text-[#7C72D8] underline decoration-[#D5A45C]/40 cursor-pointer transition-colors"
            >
              System Architecture
            </button>
          </div>
        </div>
      </footer>

      {/* 4. "Why This Agent Is Different" Modal */}
      <WhyDifferentModal
        isOpen={isWhyDifferentOpen}
        onClose={() => setIsWhyDifferentOpen(false)}
      />
    </div>
  );
}
