/**
 * Zero Downtime AI — Constants
 * Machine fleet definitions and system constants
 */

// ============================================
// Machine Fleet Configuration
// ============================================

export const MACHINES = [
  {
    id: 'MCH-001',
    name: 'CNC Milling Center',
    type: 'cnc_mill',
    location: 'Bay A - Section 1',
    model: 'ABB IRB 6700',
    installDate: '2023-03-15',
    icon: 'cog',
  },
  {
    id: 'MCH-002',
    name: 'Hydraulic Press Unit',
    type: 'hydraulic_press',
    location: 'Bay A - Section 2',
    model: 'ABB ACS880',
    installDate: '2022-11-20',
    icon: 'gauge',
  },
  {
    id: 'MCH-003',
    name: 'Industrial Robot Arm',
    type: 'robot_arm',
    location: 'Bay B - Section 1',
    model: 'ABB IRB 4600',
    installDate: '2024-01-10',
    icon: 'bot',
  },
  {
    id: 'MCH-004',
    name: 'Conveyor Belt System',
    type: 'conveyor_belt',
    location: 'Bay B - Section 2',
    model: 'ABB Dodge CST',
    installDate: '2023-07-25',
    icon: 'move-horizontal',
  },
  {
    id: 'MCH-005',
    name: 'Industrial Compressor',
    type: 'compressor',
    location: 'Bay C - Section 1',
    model: 'ABB Turbocharger A100',
    installDate: '2023-05-30',
    icon: 'wind',
  },
  {
    id: 'MCH-006',
    name: 'Cooling Tower Unit',
    type: 'cooling_tower',
    location: 'Bay C - Section 2',
    model: 'ABB ACS580',
    installDate: '2022-09-14',
    icon: 'snowflake',
  },
  {
    id: 'MCH-007',
    name: 'Robotic Welding Station',
    type: 'welding_station',
    location: 'Bay D - Section 1',
    model: 'ABB IRB 1520ID',
    installDate: '2024-02-28',
    icon: 'zap',
  },
  {
    id: 'MCH-008',
    name: 'Automated Packaging Line',
    type: 'packaging_line',
    location: 'Bay D - Section 2',
    model: 'ABB FlexPicker',
    installDate: '2023-12-05',
    icon: 'package',
  },
];

// ============================================
// Sensor Thresholds per Machine Type
// ============================================

