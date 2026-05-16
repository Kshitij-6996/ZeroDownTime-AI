/**
 * Analytics Service
 */
import store from '../database/store.js';

export function getOverview() {
  const machines = store.getAllMachines();
  const alerts = store.getAlerts();
  const logs = store.getAutomationLogs();

  const total = machines.length;
  const statusCounts = { healthy: 0, warning: 0, critical: 0 };
  let totalEfficiency = 0;
  let totalRisk = 0;
  let totalUptime = 0;

  machines.forEach(m => {
    statusCounts[m.status] = (statusCounts[m.status] || 0) + 1;
    totalEfficiency += m.efficiency || 0;
    totalRisk += m.riskScore || 0;
    totalUptime += m.uptime || 0;
  });

  return {
    factory: {
      totalMachines: total,
      ...statusCounts,
      avgEfficiency: Number((totalEfficiency / total).toFixed(1)),
      avgRisk: Number((totalRisk / total).toFixed(1)),
      avgUptime: Number((totalUptime / total).toFixed(1)),
    },
    alerts: {
      total: alerts.length,
      unacknowledged: alerts.filter(a => !a.acknowledged).length,
      critical: alerts.filter(a => a.priority === 'critical').length,
    },
    automation: {
      totalActions: logs.length,
      recentActions: logs.slice(0, 5),
    },
  };
}

export function getTrends() {
  return store.getAnalyticsSnapshots(60);
}

export function getMachineAnalytics(machineId) {
  const history = store.getSensorHistory(machineId, 100);
  if (history.length === 0) return null;

  const latest = history[history.length - 1];
  const sensorTrends = {};

  for (const key of Object.keys(latest)) {
    if (key === 'timestamp') continue;
    const values = history.map(h => h[key]).filter(v => v !== undefined);
    sensorTrends[key] = {
      current: values[values.length - 1],
      min: Math.min(...values),
      max: Math.max(...values),
      avg: Number((values.reduce((s, v) => s + v, 0) / values.length).toFixed(2)),
      trend: values.length > 1 ? (values[values.length - 1] > values[values.length - 2] ? 'rising' : 'falling') : 'stable',
    };
  }

  return { machineId, dataPoints: history.length, sensorTrends, history };
}
