import { useState } from 'react';
import { Check, KeyRound, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CodeActivationProps {
  userId: string;
  onActivated: () => void;
  onBack: () => void;
}

export default function CodeActivation({ userId, onActivated, onBack }: CodeActivationProps) {
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      value = value[0];
    }

    if (!/^\d*$/.test(value)) {
      return;
    }

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      nextInput?.focus();
    }

    setError('');
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      const prevInput = document.getElementById(`code-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();

    if (!/^\d{6}$/.test(pastedData)) {
      setError('El código debe contener 6 dígitos');
      return;
    }

    const newCode = pastedData.split('');
    setCode(newCode);
    document.getElementById('code-5')?.focus();
  };

  const handleActivate = async () => {
    const fullCode = code.join('');

    if (fullCode.length !== 6) {
      setError('Por favor ingresa los 6 dígitos del código');
      return;
    }

    setActivating(true);
    setError('');

    try {
      const { data, error: rpcError } = await supabase.rpc('use_activation_code', {
        p_code: fullCode,
        p_user_id: userId
      });

      if (rpcError) throw rpcError;

      if (data && !data.success) {
        setError(data.error || 'Error al activar el código');
        setActivating(false);
        return;
      }

      setSuccess(true);
      setTimeout(() => {
        onActivated();
      }, 2000);
    } catch (err: any) {
      console.error('Error activating code:', err);
      setError(err.message || 'Error al activar el código. Intenta nuevamente.');
      setActivating(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-emerald-500 max-w-md w-full p-8 text-center">
          <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">
            ¡Código Activado!
          </h2>
          <p className="text-slate-400 mb-6">
            Tu suscripción ha sido activada correctamente. Redirigiendo...
          </p>
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 border-slate-700 max-w-md w-full p-8">
        <div className="text-center mb-8">
          <div className="inline-flex p-4 rounded-2xl bg-gradient-to-r from-blue-500 to-purple-600 mb-4">
            <KeyRound className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-3xl font-bold text-white mb-2">
            Activa tu Código
          </h2>
          <p className="text-slate-400">
            Ingresa el código de 6 dígitos que recibiste por email
          </p>
        </div>

        <div className="mb-6">
          <div className="flex gap-3 justify-center mb-4">
            {code.map((digit, index) => (
              <input
                key={index}
                id={`code-${index}`}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={index === 0 ? handlePaste : undefined}
                className="w-14 h-14 text-center text-2xl font-bold bg-slate-900/50 border-2 border-slate-600 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                disabled={activating}
              />
            ))}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-4">
              <p className="text-red-400 text-sm text-center">{error}</p>
            </div>
          )}

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 mb-6">
            <p className="text-blue-400 text-sm text-center">
              Revisa tu email después de completar la compra en Stripe
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleActivate}
            disabled={activating || code.join('').length !== 6}
            className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg"
          >
            {activating ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Activando...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Activar Código
              </>
            )}
          </button>

          <button
            onClick={onBack}
            disabled={activating}
            className="w-full py-3 px-6 bg-slate-700 hover:bg-slate-600 text-white rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Volver
          </button>
        </div>

        <div className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            ¿No recibiste tu código? Revisa tu carpeta de spam o contacta a soporte
          </p>
        </div>
      </div>
    </div>
  );
}