import { useState } from 'react';
import { KeyRound, Mail, Loader2, Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function AdminCodeGenerator() {
  const [email, setEmail] = useState('');
  const [plan, setPlan] = useState<'daily' | 'monthly_offer' | 'monthly_standard'>('monthly_offer');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [generatedCode, setGeneratedCode] = useState('');

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setError('');
    setSuccess(false);

    try {
      const { data, error: codeError } = await supabase.rpc('create_activation_code', {
        p_subscription_type: plan,
        p_buyer_email: email
      });

      if (codeError) throw codeError;

      const code = data as string;
      setGeneratedCode(code);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-activation-code`;
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          code,
          plan
        })
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Error al enviar emails');
      }

      setSuccess(true);
      setTimeout(() => {
        setEmail('');
        setGeneratedCode('');
        setSuccess(false);
      }, 5000);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Error al generar código');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-slate-700 p-8 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
          <KeyRound className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Generar Código de Activación</h2>
          <p className="text-slate-400 text-sm">Crea códigos para nuevos clientes</p>
        </div>
      </div>

      {success ? (
        <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-6 text-center">
          <div className="w-16 h-16 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">Código Generado</h3>
          <p className="text-slate-400 mb-4">El código ha sido enviado por email</p>
          <div className="bg-slate-900 rounded-lg p-4 mb-4">
            <p className="text-3xl font-bold text-emerald-400 tracking-wider">{generatedCode}</p>
          </div>
          <p className="text-sm text-slate-500">Se enviaron emails al cliente y al admin</p>
        </div>
      ) : (
        <form onSubmit={handleGenerate} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-2">
              Email del Cliente
            </label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                placeholder="cliente@ejemplo.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-3">
              Plan Adquirido
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-4 border-2 border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 transition">
                <input
                  type="radio"
                  name="plan"
                  value="daily"
                  checked={plan === 'daily'}
                  onChange={(e) => setPlan('daily')}
                  className="w-4 h-4 text-blue-600"
                />
                <div>
                  <div className="font-semibold text-white">Acceso Diario</div>
                  <div className="text-sm text-slate-400">1,99€ por día</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-slate-700 rounded-xl cursor-pointer hover:border-amber-500 transition">
                <input
                  type="radio"
                  name="plan"
                  value="monthly_offer"
                  checked={plan === 'monthly_offer'}
                  onChange={(e) => setPlan('monthly_offer')}
                  className="w-4 h-4 text-amber-600"
                />
                <div>
                  <div className="font-semibold text-white">Oferta Especial</div>
                  <div className="text-sm text-slate-400">19,99€ de por vida</div>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 border-2 border-slate-700 rounded-xl cursor-pointer hover:border-emerald-500 transition">
                <input
                  type="radio"
                  name="plan"
                  value="monthly_standard"
                  checked={plan === 'monthly_standard'}
                  onChange={(e) => setPlan('monthly_standard')}
                  className="w-4 h-4 text-emerald-600"
                />
                <div>
                  <div className="font-semibold text-white">Acceso Mensual</div>
                  <div className="text-sm text-slate-400">29,99€ al mes</div>
                </div>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={generating}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {generating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Generando...
              </>
            ) : (
              <>
                <KeyRound className="w-5 h-5" />
                Generar y Enviar Código
              </>
            )}
          </button>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <p className="text-blue-400 text-sm">
              El código será generado automáticamente y se enviarán emails al cliente con su código y a ti (holayuxty@gmail.com) con la notificación de venta.
            </p>
          </div>
        </form>
      )}
    </div>
  );
}