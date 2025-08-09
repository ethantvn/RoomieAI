import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['matches'],
    queryFn: async () => (await api.get('/api/v1/matches/recommendations?limit=10')).data
  });

  if (isLoading) return <div className="p-6">Loading matches...</div>;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Top Matches</h1>
        <Link to="/messages" className="btn">Messages</Link>
      </div>
      {(!data || data.length === 0) && <div className="card p-6">No matches yet. Complete your profile and check back soon.</div>}
      <div className="grid gap-4">
        {data?.map((m: any) => (
          <div key={m.user.id} className="card p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gray-200 grid place-items-center text-gray-700">
                {m.user.name?.split(' ').map((n: string) => n[0]).join('').slice(0,2) || 'U'}
              </div>
              <div>
                <div className="font-medium">{m.user.name || 'Anonymous Slug'}</div>
                <div className="text-sm text-gray-600">{m.user.major || 'Undeclared'} · {m.user.yearInSchool || 'Year N/A'}</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right" title={`Lifestyle ${m.score.breakdown.lifestyle}% | Personality ${m.score.breakdown.personality}% | Extras ${m.score.breakdown.extras}%`}>
                <div className="text-sm text-gray-500">Compatibility</div>
                <div className="text-xl font-semibold">{m.score.total}%</div>
              </div>
              <div className="flex gap-2">
                <Link to={`/u/${m.user.id}`} className="btn">View Profile</Link>
                <Link to={`/messages?start=${m.user.id}`} className="btn">Message</Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

