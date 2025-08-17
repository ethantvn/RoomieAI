import { useState } from 'react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import api from '@/lib/api';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setError('');
    if (!email.endsWith('@ucsc.edu')) {
      setError('Please use your @ucsc.edu email');
      return;
    }
    if (mode === 'signup') {
      if (password.length < 6) {
        setError('Password must be at least 6 characters');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }
    try {
      setLoading(true);
      const cred =
        mode === 'login'
          ? await signInWithEmailAndPassword(auth, email, password)
          : await createUserWithEmailAndPassword(auth, email, password);

      const token = await cred.user.getIdToken(true);
      await api.post('/api/v1/auth/session', { idToken: token });
      window.location.href = mode === 'signup' ? '/onboarding/profile' : '/dashboard';
    } catch (e: any) {
      setError(e.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="card max-w-md w-full p-6 space-y-4">
        <h1 className="text-2xl font-semibold">{mode === 'login' ? 'Sign in to RoomieAI' : 'Create your RoomieAI account'}</h1>
        <div>
          <label className="label">UCSC Email</label>
          <input className="input mt-1" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@ucsc.edu" />
        </div>
        <div>
          <label className="label">Password</label>
          <input className="input mt-1" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {mode === 'signup' && (
          <div>
            <label className="label">Confirm password</label>
            <input className="input mt-1" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        )}
        {error && <div className="text-red-600 text-sm">{error}</div>}
        {mode === 'login' ? (
          <div className="flex gap-2">
            <button className="btn w-full" disabled={loading} onClick={submit}>Sign In</button>
            <button className="btn w-full" disabled={loading} onClick={() => setMode('signup')}>Create Account</button>
          </div>
        ) : (
          <div className="flex gap-2">
            <button className="btn w-full" disabled={loading} onClick={() => setMode('login')}>Back to Sign In</button>
            <button className="btn w-full" disabled={loading} onClick={submit}>Create Account</button>
          </div>
        )}
        <p className="text-xs text-gray-500">Use your @ucsc.edu email. You will be asked to verify via Firebase.</p>
      </div>
    </div>
  );
}

