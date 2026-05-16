import { useCallback } from 'react';
import { usePolling } from '../../hooks/usePolling';
import { machineService, simulationService } from '../../services/dataService';
import { GlassCard, StatusBadge, PulseIndicator } from '../ui/index';
import { motion } from 'framer-motion';
import { Thermometer, Activity, Zap, Gauge, AlertTriangle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAnomalyUX } from '../../context/AnomalyUXContext';

export default function MachineCard({ machine, index = 0 }) {
  const navigate = useNavigate();
  const { triggerAnomalySequence } = useAnomalyUX();
  const s = machine?.sensors || {};

  const handleInjectAnomaly = async (e) => {
    e.stopPropagation();
    try {
      triggerAnomalySequence(machine.name);
      await simulationService.injectAnomaly(machine.id);
    } catch (err) {
      console.error('Anomaly injection failed:', err);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      onClick={() => navigate(`/machines/${machine.id}`)}
      className={`glass-card p-5 cursor-pointer group transition-all duration-300 hover:scale-[1.02] relative overflow-hidden ${
        machine.status === 'critical' ? 'shadow-[0_0_20px_rgba(239,68,68,0.2)] border-red-500/20' : ''
      }`}
    >
      {/* Background Pulse for Critical State */}
      {machine.status === 'critical' && (
        <div className="absolute inset-0 bg-red-500/5 animate-pulse pointer-events-none" />
      )}
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            machine.status === 'critical' ? 'bg-red-500/20' :
            machine.status === 'warning' ? 'bg-amber-500/20' : 'bg-cyan-500/20'
          }`}>
            <Gauge className={`w-5 h-5 ${
              machine.status === 'critical' ? 'text-red-400' :
              machine.status === 'warning' ? 'text-amber-400' : 'text-cyan-400'
            }`} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white leading-tight">{machine.name}</h3>
            <p className="text-xs text-slate-500">{machine.id}</p>
          </div>
        </div>
        <StatusBadge status={machine.status} />
      </div>

      {/* Sensor Metrics */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Thermometer className="w-3.5 h-3.5 text-orange-400" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Temp</p>
            <p className="text-sm font-mono font-semibold text-slate-200">{s.temperature?.toFixed(1)}°C</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-purple-400" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Vibration</p>
            <p className="text-sm font-mono font-semibold text-slate-200">{s.vibration?.toFixed(2)} mm/s</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-yellow-400" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Power</p>
            <p className="text-sm font-mono font-semibold text-slate-200">{s.power?.toFixed(1)} kW</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Gauge className="w-3.5 h-3.5 text-cyan-400" />
          <div>
            <p className="text-[10px] text-slate-500 uppercase">Load</p>
            <p className="text-sm font-mono font-semibold text-slate-200">{s.load?.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* Risk Bar */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-1">
          <span className="text-[10px] text-slate-500 uppercase">Failure Risk</span>
          <span className={`text-xs font-mono font-bold ${
            machine.failureProbability > 70 ? 'text-red-400' :
            machine.failureProbability > 40 ? 'text-amber-400' : 'text-emerald-400'
          }`}>{machine.failureProbability?.toFixed(0)}%</span>
        </div>
        <div className="h-1.5 bg-slate-700/50 rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(machine.failureProbability || 0, 100)}%` }}
            transition={{ duration: 1, ease: 'easeOut' }}
            className={`h-full rounded-full ${
              machine.failureProbability > 70 ? 'bg-gradient-to-r from-red-500 to-red-400' :
              machine.failureProbability > 40 ? 'bg-gradient-to-r from-amber-500 to-amber-400' :
              'bg-gradient-to-r from-emerald-500 to-emerald-400'
            }`}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-700/50">
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-500">Efficiency</span>
          <span className="text-xs font-mono font-semibold text-cyan-400">{machine.efficiency?.toFixed(1)}%</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleInjectAnomaly}
            className="text-[10px] px-2 py-1 rounded bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            title="Inject Anomaly (Demo)"
          >
            <AlertTriangle className="w-3 h-3" />
          </button>
          <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 transition-colors" />
        </div>
      </div>
    </motion.div>
  );
}
