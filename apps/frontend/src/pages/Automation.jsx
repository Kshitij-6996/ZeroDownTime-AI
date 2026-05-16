import { useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import { automationService } from '../services/dataService';
import { GlassCard, PageHeader, LoadingSpinner } from '../components/ui/index';
import { motion } from 'framer-motion';
import { Shield, Zap, CheckCircle2, Clock, AlertTriangle, ArrowRight, Activity, Cpu, BrainCircuit } from 'lucide-react';

export default function Automation() {
  const fetchLogs = useCallback(() => automationService.getLogs(30), []);
  const fetchRules = useCallback(() => automationService.getRules(), []);
  const fetchStatus = useCallback(() => automationService.getStatus(), []);
  
  const { data: logData, loading } = usePolling(fetchLogs, 5000);
  const { data: rulesData } = usePolling(fetchRules, 30000);
  const { data: statusData } = usePolling(fetchStatus, 10000);

  const logs = logData?.data || [];
  const rules = rulesData?.data || [];
  const status = statusData?.data || {};

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Operational Timeline" subtitle="Live preventive automation workflows and system stabilization events" />

      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Engine Status', v: status.isRunning ? 'Active' : 'Stopped', c: status.isRunning ? 'text-emerald-400' : 'text-red-400' },
          { l: 'Active Rules', v: status.rulesCount || 0, c: 'text-cyan-400' },
          { l: 'Total Executions', v: status.executionCount || 0, c: 'text-purple-400' },
          { l: 'System Health', v: 'Protected', c: 'text-emerald-400' },
        ].map((s, i) => (
          <GlassCard key={i} className="p-4 flex flex-col justify-center" hover={false}>
            <p className="text-[10px] text-slate-500 uppercase">{s.l}</p>
            <p className={`text-xl font-mono font-bold ${s.c}`}>{s.v}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Automation Rules (1/3 width) */}
        <div className="lg:col-span-1 space-y-4">
          <GlassCard className="p-5" hover={false}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Shield className="w-4 h-4 text-cyan-400" /> Active Safety Protocols
            </h3>
            <div className="space-y-3">
              {rules.map((rule) => (
                <div key={rule.id} className="p-3 rounded-lg bg-industrial-800/50 border border-cyan-500/10">
                  <h4 className="text-xs font-semibold text-white mb-1">{rule.name}</h4>
                  <p className="text-[10px] text-slate-400 leading-relaxed">{rule.description}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>

        {/* Right Column: Operational Timeline (2/3 width) */}
        <div className="lg:col-span-2">
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-purple-400" /> Live Response Log
              </h3>
              <div className="flex items-center gap-2 text-[10px] text-slate-500">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-400"></span> Critical</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400"></span> High</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Moderate</span>
              </div>
            </div>

            <div className="space-y-6 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
              {logs.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle2 className="w-12 h-12 text-emerald-500/20 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">All systems operating normally.</p>
                  <p className="text-xs text-slate-500 mt-1">Awaiting anomaly triggers...</p>
                </div>
              ) : (
                <div className="relative pl-4 border-l border-slate-700/50 space-y-8">
                  {logs.map((log, i) => (
                    <TimelineEvent key={log.id || i} log={log} index={i} />
                  ))}
                </div>
              )}
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function TimelineEvent({ log, index }) {
  const getSeverityColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'text-red-400 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      default: return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20';
    }
  };

  const getDotColor = (sev) => {
    switch (sev?.toLowerCase()) {
      case 'critical': return 'bg-red-400 shadow-[0_0_8px_rgba(248,113,113,0.6)]';
      case 'high': return 'bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]';
      default: return 'bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]';
    }
  };

  const severityClasses = getSeverityColor(log.severity);
  const timeStr = new Date(log.timestamp).toLocaleTimeString();

  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }} 
      animate={{ opacity: 1, x: 0 }} 
      transition={{ delay: index * 0.1, duration: 0.4 }}
      className="relative pl-6"
    >
      {/* Timeline Dot */}
      <div className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${getDotColor(log.severity)}`} />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-[11px] font-mono text-slate-500">[{timeStr}]</span>
          <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold tracking-wider ${severityClasses}`}>
            {log.severity}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-300 bg-industrial-800/80 px-2 py-1 rounded border border-slate-700">
          <Cpu className="w-3.5 h-3.5 text-cyan-400" />
          {log.machineName}
        </div>
      </div>

      <div className="bg-industrial-800/40 rounded-lg border border-slate-700/50 overflow-hidden">
        {/* Title */}
        <div className="p-3 border-b border-slate-700/50 bg-industrial-800/80">
          <h4 className="text-sm font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            {log.ruleName} Triggered
          </h4>
        </div>

        <div className="p-4 space-y-4">
          {/* AI Analysis */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <BrainCircuit className="w-3 h-3 text-purple-400" /> AI Diagnostic
            </p>
            <p className="text-xs text-slate-300 leading-relaxed pl-4 border-l border-purple-500/30">
              {log.aiAnalysis || "Pattern deviation detected."}
            </p>
          </div>

          {/* Automation Actions */}
          <div>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400" /> Automated Response Actions
            </p>
            <ul className="space-y-1.5 pl-4">
              {log.actionSteps ? log.actionSteps.map((step, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span className="leading-snug">{step}</span>
                </li>
              )) : (
                <li className="text-xs text-slate-400 italic">No specific steps recorded.</li>
              )}
            </ul>
          </div>

          {/* Result */}
          <div className="pt-3 border-t border-slate-700/50">
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mb-1.5 flex items-center gap-1">
              <Activity className="w-3 h-3 text-emerald-400" /> Operational Result
            </p>
            <p className="text-xs text-emerald-400 font-medium pl-4">
              ✓ {log.result || "System stabilized successfully."}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
