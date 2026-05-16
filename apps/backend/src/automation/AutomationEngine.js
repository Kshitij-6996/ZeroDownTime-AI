/**
 * Automation Engine
 * Event-driven rule engine for automated preventive responses with rich narrative generation.
 */

import { v4 as uuidv4 } from 'uuid';
import store from '../database/store.js';
import simulationEngine from '../simulation/SimulationEngine.js';

// Realistic Industrial Automation Rules
const AUTOMATION_RULES = [
  {
    id: 'RULE-THERMAL',
    name: 'Thermal Overload Protocol',
    condition: (machine) => machine.status === 'critical' && machine.sensors.temperature > 85,
    description: 'Triggered when operating temperature exceeds critical threshold',
    actions: ['thermal_response'],
  },
  {
    id: 'RULE-VIBRATION',
    name: 'Vibration Instability Protocol',
    condition: (machine) => machine.sensors.vibration > 5.5,
    description: 'Triggered when chassis or spindle vibration indicates bearing degradation',
    actions: ['vibration_response'],
  },
  {
    id: 'RULE-POWER',
    name: 'Power Instability Protocol',
    condition: (machine) => machine.sensors.voltage < 370 || machine.sensors.power > 50,
    description: 'Triggered during severe voltage drop or anomalous power draw',
    actions: ['power_response'],
  },
  {
    id: 'RULE-EFFICIENCY',
    name: 'Efficiency Degradation Protocol',
    condition: (machine) => machine.efficiency < 60,
    description: 'Triggered when overall equipment effectiveness (OEE) drops below baseline',
    actions: ['efficiency_response'],
  },
];

// Rich Action Executors
const ACTION_EXECUTORS = {
  thermal_response: (machine) => {
    const reduction = Math.min(25, machine.sensors.load * 0.3);
    machine.sensors.load = Math.max(15, machine.sensors.load - reduction);
    machine.sensors.temperature -= 12; // aggressive cooling
    
    return {
      severity: 'CRITICAL',
      aiAnalysis: `Temperature exceeded safe operating threshold by ${Math.floor(machine.sensors.temperature - 75)}%. Detected prolonged thermal load on primary drive matrix.`,
      actionSteps: [
        `Reduced spindle RPM and machine load by ${reduction.toFixed(0)}%`,
        'Increased coolant circulation to maximum flow rate',
        'Redistributed queue workload to backup unit',
        'Scheduled thermal imaging inspection',
        'Activated temperature stabilization mode'
      ],
      result: `Risk reduced. Temperature stabilized at ${machine.sensors.temperature.toFixed(1)}°C.`,
    };
  },

  vibration_response: (machine) => {
    machine.sensors.vibration = Math.max(1.0, machine.sensors.vibration - 3.5);
    machine.sensors.load -= 15;
    
    return {
      severity: 'HIGH',
      aiAnalysis: 'Anomalous harmonic frequencies detected matching early-stage bearing degradation patterns.',
      actionSteps: [
        'Reduced operational load to minimize structural stress',
        'Triggered automated bearing acoustic diagnostics',
        'Enabled active vibration dampening sequence',
        'Flagged shaft alignment for physical inspection',
        'Generated predictive maintenance ticket (Priority 2)'
      ],
      result: `Vibration normalized to ${machine.sensors.vibration.toFixed(2)} mm/s. Safe operation resumed.`,
    };
  },

  power_response: (machine) => {
    machine.sensors.voltage = 400; // stabilized
    machine.sensors.power = Math.max(10, machine.sensors.power - 15);
    
    return {
      severity: 'CRITICAL',
      aiAnalysis: 'Voltage sags detected on Phase B. Potential power supply unit failure or grid instability.',
      actionSteps: [
        'Stabilized voltage input via active filtering',
        'Activated backup capacitor regulation system',
        'Reduced peak power draw to prevent breaker trip',
        'Enabled safe operational power mode',
        'Alerted facility electrical engineering team'
      ],
      result: 'Voltage stabilized at 400V. Backup systems online.',
    };
  },

  efficiency_response: (machine) => {
    machine.efficiency = Math.min(95, machine.efficiency + 25);
    
    return {
      severity: 'MODERATE',
      aiAnalysis: 'Sustained micro-stoppages and throughput reduction detected indicating suboptimal mechanical state.',
      actionSteps: [
        'Initiated algorithmic efficiency optimization sequence',
        'Rebalanced machine dynamic workload parameters',
        'Scheduled automated lubrication system cycle',
        'Recommended preventive recalibration during next shift'
      ],
      result: `Efficiency projection improved to ${machine.efficiency.toFixed(1)}%. Monitoring closely.`,
    };
  },
};

