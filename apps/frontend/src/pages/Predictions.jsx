import { useCallback, useState } from 'react';
import { usePolling } from '../hooks/usePolling';
import { predictionService } from '../services/dataService';
import { GlassCard, PageHeader, LoadingSpinner } from '../components/ui/index';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BrainCircuit, AlertTriangle, Shield, TrendingUp, Cpu,
  ChevronDown, ChevronUp, Lightbulb, Activity, BarChart3,
  Clock, Zap, Info
} from 'lucide-react';

const RISK_COLORS = {
  healthy: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20', bar: 'bg-emerald-500' },
  moderate: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20', bar: 'bg-amber-500' },
  high: { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/20', bar: 'bg-orange-500' },
  critical: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20', bar: 'bg-red-500' },
};

function ConfidenceRing({ value, size = 64, color = '#06b6d4' }) {
  const radius = (size - 8) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value * circumference);
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={4} />
        <motion.circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={4}
          strokeLinecap="round" strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: 'easeOut' }} />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
        {Math.round(value * 100)}%
      </div>
    </div>
  );
}

function FeatureBar({ name, value, maxValue = 1 }) {
  const pct = Math.min(100, (value / maxValue) * 100);
  const label = name.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  return (
    <div className="flex items-center gap-3 text-xs">
      <span className="w-36 text-slate-400 truncate">{label}</span>
      <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden">
        <motion.div className="h-full bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full"
          initial={{ width: 0 }} animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }} />
      </div>
      <span className="w-12 text-right text-slate-500 font-mono">{value.toFixed(3)}</span>
    </div>
  );
}

