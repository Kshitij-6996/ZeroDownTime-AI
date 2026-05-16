import { useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usePolling } from '../hooks/usePolling';
import { machineService, predictionService, simulationService } from '../services/dataService';
import { GlassCard, StatusBadge, PageHeader, LoadingSpinner } from '../components/ui/index';
import { SensorLineChart } from '../components/charts/SensorCharts';
import { ArrowLeft, Thermometer, Activity, Zap, Gauge, Wind, AlertTriangle, RotateCcw, BrainCircuit, Wrench, Clock } from 'lucide-react';
import { useAnomalyUX } from '../context/AnomalyUXContext';

const SENSORS = [
  { key: 'temperature', label: 'Temperature', unit: '°C', color: '#f97316', icon: Thermometer },
  { key: 'vibration', label: 'Vibration', unit: 'mm/s', color: '#a855f7', icon: Activity },
  { key: 'power', label: 'Power', unit: 'kW', color: '#eab308', icon: Zap },
  { key: 'load', label: 'Load', unit: '%', color: '#06b6d4', icon: Gauge },
  { key: 'voltage', label: 'Voltage', unit: 'V', color: '#3b82f6', icon: Zap },
  { key: 'pressure', label: 'Pressure', unit: 'bar', color: '#10b981', icon: Wind },
];

export default function MachineDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const fetchMachine = useCallback(() => machineService.getById(id), [id]);
  const fetchHistory = useCallback(() => machineService.getHistory(id, 60), [id]);
  const fetchPrediction = useCallback(() => predictionService.getByMachine(id), [id]);
  const { triggerAnomalySequence } = useAnomalyUX();
  const { data: md, loading } = usePolling(fetchMachine, 3000);
  const { data: hd } = usePolling(fetchHistory, 3000);
  const { data: pd } = usePolling(fetchPrediction, 5000);
  const machine = md?.data;
  const history = hd?.data || [];
  const prediction = pd?.data;
  if (loading || !machine) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader title={machine.name} subtitle={`${machine.id} · ${machine.location}`}
        actions={<div className="flex items-center gap-2">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-industrial-700 text-slate-300 border border-cyan-500/10 hover:border-cyan-500/30"><ArrowLeft className="w-3.5 h-3.5" /> Back</button>
          <button onClick={() => {
            triggerAnomalySequence(machine.name);
            simulationService.injectAnomaly(id);
          }} className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"><AlertTriangle className="w-3.5 h-3.5" /> Inject Anomaly</button>
          <button onClick={() => simulationService.resetMachine(id)} className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"><RotateCcw className="w-3.5 h-3.5" /> Reset</button>
        </div>} />
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {[
          { l: 'Status', v: <StatusBadge status={machine.status} /> },
          { l: 'Risk Score', v: <span className={`text-xl font-mono font-bold ${machine.riskScore>70?'text-red-400':machine.riskScore>40?'text-amber-400':'text-emerald-400'}`}>{machine.riskScore?.toFixed(0)}</span> },
          { l: 'Failure Prob.', v: <span className="text-xl font-mono font-bold text-cyan-400">{machine.failureProbability?.toFixed(1)}%</span> },
          { l: 'Efficiency', v: <span className="text-xl font-mono font-bold text-cyan-400">{machine.efficiency?.toFixed(1)}%</span> },
          { l: 'Uptime', v: <span className="text-xl font-mono font-bold text-emerald-400">{machine.uptime?.toFixed(1)}%</span> },
          { l: 'Op. Hours', v: <span className="text-xl font-mono font-bold text-slate-300">{machine.operatingHours}</span> },
        ].map((item, i) => (
          <GlassCard key={i} className="p-4" hover={false}><p className="text-[10px] text-slate-500 uppercase mb-1">{item.l}</p>{item.v}</GlassCard>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SENSORS.map(({ key, label, unit, color, icon: Icon }) => (
          <GlassCard key={key} className="p-5" hover={false}>
            <div className="flex items-center gap-2 mb-3">
              <Icon className="w-4 h-4" style={{ color }} />
              <h3 className="text-sm font-semibold text-white">{label}</h3>
              <span className="ml-auto text-sm font-mono font-bold" style={{ color }}>{machine.sensors[key]?.toFixed(2)} {unit}</span>
            </div>
            <SensorLineChart data={history} dataKey={key} name={label} color={color} unit={unit} />
          </GlassCard>
        ))}
      </div>
      {prediction && (
        <GlassCard className="p-6" hover={false}>
          <div className="flex items-center gap-2 mb-4"><BrainCircuit className="w-5 h-5 text-purple-400" /><h3 className="text-lg font-semibold text-white">AI Prediction</h3></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div><p className="text-xs text-slate-500 uppercase mb-2">Risk Category</p><StatusBadge status={prediction.riskCategory==='moderate'?'warning':prediction.riskCategory} />
              {prediction.predictedFailureTime && <p className="text-xs text-amber-400 mt-2 flex items-center gap-1"><Clock className="w-3 h-3" />Failure in ~{prediction.predictedFailureTime}</p>}</div>
            <div><p className="text-xs text-slate-500 uppercase mb-2">Anomalies</p>
              {prediction.anomalies?.length>0 ? prediction.anomalies.map((a,i)=>(<div key={i} className="text-xs flex items-center gap-2 text-red-400"><AlertTriangle className="w-3 h-3" />{a.sensor}: {a.value?.toFixed(2)}</div>)) : <p className="text-xs text-emerald-400">None detected</p>}</div>
            <div><p className="text-xs text-slate-500 uppercase mb-2">Suggestions</p>
              {prediction.suggestions?.slice(0,3).map((s,i)=>(<div key={i} className="text-xs flex items-center gap-2 text-slate-300 mb-1"><Wrench className="w-3 h-3 text-cyan-400" />{s}</div>))}</div>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
