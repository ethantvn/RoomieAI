import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import api from '@/lib/api';

export default function ProfileView() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({
    queryKey: ['user', id],
    queryFn: async () => (await api.get(`/api/v1/users/${id}`)).data,
    enabled: Boolean(id)
  });
  const score = useQuery({
    queryKey: ['compat', id],
    queryFn: async () => (await api.get(`/api/v1/matches/with/${id}`)).data,
    enabled: Boolean(id)
  });

  if (isLoading) return <div className="p-6">Loading...</div>;
  if (!data) return <div className="p-6">Profile not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">{data.name || 'Anonymous Slug'}</h1>
        <Link to={`/messages?start=${data.id}`} className="btn">Message</Link>
      </div>
      {score.data?.score && (
        <div className="card p-4">
          <div className="text-sm text-gray-600">Compatibility</div>
          <div className="text-2xl font-semibold">{score.data.score.total}%</div>
        </div>
      )}
      <div className="card p-6 space-y-2">
        <div><span className="label">Major:</span> {data.major || 'Undeclared'}</div>
        <div><span className="label">Year:</span> {data.yearInSchool || 'N/A'}</div>
      </div>
      {data.profile && (
        <div className="card p-6 space-y-2">
          <div className="font-medium">Lifestyle</div>
          <div>Sleep: {data.profile.sleepSchedule} · Study: {data.profile.studyHabits} · Guests: {data.profile.guests}</div>
          <div>Cleanliness: {data.profile.cleanliness}/5 · Noise: {data.profile.noiseTolerance}/5</div>
          <div className="font-medium mt-4">Personality</div>
          <div>Intro/Extro: {data.profile.p_introvertExtrovert}/5 · Structure/Spontaneity: {data.profile.p_structureSpontaneity}/5 · Morning/Night: {data.profile.p_morningNight}/5</div>
          {data.profile.specialRequests && (<div className="mt-2"><span className="label">Special:</span> {data.profile.specialRequests}</div>)}
        </div>
      )}
    </div>
  );
}

