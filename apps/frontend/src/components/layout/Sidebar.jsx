import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Cpu, Bell, BrainCircuit, BarChart3,
  Workflow, ChevronLeft, ChevronRight, Activity, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/machines', label: 'Machines', icon: Cpu },
  { path: '/predictions', label: 'AI Predictions', icon: BrainCircuit },
  { path: '/alerts', label: 'Alerts', icon: Bell },
  { path: '/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/automation', label: 'Automation', icon: Workflow },
];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useApp();
  const location = useLocation();
  const navigate = useNavigate();

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarOpen ? 256 : 72 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="fixed left-0 top-0 h-screen z-40 flex flex-col border-r border-cyan-500/10"
      style={{ background: 'linear-gradient(180deg, #0c1220 0%, #0a0e17 100%)' }}
    >
      {/* Logo */}
      <div 
        onClick={() => navigate('/')}
        title="Return to Landing Page"
        className="flex items-center gap-3 px-4 py-5 border-b border-cyan-500/10 cursor-pointer group hover:bg-white/5 transition-colors"
      >
        <div className="relative flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center group-hover:shadow-[0_0_15px_rgba(34,211,238,0.5)] transition-shadow duration-300">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-industrial-900 animate-pulse" />
        </div>
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="overflow-hidden"
            >
              <h1 className="text-sm font-bold text-white tracking-tight leading-none group-hover:text-cyan-300 transition-colors">ZERO DOWNTIME</h1>
              <p className="text-[10px] font-medium text-cyan-400 tracking-widest group-hover:text-cyan-200 transition-colors">AI PLATFORM</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {NAV_ITEMS.map(({ path, label, icon: Icon }) => (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) =>
              `nav-item group ${isActive ? 'active' : ''}`
            }
          >
            <Icon className="w-5 h-5 flex-shrink-0" />
            <AnimatePresence>
              {sidebarOpen && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  className="whitespace-nowrap overflow-hidden"
                >
                  {label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* System Status */}
      <div className="px-3 pb-4">
        <div className="glass-card-static p-3">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-400" />
            {sidebarOpen && (
              <span className="text-xs text-slate-400">System Online</span>
            )}
          </div>
        </div>
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-industrial-700 border border-cyan-500/20 flex items-center justify-center text-cyan-400 hover:bg-industrial-600 transition-colors z-50"
      >
        {sidebarOpen ? <ChevronLeft className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
      </button>
    </motion.aside>
  );
}
