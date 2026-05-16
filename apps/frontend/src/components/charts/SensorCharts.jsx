import { useMemo } from 'react';
import {
  LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card-static p-3 border border-cyan-500/20 !bg-industrial-800/95">
      <p className="text-xs text-slate-400 mb-1">{label}</p>
      {payload.map((entry, i) => (
        <p key={i} className="text-sm font-mono" style={{ color: entry.color }}>
          {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
        </p>
      ))}
    </div>
  );
};

export function SensorLineChart({ data, dataKey, name, color = '#06b6d4', unit = '' }) {
  const formatted = useMemo(() =>
    (data || []).map((d, i) => ({
      ...d,
      time: d.timestamp ? new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `${i}`,
    })),
  [data]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.06)" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={45} />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          dot={false}
          name={`${name} (${unit})`}
          activeDot={{ r: 4, fill: color, stroke: '#0a0e17', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function MultiSensorChart({ data, sensors }) {
  const formatted = useMemo(() =>
    (data || []).map((d, i) => ({
      ...d,
      time: d.timestamp ? new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : `${i}`,
    })),
  [data]);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={formatted}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.06)" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={45} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: '11px', color: '#94a3b8' }} />
        {(sensors || []).map((s) => (
          <Line
            key={s.key}
            type="monotone"
            dataKey={s.key}
            stroke={s.color}
            strokeWidth={1.5}
            dot={false}
            name={s.name}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

export function EfficiencyAreaChart({ data }) {
  const formatted = useMemo(() =>
    (data || []).map((d, i) => ({
      ...d,
      time: d.timestamp ? new Date(d.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : `${i}`,
    })),
  [data]);

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="effGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(6,182,212,0.06)" />
        <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#64748b' }} interval="preserveStartEnd" />
        <YAxis tick={{ fontSize: 10, fill: '#64748b' }} width={45} domain={[0, 100]} />
        <Tooltip content={<CustomTooltip />} />
        <Area type="monotone" dataKey="avgEfficiency" stroke="#06b6d4" fill="url(#effGrad)" strokeWidth={2} name="Avg Efficiency (%)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
