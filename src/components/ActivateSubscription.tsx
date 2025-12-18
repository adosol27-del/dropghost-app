import { useState } from 'react';
import { Check } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ActivateSubscriptionProps {
  onActivated: () => void;
  onCancel: () => void;
}

export default function ActivateSubscription({ onActivated, onCancel }: ActivateSubscriptionProps) {
  const [selectedType, setSelectedType] = useState<'daily' | 'monthly_offer' | 'monthly_standard'>('monthly_offer');
  const [activating, setActivating] = useState(false);
  const [error, setError] = useState('');

  const handleActivate = async () => {
    setActivating(true);
    setError('');

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      if (selectedType === 'monthly_offer') {
        const { data: stats } = await supabase
          .from('subscription_stats')
          .select('lifetime_offer_count')
          .single();

        if (stats && stats.lifetime_offer_count >= 50) {
          setError('Lo sentimos, la oferta especial ya no está disponible. Por favor selecciona otro plan.');
          setActivating(false);
          return;
        }
      }

      const expiresAt = selectedType === 'daily'
        ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
        : null;

      const price = selectedType === 'daily' ? 1.99 : selectedType === 'monthly_offer' ? 19.99 : 29.99;

      const { error: insertError } = await supabase
        .from('subscriptions')
        .insert({
          user_id: user.id,
          subscription_type: selectedType,
          status: 'active',
          price: price,
          is_lifetime_offer: selectedType === 'monthly_offer',
          expires_at: expiresAt
        });

      if (insertError) throw insertError;

      if (selectedType === 'monthly_offer') {
        const { error: funcError } = await supabase.rpc('increment_lifetime_offer_count');
        if (funcError) console.error('Error incrementing counter:', funcError);
      }

      onActivated();
    } catch (err: any) {
      console.error('Error activating subscription:', err);
      setError(err.message || 'Error al activar la suscripción');
    } finally {
      setActivating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-slate-900 rounded-2xl border-2 border-slate-700 max-w-md w-full p-8">
        <h2 className="text-3xl font-bold text-white mb-4">Activar Suscripción</h2>
        <p className="text-slate-400 mb-6">
          Después de completar tu pago en Stripe, selecciona el plan que compraste para activar tu acceso.
        </p>

        <div className="space-y-3 mb-6">
          <label className="flex items-center gap-3 p-4 border-2 border-slate-700 rounded-xl cursor-pointer hover:border-blue-500 transition">
            <input
              type="radio"
              name="subscription"
              value="daily"
              checked={selectedType === 'daily'}
              onChange={(e) => setSelectedType('daily')}
              className="w-5 h-5 text-blue-600"
            />
            <div className="flex-1">
              <div className="font-semibold text-white">Acceso Diario</div>
              <div className="text-sm text-slate-400">1,99€ por día</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border-2 border-slate-700 rounded-xl cursor-pointer hover:border-amber-500 transition">
            <input
              type="radio"
              name="subscription"
              value="monthly_offer"
              checked={selectedType === 'monthly_offer'}
              onChange={(e) => setSelectedType('monthly_offer')}
              className="w-5 h-5 text-amber-600"
            />
            <div className="flex-1">
              <div className="font-semibold text-white">Oferta Especial</div>
              <div className="text-sm text-slate-400">19,99€ de por vida</div>
            </div>
          </label>

          <label className="flex items-center gap-3 p-4 border-2 border-slate-700 rounded-xl cursor-pointer hover:border-purple-500 transition">
            <input
              type="radio"
              name="subscription"
              value="monthly_standard"
              checked={selectedType === 'monthly_standard'}
              onChange={(e) => setSelectedType('monthly_standard')}
              className="w-5 h-5 text-purple-600"
            />
            <div className="flex-1">
              <div className="font-semibold text-white">Acceso Mensual</div>
              <div className="text-sm text-slate-400">29,99€ al mes</div>
            </div>
          </label>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-3 px-6 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition font-medium"
          >
            Cancelar
          </button>
          <button
            onClick={handleActivate}
            disabled={activating}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {activating ? (
              <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Activar
              </>
            )}
          </button>
        </div>

        <p className="text-xs text-slate-500 mt-4 text-center">
          Solo activa tu suscripción después de completar el pago en Stripe
        </p>
      </div>
    </div>
  );
}