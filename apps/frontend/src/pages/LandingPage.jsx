import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import ParticleGrid from '../components/landing/ParticleGrid';
import {
  BrainCircuit, Shield, Zap, Activity, Factory, BarChart3,
  ArrowRight, ChevronDown, Cpu, Gauge, Network, GitBranch,
  Radio, Cog, Layers, TrendingUp, Clock, AlertTriangle
} from 'lucide-react';

const fadeUp = { hidden: { opacity: 0, y: 40 }, visible: { opacity: 1, y: 0 } };
const stagger = { visible: { transition: { staggerChildren: 0.12 } } };

function Section({ children, className = '', id }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section ref={ref} id={id}
      initial="hidden" animate={inView ? 'visible' : 'hidden'}
      variants={stagger}
      className={`relative z-10 ${className}`}>
      {children}
    </motion.section>
  );
}

function GlowCard({ children, className = '', color = 'cyan' }) {
  const colors = {
    cyan: 'border-cyan-500/20 hover:border-cyan-400/40 hover:shadow-cyan-500/10',
    purple: 'border-purple-500/20 hover:border-purple-400/40 hover:shadow-purple-500/10',
    emerald: 'border-emerald-500/20 hover:border-emerald-400/40 hover:shadow-emerald-500/10',
    amber: 'border-amber-500/20 hover:border-amber-400/40 hover:shadow-amber-500/10',
    red: 'border-red-500/20 hover:border-red-400/40 hover:shadow-red-500/10',
    blue: 'border-blue-500/20 hover:border-blue-400/40 hover:shadow-blue-500/10',
  };
  return (
    <motion.div variants={fadeUp}
      className={`bg-slate-900/60 backdrop-blur-xl border rounded-2xl p-6 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${colors[color]} ${className}`}>
      {children}
    </motion.div>
  );
}

const FEATURES = [
  { icon: BrainCircuit, title: 'Predictive Maintenance', desc: 'ML-powered failure prediction using Random Forest and Gradient Boosting with 95%+ accuracy', color: 'purple' },
  { icon: Radio, title: 'Anomaly Detection', desc: 'Isolation Forest trained on 14K+ industrial samples detects deviations in real-time', color: 'red' },
  { icon: Cog, title: 'Automation Workflows', desc: 'Rule-based preventive actions triggered automatically when risk thresholds are breached', color: 'amber' },
  { icon: Gauge, title: 'Risk Analytics', desc: 'Composite risk scoring from 3 ML models with explainable feature contributions', color: 'cyan' },
  { icon: Layers, title: 'Digital Twin Monitoring', desc: '8 simulated industrial machines with correlated sensor behavior and realistic degradation', color: 'emerald' },
  { icon: Activity, title: 'Live Intelligence', desc: 'Streaming predictions with real-time risk updates and operational confidence scoring', color: 'blue' },
];

const WORKFLOW_STEPS = [
  { icon: Radio, label: 'Sensor Data', sub: '13 sensor channels' },
  { icon: BrainCircuit, label: 'AI Detection', sub: '3 ML models' },
  { icon: AlertTriangle, label: 'Risk Analysis', sub: 'Explainable AI' },
  { icon: Zap, label: 'Automation', sub: 'Rule engine' },
  { icon: Cog, label: 'Maintenance', sub: 'Auto-scheduled' },
  { icon: Shield, label: 'Downtime Prevented', sub: 'Zero failures' },
];

const STATS = [
  { value: '99.7%', label: 'System Uptime', icon: TrendingUp },
  { value: '95.1%', label: 'Prediction Accuracy', icon: BrainCircuit },
  { value: '47%', label: 'Cost Reduction', icon: BarChart3 },
  { value: '<2min', label: 'Response Time', icon: Clock },
];

const MACHINES = [
  { name: 'CNC Mill', status: 'healthy' }, { name: 'Hydraulic Press', status: 'healthy' },
  { name: 'Robot Arm', status: 'warning' }, { name: 'Conveyor', status: 'healthy' },
  { name: 'Compressor', status: 'critical' }, { name: 'Lathe', status: 'healthy' },
  { name: 'Weld Cell', status: 'healthy' }, { name: 'Pump System', status: 'warning' },
];

const TECH = [
  { name: 'React 18', area: 'Frontend' }, { name: 'Express.js', area: 'Backend' },
  { name: 'FastAPI', area: 'AI Service' }, { name: 'scikit-learn', area: 'ML Models' },
  { name: 'Isolation Forest', area: 'Anomaly Detection' }, { name: 'Random Forest', area: 'Classification' },
  { name: 'Gradient Boosting', area: 'Risk Scoring' }, { name: 'Framer Motion', area: 'Animation' },
];

