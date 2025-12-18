import { useState } from 'react';
import { Check, Sparkles, Zap, Crown, ArrowRight, Video, TrendingUp, BarChart3, Search, Package } from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
}

export default function LandingPage({ onGetStarted }: LandingPageProps) {
  const plans = [
    {
      name: 'Acceso Diario',
      price: '1,99€',
      period: 'por día',
      description: 'Perfecto para probar la plataforma',
      features: [
        'Acceso completo por 24 horas',
        'Todos los videos del día',
        'Métricas de productos',
        'Acceso a favoritos',
        'Sin compromisos'
      ],
      icon: Zap,
      color: 'from-blue-500 to-cyan-500',
      buttonColor: 'bg-blue-600 hover:bg-blue-700',
      url: 'https://buy.stripe.com/28E4gz4bM7c8ekt0hufjG0T'
    },
    {
      name: 'Oferta Especial',
      price: '19,99€',
      period: 'de por vida',
      description: 'Solo para los primeros 50 usuarios',
      features: [
        'Acceso ilimitado para siempre',
        'Precio bloqueado de por vida',
        'Todos los videos premium',
        'Métricas avanzadas',
        'Soporte prioritario',
        'Actualizaciones gratuitas'
      ],
      icon: Crown,
      color: 'from-amber-500 to-orange-500',
      buttonColor: 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-700 hover:to-orange-700',
      badge: 'OFERTA LIMITADA',
      url: 'https://buy.stripe.com/bJebJ18s26845NX4xKfjG0S',
      popular: true
    },
    {
      name: 'Acceso Mensual',
      price: '29,99€',
      period: 'al mes',
      description: 'Acceso completo sin límites',
      features: [
        'Acceso ilimitado mensual',
        'Todos los videos premium',
        'Análisis de tendencias',
        'Renovación automática',
        'Cancela cuando quieras',
        'Soporte incluido'
      ],
      icon: Sparkles,
      color: 'from-emerald-500 to-teal-500',
      buttonColor: 'bg-slate-600',
      comingSoon: true
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMyMjIiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzBoLTJWMGgydjMwem0tMiAzMGgyVjMwaC0ydjMwek0wIDM2aDMwdi0ySDB2MnptNjAgMHYtMkgzMHYyaDMweiIvPjwvZz48L2c+PC9zdmc+')] opacity-20"></div>

        <header className="relative z-10 container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">dropghost</h1>
            </div>
            <button
              onClick={onGetStarted}
              className="px-6 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl transition backdrop-blur-sm border border-white/20"
            >
              Iniciar Sesión
            </button>
          </div>
        </header>

        <section className="relative z-10 container mx-auto px-6 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/30 rounded-full mb-6">
              <Package className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 text-sm font-medium">DE DROPSHIPPERS PARA DROPSHIPPERS</span>
            </div>

            <h2 className="text-6xl font-bold text-white mb-6">
              Encuentra tu próximo<br />
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                Producto Winner
              </span>
            </h2>

            <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
              Accede a nuestra base de datos diaria de productos virales, analiza métricas reales y escala tu e-commerce.
            </p>

            <div className="grid md:grid-cols-3 gap-6 mb-16 max-w-4xl mx-auto">
              <div className="bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700 p-6 text-left">
                <Video className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">5 Videos Diarios</h3>
                <p className="text-slate-400 text-sm">Producto en escalada de 7 días</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700 p-6 text-left">
                <BarChart3 className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">Análisis de Competencia</h3>
                <p className="text-slate-400 text-sm">Datos de ventas.</p>
              </div>
              <div className="bg-slate-800/50 rounded-xl backdrop-blur-sm border border-slate-700 p-6 text-left">
                <Search className="w-8 h-8 text-emerald-400 mb-3" />
                <h3 className="text-white font-bold text-lg mb-2">Buscamos por ti ⚡</h3>
                <p className="text-slate-400 text-sm">Si no encuentras el producto, lo buscamos y garantizamos su tendencia.</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <section className="relative z-10 container mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h3 className="text-4xl font-bold text-white mb-4">
            Elige tu Plan
          </h3>
          <p className="text-xl text-slate-400">
            Selecciona el plan que mejor se adapte a tus necesidades
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto mb-12">
          {plans.map((plan) => {
            const Icon = plan.icon;

            return (
              <div
                key={plan.name}
                className={`relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border-2 p-8 transition-all hover:scale-105 ${
                  plan.popular
                    ? 'border-amber-500 shadow-2xl shadow-amber-500/20'
                    : 'border-slate-700 hover:border-slate-600'
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="text-center mb-6">
                  <div className={`inline-flex p-4 rounded-2xl bg-gradient-to-r ${plan.color} mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h4 className="text-2xl font-bold text-white mb-2">{plan.name}</h4>
                  <p className="text-slate-400 text-sm mb-4">{plan.description}</p>
                  <div className="mb-2">
                    <span className="text-5xl font-bold text-white">{plan.price}</span>
                  </div>
                  <span className="text-slate-400">{plan.period}</span>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-300">{feature}</span>
                    </li>
                  ))}
                </ul>

                {plan.comingSoon ? (
                  <button
                    disabled
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all shadow-lg flex items-center justify-center gap-2 ${plan.buttonColor} opacity-60 cursor-not-allowed`}
                  >
                    Próximamente
                  </button>
                ) : (
                  <a
                    href={plan.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-4 px-6 rounded-xl font-semibold text-white transition-all shadow-lg transform hover:scale-105 flex items-center justify-center gap-2 ${plan.buttonColor}`}
                  >
                    Comprar Ahora
                    <ArrowRight className="w-5 h-5" />
                  </a>
                )}
              </div>
            );
          })}
        </div>

        <div className="text-center max-w-3xl mx-auto bg-slate-800/30 backdrop-blur-sm border border-slate-700 rounded-2xl p-8">
          <h4 className="text-2xl font-bold text-white mb-4">
            ¿Ya compraste tu plan?
          </h4>
          <p className="text-slate-400 mb-6">
            Después de completar tu compra en Stripe, recibirás un código de activación de 6 dígitos por email. Usa ese código para activar tu acceso.
          </p>
          <button
            onClick={onGetStarted}
            className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-xl transition font-semibold shadow-lg transform hover:scale-105"
          >
            Activar mi Código
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      <footer className="relative z-10 container mx-auto px-6 py-8 border-t border-slate-800">
        <div className="text-center text-slate-500 text-sm">
          <p>Pagos seguros procesados por Stripe. Garantía de satisfacción.</p>
        </div>
      </footer>
    </div>
  );
}