function PredictionCard({ pred }) {
  const [expanded, setExpanded] = useState(false);
  const rc = RISK_COLORS[pred.riskCategory] || RISK_COLORS.healthy;
  const hasExplanation = pred.explanation && pred.explanation.length > 0 && !pred.explanation[0]?.includes('heuristic');
  const contributions = pred.featureContributions || {};
  const contribEntries = Object.entries(contributions).slice(0, 8);
  const maxContrib = contribEntries.length > 0 ? Math.max(...contribEntries.map(e => e[1])) : 1;

  return (
    <GlassCard className="p-0 overflow-hidden" hover={false}>
      {/* Header */}
      <div className={`flex items-center justify-between p-5 cursor-pointer ${rc.bg}`}
        onClick={() => setExpanded(!expanded)}>
        <div className="flex items-center gap-3">
          <Cpu className={`w-5 h-5 ${rc.text}`} />
          <div>
            <h3 className="font-semibold text-white text-sm">{pred.machineName || pred.machineId}</h3>
            <div className="flex items-center gap-2 mt-0.5">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium capitalize ${rc.bg} ${rc.text} border ${rc.border}`}>
                {pred.riskCategory}
              </span>
              {pred.predictedFailureType && pred.predictedFailureType !== 'none' && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {pred.predictedFailureType.replace(/_/g, ' ')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className={`text-lg font-bold font-mono ${rc.text}`}>{pred.failureProbability?.toFixed(0)}%</span>
            <p className="text-[10px] text-slate-500">Failure Risk</p>
          </div>
          {pred.confidenceScore > 0 && (
            <ConfidenceRing value={pred.confidenceScore}
              color={pred.riskCategory === 'critical' ? '#ef4444' : pred.riskCategory === 'high' ? '#f97316' : '#06b6d4'} />
          )}
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {/* Risk bar */}
      <div className="h-1 bg-white/5">
        <motion.div className={`h-full ${rc.bar}`}
          initial={{ width: 0 }} animate={{ width: `${pred.riskScore}%` }}
          transition={{ duration: 1 }} />
      </div>

      {/* Expanded content */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
            <div className="p-5 space-y-5 border-t border-white/5">

              {/* Stats grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: 'Risk Score', value: pred.riskScore?.toFixed(1), icon: Shield, color: rc.text },
                  { label: 'Health Score', value: pred.healthScore?.toFixed(1), icon: Activity, color: 'text-emerald-400' },
                  { label: 'Severity', value: pred.severityLevel || 'N/A', icon: AlertTriangle, color: 'text-amber-400' },
                  { label: 'Est. Downtime', value: pred.estimatedDowntimeHours ? `${pred.estimatedDowntimeHours}h` : 'N/A', icon: Clock, color: 'text-blue-400' },
                ].map(s => (
                  <div key={s.label} className="bg-white/[0.02] rounded-lg p-3 border border-white/5">
                    <s.icon className={`w-4 h-4 ${s.color} mb-1`} />
                    <div className="text-lg font-bold text-white">{s.value}</div>
                    <div className="text-[10px] text-slate-500">{s.label}</div>
                  </div>
                ))}
              </div>

              {/* AI Explanation */}
              {hasExplanation && (
                <div className="bg-purple-500/5 border border-purple-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Lightbulb className="w-4 h-4 text-purple-400" />
                    <span className="text-sm font-semibold text-purple-400">Why did AI predict this?</span>
                  </div>
                  <ul className="space-y-2">
                    {pred.explanation.map((exp, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                        <Info className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Feature Contributions */}
              {contribEntries.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    <span className="text-sm font-semibold text-white">Feature Contributions</span>
                  </div>
                  <div className="space-y-2">
                    {contribEntries.map(([name, val]) => (
                      <FeatureBar key={name} name={name} value={val} maxValue={maxContrib} />
                    ))}
                  </div>
                </div>
              )}

              {/* Suggestions */}
              {pred.suggestions?.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Zap className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-semibold text-white">Recommended Actions</span>
                  </div>
                  <div className="space-y-1.5">
                    {pred.suggestions.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-400 bg-white/[0.02] rounded-lg px-3 py-2 border border-white/5">
                        <span className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center text-[10px] flex-shrink-0">{i + 1}</span>
                        {s}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Model info */}
              <div className="flex items-center gap-4 text-[10px] text-slate-600 pt-2 border-t border-white/5">
                <span>Model: {pred.modelUsed}</span>
                {pred.modelMetadata?.failure_accuracy && (
                  <span>Accuracy: {(pred.modelMetadata.failure_accuracy * 100).toFixed(1)}%</span>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </GlassCard>
  );
}

export default function Predictions() {
  const fetchPredictions = useCallback(() => predictionService.getAll(), []);
  const fetchModelInfo = useCallback(() => predictionService.getModelInfo(), []);
  const { data: predsData, loading } = usePolling(fetchPredictions, 5000);
  const { data: modelData } = usePolling(fetchModelInfo, 30000);

  const preds = predsData?.data || [];
  const modelInfo = modelData?.data || {};
  const metrics = modelInfo?.evaluation_metrics || {};

  if (loading) return <LoadingSpinner />;

  const critical = preds.filter(p => p.riskCategory === 'critical');
  const high = preds.filter(p => p.riskCategory === 'high');
  const moderate = preds.filter(p => p.riskCategory === 'moderate');
  const healthy = preds.filter(p => p.riskCategory === 'healthy');

  return (
    <div className="space-y-6">
      <PageHeader title="AI Predictions" subtitle="ML-powered failure prediction with explainable reasoning"
        actions={
          <div className="flex items-center gap-2 text-xs">
            <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border ${modelInfo.models_loaded
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                : 'bg-red-500/10 text-red-400 border-red-500/20'
              }`}>
              <BrainCircuit className="w-3.5 h-3.5" />
              {modelInfo.models_loaded ? 'ML Models Active' : 'Heuristic Fallback'}
            </span>
          </div>
        } />

      {/* Model Info Bar */}
      {modelInfo.models_loaded && (
        <GlassCard className="p-4" hover={false}>
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div className="flex items-center gap-2">
              <BrainCircuit className="w-4 h-4 text-purple-400" />
              <span className="text-white font-semibold">Model Performance</span>
            </div>
            {metrics.failure_classifier && (
              <div><span className="text-slate-500">Failure F1:</span> <span className="text-cyan-400 font-mono">{(metrics.failure_classifier.f1_weighted * 100).toFixed(1)}%</span></div>
            )}
            {metrics.risk_scorer && (
              <div><span className="text-slate-500">Risk Accuracy:</span> <span className="text-cyan-400 font-mono">{(metrics.risk_scorer.accuracy * 100).toFixed(1)}%</span></div>
            )}
            {metrics.anomaly_detector && (
              <div><span className="text-slate-500">Anomaly Recall:</span> <span className="text-cyan-400 font-mono">{(metrics.anomaly_detector.recall * 100).toFixed(1)}%</span></div>
            )}
            {modelInfo.dataset_size && (
              <div><span className="text-slate-500">Trained on:</span> <span className="text-slate-400 font-mono">{modelInfo.dataset_size.toLocaleString()} samples</span></div>
            )}
          </div>
        </GlassCard>
      )}

      {/* Risk summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Critical', count: critical.length, color: 'red', icon: AlertTriangle },
          { label: 'High Risk', count: high.length, color: 'orange', icon: Shield },
          { label: 'Moderate', count: moderate.length, color: 'amber', icon: TrendingUp },
          { label: 'Healthy', count: healthy.length, color: 'emerald', icon: Activity },
        ].map(s => (
          <GlassCard key={s.label} className="p-4" hover={false}>
            <div className="flex items-center justify-between">
              <div>
                <p className={`text-2xl font-bold text-${s.color}-400`}>{s.count}</p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
              <s.icon className={`w-6 h-6 text-${s.color}-400/40`} />
            </div>
          </GlassCard>
        ))}
      </div>

      {/* Prediction cards */}
      <div className="space-y-4">
        {preds.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0)).map(p => (
          <PredictionCard key={p.machineId} pred={p} />
        ))}
      </div>
    </div>
  );
}
