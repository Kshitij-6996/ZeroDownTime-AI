/**
 * Simulation Engine
 * Generates realistic industrial sensor data with anomaly injection capability.
 */

import { v4 as uuidv4 } from 'uuid';
import store from '../database/store.js';
import config from '../config/index.js';

const MACHINES_CONFIG = [
  { id: 'MCH-001', name: 'CNC Milling Center', type: 'cnc_mill', location: 'Bay A - Section 1' },
  { id: 'MCH-002', name: 'Hydraulic Press Unit', type: 'hydraulic_press', location: 'Bay A - Section 2' },
  { id: 'MCH-003', name: 'Industrial Robot Arm', type: 'robot_arm', location: 'Bay B - Section 1' },
  { id: 'MCH-004', name: 'Conveyor Belt System', type: 'conveyor_belt', location: 'Bay B - Section 2' },
  { id: 'MCH-005', name: 'Industrial Compressor', type: 'compressor', location: 'Bay C - Section 1' },
  { id: 'MCH-006', name: 'Cooling Tower Unit', type: 'cooling_tower', location: 'Bay C - Section 2' },
  { id: 'MCH-007', name: 'Robotic Welding Station', type: 'welding_station', location: 'Bay D - Section 1' },
  { id: 'MCH-008', name: 'Automated Packaging Line', type: 'packaging_line', location: 'Bay D - Section 2' },
];

// Normal operating ranges per machine type
const SENSOR_RANGES = {
  cnc_mill: { temperature: [40, 60], vibration: [1.0, 2.5], voltage: [395, 410], pressure: [4.5, 6.0], rpm: [3000, 6000], power: [20, 40], load: [30, 65] },
  hydraulic_press: { temperature: [45, 65], vibration: [1.5, 3.5], voltage: [395, 410], pressure: [120, 220], rpm: [0, 0], power: [35, 65], load: [35, 70] },
  robot_arm: { temperature: [35, 50], vibration: [0.5, 1.5], voltage: [395, 410], pressure: [3.5, 5.0], rpm: [800, 2500], power: [8, 20], load: [20, 55] },
  conveyor_belt: { temperature: [30, 45], vibration: [0.5, 2.0], voltage: [395, 410], pressure: [0, 0], rpm: [150, 400], power: [5, 12], load: [25, 55] },
  compressor: { temperature: [50, 70], vibration: [1.5, 3.5], voltage: [395, 410], pressure: [7.0, 9.0], rpm: [2000, 3200], power: [25, 50], load: [30, 65] },
  cooling_tower: { temperature: [22, 32], vibration: [0.8, 2.0], voltage: [395, 410], pressure: [2.0, 3.0], rpm: [1000, 1600], power: [12, 25], load: [25, 60] },
  welding_station: { temperature: [55, 80], vibration: [1.0, 3.0], voltage: [395, 410], pressure: [2.5, 4.5], rpm: [0, 0], power: [25, 55], load: [30, 65] },
  packaging_line: { temperature: [28, 40], vibration: [0.5, 1.5], voltage: [395, 410], pressure: [2.5, 3.5], rpm: [300, 700], power: [6, 16], load: [20, 55] },
};

// Warning/critical thresholds
const THRESHOLDS = {
  cnc_mill: { temperature: { warn: 70, crit: 85 }, vibration: { warn: 4.0, crit: 6.0 }, load: { warn: 75, crit: 90 } },
  hydraulic_press: { temperature: { warn: 75, crit: 90 }, vibration: { warn: 5.0, crit: 7.5 }, load: { warn: 80, crit: 92 } },
  robot_arm: { temperature: { warn: 60, crit: 75 }, vibration: { warn: 2.5, crit: 4.5 }, load: { warn: 70, crit: 85 } },
  conveyor_belt: { temperature: { warn: 55, crit: 70 }, vibration: { warn: 3.0, crit: 5.0 }, load: { warn: 65, crit: 82 } },
  compressor: { temperature: { warn: 80, crit: 95 }, vibration: { warn: 5.0, crit: 7.5 }, load: { warn: 75, crit: 88 } },
  cooling_tower: { temperature: { warn: 38, crit: 48 }, vibration: { warn: 3.0, crit: 4.5 }, load: { warn: 70, crit: 85 } },
  welding_station: { temperature: { warn: 90, crit: 105 }, vibration: { warn: 4.0, crit: 6.5 }, load: { warn: 75, crit: 88 } },
  packaging_line: { temperature: { warn: 48, crit: 60 }, vibration: { warn: 2.5, crit: 4.0 }, load: { warn: 65, crit: 80 } },
};

