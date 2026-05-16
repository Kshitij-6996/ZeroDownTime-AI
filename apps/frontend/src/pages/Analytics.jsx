import { useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import { analyticsService } from '../services/dataService';
import { GlassCard, PageHeader, LoadingSpinner } from '../components/ui/index';
import { EfficiencyAreaChart } from '../components/charts/SensorCharts';
import { BarChart3, TrendingUp, Activity, Shield } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

export default function Analytics() {
  const fetchOverview = useCallback(() => analyticsService.getOverview(), []);
  const fetchTrends = useCallback(() => analyticsService.getTrends(), []);
  const { data: ovData, loading } = usePolling(fetchOverview, 5000);
  const { data: tData } = usePolling(fetchTrends, 10000);
  const overview = ovData?.data || {};
  const trends = tData?.data || [];
  const factory = overview.factory || {};

  if (loading) return <LoadingSpinner />;

  const statusPie = [
    { name: 'Healthy', value: factory.healthy || 0, color: '#10b981' },
    { name: 'Warning', value: factory.warning || 0, color: '#f59e0b' },
    { name: 'Critical', value: factory.critical || 0, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" subtitle="Historical data analysis and operational trends" />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { l: 'Avg Efficiency', v: `${factory.avgEfficiency||0}%`, c: 'text-cyan-400', icon: TrendingUp },
          { l: 'Avg Risk', v: `${factory.avgRisk||0}`, c: 'text-amber-400', icon: Shield },
          { l: 'Avg Uptime', v: `${factory.avgUptime||0}%`, c: 'text-emerald-400', icon: Activity },
          { l: 'Total Automations', v: overview.automation?.totalActions || 0, c: 'text-purple-400', icon: BarChart3 },
        ].map(({ l, v, c, icon: Icon }, i) => (
          <GlassCard key={i} className="p-4" hover={false}>
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-slate-500 uppercase">{l}</p>
              <Icon className={`w-4 h-4 ${c}`} />
            </div>
            <p className={`text-2xl font-mono font-bold ${c}`}>{v}</p>
          </GlassCard>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Efficiency Trend */}
        <GlassCard className="lg:col-span-2 p-5" hover={false}>
          <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2"><TrendingUp className="w-4 h-4 text-cyan-400" /> Factory Efficiency Trend</h3>
          <EfficiencyAreaChart data={trends} />
        </GlassCard>

        {/* Status Distribution */}
        <GlassCard className="p-5" hover={false}>
          <h3 className="text-sm font-semibold text-white mb-4">Machine Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={statusPie} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                {statusPie.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#141d35', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 mt-2">
            {statusPie.map(d => (
              <div key={d.name} className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
                {d.name}: {d.value}
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Status Over Time Bar Chart */}
      {trends.length > 0 && (
        <GlassCard className="p-5" hover={false}>
          <h3 className="text-sm font-semibold text-white mb-4">Status Distribution Over Time</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trends.slice(-30)}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.06)" />
              <XAxis dataKey="timestamp" tick={{ fontSize: 10, fill: '#64748b' }} tickFormatter={(t) => new Date(t).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })} interval="preserveStartEnd" />
              <YAxis tick={{ fontSize: 10, fill: '#64748b' }} />
              <Tooltip contentStyle={{ background: '#141d35', border: '1px solid rgba(6,182,212,0.2)', borderRadius: '8px', fontSize: '12px', color: '#f1f5f9' }} />
              <Bar dataKey="healthyCount" stackId="a" fill="#10b981" name="Healthy" radius={[0,0,0,0]} />
              <Bar dataKey="warningCount" stackId="a" fill="#f59e0b" name="Warning" />
              <Bar dataKey="criticalCount" stackId="a" fill="#ef4444" name="Critical" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}
    </div>
  );
}