class AutomationEngine {
  constructor() {
    this.rules = AUTOMATION_RULES;
    this.isRunning = false;
    this.intervalId = null;
    this.executionCount = 0;
    this.recentlyTriggered = new Map(); // cooldown tracking
  }

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.intervalId = setInterval(() => this._evaluate(), 5000);
    console.log('[AutoEngine] Started');
  }

  stop() {
    if (!this.isRunning) return;
    this.isRunning = false;
    clearInterval(this.intervalId);
    console.log('[AutoEngine] Stopped');
  }

  _evaluate() {
    const machines = store.getAllMachines();

    for (const machine of machines) {
      for (const rule of this.rules) {
        const cooldownKey = `${machine.id}-${rule.id}`;
        const lastTriggered = this.recentlyTriggered.get(cooldownKey);

        // 20-second cooldown per machine-rule combination
        if (lastTriggered && Date.now() - lastTriggered < 20000) continue;

        try {
          if (rule.condition(machine)) {
            this._executeRule(rule, machine);
            this.recentlyTriggered.set(cooldownKey, Date.now());
          }
        } catch (err) {
          console.error(`[AutoEngine] Rule evaluation error: ${rule.id}`, err.message);
        }
      }
    }
  }

  _executeRule(rule, machine) {
    const workflowId = uuidv4();
    const prevRisk = machine.riskScore;

    // Create workflow placeholder
    const workflow = {
      id: workflowId,
      ruleId: rule.id,
      ruleName: rule.name,
      machineId: machine.id,
      machineName: machine.name,
      status: 'executing',
      triggeredAt: new Date().toISOString(),
      actions: [],
    };

    store.addWorkflow(workflow);

    const logEntries = [];

    // Execute actions
    for (const actionType of rule.actions) {
      const executor = ACTION_EXECUTORS[actionType];
      if (executor) {
        // Execute the rich response
        const result = executor(machine);
        
        // Recalculate risk temporarily to show improvement
        const newRisk = Math.max(10, machine.riskScore - 25);
        machine.riskScore = newRisk;
        machine.failureProbability = Math.max(1, machine.failureProbability - 30);
        machine.status = newRisk > 70 ? 'warning' : 'healthy';

        const finalResultString = `${result.result} (Risk reduced from ${prevRisk.toFixed(0)}% to ${newRisk.toFixed(0)}%)`;

        const logEntry = {
          id: uuidv4(),
          workflowId,
          machineId: machine.id,
          machineName: machine.name,
          ruleId: rule.id,
          ruleName: rule.name,
          action: actionType,
          severity: result.severity,
          aiAnalysis: result.aiAnalysis,
          actionSteps: result.actionSteps,
          result: finalResultString,
          timestamp: new Date().toISOString(),
        };

        logEntries.push(logEntry);
        store.addAutomationLog(logEntry);

        // Create alert
        store.addAlert({
          id: uuidv4(),
          machineId: machine.id,
          machineName: machine.name,
          type: 'automation',
          category: 'system',
          priority: result.severity.toLowerCase(),
          title: `Automation: ${rule.name}`,
          message: `Executed ${result.actionSteps.length} preventive steps. System stabilized.`,
          acknowledged: false,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Update machine state
    store.setMachine(machine.id, machine);

    // Complete workflow
    store.updateWorkflow(workflowId, {
      status: 'completed',
      completedAt: new Date().toISOString(),
      actions: logEntries,
    });

    this.executionCount++;
    console.log(`[AutoEngine] Executed ${rule.name} on ${machine.name}`);
  }

  getStatus() {
    return {
      isRunning: this.isRunning,
      rulesCount: this.rules.length,
      executionCount: this.executionCount,
    };
  }

  getRules() {
    return this.rules.map(r => ({
      id: r.id,
      name: r.name,
      description: r.description,
      actions: r.actions,
    }));
  }
}

const automationEngine = new AutomationEngine();
export default automationEngine;