class SimulationEngine {
  constructor() {
    this.isRunning = false;
    this.intervalId = null;
    this.machineStates = new Map();
    this.anomalyTargets = new Set();
    this.tickCount = 0;
  }

  initialize() {
    MACHINES_CONFIG.forEach(machine => {
      const ranges = SENSOR_RANGES[machine.type];
      const sensors = {};
      for (const [key, [min, max]] of Object.entries(ranges)) {
        sensors[key] = this._randomBetween(min, max);
      }

      const state = {
        ...machine,
        status: 'healthy',
        sensors,
        efficiency: this._randomBetween(88, 98),
        uptime: this._randomBetween(95, 99.9),
        lastMaintenance: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        operatingHours: Math.floor(this._randomBetween(1000, 8000)),
        riskScore: this._randomBetween(5, 20),
        failureProbability: this._randomBetween(2, 15),
      };
      this.machineStates.set(machine.id, state);
      store.setMachine(machine.id, state);
    });

    console.log(`[SimEngine] Initialized ${MACHINES_CONFIG.length} machines`);
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this._tick(), config.simulation.intervalMs);
    console.log(`[SimEngine] Started (interval: ${config.simulation.intervalMs}ms)`);
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.intervalId);
    console.log('[SimEngine] Stopped');
  }

  injectAnomaly(machineId) {
    if (!this.machineStates.has(machineId)) return false;
    this.anomalyTargets.add(machineId);
    console.log(`[SimEngine] Anomaly injection queued for ${machineId}`);
    return true;
  }

  clearAnomaly(machineId) {
    this.anomalyTargets.delete(machineId);
  }

  resetMachine(machineId) {
    this.anomalyTargets.delete(machineId);
    const machine = this.machineStates.get(machineId);
    if (!machine) return;
    const ranges = SENSOR_RANGES[machine.type];
    for (const [key, [min, max]] of Object.entries(ranges)) {
      machine.sensors[key] = this._randomBetween(min, max);
    }
    machine.status = 'healthy';
    machine.riskScore = this._randomBetween(5, 20);
    machine.failureProbability = this._randomBetween(2, 15);
    store.setMachine(machineId, machine);
  }

  resetAll() {
    this.anomalyTargets.clear();
    for (const id of this.machineStates.keys()) {
      this.resetMachine(id);
    }
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      tickCount: this.tickCount,
      machineCount: this.machineStates.size,
      anomalyTargets: Array.from(this.anomalyTargets),
      intervalMs: config.simulation.intervalMs,
    };
  }

  _tick() {
    this.tickCount++;

    for (const [id, machine] of this.machineStates) {
      const isAnomaly = this.anomalyTargets.has(id);
      const naturalAnomaly = Math.random() < config.simulation.anomalyProbability;

      if (isAnomaly || naturalAnomaly) {
        this._applyAnomalyDrift(machine);
      } else if (machine.status !== 'healthy') {
        this._applyRecoveryDrift(machine);
      } else {
        this._applyNormalDrift(machine);
      }

      this._updateStatus(machine);
      this._calculateRisk(machine);
      store.setMachine(id, machine);
      store.addSensorReading(id, { ...machine.sensors });
    }

    // Periodic analytics snapshot
    if (this.tickCount % 10 === 0) {
      this._captureAnalyticsSnapshot();
    }
  }

  _applyNormalDrift(machine) {
    const ranges = SENSOR_RANGES[machine.type];
    for (const [key, [min, max]] of Object.entries(ranges)) {
      const center = (min + max) / 2;
      const current = machine.sensors[key];
      // Drift toward center with noise
      machine.sensors[key] = current + (center - current) * 0.05 + this._gaussian() * (max - min) * 0.02;
      machine.sensors[key] = Math.max(min * 0.8, Math.min(max * 1.2, machine.sensors[key]));
    }
    machine.efficiency = Math.min(99, machine.efficiency + this._gaussian() * 0.3);
  }

  _applyAnomalyDrift(machine) {
    const ranges = SENSOR_RANGES[machine.type];
    const thresholds = THRESHOLDS[machine.type];

    // Increase temperature aggressively
    const tempRange = ranges.temperature;
    machine.sensors.temperature += this._randomBetween(0.5, 2.5);
    machine.sensors.temperature = Math.min(thresholds.temperature.crit * 1.3, machine.sensors.temperature);

    // Increase vibration
    machine.sensors.vibration += this._randomBetween(0.1, 0.5);
    machine.sensors.vibration = Math.min(thresholds.vibration.crit * 1.2, machine.sensors.vibration);

    // Increase load
    machine.sensors.load += this._randomBetween(0.5, 2.0);
    machine.sensors.load = Math.min(100, machine.sensors.load);

    // Increase power
    const powerRange = ranges.power;
    machine.sensors.power += this._randomBetween(0.3, 1.5);
    machine.sensors.power = Math.min(powerRange[1] * 1.8, machine.sensors.power);

    // Slight voltage drop
    machine.sensors.voltage -= this._randomBetween(0, 1.5);
    machine.sensors.voltage = Math.max(350, machine.sensors.voltage);

    // Efficiency drops
    machine.efficiency = Math.max(40, machine.efficiency - this._randomBetween(0.5, 2.0));
  }

  _applyRecoveryDrift(machine) {
    const ranges = SENSOR_RANGES[machine.type];
    for (const [key, [min, max]] of Object.entries(ranges)) {
      const center = (min + max) / 2;
      const current = machine.sensors[key];
      machine.sensors[key] = current + (center - current) * 0.08;
    }
    machine.efficiency = Math.min(98, machine.efficiency + 0.5);
  }

  _updateStatus(machine) {
    const thresholds = THRESHOLDS[machine.type];
    let status = 'healthy';

    if (machine.sensors.temperature >= thresholds.temperature.crit ||
        machine.sensors.vibration >= thresholds.vibration.crit ||
        machine.sensors.load >= thresholds.load.crit) {
      status = 'critical';
    } else if (machine.sensors.temperature >= thresholds.temperature.warn ||
               machine.sensors.vibration >= thresholds.vibration.warn ||
               machine.sensors.load >= thresholds.load.warn) {
      status = 'warning';
    }

    machine.status = status;
  }

  _calculateRisk(machine) {
    const thresholds = THRESHOLDS[machine.type];
    const ranges = SENSOR_RANGES[machine.type];

    // Normalized deviation scores
    const tempScore = Math.max(0, (machine.sensors.temperature - ranges.temperature[1]) / (thresholds.temperature.crit - ranges.temperature[1])) * 40;
    const vibScore = Math.max(0, (machine.sensors.vibration - ranges.vibration[1]) / (thresholds.vibration.crit - ranges.vibration[1])) * 30;
    const loadScore = Math.max(0, (machine.sensors.load - ranges.load[1]) / (thresholds.load.crit - ranges.load[1])) * 20;
    const effScore = Math.max(0, (85 - machine.efficiency) / 45) * 10;

    machine.riskScore = Math.min(100, Math.max(0, tempScore + vibScore + loadScore + effScore));
    machine.failureProbability = Math.min(99, Math.max(1, machine.riskScore * 0.95 + this._gaussian() * 3));
  }

  _captureAnalyticsSnapshot() {
    const machines = this.machineStates;
    let totalEfficiency = 0;
    let healthyCount = 0;
    let warningCount = 0;
    let criticalCount = 0;

    for (const m of machines.values()) {
      totalEfficiency += m.efficiency;
      if (m.status === 'healthy') healthyCount++;
      else if (m.status === 'warning') warningCount++;
      else if (m.status === 'critical') criticalCount++;
    }

    store.addAnalyticsSnapshot({
      avgEfficiency: totalEfficiency / machines.size,
      healthyCount,
      warningCount,
      criticalCount,
      totalMachines: machines.size,
    });
  }

  _randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  _gaussian() {
    const u1 = Math.random();
    const u2 = Math.random();
    return Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  }
}

const simulationEngine = new SimulationEngine();
export default simulationEngine;
