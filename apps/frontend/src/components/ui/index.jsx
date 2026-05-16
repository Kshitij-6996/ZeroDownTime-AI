import { motion } from 'framer-motion';

export function GlassCard({ children, className = '', hover = true, ...props }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`${hover ? 'glass-card' : 'glass-card-static'} ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function MetricWidget({ label, value, unit, trend, icon: Icon, color = 'cyan' }) {
  const colors = {
    cyan: 'text-cyan-400',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
    red: 'text-red-400',
    purple: 'text-purple-400',
  };

  return (
    <GlassCard className="p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-slate-500 uppercase tracking-wider">{label}</span>
        {Icon && <Icon className={`w-4 h-4 ${colors[color]}`} />}
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-mono font-bold ${colors[color]}`}>{value}</span>
        {unit && <span className="text-xs text-slate-500">{unit}</span>}
      </div>
      {trend !== undefined && (
        <div className={`text-xs mt-1 ${trend >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
          {trend >= 0 ? '↑' : '↓'} {Math.abs(trend).toFixed(1)}%
        </div>
      )}
    </GlassCard>
  );
}

export function PulseIndicator({ status = 'healthy', size = 'md' }) {
  const colors = {
    healthy: 'bg-emerald-400',
    warning: 'bg-amber-400',
    critical: 'bg-red-400',
    offline: 'bg-slate-500',
  };
  const sizes = { sm: 'w-2 h-2', md: 'w-3 h-3', lg: 'w-4 h-4' };

  return (
    <span className="relative flex">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${colors[status]} opacity-40`} />
      <span className={`relative inline-flex rounded-full ${sizes[size]} ${colors[status]}`} />
    </span>
  );
}

export function StatusBadge({ status }) {
  const styles = {
    healthy: 'status-healthy',
    warning: 'status-warning',
    critical: 'status-critical',
    maintenance: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    offline: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status] || styles.offline}`}>
      <PulseIndicator status={status} size="sm" />
      {status?.charAt(0).toUpperCase() + status?.slice(1)}
    </span>
  );
}

export function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-cyan-500/20 rounded-full" />
        <div className="absolute top-0 left-0 w-12 h-12 border-2 border-transparent border-t-cyan-400 rounded-full animate-spin" />
      </div>
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex items-center justify-between mb-6">
      <div>
        <h1 className="text-2xl font-bold text-white">{title}</h1>
        {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>
  );
}

export function EmptyState({ icon: Icon, title, description }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon className="w-12 h-12 text-slate-600 mb-4" />}
      <h3 className="text-lg font-medium text-slate-400">{title}</h3>
      {description && <p className="text-sm text-slate-500 mt-2 max-w-md">{description}</p>}
    </div>
  );
}
