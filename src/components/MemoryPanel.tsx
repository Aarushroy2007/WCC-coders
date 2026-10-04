/**
 * Aegis Agent OS - Structured Memory Architecture (Warm Soft Palette)
 */

import React, { useState } from 'react';
import { MemoryItem } from '../types/agent';
import {
  Trash2,
  Plus,
} from 'lucide-react';

interface MemoryPanelProps {
  memories: MemoryItem[];
  onAddMemory: (content: string, type: MemoryItem['type']) => void;
  onDeleteMemory: (id: string) => void;
  onClearMemories: () => void;
}

export const MemoryPanel: React.FC<MemoryPanelProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  onClearMemories,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'short_term' | 'working' | 'long_term'>('all');
  const [isAdding, setIsAdding] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newType, setNewType] = useState<MemoryItem['type']>('long_term');

  const filteredMemories = memories.filter((m) => {
    if (activeTab === 'all') return true;
    return m.type === activeTab;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContent.trim()) {
      onAddMemory(newContent.trim(), newType);
      setNewContent('');
      setIsAdding(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="caption-meta">Persistent Cognitive State</span>
          <h2 className="text-xl sm:text-2xl font-semibold text-[#201F1D] tracking-[-0.016em] mt-0.5">
            Structured Agent Memory Architecture
          </h2>
          <p className="prose-secondary text-[#57524A] mt-1 max-w-[65ch]">
            Contextual memory partitions enabling deterministic recall, policy enforcement, and cross-task persistence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="liquid-button primary text-xs py-2 px-3.5 font-semibold cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory Directive</span>
          </button>
          <button
            onClick={onClearMemories}
            className="liquid-button text-xs py-2 px-3 text-[#8C3B3B] border-[#D98282]/30 hover:bg-[#D98282]/10 font-medium cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear Memory</span>
          </button>
        </div>
      </div>

      {/* Memory Creation Drawer (If adding) */}
      {isAdding && (
        <form
          onSubmit={handleAddSubmit}
          className="glass p-5! border-[#D5A45C]/40 bg-[#FAF4EA]/80 shadow-sm space-y-3"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-[13px] font-semibold text-[#201F1D]">
              Inject Human Directive / Context Rule
            </span>
            <div className="flex items-center gap-2">
              <select
                aria-label="Memory Type"
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="text-xs py-1.5 px-3 bg-white/80 border border-[#EBE4D8] rounded-xl font-medium text-[#201F1D] shadow-2xs cursor-pointer"
              >
                <option value="long_term">Long-Term (Persistent Rule)</option>
                <option value="working">Working Memory (Current Workflow)</option>
                <option value="short_term">Short-Term (Task Context)</option>
              </select>
            </div>
          </div>

          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            rows={2}
            placeholder="E.g., Institutional Rule: All generated content must comply with educational privacy and clarity guidelines."
            className="glass-input text-xs sm:text-[13px] leading-relaxed"
          />

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="liquid-button primary text-xs py-1.5 px-4 font-semibold cursor-pointer"
            >
              Save Memory
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="liquid-button text-xs py-1.5 px-3 font-medium cursor-pointer"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* 3 Partition Metrics in Warm Glass */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Short Term */}
        <div
          onClick={() => setActiveTab('short_term')}
          className={`glass-card cursor-pointer transition-all ${
            activeTab === 'short_term'
              ? 'ring-2 ring-[#7C72D8]/40 border-[#7C72D8]'
              : 'hover:border-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="caption-meta">Partition 01</span>
            <span className="text-xs font-mono font-semibold text-[#201F1D] tabular-nums">
              {memories.filter((m) => m.type === 'short_term').length} items
            </span>
          </div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-[#201F1D] mt-1 tracking-tight">Short-Term Memory</h3>
          <p className="text-xs text-[#57524A] mt-1 leading-snug">
            Immediate task state, local variables, and current step inputs.
          </p>
        </div>

        {/* Working Memory */}
        <div
          onClick={() => setActiveTab('working')}
          className={`glass-card cursor-pointer transition-all ${
            activeTab === 'working'
              ? 'ring-2 ring-[#7C72D8]/40 border-[#7C72D8]'
              : 'hover:border-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="caption-meta">Partition 02</span>
            <span className="text-xs font-mono font-semibold text-[#201F1D] tabular-nums">
              {memories.filter((m) => m.type === 'working').length} items
            </span>
          </div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-[#201F1D] mt-1 tracking-tight">Working Memory</h3>
          <p className="text-xs text-[#57524A] mt-1 leading-snug">
            Active findings, candidate vendor pools, and accumulated cross-task insights.
          </p>
        </div>

        {/* Long Term */}
        <div
          onClick={() => setActiveTab('long_term')}
          className={`glass-card cursor-pointer transition-all ${
            activeTab === 'long_term'
              ? 'ring-2 ring-[#7C72D8]/40 border-[#7C72D8]'
              : 'hover:border-white'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="caption-meta">Partition 03</span>
            <span className="text-xs font-mono font-semibold text-[#201F1D] tabular-nums">
              {memories.filter((m) => m.type === 'long_term').length} items
            </span>
          </div>
          <h3 className="text-sm sm:text-[15px] font-semibold text-[#201F1D] mt-1 tracking-tight">Long-Term Memory</h3>
          <p className="text-xs text-[#57524A] mt-1 leading-snug">
            Governance rules, institutional standards, and verified cross-session facts.
          </p>
        </div>
      </div>

      {/* Memory Items Registry in Warm Glass */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between border-b border-white/60 pb-3">
          <div>
            <span className="caption-meta">Memory Registry</span>
            <h3 className="text-sm sm:text-base font-semibold text-[#201F1D] mt-0.5 tracking-[-0.01em]">
              Active Knowledge Buffers ({filteredMemories.length})
            </h3>
          </div>
          {activeTab !== 'all' && (
            <button
              onClick={() => setActiveTab('all')}
              className="text-xs text-[#7C72D8] hover:underline cursor-pointer font-medium"
            >
              Show all partitions
            </button>
          )}
        </div>

        {filteredMemories.length > 0 ? (
          <div className="space-y-3">
            {filteredMemories.map((mem) => (
              <div
                key={mem.id}
                className="glass p-4! border-white/80 bg-white/50 flex items-start justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] uppercase font-semibold text-[#7C72D8] bg-[#7C72D8]/10 px-2 py-0.5 rounded-full border border-[#7C72D8]/20">
                      {mem.type.replace('_', ' ')}
                    </span>
                    <span className="text-[#7D786F]">·</span>
                    <span className="text-[#57524A] font-medium">Source: {mem.source}</span>
                    <span className="text-[#7D786F]">·</span>
                    <span className="font-mono text-[#7D786F] tabular-nums">{mem.timestamp}</span>
                  </div>

                  <p className="text-[#201F1D] text-xs sm:text-[14px] font-medium leading-relaxed max-w-[65ch]">
                    {mem.content}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#57524A] tabular-nums">
                    <span>Confidence: {mem.confidence}%</span>
                    <span>·</span>
                    <span>Relevance: {mem.relevance}%</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMemory(mem.id)}
                  className="text-[#7D786F] hover:text-[#8C3B3B] transition-colors p-1.5 rounded-lg hover:bg-white/80 cursor-pointer"
                  title="Purge this memory item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#7D786F] border border-dashed border-[#EBE4D8] rounded-2xl">
            No memories stored in this partition. Add a directive or run an agent workflow.
          </div>
        )}
      </div>
    </div>
  );
};
