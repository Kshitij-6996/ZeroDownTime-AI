import * as PredictionService from '../services/PredictionService.js';

export async function getAll(req, res) {
  const predictions = await PredictionService.getAllPredictions();
  res.json({ success: true, data: predictions });
}

export async function getByMachine(req, res) {
  const prediction = await PredictionService.getPrediction(req.params.machineId);
  if (!prediction) return res.status(404).json({ success: false, error: 'Machine not found' });
  res.json({ success: true, data: prediction });
}

export async function analyze(req, res) {
  const { machineId } = req.body;
  if (!machineId) return res.status(400).json({ success: false, error: 'machineId required' });
  const prediction = await PredictionService.getAIPrediction(machineId);
  if (!prediction) return res.status(404).json({ success: false, error: 'Machine not found' });
  res.json({ success: true, data: prediction });
}

export async function modelInfo(req, res) {
  const info = await PredictionService.getModelInfo();
  res.json({ success: true, data: info });
}
