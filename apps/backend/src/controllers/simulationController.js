import simulationEngine from '../simulation/SimulationEngine.js';

export function injectAnomaly(req, res) {
  const { machineId } = req.body;
  if (!machineId) return res.status(400).json({ success: false, error: 'machineId required' });
  const success = simulationEngine.injectAnomaly(machineId);
  if (!success) return res.status(404).json({ success: false, error: 'Machine not found' });
  res.json({ success: true, message: `Anomaly injection started for ${machineId}` });
}

export function reset(req, res) {
  simulationEngine.resetAll();
  res.json({ success: true, message: 'Simulation reset complete' });
}

export function getStatus(req, res) {
  const status = simulationEngine.getStatus();
  res.json({ success: true, data: status });
}

export function resetMachine(req, res) {
  const { machineId } = req.body;
  if (!machineId) return res.status(400).json({ success: false, error: 'machineId required' });
  simulationEngine.resetMachine(machineId);
  simulationEngine.clearAnomaly(machineId);
  res.json({ success: true, message: `Machine ${machineId} reset` });
}
