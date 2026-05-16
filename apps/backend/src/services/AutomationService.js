/**
 * Automation Service (Facade for AutomationEngine)
 */
import store from '../database/store.js';
import automationEngine from '../automation/AutomationEngine.js';

export function getWorkflows() {
  return store.getWorkflows();
}

export function getAutomationLogs(limit = 50) {
  return store.getAutomationLogs(limit);
}

export function getRules() {
  return automationEngine.getRules();
}

export function getAutomationStatus() {
  return automationEngine.getStatus();
}
