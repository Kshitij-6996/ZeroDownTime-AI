import * as AutomationService from '../services/AutomationService.js';

export function getWorkflows(req, res) {
  const workflows = AutomationService.getWorkflows();
  res.json({ success: true, data: workflows });
}

export function getLogs(req, res) {
  const limit = parseInt(req.query.limit) || 50;
  const logs = AutomationService.getAutomationLogs(limit);
  res.json({ success: true, data: logs, count: logs.length });
}

export function getRules(req, res) {
  const rules = AutomationService.getRules();
  res.json({ success: true, data: rules });
}

export function getStatus(req, res) {
  const status = AutomationService.getAutomationStatus();
  res.json({ success: true, data: status });
}
