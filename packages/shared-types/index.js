/**
 * Zero Downtime AI — Shared Type Definitions
 * @module shared-types
 */

// ============================================
// Machine Types
// ============================================

/** @enum {string} */
export const MachineStatus = {
  HEALTHY: 'healthy',
  WARNING: 'warning',
  CRITICAL: 'critical',
  MAINTENANCE: 'maintenance',
  OFFLINE: 'offline',
};

/** @enum {string} */
export const MachineType = {
  CNC_MILL: 'cnc_mill',
  HYDRAULIC_PRESS: 'hydraulic_press',
  ROBOT_ARM: 'robot_arm',
  CONVEYOR_BELT: 'conveyor_belt',
  COMPRESSOR: 'compressor',
  COOLING_TOWER: 'cooling_tower',
  WELDING_STATION: 'welding_station',
  PACKAGING_LINE: 'packaging_line',
};

// ============================================
// Sensor Types
// ============================================

/** @enum {string} */
export const SensorType = {
  TEMPERATURE: 'temperature',
  VIBRATION: 'vibration',
  VOLTAGE: 'voltage',
  PRESSURE: 'pressure',
  RPM: 'rpm',
  POWER: 'power',
  LOAD: 'load',
  CURRENT: 'current',
};

// ============================================
// Alert Types
// ============================================

/** @enum {string} */
export const AlertPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical',
};

/** @enum {string} */
export const AlertCategory = {
  TEMPERATURE: 'temperature',
  VIBRATION: 'vibration',
  POWER: 'power',
  PRESSURE: 'pressure',
  SYSTEM: 'system',
  MAINTENANCE: 'maintenance',
  PREDICTION: 'prediction',
};

// ============================================
// Prediction Types
// ============================================

/** @enum {string} */
export const RiskCategory = {
  HEALTHY: 'healthy',
  MODERATE: 'moderate',
  HIGH: 'high',
  CRITICAL: 'critical',
};

// ============================================
// Automation Types
// ============================================

/** @enum {string} */
export const AutomationAction = {
  REDUCE_LOAD: 'reduce_load',
  SCHEDULE_MAINTENANCE: 'schedule_maintenance',
  NOTIFY_OPERATOR: 'notify_operator',
  ACTIVATE_BACKUP: 'activate_backup',
  EMERGENCY_SHUTDOWN: 'emergency_shutdown',
  ADJUST_PARAMETERS: 'adjust_parameters',
};

/** @enum {string} */
export const WorkflowStatus = {
  PENDING: 'pending',
  EXECUTING: 'executing',
  COMPLETED: 'completed',
  FAILED: 'failed',
};
