/**
 * Prediction Service
 * Routes all predictions through the Python AI microservice as primary path.
 * Falls back to local heuristics only when AI service is unavailable.
 */
import store from '../database/store.js';
import config from '../config/index.js';

export async function getPrediction(machineId) {
  const machine = store.getMachine(machineId);
  if (!machine) return null;

  // Try AI service first
  const prediction = await fetchAIPrediction(machine);
  store.setPrediction(machineId, prediction);
  return prediction;
}

export async function getAllPredictions() {
  const machines = store.getAllMachines();
  const results = [];

  for (const machine of machines) {
    const prediction = await fetchAIPrediction(machine);
    store.setPrediction(machine.id, prediction);
    results.push({ machineId: machine.id, machineName: machine.name, ...prediction });
  }
  return results;
}

async function fetchAIPrediction(machine) {
  try {
    const response = await fetch(`${config.aiServiceUrl}/api/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        machine_id: machine.id,
        temperature: machine.sensors.temperature || 50,
        vibration: machine.sensors.vibration || 2.0,
        voltage: machine.sensors.voltage || 400,
        current: machine.sensors.current || 5.0,
        pressure: machine.sensors.pressure || 5.0,
        rpm: machine.sensors.rpm || 3000,
        power: machine.sensors.power || 30,
        load: machine.sensors.load || 50,
        runtime_hours: machine.sensors.runtime_hours || machine.uptime || 1000,
        maintenance_gap_hours: machine.sensors.maintenance_gap_hours || 200,
        efficiency: machine.sensors.efficiency || machine.efficiency || 92,
        thermal_fluctuation: machine.sensors.thermal_fluctuation || 1.0,
        vibration_instability: machine.sensors.vibration_instability || 0.3,
      }),
    });

    if (!response.ok) throw new Error(`AI service returned ${response.status}`);
    const aiResult = await response.json();

    // Map AI response to frontend format
    return {
      riskScore: aiResult.risk_score,
      failureProbability: aiResult.failure_probability,
      riskCategory: aiResult.risk_category,
      healthScore: aiResult.health_score,
      predictedFailureType: aiResult.predicted_failure_type,
      predictedFailureTime: aiResult.predicted_failure_time,
      confidenceScore: aiResult.confidence_score,
      severityLevel: aiResult.severity_level,
      estimatedDowntimeHours: aiResult.estimated_downtime_hours,
      suggestions: aiResult.suggestions,
      explanation: aiResult.explanation || [],
      featureContributions: aiResult.feature_contributions || {},
      anomalies: (aiResult.anomaly?.anomalous_sensors || []).map(s => ({
        sensor: s,
        severity: aiResult.anomaly?.is_anomaly ? 'high' : 'medium',
      })),
      anomalyScore: aiResult.anomaly?.anomaly_score || 0,
      isAnomaly: aiResult.anomaly?.is_anomaly || false,
      modelUsed: aiResult.model_used || 'ai-service-v2',
      confidence: aiResult.confidence_score > 0.7 ? 'high' :
                  aiResult.confidence_score > 0.4 ? 'moderate' : 'low',
      modelMetadata: aiResult.model_metadata || {},
    };
  } catch {
    // Fallback to local heuristic
    return calculateLocalPrediction(machine);
  }
}

function calculateLocalPrediction(machine) {
  const riskScore = machine.riskScore || 0;
  const failureProbability = machine.failureProbability || 0;

  let riskCategory = 'healthy';
  if (riskScore > 75) riskCategory = 'critical';
  else if (riskScore > 50) riskCategory = 'high';
  else if (riskScore > 25) riskCategory = 'moderate';

  let predictedFailureTime = null;
  if (failureProbability > 30) {
    const hours = Math.max(0.5, (100 - failureProbability) / 10);
    predictedFailureTime = `${hours.toFixed(1)} hours`;
  }

  return {
    riskScore: Number(riskScore.toFixed(1)),
    failureProbability: Number(failureProbability.toFixed(1)),
    riskCategory,
    predictedFailureTime,
    healthScore: Number((100 - riskScore).toFixed(1)),
    predictedFailureType: 'none',
    confidenceScore: 0,
    severityLevel: riskScore > 50 ? 'high' : 'low',
    estimatedDowntimeHours: 0,
    suggestions: ['Start AI service for ML-powered predictions'],
    explanation: ['Using heuristic fallback - AI service not available'],
    featureContributions: {},
    anomalies: [],
    anomalyScore: 0,
    isAnomaly: false,
    modelUsed: 'fallback-heuristic-v1',
    confidence: 'low',
    modelMetadata: {},
  };
}

export async function getModelInfo() {
  try {
    const response = await fetch(`${config.aiServiceUrl}/api/model-info`);
    if (!response.ok) throw new Error('AI service unavailable');
    return await response.json();
  } catch {
    return {
      models_loaded: false,
      error: 'AI service not available',
    };
  }
}

export async function getAIPrediction(machineId) {
  const machine = store.getMachine(machineId);
  if (!machine) return null;
  return fetchAIPrediction(machine);
}
