/**
 * Alert Service
 */
import { v4 as uuidv4 } from 'uuid';
import store from '../database/store.js';

export function getAllAlerts(filters = {}) {
  return store.getAlerts(filters);
}

export function createAlert({ machineId, machineName, type, category, priority, title, message }) {
  const alert = {
    id: uuidv4(),
    machineId,
    machineName,
    type: type || 'system',
    category: category || 'system',
    priority: priority || 'medium',
    title,
    message,
    acknowledged: false,
    timestamp: new Date().toISOString(),
  };
  return store.addAlert(alert);
}

export function acknowledgeAlert(id) {
  return store.acknowledgeAlert(id);
}

export function getAlertStats() {
  const alerts = store.getAlerts();
  return {
    total: alerts.length,
    unacknowledged: alerts.filter(a => !a.acknowledged).length,
    critical: alerts.filter(a => a.priority === 'critical').length,
    high: alerts.filter(a => a.priority === 'high').length,
    medium: alerts.filter(a => a.priority === 'medium').length,
    low: alerts.filter(a => a.priority === 'low').length,
  };
}