export default function LandingPage() {
  const nav = useNavigate();

  return (
    <div className="bg-[#030712] text-white overflow-x-hidden">
      <ParticleGrid />

      {/* ═══════ HERO ═══════ */}
      <section className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }} className="max-w-5xl mx-auto">

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="inline-flex items-center gap-2 px-4 py-2 mb-8 rounded-full border border-cyan-500/30 bg-cyan-500/5 text-cyan-400 text-sm">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
            ABB Accelerator Hackathon 2026
          </motion.div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight leading-[0.9] mb-6">
            <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">
              Prevent Downtime
            </span>
            <br />
            <span className="text-white/90">Before It Happens</span>
          </h1>

          <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            AI-powered industrial continuity and predictive automation platform
            for next-generation smart factories.
          </p>

          <div className="flex flex-wrap justify-center gap-4 mb-16">
            <button onClick={() => nav('/dashboard')}
              className="group px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl font-semibold text-lg shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-105">
              Launch Command Center
              <ArrowRight className="inline ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
              className="px-8 py-4 border border-slate-600 rounded-xl font-semibold text-lg hover:bg-white/5 hover:border-slate-400 transition-all">
              Explore AI Engine
            </button>
          </div>

          {/* Live stats bar */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.8 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {STATS.map(s => (
              <div key={s.label} className="bg-white/[0.03] border border-white/[0.06] rounded-xl p-4 backdrop-blur-sm">
                <s.icon className="w-5 h-5 text-cyan-400 mb-2 mx-auto" />
                <div className="text-2xl font-bold text-white">{s.value}</div>
                <div className="text-xs text-slate-500">{s.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}
          className="absolute bottom-8">
          <ChevronDown className="w-6 h-6 text-slate-500" />
        </motion.div>
      </section>

      {/* ═══════ PLATFORM OVERVIEW ═══════ */}
      <Section className="py-32 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">Platform Capabilities</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
              Industrial AI <span className="bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent">Operating System</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">Six integrated modules working in concert to eliminate unplanned downtime across your entire factory floor.</p>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map(f => (
              <GlowCard key={f.title} color={f.color}>
                <f.icon className={`w-10 h-10 mb-4 text-${f.color}-400`} />
                <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{f.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════ AI WORKFLOW ═══════ */}
      <Section className="py-32 px-6 bg-gradient-to-b from-transparent via-cyan-950/10 to-transparent" id="workflow">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">Live AI Workflow</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">From Sensor to <span className="bg-gradient-to-r from-cyan-400 to-emerald-400 bg-clip-text text-transparent">Safety</span></h2>
          </motion.div>
          <div className="flex flex-wrap justify-center items-center gap-4 md:gap-2">
            {WORKFLOW_STEPS.map((s, i) => (
              <motion.div key={s.label} variants={fadeUp} className="flex items-center gap-2 md:gap-4">
                <div className="flex flex-col items-center">
                  <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-500/30 flex items-center justify-center mb-2 hover:scale-110 transition-transform">
                    <s.icon className="w-7 h-7 text-cyan-400" />
                  </div>
                  <span className="text-sm font-semibold">{s.label}</span>
                  <span className="text-[10px] text-slate-500">{s.sub}</span>
                </div>
                {i < WORKFLOW_STEPS.length - 1 && (
                  <ArrowRight className="w-5 h-5 text-cyan-500/40 hidden md:block" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════ DIGITAL FACTORY ═══════ */}
      <Section className="py-32 px-6" id="factory">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-cyan-400 text-sm font-semibold tracking-widest uppercase">Digital Factory</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">Machine Fleet <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Overview</span></h2>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {MACHINES.map(m => {
              const colors = { healthy: 'emerald', warning: 'amber', critical: 'red' };
              const c = colors[m.status];
              return (
                <motion.div key={m.name} variants={fadeUp}
                  className={`bg-slate-900/60 backdrop-blur border border-${c}-500/20 rounded-xl p-5 text-center hover:border-${c}-400/40 transition-all hover:-translate-y-1`}>
                  <div className={`w-3 h-3 rounded-full bg-${c}-400 mx-auto mb-3 ${m.status !== 'healthy' ? 'animate-pulse' : ''}`} />
                  <Factory className={`w-8 h-8 text-${c}-400 mx-auto mb-2`} />
                  <p className="text-sm font-semibold">{m.name}</p>
                  <p className={`text-xs text-${c}-400 capitalize mt-1`}>{m.status}</p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </Section>

      {/* ═══════ ANALYTICS SHOWCASE ═══════ */}
      <Section className="py-32 px-6 bg-gradient-to-b from-transparent via-purple-950/10 to-transparent" id="analytics">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-purple-400 text-sm font-semibold tracking-widest uppercase">Performance Metrics</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">Measurable <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Impact</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { val: '14,463', label: 'Training Samples', sub: 'Industrial telemetry data' },
              { val: '95.1%', label: 'Failure Prediction', sub: 'Classification accuracy' },
              { val: '96.9%', label: 'Risk Scoring', sub: 'State prediction accuracy' },
              { val: '91.5%', label: 'Anomaly Detection', sub: 'Detection accuracy' },
            ].map(m => (
              <GlowCard key={m.label} color="purple">
                <div className="text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">{m.val}</div>
                <div className="font-semibold text-white mb-1">{m.label}</div>
                <div className="text-xs text-slate-500">{m.sub}</div>
              </GlowCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════ WHY ZERO DOWNTIME AI ═══════ */}
      <Section className="py-32 px-6" id="why">
        <div className="max-w-6xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-emerald-400 text-sm font-semibold tracking-widest uppercase">Business Value</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">Why <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Zero Downtime AI</span></h2>
          </motion.div>
          <div className="grid md:grid-cols-2 gap-6">
            {[
              { icon: TrendingUp, title: 'Reduce Operational Costs', desc: 'Prevent costly unplanned shutdowns with predictive intelligence that catches failures days before they happen.' },
              { icon: Shield, title: 'Maximize Equipment Lifespan', desc: 'Condition-based maintenance extends asset life by 20-40% compared to scheduled maintenance approaches.' },
              { icon: BrainCircuit, title: 'Explainable AI Decisions', desc: 'Every prediction comes with human-readable explanations showing exactly which sensors drove the assessment.' },
              { icon: Zap, title: 'Autonomous Response', desc: 'Automation engine reacts in real-time — reducing loads, scheduling maintenance, and escalating alerts without human intervention.' },
            ].map(v => (
              <GlowCard key={v.title} color="emerald">
                <v.icon className="w-8 h-8 text-emerald-400 mb-4" />
                <h3 className="text-xl font-bold mb-2">{v.title}</h3>
                <p className="text-slate-400 text-sm leading-relaxed">{v.desc}</p>
              </GlowCard>
            ))}
          </div>
        </div>
      </Section>

      {/* ═══════ TECH STACK ═══════ */}
      <Section className="py-32 px-6 bg-gradient-to-b from-transparent via-slate-900/50 to-transparent" id="tech">
        <div className="max-w-5xl mx-auto">
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-blue-400 text-sm font-semibold tracking-widest uppercase">Architecture</span>
            <h2 className="text-4xl md:text-5xl font-bold mt-4">Built With <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Modern Stack</span></h2>
          </motion.div>
          <motion.div variants={fadeUp}
            className="bg-slate-900/60 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {TECH.map(t => (
                <div key={t.name} className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.05] text-center hover:border-cyan-500/30 transition-all">
                  <GitBranch className="w-5 h-5 text-cyan-400 mx-auto mb-2" />
                  <div className="font-semibold text-sm">{t.name}</div>
                  <div className="text-[10px] text-slate-500">{t.area}</div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
              <div className="flex items-center gap-2 text-cyan-400 text-sm font-semibold mb-2">
                <Network className="w-4 h-4" /> System Architecture
              </div>
              <div className="text-xs text-slate-400 font-mono leading-relaxed">
                Frontend (React) → Backend (Express) → AI Service (FastAPI) → Pre-trained Models (.pkl) → Inference → Explainable Response → Dashboard
              </div>
            </div>
          </motion.div>
        </div>
      </Section>

      {/* ═══════ CTA ═══════ */}
      <Section className="py-32 px-6" id="cta">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div variants={fadeUp}>
            <h2 className="text-4xl md:text-6xl font-black mb-6">
              Transform Industrial Operations
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent">with AI</span>
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
              Experience the future of predictive maintenance. Launch the command center and see real ML models in action.
            </p>
            <button onClick={() => nav('/dashboard')}
              className="group px-10 py-5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl font-bold text-xl shadow-2xl shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all hover:scale-105">
              Enter Zero Downtime AI
              <ArrowRight className="inline ml-3 w-6 h-6 group-hover:translate-x-2 transition-transform" />
            </button>
          </motion.div>
        </div>
      </Section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.05] py-8 px-6 text-center text-xs text-slate-600">
        <p>Zero Downtime AI — ABB Accelerator Hackathon 2026</p>
        <p className="mt-1">Predict. Prevent. Perform.</p>
      </footer>
    </div>
  );
}
