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
          <span className="text-xs text-[#918C83] font-mono">PERSISTENT COGNITIVE STATE</span>
          <h2 className="text-base sm:text-lg font-semibold text-[#292824] mt-0.5">
            Structured Agent Memory Architecture
          </h2>
          <p className="text-xs text-[#68645D] mt-0.5">
            Contextual memory partitions enabling deterministic recall, policy enforcement, and cross-task persistence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAdding(true)}
            className="liquid-button primary text-xs py-2 px-3.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Memory Directive</span>
          </button>
          <button
            onClick={onClearMemories}
            className="liquid-button text-xs py-2 px-3 text-[#8C3B3B] border-[#D98282]/30 hover:bg-[#D98282]/10"
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
            <span className="text-xs font-semibold text-[#292824]">
              Inject Human Operator Directive / Context
            </span>
            <div className="flex items-center gap-2">
              <select
                aria-label="Memory Type"
                value={newType}
                onChange={(e) => setNewType(e.target.value as any)}
                className="text-xs py-1.5 px-3 bg-white/80 border border-[#EBE4D8] rounded-xl font-medium text-[#292824] shadow-2xs"
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
            className="glass-input text-xs"
          />

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="liquid-button primary text-xs py-1.5 px-4"
            >
              Save Memory
            </button>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              className="liquid-button text-xs py-1.5 px-3"
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
            <span className="text-xs font-mono font-medium text-[#918C83]">PARTITION 01</span>
            <span className="text-xs font-mono font-bold text-[#292824]">
              {memories.filter((m) => m.type === 'short_term').length} items
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[#292824] mt-1">Short-Term Memory</h3>
          <p className="text-xs text-[#68645D] mt-1 leading-snug">
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
            <span className="text-xs font-mono font-medium text-[#918C83]">PARTITION 02</span>
            <span className="text-xs font-mono font-bold text-[#292824]">
              {memories.filter((m) => m.type === 'working').length} items
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[#292824] mt-1">Working Memory</h3>
          <p className="text-xs text-[#68645D] mt-1 leading-snug">
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
            <span className="text-xs font-mono font-medium text-[#918C83]">PARTITION 03</span>
            <span className="text-xs font-mono font-bold text-[#292824]">
              {memories.filter((m) => m.type === 'long_term').length} items
            </span>
          </div>
          <h3 className="text-sm font-semibold text-[#292824] mt-1">Long-Term Memory</h3>
          <p className="text-xs text-[#68645D] mt-1 leading-snug">
            Governance rules, institutional standards, and verified cross-session facts.
          </p>
        </div>
      </div>

      {/* Memory Items Registry in Warm Glass */}
      <div className="glass-card space-y-4">
        <div className="flex items-center justify-between border-b border-white/60 pb-3">
          <div>
            <span className="text-xs text-[#918C83] font-mono">MEMORY REGISTRY</span>
            <h3 className="text-sm font-semibold text-[#292824] mt-0.5">
              Active Knowledge Buffers ({filteredMemories.length})
            </h3>
          </div>
          {activeTab !== 'all' && (
            <button
              onClick={() => setActiveTab('all')}
              className="text-xs text-[#7C72D8] hover:underline cursor-pointer"
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
                    <span className="text-[#918C83]">·</span>
                    <span className="text-[#68645D] font-medium">Source: {mem.source}</span>
                    <span className="text-[#918C83]">·</span>
                    <span className="font-mono text-[#918C83]">{mem.timestamp}</span>
                  </div>

                  <p className="text-[#292824] text-xs sm:text-sm font-medium leading-relaxed">
                    {mem.content}
                  </p>

                  <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-[#68645D]">
                    <span>Confidence: {mem.confidence}%</span>
                    <span>·</span>
                    <span>Relevance: {mem.relevance}%</span>
                  </div>
                </div>

                <button
                  onClick={() => onDeleteMemory(mem.id)}
                  className="text-[#918C83] hover:text-[#8C3B3B] transition-colors p-1.5 rounded-lg hover:bg-white/80 cursor-pointer"
                  title="Purge this memory item"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-12 text-center text-xs text-[#918C83] border border-dashed border-[#EBE4D8] rounded-2xl">
            No memories stored in this partition. Add a directive or run an agent workflow.
          </div>
        )}
      </div>
    </div>
  );
};
