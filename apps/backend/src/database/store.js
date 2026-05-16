/**
 * In-Memory Data Store
 * Designed to be swappable with MongoDB/Firebase via interface adherence.
 */

class DataStore {
  constructor() {
    this.machines = new Map();
    this.alerts = [];
    this.predictions = new Map();
    this.automationLogs = [];
    this.workflows = [];
    this.sensorHistory = new Map();
    this.analyticsSnapshots = [];
  }

  // Machine methods
  setMachine(id, data) {
    this.machines.set(id, { ...data, updatedAt: new Date().toISOString() });
  }

  getMachine(id) {
    return this.machines.get(id) || null;
  }

  getAllMachines() {
    return Array.from(this.machines.values());
  }

  // Alert methods
  addAlert(alert) {
    this.alerts.unshift(alert);
    if (this.alerts.length > 500) this.alerts = this.alerts.slice(0, 500);
    return alert;
  }

  getAlerts(filters = {}) {
    let result = [...this.alerts];
    if (filters.priority) result = result.filter(a => a.priority === filters.priority);
    if (filters.machineId) result = result.filter(a => a.machineId === filters.machineId);
    if (filters.acknowledged !== undefined) result = result.filter(a => a.acknowledged === filters.acknowledged);
    return result;
  }

  acknowledgeAlert(id) {
    const alert = this.alerts.find(a => a.id === id);
    if (alert) {
      alert.acknowledged = true;
      alert.acknowledgedAt = new Date().toISOString();
    }
    return alert;
  }

  // Prediction methods
  setPrediction(machineId, prediction) {
    this.predictions.set(machineId, { ...prediction, timestamp: new Date().toISOString() });
  }

  getPrediction(machineId) {
    return this.predictions.get(machineId) || null;
  }

  getAllPredictions() {
    return Array.from(this.predictions.entries()).map(([machineId, pred]) => ({
      machineId,
      ...pred,
    }));
  }

  // Automation log methods
  addAutomationLog(log) {
    this.automationLogs.unshift(log);
    if (this.automationLogs.length > 300) this.automationLogs = this.automationLogs.slice(0, 300);
    return log;
  }

  getAutomationLogs(limit = 50) {
    return this.automationLogs.slice(0, limit);
  }

  // Workflow methods
  addWorkflow(workflow) {
    this.workflows.unshift(workflow);
    if (this.workflows.length > 100) this.workflows = this.workflows.slice(0, 100);
    return workflow;
  }

  getWorkflows() {
    return [...this.workflows];
  }

  updateWorkflow(id, updates) {
    const wf = this.workflows.find(w => w.id === id);
    if (wf) Object.assign(wf, updates, { updatedAt: new Date().toISOString() });
    return wf;
  }

  // Sensor history
  addSensorReading(machineId, reading) {
    if (!this.sensorHistory.has(machineId)) {
      this.sensorHistory.set(machineId, []);
    }
    const history = this.sensorHistory.get(machineId);
    history.push({ ...reading, timestamp: new Date().toISOString() });
    if (history.length > 200) history.splice(0, history.length - 200);
  }

  getSensorHistory(machineId, limit = 50) {
    const history = this.sensorHistory.get(machineId) || [];
    return history.slice(-limit);
  }

  // Analytics snapshots
  addAnalyticsSnapshot(snapshot) {
    this.analyticsSnapshots.push({ ...snapshot, timestamp: new Date().toISOString() });
    if (this.analyticsSnapshots.length > 500) this.analyticsSnapshots.splice(0, 100);
  }

  getAnalyticsSnapshots(limit = 50) {
    return this.analyticsSnapshots.slice(-limit);
  }
}

const store = new DataStore();
export default store;
