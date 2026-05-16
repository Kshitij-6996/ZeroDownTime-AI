import * as MachineService from '../services/MachineService.js';

export function getAll(req, res) {
  const machines = MachineService.getAllMachines();
  res.json({ success: true, data: machines, count: machines.length });
}

export function getById(req, res) {
  const machine = MachineService.getMachineById(req.params.id);
  if (!machine) return res.status(404).json({ success: false, error: 'Machine not found' });
  res.json({ success: true, data: machine });
}

export function getHistory(req, res) {
  const limit = parseInt(req.query.limit) || 50;
  const history = MachineService.getMachineHistory(req.params.id, limit);
  res.json({ success: true, data: history, count: history.length });
}

export function getOverview(req, res) {
  const overview = MachineService.getFactoryOverview();
  res.json({ success: true, data: overview });
}
