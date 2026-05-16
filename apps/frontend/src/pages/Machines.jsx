import { useCallback, useState } from 'react';
import { usePolling } from '../hooks/usePolling';
import { machineService, simulationService } from '../services/dataService';
import MachineCard from '../components/machines/MachineCard';
import { PageHeader, LoadingSpinner } from '../components/ui/index';
import { RefreshCw, AlertTriangle, RotateCcw } from 'lucide-react';

export default function Machines() {
  const [filter, setFilter] = useState('all');
  const fetchMachines = useCallback(() => machineService.getAll(), []);
  const { data, loading, refetch } = usePolling(fetchMachines, 3000);
  const machines = data?.data || [];

  const filtered = filter === 'all' ? machines : machines.filter(m => m.status === filter);

  const handleResetAll = async () => {
    await simulationService.reset();
    refetch();
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Machine Fleet"
        subtitle="Monitor all industrial machines in real-time"
        actions={
          <div className="flex items-center gap-2">
            <button onClick={handleResetAll} className="flex items-center gap-2 px-3 py-2 text-xs rounded-lg bg-industrial-700 text-slate-300 border border-cyan-500/10 hover:border-cyan-500/30 transition-colors">
              <RotateCcw className="w-3.5 h-3.5" /> Reset All
            </button>
          </div>
        }
      />

      {/* Filters */}
      <div className="flex items-center gap-2">
        {['all', 'healthy', 'warning', 'critical'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-xs font-medium rounded-lg border transition-all ${
              filter === f
                ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30'
                : 'bg-industrial-800 text-slate-400 border-cyan-500/10 hover:text-slate-300'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-slate-500">
              {f === 'all' ? machines.length : machines.filter(m => m.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Machine Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((m, i) => (
          <MachineCard key={m.id} machine={m} index={i} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-500">
          <AlertTriangle className="w-8 h-8 mx-auto mb-3" />
          <p>No machines match the current filter</p>
        </div>
      )}
    </div>
  );
}
