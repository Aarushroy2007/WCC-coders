/**
 * Aegis Agent OS - Complete Immutable Audit Log (Warm Soft Palette)
 */

import React, { useState } from 'react';
import { ActivityLogItem } from '../types/agent';
import {
  Download,
  Search,
} from 'lucide-react';

interface AuditLogProps {
  activityLog: ActivityLogItem[];
}

export const AuditLog: React.FC<AuditLogProps> = ({ activityLog }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  const filteredLogs = activityLog.filter((item) => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      (item.detail && item.detail.toLowerCase().includes(q)) ||
      (item.agentRole && item.agentRole.toLowerCase().includes(q))
    );
  });

  const exportAsJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(activityLog, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `aegis_audit_trail_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const exportAsCSV = () => {
    const headers = ['Timestamp', 'Type', 'Agent', 'Task ID', 'Title', 'Detail'];
    const rows = activityLog.map((l) => [
      `"${l.timestamp}"`,
      `"${l.type}"`,
      `"${l.agentRole || 'system'}"`,
      `"${l.taskId || 'N/A'}"`,
      `"${l.title.replace(/"/g, '""')}"`,
      `"${(l.detail || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `aegis_audit_trail_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-card flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs text-[#918C83] font-mono">CRYPTOGRAPHIC & AUDIT INTEGRITY</span>
          <h2 className="text-base sm:text-lg font-semibold text-[#292824] mt-0.5">
            Immutable Activity & Decision Log
          </h2>
          <p className="text-xs text-[#68645D] mt-0.5">
            Chronological audit trail preserving every agent transition, tool invocation, human approval, and recovery event.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportAsJSON}
            className="liquid-button text-xs py-2 px-3.5"
          >
            <Download className="w-3.5 h-3.5 text-[#68645D]" />
            <span>Export JSON</span>
          </button>
          <button
            onClick={exportAsCSV}
            className="liquid-button text-xs py-2 px-3.5"
          >
            <Download className="w-3.5 h-3.5 text-[#68645D]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass p-4!">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#918C83] absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search audit trail..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="glass-input pl-10! py-2! text-xs font-mono"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-white/50 backdrop-blur-md rounded-2xl border border-white/80 text-xs font-medium self-stretch sm:self-auto overflow-x-auto shadow-2xs">
          {['all', 'agent', 'tool', 'approval', 'recovery', 'warning'].map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-3 py-1.5 rounded-xl transition-all capitalize cursor-pointer whitespace-nowrap ${
                filterType === t
                  ? 'bg-white text-[#292824] shadow-2xs font-semibold border border-white/90'
                  : 'text-[#68645D] hover:text-[#292824]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card p-0! overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/80 bg-white/40 text-[#68645D] font-mono text-[11px]">
                <th className="py-3 px-5 font-medium">TIMESTAMP</th>
                <th className="py-3 px-5 font-medium">TYPE</th>
                <th className="py-3 px-5 font-medium">AGENT</th>
                <th className="py-3 px-5 font-medium">EVENT TITLE</th>
                <th className="py-3 px-5 font-medium">AUDIT DETAILS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/60">
              {filteredLogs.map((item) => (
                <tr key={item.id} className="hover:bg-white/40 transition-colors">
                  <td className="py-3.5 px-5 font-mono text-[11px] text-[#918C83] whitespace-nowrap">
                    {item.timestamp}
                  </td>
                  <td className="py-3.5 px-5 whitespace-nowrap">
                    <span
                      className={`font-mono text-[10px] px-2.5 py-0.5 rounded-full font-semibold uppercase ${
                        item.type === 'error'
                          ? 'bg-[#D98282]/15 text-[#8C3B3B] border border-[#D98282]/30'
                          : item.type === 'approval' || item.type === 'warning'
                          ? 'bg-[#D5A45C]/15 text-[#8C6D2D] border border-[#D5A45C]/30'
                          : item.type === 'recovery'
                          ? 'bg-[#7F9DBB]/15 text-[#3B5773] border border-[#7F9DBB]/30'
                          : item.type === 'success'
                          ? 'bg-[#79A98A]/15 text-[#4E765D] border border-[#79A98A]/30'
                          : item.type === 'tool'
                          ? 'bg-[#7C72D8]/10 text-[#7C72D8] border border-[#7C72D8]/20'
                          : 'bg-white/80 text-[#292824] border border-[#EBE4D8]'
                      }`}
                    >
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-[#292824] whitespace-nowrap capitalize">
                    {item.agentRole ? `${item.agentRole} Agent` : 'System'}
                  </td>
                  <td className="py-3.5 px-5 font-semibold text-[#292824] whitespace-nowrap">
                    {item.title}
                  </td>
                  <td className="py-3.5 px-5 text-[#68645D] max-w-md leading-relaxed">
                    {item.detail || '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
