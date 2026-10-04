/**
 * Aegis Agent OS - Modular Tool Ecosystem & Live Invocation Stream (Warm Soft Palette)
 */

import React, { useState } from 'react';
import { SYSTEM_TOOLS } from '../services/tools';
import { ToolInvocation } from '../types/agent';
import {
  Globe,
  BarChart3,
  FileText,
  Code,
  Database,
  FolderOpen,
  BookOpen,
  Calculator,
  Eye,
  Layers,
} from 'lucide-react';

interface ToolMonitorProps {
  toolInvocations: ToolInvocation[];
}

export const ToolMonitor: React.FC<ToolMonitorProps> = ({ toolInvocations }) => {
  const [selectedInvocation, setSelectedInvocation] = useState<ToolInvocation | null>(
    toolInvocations[0] || null
  );
  const [filterToolId, setFilterToolId] = useState<string>('all');

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Globe':
        return <Globe className="w-4 h-4 text-[#7F9DBB]" />;
      case 'BarChart3':
        return <BarChart3 className="w-4 h-4 text-[#E9A98F]" />;
      case 'FileText':
        return <FileText className="w-4 h-4 text-[#7C72D8]" />;
      case 'Code':
        return <Code className="w-4 h-4 text-[#8D82C7]" />;
      case 'Database':
        return <Database className="w-4 h-4 text-[#D5A45C]" />;
      case 'FolderOpen':
        return <FolderOpen className="w-4 h-4 text-[#9DB8A5]" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4 text-[#79A98A]" />;
      case 'Calculator':
        return <Calculator className="w-4 h-4 text-[#D5A45C]" />;
      case 'Eye':
        return <Eye className="w-4 h-4 text-[#B7A9D6]" />;
      default:
        return <Layers className="w-4 h-4 text-[#7C72D8]" />;
    }
  };

  const filteredInvocations = toolInvocations.filter((inv) => {
    if (filterToolId === 'all') return true;
    return inv.toolId === filterToolId;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="caption-meta">Sandboxed Runtime</span>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#201F1D] tracking-[-0.016em] mt-0.5">
            Modular Tool Ecosystem & Live Invocation Stream
          </h2>
          <p className="prose-secondary text-[#57524A] mt-1 max-w-[65ch]">
            Real-time auditable stream of agent tool calls, queries, latency measurements, and returned artifacts.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#57524A]">
          <span className="glass-badge py-1 px-3 tabular-nums font-semibold text-[#201F1D]">
            Total Invocations: {toolInvocations.length}
          </span>
        </div>
      </div>

      {/* Grid of 9 Available System Tools in Warm Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        {SYSTEM_TOOLS.map((tool) => (
          <div
            key={tool.id}
            onClick={() => setFilterToolId(filterToolId === tool.id ? 'all' : tool.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              filterToolId === tool.id
                ? 'bg-white/95 border-[#7C72D8] ring-2 ring-[#7C72D8]/20 shadow-md'
                : 'bg-white/60 hover:bg-white/85 border-white/80 shadow-xs hover:border-[#EBE4D8]'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center border border-[#EBE4D8]/80 shadow-2xs shrink-0">
                  {getToolIcon(tool.iconName)}
                </div>
                <div>
                  <h3 className="text-xs sm:text-[13px] font-semibold text-[#201F1D] tracking-tight">{tool.name}</h3>
                  <span className="text-[11px] font-medium text-[#7D786F]">
                    {tool.category} · Risk: {tool.riskLevel}
                  </span>
                </div>
              </div>
              <span className="text-xs font-mono font-semibold text-[#7C72D8] bg-[#7C72D8]/10 px-2.5 py-0.5 rounded-full border border-[#7C72D8]/20 tabular-nums">
                {tool.callsCount} calls
              </span>
            </div>
            <p className="mt-2.5 text-[11px] sm:text-xs text-[#57524A] line-clamp-2 leading-relaxed">
              {tool.description}
            </p>
          </div>
        ))}
      </div>

      {/* Invocation Stream & Inspector Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left 7 Cols: Live Invocations List */}
        <div className="lg:col-span-7 glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <div>
              <span className="caption-meta">Live Execution Feed</span>
              <h3 className="text-sm sm:text-base font-semibold text-[#201F1D] mt-0.5 tracking-[-0.01em]">
                Transparent Tool Calls ({filteredInvocations.length})
              </h3>
            </div>
            {filterToolId !== 'all' && (
              <button
                onClick={() => setFilterToolId('all')}
                className="text-xs text-[#7C72D8] hover:underline cursor-pointer font-medium"
              >
                Clear filter
              </button>
            )}
          </div>

          {filteredInvocations.length > 0 ? (
            <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
              {filteredInvocations.map((inv) => {
                const isSelected = selectedInvocation?.id === inv.id;
                return (
                  <div
                    key={inv.id}
                    onClick={() => setSelectedInvocation(inv)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-white/95 border-[#7C72D8]/40 shadow-xs ring-1 ring-[#7C72D8]/15'
                        : 'bg-white/50 border-white/80 hover:bg-white/75'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${
                            inv.status === 'success'
                              ? 'bg-[#79A98A] shadow-[0_0_8px_rgba(121,169,138,0.45)]'
                              : inv.status === 'retried'
                              ? 'bg-[#7F9DBB]'
                              : 'bg-[#D98282] shadow-[0_0_8px_rgba(217,130,130,0.45)]'
                          }`}
                        />
                        <span className="font-semibold text-xs sm:text-[13px] text-[#201F1D] truncate">
                          {inv.toolName}
                        </span>
                        <span className="text-stone-300 text-xs">/</span>
                        <span className="text-xs text-[#57524A] truncate">
                          {inv.taskTitle}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 font-mono text-[11px] text-[#7D786F] tabular-nums">
                        <span>{inv.durationMs}ms</span>
                        <span>·</span>
                        <span>{inv.timestamp}</span>
                      </div>
                    </div>

                    {inv.error ? (
                      <p className="mt-2 text-xs text-[#8C3B3B] bg-[#D98282]/15 p-2.5 rounded-xl border border-[#D98282]/30">
                        {inv.error}
                      </p>
                    ) : inv.input.query ? (
                      <div className="mt-2 text-xs text-[#201F1D] bg-white/70 p-2.5 rounded-xl font-mono truncate border border-[#EBE4D8]">
                        Query: "{inv.input.query}"
                      </div>
                    ) : (
                      <div className="mt-1.5 text-xs text-[#7D786F] truncate">
                        Executed with {Object.keys(inv.input).length} parameters
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-[#7D786F] border border-dashed border-[#EBE4D8] rounded-2xl">
              No tool calls logged yet. Run an autonomous workflow to observe transparent executions.
            </div>
          )}
        </div>

        {/* Right 5 Cols: Selected Invocation Deep Inspector */}
        <div className="lg:col-span-5 glass-card space-y-4">
          <div className="flex items-center justify-between border-b border-white/60 pb-3">
            <div>
              <span className="caption-meta">Telemetry Inspector</span>
              <h3 className="text-sm sm:text-base font-semibold text-[#201F1D] mt-0.5 tracking-[-0.01em]">
                Tool Call Payloads
              </h3>
            </div>
            {selectedInvocation && (
              <span
                className={`text-[11px] font-semibold capitalize px-2.5 py-0.5 rounded-full ${
                  selectedInvocation.status === 'success'
                    ? 'bg-[#79A98A]/15 text-[#3B664C] border border-[#79A98A]/30'
                    : 'bg-[#D98282]/15 text-[#8C3B3B] border border-[#D98282]/30'
                }`}
              >
                {selectedInvocation.status}
              </span>
            )}
          </div>

          {selectedInvocation ? (
            <div className="space-y-3 text-xs">
              <div>
                <span className="text-[11px] text-[#7D786F] font-medium">Tool & Task</span>
                <p className="font-semibold text-[#201F1D] text-xs sm:text-[13px] mt-0.5">{selectedInvocation.toolName}</p>
                <p className="text-[#57524A] text-xs mt-0.5">{selectedInvocation.taskTitle}</p>
              </div>

              <div>
                <span className="text-[11px] text-[#7D786F] font-medium">Input Arguments</span>
                <pre className="mt-1 p-3 rounded-2xl bg-[#201F1D] text-[#FAF7F2] font-mono text-[11px] overflow-x-auto max-h-36 shadow-inner leading-relaxed">
                  {JSON.stringify(selectedInvocation.input, null, 2)}
                </pre>
              </div>

              <div>
                <span className="text-[11px] text-[#7D786F] font-medium">Output Payload</span>
                <pre className="mt-1 p-3 rounded-2xl bg-[#201F1D] text-[#FAF7F2] font-mono text-[11px] overflow-x-auto max-h-48 shadow-inner leading-relaxed">
                  {JSON.stringify(selectedInvocation.output, null, 2)}
                </pre>
              </div>

              <div className="pt-2 border-t border-white/60 flex items-center justify-between text-[11px] font-mono text-[#7D786F] tabular-nums">
                <span>Latency: {selectedInvocation.durationMs}ms</span>
                <span>Time: {selectedInvocation.timestamp}</span>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-[#7D786F]">
              Select a tool call from the timeline to inspect raw inputs and outputs.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
