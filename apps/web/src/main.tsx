import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles.css';
import { AuthGate } from './pages/AuthGate';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import OnboardingProfile from './pages/OnboardingProfile';
import ProfileView from './pages/ProfileView';
import Messages from './pages/Messages';
import Admin from './pages/Admin';

const router = createBrowserRouter([
  { path: '/', element: <AuthGate><Dashboard /></AuthGate> },
  { path: '/login', element: <LoginPage /> },
  { path: '/onboarding/profile', element: <AuthGate><OnboardingProfile /></AuthGate> },
  { path: '/dashboard', element: <AuthGate><Dashboard /></AuthGate> },
  { path: '/u/:id', element: <AuthGate><ProfileView /></AuthGate> },
  { path: '/messages', element: <AuthGate><Messages /></AuthGate> },
  { path: '/admin', element: <AuthGate adminOnly><Admin /></AuthGate> }
]);

const qc = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={qc}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </React.StrictMode>
);

