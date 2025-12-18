import { useEffect, useState } from 'react';
import { supabase } from './lib/supabase';
import type { User } from '@supabase/supabase-js';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import PricingPage from './components/PricingPage';

type Route = 'landing' | 'pricing' | 'auth' | 'dashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentRoute, setCurrentRoute] = useState<Route>('landing');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      if (session?.user) {
        setCurrentRoute('dashboard');
      } else {
        const hash = window.location.hash.slice(1);
        if (hash === '/tienda' || hash === '/pricing') {
          setCurrentRoute('pricing');
        } else if (hash === '/auth' || hash === '/login') {
          setCurrentRoute('auth');
        } else {
          setCurrentRoute('landing');
        }
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        setCurrentRoute('dashboard');
      }
    });

    const handleHashChange = () => {
      if (user) return;

      const hash = window.location.hash.slice(1);
      if (hash === '/tienda' || hash === '/pricing') {
        setCurrentRoute('pricing');
      } else if (hash === '/auth' || hash === '/login') {
        setCurrentRoute('auth');
      } else {
        setCurrentRoute('landing');
      }
    };

    window.addEventListener('hashchange', handleHashChange);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (currentRoute === 'pricing') {
    return (
      <PricingPage
        onSubscribed={() => {
          window.location.hash = '#/auth';
          setCurrentRoute('auth');
        }}
      />
    );
  }

  if (currentRoute === 'auth') {
    return <Auth />;
  }

  return (
    <LandingPage
      onGetStarted={() => {
        window.location.hash = '#/auth';
        setCurrentRoute('auth');
      }}
    />
  );
}

export default App;
