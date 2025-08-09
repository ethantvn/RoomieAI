import { ReactNode, useEffect, useState } from 'react';
import { useAuth } from '@/store/auth';
import api from '@/lib/api';
import { useNavigate } from 'react-router-dom';

type Props = { children: ReactNode; adminOnly?: boolean };

export function AuthGate({ children, adminOnly = false }: Props) {
  const { user, loading } = useAuth();
  const [checking, setChecking] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login');
      return;
    }
    setChecking(true);
    api.get('/api/v1/me')
      .then((res) => {
        const me = res.data.user;
        setIsAdmin(Boolean(me && (me as any).isAdmin));
        if (!me.profileCompleted) navigate('/onboarding/profile');
      })
      .catch(() => navigate('/login'))
      .finally(() => setChecking(false));
  }, [user, loading]);

  if (loading || checking) return <div className="p-8">Loading...</div>;
  if (adminOnly && !isAdmin) return <div className="p-8">Admins only</div>;
  return <>{children}</>;
}

