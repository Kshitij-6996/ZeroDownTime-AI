import * as AlertService from '../services/AlertService.js';

export function getAll(req, res) {
  const filters = {
    priority: req.query.priority,
    machineId: req.query.machineId,
    acknowledged: req.query.acknowledged === 'true' ? true : req.query.acknowledged === 'false' ? false : undefined,
  };
  const alerts = AlertService.getAllAlerts(filters);
  res.json({ success: true, data: alerts, count: alerts.length });
}

export function acknowledge(req, res) {
  const alert = AlertService.acknowledgeAlert(req.params.id);
  if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
  res.json({ success: true, data: alert });
}

export function getStats(req, res) {
  const stats = AlertService.getAlertStats();
  res.json({ success: true, data: stats });
}
