import { useCallback, useState } from 'react';
import { usePolling } from '../hooks/usePolling';
import { alertService } from '../services/dataService';
import { GlassCard, PageHeader, LoadingSpinner } from '../components/ui/index';
import { motion } from 'framer-motion';
import { Bell, AlertTriangle, CheckCircle2, Filter, Check } from 'lucide-react';

export default function Alerts() {
  const [filter, setFilter] = useState('all');
  const fetchAlerts = useCallback(() => alertService.getAll(), []);
  const fetchStats = useCallback(() => alertService.getStats(), []);
  const { data, loading, refetch } = usePolling(fetchAlerts, 4000);
  const { data: statsData } = usePolling(fetchStats, 5000);

  const alerts = data?.data || [];
  const stats = statsData?.data || {};
  const filtered = filter === 'all' ? alerts : alerts.filter(a => a.priority === filter);

  const handleAcknowledge = async (id) => {
    await alertService.acknowledge(id);
    refetch();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title="Alert Center" subtitle="Real-time industrial alerts and notifications" />

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {[
          { l: 'Total', v: stats.total || 0, c: 'text-slate-300' },
          { l: 'Unacknowledged', v: stats.unacknowledged || 0, c: 'text-amber-400' },
          { l: 'Critical', v: stats.critical || 0, c: 'text-red-400' },
          { l: 'High', v: stats.high || 0, c: 'text-orange-400' },
          { l: 'Medium', v: stats.medium || 0, c: 'text-yellow-400' },
        ].map((s, i) => (
          <GlassCard key={i} className="p-3" hover={false}>
            <p className="text-[10px] text-slate-500 uppercase">{s.l}</p>
            <p className={`text-xl font-mono font-bold ${s.c}`}>{s.v}</p>
          </GlassCard>
        ))}
      </div>

      <div className="flex items-center gap-2">
        {['all', 'critical', 'high', 'medium', 'low'].map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all ${filter===f ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30' : 'bg-industrial-800 text-slate-400 border-cyan-500/10 hover:text-slate-300'}`}>
            {f.charAt(0).toUpperCase()+f.slice(1)}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((alert, i) => (
          <motion.div key={alert.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.02 }}>
            <GlassCard className={`p-4 flex items-start gap-4 ${alert.acknowledged ? 'opacity-50' : ''}`} hover={!alert.acknowledged}>
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                alert.priority==='critical'?'bg-red-500/20':'bg-amber-500/20'}`}>
                <AlertTriangle className={`w-5 h-5 ${alert.priority==='critical'?'text-red-400':'text-amber-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold text-white truncate">{alert.title}</h3>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    alert.priority==='critical'?'bg-red-500/10 text-red-400 border-red-500/20':
                    alert.priority==='high'?'bg-orange-500/10 text-orange-400 border-orange-500/20':
                    'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'}`}>{alert.priority}</span>
                </div>
                <p className="text-xs text-slate-400">{alert.message}</p>
                <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-500">
                  <span>{alert.machineName}</span>
                  <span>{new Date(alert.timestamp).toLocaleTimeString()}</span>
                </div>
              </div>
              {!alert.acknowledged && (
                <button onClick={() => handleAcknowledge(alert.id)}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors flex-shrink-0">
                  <Check className="w-3 h-3" /> Ack
                </button>
              )}
            </GlassCard>
          </motion.div>
        ))}
        {filtered.length === 0 && (
          <div className="text-center py-16 text-slate-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-3 text-emerald-400" />
            <p>No alerts matching this filter</p>
          </div>
        )}
      </div>
    </div>
  );
}
