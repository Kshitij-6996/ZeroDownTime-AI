/**
 * Machine Service
 */
import store from '../database/store.js';

export function getAllMachines() {
  return store.getAllMachines();
}

export function getMachineById(id) {
  return store.getMachine(id);
}

export function getMachineHistory(id, limit = 50) {
  return store.getSensorHistory(id, limit);
}

export function getFactoryOverview() {
  const machines = store.getAllMachines();
  const total = machines.length;
  const healthy = machines.filter(m => m.status === 'healthy').length;
  const warning = machines.filter(m => m.status === 'warning').length;
  const critical = machines.filter(m => m.status === 'critical').length;
  const avgEfficiency = machines.reduce((sum, m) => sum + (m.efficiency || 0), 0) / total;
  const avgRisk = machines.reduce((sum, m) => sum + (m.riskScore || 0), 0) / total;
  const totalAlerts = store.getAlerts({ acknowledged: false }).length;

  return {
    totalMachines: total,
    healthy,
    warning,
    critical,
    avgEfficiency: Number(avgEfficiency.toFixed(1)),
    avgRisk: Number(avgRisk.toFixed(1)),
    activeAlerts: totalAlerts,
    uptime: Number((healthy / total * 100).toFixed(1)),
  };
}
