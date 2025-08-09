import { useEffect, useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';

export default function Messages() {
  const qc = useQueryClient();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const [body, setBody] = useState('');

  const threadsQuery = useQuery({
    queryKey: ['threads'],
    queryFn: async () => (await api.get('/api/v1/threads')).data,
    refetchInterval: 8000,
    refetchOnWindowFocus: true
  });

  const messagesQuery = useQuery({
    queryKey: ['messages', activeThread],
    queryFn: async () => (await api.get(`/api/v1/threads/${activeThread}/messages`)).data,
    enabled: Boolean(activeThread),
    refetchInterval: 8000,
    refetchOnWindowFocus: true
  });

  useEffect(() => {
    if (!activeThread && threadsQuery.data?.length) {
      setActiveThread(threadsQuery.data[0].id);
    }
  }, [threadsQuery.data, activeThread]);

  const active = useMemo(
    () => threadsQuery.data?.find((t: any) => t.id === activeThread),
    [threadsQuery.data, activeThread]
  );

  const send = async () => {
    if (!activeThread || !body.trim()) return;
    await api.post(`/api/v1/threads/${activeThread}/messages`, { body });
    setBody('');
    await qc.invalidateQueries({ queryKey: ['messages', activeThread] });
    await qc.invalidateQueries({ queryKey: ['threads'] });
  };

  return (
    <div className="grid md:grid-cols-3 h-[calc(100vh-2rem)] gap-4 p-4">
      <div className="card p-4 overflow-y-auto">
        <div className="text-sm text-gray-600 mb-2">Threads</div>
        <div className="space-y-2">
          {threadsQuery.data?.map((t: any) => (
            <button key={t.id} onClick={() => setActiveThread(t.id)} className={`w-full text-left p-3 rounded-md border ${activeThread === t.id ? 'border-black bg-gray-50' : 'border-gray-200'}`}>
              <div className="font-medium">{t.otherParticipant.name || 'Anonymous Slug'}</div>
              <div className="text-xs text-gray-500 truncate">{t.lastMessage?.body || 'No messages yet'}</div>
            </button>
          ))}
          {(!threadsQuery.data || threadsQuery.data.length === 0) && <div className="text-sm text-gray-500">No threads yet.</div>}
        </div>
      </div>
      <div className="md:col-span-2 card p-4 flex flex-col">
        {!active && <div className="text-gray-500">Select a thread</div>}
        {active && (
          <>
            <div className="border-b pb-2 mb-2">
              <div className="font-medium">{active.otherParticipant.name || 'Anonymous Slug'}</div>
              <div className="text-xs text-gray-500">{active.otherParticipant.major || 'Undeclared'} · {active.otherParticipant.yearInSchool || 'N/A'}</div>
            </div>
            <div className="flex-1 overflow-y-auto space-y-2">
              {messagesQuery.data?.messages?.map((m: any) => (
                <div key={m.id} className="p-2 rounded-md bg-gray-100">{m.body}</div>
              ))}
            </div>
            <div className="mt-2 flex gap-2">
              <input className="input flex-1" value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message..." />
              <button className="btn" onClick={send}>Send</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