export const SENSOR_THRESHOLDS = {
  cnc_mill: {
    temperature: { normal: [35, 65], warning: [65, 80], critical: [80, 120], unit: '°C' },
    vibration: { normal: [0.5, 3.0], warning: [3.0, 5.5], critical: [5.5, 10], unit: 'mm/s' },
    voltage: { normal: [380, 420], warning: [360, 380], critical: [0, 360], unit: 'V' },
    pressure: { normal: [4.0, 6.5], warning: [6.5, 8.0], critical: [8.0, 12], unit: 'bar' },
    rpm: { normal: [2000, 8000], warning: [8000, 10000], critical: [10000, 15000], unit: 'RPM' },
    power: { normal: [15, 45], warning: [45, 60], critical: [60, 100], unit: 'kW' },
    load: { normal: [20, 70], warning: [70, 85], critical: [85, 100], unit: '%' },
  },
  hydraulic_press: {
    temperature: { normal: [40, 70], warning: [70, 85], critical: [85, 130], unit: '°C' },
    vibration: { normal: [1.0, 4.0], warning: [4.0, 7.0], critical: [7.0, 12], unit: 'mm/s' },
    voltage: { normal: [380, 420], warning: [360, 380], critical: [0, 360], unit: 'V' },
    pressure: { normal: [100, 250], warning: [250, 300], critical: [300, 400], unit: 'bar' },
    rpm: { normal: [0, 0], warning: [0, 0], critical: [0, 0], unit: 'RPM' },
    power: { normal: [30, 75], warning: [75, 100], critical: [100, 150], unit: 'kW' },
    load: { normal: [30, 75], warning: [75, 90], critical: [90, 100], unit: '%' },
  },
  robot_arm: {
    temperature: { normal: [30, 55], warning: [55, 70], critical: [70, 100], unit: '°C' },
    vibration: { normal: [0.2, 2.0], warning: [2.0, 4.0], critical: [4.0, 8], unit: 'mm/s' },
    voltage: { normal: [380, 420], warning: [360, 380], critical: [0, 360], unit: 'V' },
    pressure: { normal: [3.0, 5.5], warning: [5.5, 7.0], critical: [7.0, 10], unit: 'bar' },
    rpm: { normal: [500, 3000], warning: [3000, 4000], critical: [4000, 6000], unit: 'RPM' },
    power: { normal: [5, 25], warning: [25, 35], critical: [35, 50], unit: 'kW' },
    load: { normal: [15, 65], warning: [65, 80], critical: [80, 100], unit: '%' },
  },
  conveyor_belt: {
    temperature: { normal: [25, 50], warning: [50, 65], critical: [65, 90], unit: '°C' },
    vibration: { normal: [0.3, 2.5], warning: [2.5, 4.5], critical: [4.5, 8], unit: 'mm/s' },
    voltage: { normal: [380, 420], warning: [360, 380], critical: [0, 360], unit: 'V' },
    pressure: { normal: [0, 0], warning: [0, 0], critical: [0, 0], unit: 'bar' },
    rpm: { normal: [100, 500], warning: [500, 700], critical: [700, 1000], unit: 'RPM' },
    power: { normal: [3, 15], warning: [15, 22], critical: [22, 35], unit: 'kW' },
    load: { normal: [20, 60], warning: [60, 80], critical: [80, 100], unit: '%' },
  },
  compressor: {
    temperature: { normal: [40, 75], warning: [75, 90], critical: [90, 130], unit: '°C' },
    vibration: { normal: [1.0, 4.5], warning: [4.5, 7.0], critical: [7.0, 12], unit: 'mm/s' },
    voltage: { normal: [380, 420], warning: [360, 380], critical: [0, 360], unit: 'V' },
    pressure: { normal: [6.0, 10.0], warning: [10.0, 13.0], critical: [13.0, 18], unit: 'bar' },
    rpm: { normal: [1500, 3600], warning: [3600, 4500], critical: [4500, 6000], unit: 'RPM' },
    power: { normal: [20, 55], warning: [55, 75], critical: [75, 100], unit: 'kW' },
    load: { normal: [25, 70], warning: [70, 85], critical: [85, 100], unit: '%' },
  },
  cooling_tower: {
    temperature: { normal: [20, 35], warning: [35, 45], critical: [45, 60], unit: '°C' },
    vibration: { normal: [0.5, 2.5], warning: [2.5, 4.0], critical: [4.0, 7], unit: 'mm/s' },
    voltage: { normal: [380, 420], warning: [360, 380], critical: [0, 360], unit: 'V' },
    pressure: { normal: [1.5, 3.5], warning: [3.5, 5.0], critical: [5.0, 8], unit: 'bar' },
    rpm: { normal: [800, 1800], warning: [1800, 2400], critical: [2400, 3500], unit: 'RPM' },
    power: { normal: [10, 30], warning: [30, 45], critical: [45, 65], unit: 'kW' },
    load: { normal: [20, 65], warning: [65, 80], critical: [80, 100], unit: '%' },
  },
  welding_station: {
    temperature: { normal: [50, 85], warning: [85, 100], critical: [100, 150], unit: '°C' },
    vibration: { normal: [0.8, 3.5], warning: [3.5, 6.0], critical: [6.0, 10], unit: 'mm/s' },
    voltage: { normal: [380, 420], warning: [360, 380], critical: [0, 360], unit: 'V' },
    pressure: { normal: [2.0, 5.0], warning: [5.0, 7.0], critical: [7.0, 10], unit: 'bar' },
    rpm: { normal: [0, 0], warning: [0, 0], critical: [0, 0], unit: 'RPM' },
    power: { normal: [20, 60], warning: [60, 80], critical: [80, 120], unit: 'kW' },
    load: { normal: [25, 70], warning: [70, 85], critical: [85, 100], unit: '%' },
  },
  packaging_line: {
    temperature: { normal: [25, 45], warning: [45, 55], critical: [55, 75], unit: '°C' },
    vibration: { normal: [0.3, 2.0], warning: [2.0, 3.5], critical: [3.5, 6], unit: 'mm/s' },
    voltage: { normal: [380, 420], warning: [360, 380], critical: [0, 360], unit: 'V' },
    pressure: { normal: [2.0, 4.0], warning: [4.0, 5.5], critical: [5.5, 8], unit: 'bar' },
    rpm: { normal: [200, 800], warning: [800, 1100], critical: [1100, 1500], unit: 'RPM' },
    power: { normal: [5, 20], warning: [20, 30], critical: [30, 45], unit: 'kW' },
    load: { normal: [15, 60], warning: [60, 78], critical: [78, 100], unit: '%' },
  },
};

// ============================================
// API Endpoints
// ============================================

export const API_ENDPOINTS = {
  MACHINES: '/api/machines',
  PREDICTIONS: '/api/predictions',
  ALERTS: '/api/alerts',
  ANALYTICS: '/api/analytics',
  AUTOMATION: '/api/automation',
  SIMULATION: '/api/simulation',
};

// ============================================
// Simulation Config
// ============================================

export const SIMULATION_CONFIG = {
  UPDATE_INTERVAL_MS: 3000,
  ANOMALY_PROBABILITY: 0.05,
  RECOVERY_RATE: 0.02,
  MAX_HISTORY_POINTS: 100,
  SENSOR_NOISE_FACTOR: 0.03,
};

// ============================================
// Alert Config
// ============================================

export const ALERT_CONFIG = {
  MAX_ALERTS: 200,
  AUTO_DISMISS_TIMEOUT_MS: 30000,
  PRIORITIES: ['low', 'medium', 'high', 'critical'],
};
