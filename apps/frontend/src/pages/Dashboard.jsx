import { useCallback } from 'react';
import { usePolling } from '../hooks/usePolling';
import { machineService, alertService, analyticsService, predictionService } from '../services/dataService';
import { GlassCard, MetricWidget, PageHeader, LoadingSpinner } from '../components/ui/index';
import MachineCard from '../components/machines/MachineCard';
import { EfficiencyAreaChart } from '../components/charts/SensorCharts';
import { motion } from 'framer-motion';
import {
  Factory, Activity, AlertTriangle, Shield, Cpu, TrendingUp,
  Bell, BrainCircuit, Zap, CheckCircle2
} from 'lucide-react';

export default function Dashboard() {
  const fetchMachines = useCallback(() => machineService.getAll(), []);
  const fetchOverview = useCallback(() => machineService.getOverview(), []);
  const fetchAlertStats = useCallback(() => alertService.getStats(), []);
  const fetchTrends = useCallback(() => analyticsService.getTrends(), []);
  const fetchPredictions = useCallback(() => predictionService.getAll(), []);

  const { data: machinesData, loading: mLoading } = usePolling(fetchMachines, 3000);
  const { data: overview } = usePolling(fetchOverview, 3000);
  const { data: alertStats } = usePolling(fetchAlertStats, 5000);
  const { data: trends } = usePolling(fetchTrends, 10000);
  const { data: predictions } = usePolling(fetchPredictions, 5000);

  const machines = machinesData?.data || [];
  const ov = overview?.data || {};
  const as = alertStats?.data || {};
  const trendsData = trends?.data || [];
  const preds = predictions?.data || [];

  const criticalPreds = preds.filter(p => p.riskCategory === 'critical' || p.riskCategory === 'high');

  if (mLoading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Factory Dashboard"
        subtitle="Real-time industrial monitoring & AI predictions"
        actions={
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
              Live
            </span>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <MetricWidget label="Total Machines" value={ov.totalMachines || 0} icon={Cpu} color="cyan" />
        <MetricWidget label="Healthy" value={ov.healthy || 0} icon={CheckCircle2} color="emerald" />
        <MetricWidget label="Warnings" value={ov.warning || 0} icon={AlertTriangle} color="amber" />
        <MetricWidget label="Critical" value={ov.critical || 0} icon={Shield} color="red" />
        <MetricWidget label="Avg Efficiency" value={`${ov.avgEfficiency || 0}`} unit="%" icon={TrendingUp} color="cyan" />
        <MetricWidget label="Active Alerts" value={as.unacknowledged || 0} icon={Bell} color={as.unacknowledged > 5 ? 'red' : 'amber'} />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Machine Grid — takes 2 columns */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <Factory className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-semibold text-white">Machine Fleet</h2>
            <span className="text-xs text-slate-500 ml-auto">{machines.length} units</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {machines.map((m, i) => (
              <MachineCard key={m.id} machine={m} index={i} />
            ))}
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">

          {/* AI Predictions Summary */}
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <BrainCircuit className="w-5 h-5 text-purple-400" />
              <h3 className="text-sm font-semibold text-white">AI Insights</h3>
            </div>
            {criticalPreds.length > 0 ? (
              <div className="space-y-3">
                {criticalPreds.slice(0, 4).map((p) => (
                  <div key={p.machineId} className="flex items-center justify-between p-2.5 rounded-lg bg-red-500/5 border border-red-500/10">
                    <div>
                      <p className="text-xs font-medium text-white">{p.machineName}</p>
                      <p className="text-[10px] text-slate-500">{p.predictedFailureTime ? `Failure in ~${p.predictedFailureTime}` : 'Elevated risk'}</p>
                    </div>
                    <span className={`text-sm font-mono font-bold ${
                      p.failureProbability > 70 ? 'text-red-400' : 'text-amber-400'
                    }`}>{p.failureProbability?.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                All machines within normal parameters
              </div>
            )}
          </GlassCard>

          {/* Recent Alerts */}
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-amber-400" />
              <h3 className="text-sm font-semibold text-white">Recent Alerts</h3>
              {as.critical > 0 && (
                <span className="ml-auto text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-400">{as.critical} critical</span>
              )}
            </div>
            <AlertsFeed />
          </GlassCard>

          {/* Efficiency Trend */}
          <GlassCard className="p-5" hover={false}>
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Efficiency Trend</h3>
            </div>
            <EfficiencyAreaChart data={trendsData} />
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function AlertsFeed() {
  const fetchAlerts = useCallback(() => alertService.getAll({ acknowledged: 'false' }), []);
  const { data } = usePolling(fetchAlerts, 5000);
  const alerts = (data?.data || []).slice(0, 5);

  if (alerts.length === 0) {
    return <p className="text-xs text-slate-500">No active alerts</p>;
  }

  return (
    <div className="space-y-2">
      {alerts.map((alert) => (
        <div key={alert.id} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
          alert.priority === 'critical' ? 'bg-red-500/5 border border-red-500/10' :
          alert.priority === 'high' ? 'bg-amber-500/5 border border-amber-500/10' :
          'bg-slate-500/5 border border-slate-500/10'
        }`}>
          <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${
            alert.priority === 'critical' ? 'text-red-400' :
            alert.priority === 'high' ? 'text-amber-400' : 'text-slate-400'
          }`} />
          <div>
            <p className="font-medium text-slate-300">{alert.title}</p>
            <p className="text-slate-500 mt-0.5">{alert.machineName}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
