import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Video, BarChart3, Search, User, Mail, ArrowRight, Sparkles, Lock, ArrowLeft, KeyRound } from 'lucide-react';
import LandingPage from './LandingPage';
import CodeActivation from './CodeActivation';

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [clickCount, setClickCount] = useState(0);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [masterPassword, setMasterPassword] = useState('');
  const [showLanding, setShowLanding] = useState(true);
  const [showCodeActivation, setShowCodeActivation] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const handleLogoClick = () => {
    const newCount = clickCount + 1;
    setClickCount(newCount);

    if (newCount === 5) {
      setShowAdminPanel(true);
      setClickCount(0);
    }
  };

  const handleAdminAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (masterPassword !== 'daya27') {
      setError('Contraseña maestra incorrecta');
      setLoading(false);
      return;
    }

    try {
      let { error: signInError } = await supabase.auth.signInWithPassword({
        email: 'admin@dropghost.com',
        password: 'daya27'
      });

      if (signInError && signInError.message.includes('Invalid')) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: 'admin@dropghost.com',
          password: 'daya27',
          options: {
            data: {
              full_name: 'Administrador'
            }
          }
        });

        if (signUpError) throw signUpError;

        const { error: signInRetryError } = await supabase.auth.signInWithPassword({
          email: 'admin@dropghost.com',
          password: 'daya27'
        });

        if (signInRetryError) throw signInRetryError;
      } else if (signInError) {
        throw signInError;
      }
    } catch (err: any) {
      setError('Error al acceder al panel');
    } finally {
      setLoading(false);
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSignUp) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: name
            }
          }
        });
        if (error) throw error;

        if (data.user) {
          setCurrentUserId(data.user.id);
          setShowCodeActivation(true);
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (data.user) {
          setCurrentUserId(data.user.id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error al autenticar');
    } finally {
      setLoading(false);
    }
  };

  const handleActivateCodeClick = () => {
    setShowLanding(false);
    setIsSignUp(true);
  };

  if (showLanding) {
    return <LandingPage onGetStarted={() => setShowLanding(false)} />;
  }

  if (showCodeActivation && currentUserId) {
    return (
      <CodeActivation
        userId={currentUserId}
        onActivated={() => window.location.reload()}
        onBack={() => {
          setShowCodeActivation(false);
          setCurrentUserId(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4 lg:p-8">
      <div className="w-full max-w-6xl bg-gradient-to-r from-slate-900/50 to-black/50 rounded-3xl overflow-hidden border border-slate-800/50 shadow-2xl">
        <div className="grid lg:grid-cols-2 min-h-[600px]">
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 lg:p-12 flex flex-col justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full text-emerald-400 text-sm font-medium mb-8 w-fit">
              <Sparkles className="w-4 h-4" />
              DE DROPSHIPPERS PARA DROPSHIPPERS
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-3 leading-tight">
              Encuentra tu<br />
              próximo<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Producto Winner
              </span>
            </h1>

            <p className="text-slate-400 text-lg mb-12 leading-relaxed">
              Accede a nuestra base de datos diaria de productos virales, analiza métricas reales y escala tu e-commerce.
            </p>

            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Video className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">5 Videos Diarios</h3>
                  <p className="text-slate-400 text-sm">Producto en escalada de 7 días</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Análisis de Competencia</h3>
                  <p className="text-slate-400 text-sm">Datos de ventas</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center">
                  <Search className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-white font-semibold mb-1">Buscamos por ti ✨</h3>
                  <p className="text-slate-400 text-sm">Si no encuentras el producto, lo buscamos y garantizamos su tendencia.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-black p-8 lg:p-12 flex flex-col justify-center">
            <div
              className="flex items-center gap-3 mb-8 cursor-pointer select-none"
              onClick={handleLogoClick}
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                <Video className="w-7 h-7 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">DropGhost</span>
            </div>

            {showAdminPanel ? (
              <>
                <h2 className="text-3xl font-bold text-white mb-2">
                  Panel de Control
                </h2>
                <p className="text-slate-400 mb-8">
                  Acceso restringido.
                </p>

                <form onSubmit={handleAdminAccess} className="space-y-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                      Contraseña Maestra
                    </label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        type="password"
                        value={masterPassword}
                        onChange={(e) => setMasterPassword(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-600/50 focus:border-slate-600 transition"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Cargando...' : 'Acceder al Studio'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminPanel(false);
                      setMasterPassword('');
                      setError('');
                    }}
                    className="w-full text-slate-400 hover:text-white text-sm flex items-center justify-center gap-2 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    Volver al inicio
                  </button>
                </form>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold text-white mb-2">
                  {isSignUp ? 'Registro' : 'Iniciar sesión'}
                </h2>
                <p className="text-slate-400 mb-8">
                  {isSignUp ? 'Completa tus datos.' : 'Ingresa tus credenciales.'}
                </p>

            <form onSubmit={handleAuth} className="space-y-5">
              {isSignUp && (
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                    Nombre Completo
                  </label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                      placeholder="Ej. Juan Pérez"
                      required={isSignUp}
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                    placeholder="nombre@gmail.com"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide">
                  Contraseña
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-4 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
              >
                {loading ? 'Cargando...' : isSignUp ? 'Crear cuenta y activar código' : 'Continuar'}
                {!loading && <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
              </button>
            </form>

                <div className="mt-6 space-y-3">
                  <div className="text-center">
                    <button
                      onClick={() => setIsSignUp(!isSignUp)}
                      className="text-sm text-slate-400 hover:text-emerald-400 transition"
                    >
                      {isSignUp ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate'}
                    </button>
                  </div>

                  {!isSignUp && (
                    <div className="text-center">
                      <button
                        onClick={() => {
                          setIsSignUp(false);
                          if (currentUserId) {
                            setShowCodeActivation(true);
                          }
                        }}
                        className="text-sm text-blue-400 hover:text-blue-300 transition flex items-center gap-2 mx-auto"
                      >
                        <KeyRound className="w-4 h-4" />
                        Tengo un código de activación
                      </button>
                    </div>
                  )}

                  <div className="text-center pt-3 border-t border-slate-800">
                    <button
                      onClick={() => setShowLanding(true)}
                      className="text-sm text-slate-500 hover:text-slate-400 transition flex items-center gap-2 mx-auto"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      Volver a planes
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
