import { useState, useEffect } from 'react';
import { Check, Sparkles, Zap, Crown, Ticket, AlertCircle, Copy } from 'lucide-react';
import { supabase } from '../lib/supabase';
import ActivateSubscription from './ActivateSubscription';

interface PricingPageProps {
  onSubscribed: () => void;
}

export default function PricingPage({ onSubscribed }: PricingPageProps) {
  const [offerAvailable, setOfferAvailable] = useState(true);
  const [offerCount, setOfferCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showActivation, setShowActivation] = useState(false);
  const [stripeConfigured, setStripeConfigured] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true);

  useEffect(() => {
    checkOfferAvailability();
    const configured = localStorage.getItem('stripeConfigured');
    if (configured === 'true') {
      setStripeConfigured(true);
      setShowInstructions(false);
    }
  }, []);

  const checkOfferAvailability = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_stats')
        .select('lifetime_offer_count')
        .single();

      if (error) throw error;

      const count = data?.lifetime_offer_count || 0;
      setOfferCount(count);
      setOfferAvailable(count < 50);
    } catch (error) {
      console.error('Error checking offer availability:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (url: string) => {
    if (!stripeConfigured) {
      const confirmed = window.confirm(
        '⚠️ ADVERTENCIA: Aun no has marcado que configuraste Stripe.\n\n' +
        'Si ves un error de "URL de proveedor", significa que necesitas:\n' +
        '1. Ir al Dashboard de Stripe\n' +
        '2. Editar cada Payment Link\n' +
        '3. Configurar la URL de retorno en "After payment"\n\n' +
        'Ve las instrucciones completas arriba.\n\n' +
        '¿Deseas intentar comprar de todos modos?'
      );

      if (!confirmed) {
        setShowInstructions(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    window.open(url, '_blank');
  };

  const plans = [
    {
      name: 'Acceso Diario',
      price: '1,99€',
      period: 'por día',
      description: 'Perfecto para probar la plataforma',
      features: [
        'Acceso completo por 24 horas',
        'Todos los videos del día',
        'Acceso a favoritos',
        'Sin compromisos'
      ],
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      url: 'https://buy.stripe.com/28E4gz4bM7c8ekt0hufjG0T',
      available: true
    },
    {
      name: 'Oferta Especial',
      price: '19,99€',
      period: 'de por vida',
      description: '¡Solo para los primeros 50 usuarios!',
      features: [
        'Acceso ilimitado para siempre',
        'Precio bloqueado de por vida',
        'Todos los videos premium',
        'Soporte prioritario',
        'Actualizaciones gratuitas'
      ],
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      buttonColor: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
      badge: 'OFERTA LIMITADA',
      url: 'https://buy.stripe.com/bJebJ18s26845NX4xKfjG0S',
      available: offerAvailable,
      popular: true,
      remainingSlots: 50 - offerCount
    },
    {
      name: 'Acceso Mensual',
      price: '29,99€',
      period: 'al mes',
      description: 'Acceso completo sin límites',
      features: [
        'Acceso ilimitado mensual',
        'Todos los videos premium',
        'Renovación automática',
        'Cancela cuando quieras',
        'Soporte incluido'
      ],
      icon: Sparkles,
      color: 'from-purple-500 to-pink-500',
      buttonColor: 'bg-purple-600 hover:bg-purple-700',
      url: 'https://buy.stripe.com/bJebJ18s26845NX4xKfjG0S',
      available: true,
      comingSoon: !offerAvailable
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const copyToClipboard = () => {
    const url = `${window.location.origin}/#/auth`;
    navigator.clipboard.writeText(url);
    alert('URL copiada al portapapeles');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-4">
            Elige tu Plan
          </h1>
          <p className="text-xl text-slate-400">
            Accede a contenido premium de video marketing
          </p>
        </div>

        {showInstructions && !stripeConfigured && (
          <div className="max-w-5xl mx-auto mb-12 bg-red-500/10 border-2 border-red-500/40 rounded-2xl p-8 relative">
            <button
              onClick={() => setShowInstructions(false)}
              className="absolute top-4 right-4 text-red-400 hover:text-red-300 text-2xl"
              title="Ocultar instrucciones temporalmente"
            >
              ×
            </button>

            <div className="flex items-start gap-4 mb-6">
              <div className="bg-red-500/20 p-3 rounded-xl">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-red-300 font-bold text-2xl mb-2">
                  ERROR: "No hay URL de proveedor configurada"
                </h3>
                <p className="text-red-200/90 font-medium text-lg">
                  Los pagos de Stripe NO funcionaran hasta que configures las URLs de retorno en el Dashboard de Stripe
                </p>
              </div>
            </div>

          <div className="bg-slate-900/80 rounded-xl p-6 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">1</div>
                <h4 className="text-white font-semibold text-lg">Abre Stripe Payment Links</h4>
              </div>
              <a
                href="https://dashboard.stripe.com/payment-links"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg"
              >
                Abrir Dashboard de Stripe
              </a>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">2</div>
                <h4 className="text-white font-semibold text-lg">Para CADA Payment Link (tienes 3):</h4>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-5 space-y-3">
                <p className="text-slate-300">a) Haz clic en el Payment Link</p>
                <p className="text-slate-300">b) Haz clic en el boton <span className="text-white font-semibold">"Edit"</span> (arriba a la derecha)</p>
                <p className="text-slate-300">c) Busca la seccion <span className="text-white font-semibold">"After payment"</span></p>
                <p className="text-slate-300">d) Selecciona <span className="text-white font-semibold">"Redirect to a URL"</span></p>
                <p className="text-slate-300">e) Pega esta URL:</p>

                <div className="bg-slate-900 rounded-lg p-4 border-2 border-green-500/30">
                  <div className="flex items-center justify-between gap-4">
                    <code className="text-green-400 text-base font-mono break-all flex-1 select-all">
                      {window.location.origin}/#/auth
                    </code>
                    <button
                      onClick={copyToClipboard}
                      className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition flex-shrink-0"
                    >
                      <Copy className="w-4 h-4" />
                      Copiar
                    </button>
                  </div>
                </div>

                <p className="text-slate-300">f) Haz clic en <span className="text-white font-semibold">"Save"</span></p>
                <p className="text-amber-300 font-medium">g) Repite para los otros 2 Payment Links</p>
              </div>
            </div>

            <div className="border-t border-slate-700 pt-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">3</div>
                <h4 className="text-white font-semibold text-lg">Verifica</h4>
              </div>
              <p className="text-slate-300">
                Despues de guardar, deberas ver tu URL en la seccion "After payment" de cada Payment Link.
              </p>
            </div>
          </div>

          <div className="mt-6 bg-amber-900/30 rounded-xl p-5 border border-amber-600/30">
            <p className="text-amber-200 font-medium flex items-start gap-3">
              <span className="text-2xl">💡</span>
              <span>
                Mientras tanto, los usuarios pueden comprar y luego usar el boton
                <span className="text-white font-semibold"> "Ya pague, activar suscripcion" </span>
                abajo para activar su codigo de 6 digitos que reciben por email.
              </span>
            </p>
          </div>

          <div className="mt-6 flex gap-4 justify-center">
            <button
              onClick={() => {
                setStripeConfigured(true);
                localStorage.setItem('stripeConfigured', 'true');
              }}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-semibold transition shadow-lg"
            >
              ✓ Ya configure Stripe
            </button>
            <button
              onClick={() => setShowInstructions(false)}
              className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-xl font-medium transition"
            >
              Ocultar por ahora
            </button>
          </div>
        </div>
        )}

        {!showInstructions && !stripeConfigured && (
          <div className="max-w-5xl mx-auto mb-8 text-center">
            <button
              onClick={() => setShowInstructions(true)}
              className="inline-flex items-center gap-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-300 px-6 py-3 rounded-xl font-medium transition"
            >
              <AlertCircle className="w-5 h-5" />
              Mostrar instrucciones de configuracion de Stripe
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans.map((plan) => {
            const Icon = plan.icon;
            const isDisabled = !plan.available;

            return (
              <div
                key={plan.name}
                className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 p-8 transition-all ${
                  plan.popular
                    ? 'border-amber-500 shadow-2xl shadow-amber-500/20 scale-105'
                    : isDisabled
                    ? 'border-slate-700 opacity-60'
                    : 'border-slate-700 hover:border-slate-600 hover:shadow-xl'
                }`}
              >
                {plan.badge && plan.available && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                {plan.comingSoon && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-slate-700 text-slate-300 px-4 py-1 rounded-full text-sm font-medium">
                      Próximamente
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${plan.color} mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{plan.name}</h3>
                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                  </div>
                  <span className="text-slate-400">{plan.period}</span>

                  {plan.remainingSlots !== undefined && plan.available && (
                    <div className="mt-4 bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                      <p className="text-amber-400 text-sm font-medium">
                        ¡Solo quedan {plan.remainingSlots} plazas!
                      </p>
                    </div>
                  )}
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className={`w-5 h-5 ${isDisabled ? 'text-slate-600' : 'text-green-500'} flex-shrink-0 mt-0.5`} />
                      <span className={isDisabled ? 'text-slate-600' : 'text-slate-300'}>{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => !isDisabled && handlePayment(plan.url)}
                  disabled={isDisabled}
                  className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all ${
                    isDisabled
                      ? 'bg-slate-700 cursor-not-allowed'
                      : `${plan.buttonColor} shadow-lg transform hover:scale-105`
                  }`}
                >
                  {isDisabled ? 'No Disponible' : plan.comingSoon ? 'Próximamente' : 'Seleccionar Plan'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-16 text-center space-y-4">
          <p className="text-slate-400 text-sm">
            Pagos seguros procesados por Stripe. Garantía de satisfacción.
          </p>

          <div className="border-t border-slate-700 pt-6">
            <button
              onClick={() => setShowActivation(true)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition font-medium border border-slate-600"
            >
              <Ticket className="w-5 h-5" />
              Ya pagué, activar suscripción
            </button>
          </div>
        </div>
      </div>

      {showActivation && (
        <ActivateSubscription
          onActivated={() => {
            setShowActivation(false);
            onSubscribed();
          }}
          onCancel={() => setShowActivation(false)}
        />
      )}
    </div>
  );
}