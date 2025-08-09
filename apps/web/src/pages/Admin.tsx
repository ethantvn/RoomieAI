import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function Admin() {
  const overview = useQuery({
    queryKey: ['admin-overview'],
    queryFn: async () => (await api.get('/api/v1/admin/metrics/overview')).data
  });
  const buckets = useQuery({
    queryKey: ['admin-buckets'],
    queryFn: async () => (await api.get('/api/v1/admin/reports/compatibility')).data
  });

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Admin Dashboard</h1>
      <div className="grid md:grid-cols-3 gap-4">
        <div className="card p-4">
          <div className="text-sm text-gray-500">Total signups</div>
          <div className="text-2xl font-semibold">{overview.data?.totalUsers ?? '-'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Completed profiles</div>
          <div className="text-2xl font-semibold">{overview.data?.completedProfiles ?? '-'}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-gray-500">Avg compatibility (30d)</div>
          <div className="text-2xl font-semibold">{overview.data?.avgCompatibility?.toFixed?.(1) ?? '-'}</div>
        </div>
      </div>
      <div className="card p-4">
        <div className="text-sm text-gray-500 mb-2">Compatibility distribution (last 30 days)</div>
        <div className="grid grid-cols-5 gap-2">
          {buckets.data?.buckets?.map((b: any) => (
            <div key={b.range} className="space-y-1">
              <div className="h-24 bg-gray-100 rounded-md flex items-end">
                <div className="w-full bg-black rounded-md" style={{ height: `${Math.min(100, b.count)}%` }} />
              </div>
              <div className="text-xs text-gray-500 text-center">{b.range}</div>
              <div className="text-xs text-center">{b.count}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

