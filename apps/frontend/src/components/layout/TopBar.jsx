import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Search, Radio, Clock } from 'lucide-react';
import { usePolling } from '../../hooks/usePolling';
import { alertService } from '../../services/dataService';
import { motion, AnimatePresence } from 'framer-motion';

export default function TopBar() {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  const { data: alertStats } = usePolling(() => alertService.getStats(), 5000);
  const stats = alertStats?.data || {};

  const now = new Date();
  const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="h-16 border-b border-cyan-500/10 flex items-center justify-between px-6"
      style={{ background: 'rgba(10, 14, 23, 0.8)', backdropFilter: 'blur(12px)' }}>

      {/* Left — Factory Status */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-4 h-4 text-emerald-400" />
            <div className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-emerald-400 rounded-full animate-ping" />
          </div>
          <span className="text-sm font-medium text-emerald-400">FACTORY ONLINE</span>
        </div>
        <div className="h-4 w-px bg-slate-700" />
        <div className="flex items-center gap-2 text-slate-400">
          <Clock className="w-3.5 h-3.5" />
          <span className="text-xs font-mono">{timeStr}</span>
          <span className="text-xs text-slate-600">|</span>
          <span className="text-xs">{dateStr}</span>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search machines..."
            className="w-52 pl-9 pr-4 py-2 text-sm bg-industrial-800 border border-cyan-500/10 rounded-lg text-slate-300 placeholder-slate-500 focus:outline-none focus:border-cyan-500/30 transition-colors"
          />
        </div>

        {/* Notifications */}
        <button
          onClick={() => navigate('/alerts')}
          title="Open Alerts Center"
          className="relative p-2 rounded-lg hover:bg-industrial-700 transition-all hover:scale-110 active:scale-95 group"
        >
          <Bell className="w-5 h-5 text-slate-400 group-hover:text-cyan-400 transition-colors" />
          {stats.unacknowledged > 0 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold bg-red-500 text-white rounded-full px-1 shadow-[0_0_8px_rgba(239,68,68,0.5)]">
              {stats.unacknowledged > 99 ? '99+' : stats.unacknowledged}
            </span>
          )}
        </button>

        {/* User Avatar */}
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
          OP
        </div>
      </div>
    </header>
  );
}
