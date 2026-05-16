import { createContext, useContext, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, BrainCircuit, Activity, CheckCircle2, X } from 'lucide-react';

const AnomalyUXContext = createContext();

export function useAnomalyUX() {
  return useContext(AnomalyUXContext);
}

export function AnomalyUXProvider({ children }) {
  const [activeAlerts, setActiveAlerts] = useState([]);

  const addAlert = useCallback((alert) => {
    const id = Date.now().toString() + Math.random().toString(36).substring(7);
    setActiveAlerts((prev) => [...prev, { ...alert, id }]);
    
    // Automatically remove after duration
    setTimeout(() => {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
    }, alert.duration || 4000);
    
    return id;
  }, []);

  const triggerAnomalySequence = useCallback((machineName) => {
    // Stage 1: Detection
    addAlert({
      title: 'Synthetic fault event initiated',
      message: `Injecting thermal anomaly into ${machineName}...`,
      icon: AlertTriangle,
      color: 'amber',
      duration: 3000,
    });

    // Stage 2: AI Analysis
    setTimeout(() => {
      addAlert({
        title: 'AI Anomaly Analysis Initiated',
        message: 'Detecting pattern deviation. Evaluating risk vectors...',
        icon: BrainCircuit,
        color: 'purple',
        duration: 3500,
      });
    }, 2000);

    // Stage 3: Escalation
    setTimeout(() => {
      addAlert({
        title: 'Risk Escalation Detected',
        message: 'Threshold exceeded. Triggering preventive automation workflow...',
        icon: Activity,
        color: 'red',
        duration: 4000,
      });
    }, 4500);

    // Stage 4: Stabilization
    setTimeout(() => {
      addAlert({
        title: 'Preventive Automation Successful',
        message: `System ${machineName} stabilized. Operating risk reduced.`,
        icon: CheckCircle2,
        color: 'emerald',
        duration: 5000,
      });
    }, 8500);
  }, [addAlert]);

  return (
    <AnomalyUXContext.Provider value={{ triggerAnomalySequence }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3 pointer-events-none">
        <AnimatePresence>
          {activeAlerts.map((alert) => (
            <ToastAlert key={alert.id} alert={alert} />
          ))}
        </AnimatePresence>
      </div>
    </AnomalyUXContext.Provider>
  );
}

function ToastAlert({ alert }) {
  const Icon = alert.icon;
  
  const colors = {
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-400',
    purple: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
    red: 'bg-red-500/10 border-red-500/20 text-red-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  };

  const bgGradient = {
    amber: 'from-amber-500/5 to-transparent',
    purple: 'from-purple-500/5 to-transparent',
    red: 'from-red-500/5 to-transparent',
    emerald: 'from-emerald-500/5 to-transparent',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden flex gap-3 p-4 rounded-lg border w-80 shadow-lg backdrop-blur-md pointer-events-auto bg-industrial-900 ${colors[alert.color]}`}
    >
      <div className={`absolute inset-0 bg-gradient-to-r ${bgGradient[alert.color]}`} />
      
      <div className="relative flex-shrink-0 mt-0.5">
        <Icon className="w-5 h-5" />
      </div>
      
      <div className="relative flex-1">
        <h4 className="text-sm font-semibold mb-1 leading-none text-white">{alert.title}</h4>
        <p className="text-xs opacity-80 leading-relaxed">{alert.message}</p>
      </div>
    </motion.div>
  );
}
