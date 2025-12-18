import { useState, useEffect } from 'react';
import { X, Download, Edit2, Trash2, Maximize2, ShoppingBag, Search, TrendingUp, Award, Flame, Zap, Calendar as CalendarIcon, Users, Video as VideoIcon, DollarSign, Tag, Globe, FileText } from 'lucide-react';
import type { Video } from '../lib/database.types';
import { supabase } from '../lib/supabase';

interface VideoDetailViewProps {
  video: Video;
  onClose: () => void;
  onEdit: (video: Video) => void;
  onDelete: () => void;
  dayName: string;
}

export default function VideoDetailView({ video, onClose, onEdit, onDelete, dayName }: VideoDetailViewProps) {
  const [imageUrl, setImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [productImageUrl, setProductImageUrl] = useState<string>('');
  const [salesImageUrl, setSalesImageUrl] = useState<string>('');
  const [showAngles, setShowAngles] = useState(false);
  const [showAdCopies, setShowAdCopies] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [showCalculator, setShowCalculator] = useState(false);
  const [salePrice, setSalePrice] = useState<string>('0.00');
  const [productCost, setProductCost] = useState<string>('0.00');
  const [adsCost, setAdsCost] = useState<string>('0.00');
  const [isEditingMetrics, setIsEditingMetrics] = useState(false);
  const [editedMetrics, setEditedMetrics] = useState({
    product_name: video.product_name || '',
    country: video.country || '',
    ranking_us: video.ranking_us || '',
    ranking_category: video.ranking_category || '',
    per_product: video.per_product || '',
    per_global: video.per_global || '',
    sales_yesterday: video.sales_yesterday || '',
    sales_7_days: video.sales_7_days || '',
  });

  useEffect(() => {
    const loadUrls = async () => {
      if (video.image_url) {
        const { data } = supabase.storage.from('images').getPublicUrl(video.image_url);
        setImageUrl(data.publicUrl);
      }
      if (video.video_url) {
        const { data } = supabase.storage.from('videos').getPublicUrl(video.video_url);
        setVideoUrl(data.publicUrl);
      }
      if (video.product_image_url) {
        const { data } = supabase.storage.from('images').getPublicUrl(video.product_image_url);
        setProductImageUrl(data.publicUrl);
      }
      if (video.sales_image_url) {
        const { data } = supabase.storage.from('images').getPublicUrl(video.sales_image_url);
        setSalesImageUrl(data.publicUrl);
      }
    };
    loadUrls();
  }, [video]);

  const handleDownload = async () => {
    if (videoUrl) {
      const a = document.createElement('a');
      a.href = videoUrl;
      a.download = `video-${video.id}.mp4`;
      a.click();
    }
  };

  const formatNumber = (num: number | null | undefined) => {
    if (!num) return '0';
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}mil`;
    return num.toString();
  };

  const handleSaveMetrics = async () => {
    try {
      const { error } = await supabase
        .from('videos')
        .update({
          product_name: editedMetrics.product_name,
          country: editedMetrics.country,
          ranking_us: editedMetrics.ranking_us,
          ranking_category: editedMetrics.ranking_category,
          per_product: editedMetrics.per_product,
          per_global: editedMetrics.per_global,
          sales_yesterday: editedMetrics.sales_yesterday,
          sales_7_days: editedMetrics.sales_7_days,
        })
        .eq('id', video.id);

      if (error) throw error;

      onEdit({ ...video, ...editedMetrics });
      setIsEditingMetrics(false);
      alert('Métricas actualizadas correctamente');
    } catch (error) {
      console.error('Error updating metrics:', error);
      alert('Error al actualizar las métricas');
    }
  };

  const handleCancelEditMetrics = () => {
    setEditedMetrics({
      product_name: video.product_name || '',
      country: video.country || '',
      ranking_us: video.ranking_us || '',
      ranking_category: video.ranking_category || '',
      per_product: video.per_product || '',
      per_global: video.per_global || '',
      sales_yesterday: video.sales_yesterday || '',
      sales_7_days: video.sales_7_days || '',
    });
    setIsEditingMetrics(false);
  };

  const getSalesAngles = () => {
    if (Array.isArray(video.sales_angles) && video.sales_angles.length > 0) {
      return video.sales_angles.map((angle, index) => ({
        title: `Ángulo ${index + 1}`,
        description: angle
      }));
    }

    const productName = video.product_name || video.title || 'este producto';
    const totalSales = formatNumber(video.total_sales);
    const salesYesterday = video.sales_yesterday || 'cientos';

    const angleStrategies = [
      {
        title: 'Problema-Solución',
        description: `¿Estás frustrado porque ese problema diario te impide alcanzar tus objetivos? 😤

${productName} fue diseñado específicamente para eliminar este problema de raíz. No es una solución temporal, es LA solución definitiva.

✅ Resuelve el problema principal en minutos
✅ Sin complicaciones, fácil de usar
✅ Resultados garantizados desde el primer uso
✅ Ya son ${totalSales} clientes que superaron este problema

No dejes que este problema controle tu vida un día más. Toma acción ahora y descubre la diferencia. 💪`
      },
      {
        title: 'Beneficio Emocional',
        description: `Imagina despertar cada día sintiéndote feliz, seguro, orgulloso y confiado... 🌟

${productName} no es solo un producto, es tu boleto hacia la vida que siempre soñaste.

💎 TRANSFORMA TU DÍA A DÍA:
• Siente la tranquilidad de tener todo bajo control
• Disfruta la confianza que siempre quisiste
• Experimenta la libertad de vivir sin preocupaciones
• Conquista ese sentimiento de logro personal

${totalSales} personas ya están viviendo esta transformación emocional. ¿Por qué tú no?

Tu bienestar emocional no tiene precio. Invierte en ti hoy. ❤️`
      },
      {
        title: 'Exclusividad/Escasez',
        description: `🚨 ALERTA: STOCK CRÍTICO 🚨

${productName} está VOLANDO de los estantes. Solo ayer se vendieron ${salesYesterday} unidades.

⚡ POR QUÉ LA URGENCIA ES REAL:
• Edición limitada: pocas unidades disponibles
• Tendencia VIRAL en redes sociales
• ${totalSales} unidades vendidas y contando
• Reabastecimiento: 4-6 semanas

Este no es un truco de marketing. La demanda es REAL y el inventario es LIMITADO.

⏰ ÚLTIMA OPORTUNIDAD:
Si estás leyendo esto, todavía hay stock... pero no por mucho tiempo.

❌ No seas de los que luego dicen "debí comprarlo cuando pude"
✅ Actúa AHORA y asegura el tuyo antes del agotamiento total

Los que dudan, pierden. Simple. 🔥`
      },
      {
        title: 'Comparación',
        description: `🤔 ¿Seguir con tu situación actual o dar el salto a ${productName}?

📊 COMPARACIÓN REAL:

SIN ${productName}:
❌ Sigues lidiando con las mismas frustraciones
❌ Pierdes tiempo y dinero constantemente
❌ Te frustras cada vez que intentas resolver el problema
❌ Envidias a quienes ya tienen la solución

CON ${productName}:
✅ Obtienes resultados automáticamente
✅ Ahorras tiempo, dinero y esfuerzo
✅ Disfrutas resultados positivos todos los días
✅ Te unes a ${totalSales} usuarios satisfechos

💰 INVERSIÓN vs. GASTO:
La competencia te cobra más por menos. ${productName} te da calidad premium a precio justo.

¿Vas a seguir gastando en soluciones mediocres o invertirás en algo que realmente funciona?

La elección es tuya. Pero ${salesYesterday} personas ayer eligieron sabiamente. 🎯`
      },
      {
        title: 'Transformación (Antes/Después)',
        description: `🔴 ANTES de ${productName}:
"Cada día es una lucha constante. He probado todo y nada funciona. Me siento estancado y sin esperanza..." 😞

🟢 DESPUÉS de ${productName}:
"¡WOW! No puedo creer el cambio. Mi vida es completamente diferente. ¿Por qué no lo descubrí antes?" 🤩

📈 TRANSFORMACIÓN COMPROBADA:

✨ Primera Semana:
• Notas mejora inmediata en tu día a día
• El problema principal disminuye notablemente
• Sientes la diferencia desde el día 1

🚀 Primer Mes:
• Los resultados están completamente logrados
• Tu rutina diaria se transforma por completo
• Las personas notan el cambio en ti

🏆 Resultados a Largo Plazo:
• Beneficios permanentes y duraderos
• Calidad de vida superior
• Sin vuelta atrás a lo que eras antes

${totalSales} transformaciones reales. ${salesYesterday} personas más empezaron ayer su viaje.

¿Cuándo empieza el tuyo? Tu "después" te está esperando. ⭐`
      }
    ];

    const shuffled = [...angleStrategies].sort(() => Math.random() - 0.5);

    return shuffled.map((angle, index) => ({
      title: `${index + 1}. ${angle.title}`,
      description: angle.description
    }));
  };

  const getFacebookAdCopies = () => {
    if (Array.isArray(video.facebook_ad_copies) && video.facebook_ad_copies.length > 0) {
      const angleLabels = [
        'Problema/Solución (Pain Point)',
        'Transformación (Antes y Después)',
        'Escasez/Urgencia (FOMO)',
        'Propuesta de Valor Única',
        'Desafío/Pregunta Impactante'
      ];
      return video.facebook_ad_copies.map((copy, index) => ({
        title: angleLabels[index] || `Copy ${index + 1}`,
        description: copy
      }));
    }

    const productName = video.product_name || video.title || 'este producto';
    const totalSales = formatNumber(video.total_sales);
    const salesYesterday = video.sales_yesterday || 'cientos';

    return [
      {
        title: 'Problema/Solución (Pain Point)',
        description: `¿Te has sentido frustrado porque ese problema constante sigue afectando tu día a día? 😔

Sabemos exactamente lo que estás pasando. Miles de personas han enfrentado este mismo problema durante años, probando soluciones que simplemente NO funcionan.

Pero aquí está la buena noticia... 🎯

${productName} fue diseñado específicamente para resolver este problema de raíz. No es otra solución temporal, es LA solución definitiva que has estado buscando.

✅ Resuelve el problema de forma permanente
✅ Fácil de usar, sin complicaciones
✅ Resultados visibles desde el primer uso
✅ Garantía de satisfacción 100%

Ya son ${totalSales} clientes satisfechos que superaron este mismo problema. Ahora es tu turno.

👉 Haz clic en "Comprar Ahora" y transforma tu vida hoy mismo. ¡No dejes que este problema te detenga ni un día más!`
      },
      {
        title: 'Transformación (Antes y Después)',
        description: `🔴 ANTES: "Estoy harto de esta situación... He probado todo y nada funciona. Me siento frustrado y sin esperanza..."

¿Te suena familiar? Así se sentían miles de personas antes de descubrir ${productName}.

🟢 DESPUÉS: "¡No puedo creer la diferencia! ${productName} cambió completamente mi vida. Ojalá lo hubiera descubierto antes. Es increíble."

Esta es la transformación REAL que están experimentando ${totalSales} personas en todo el mundo. No es magia, es simplemente el poder de una solución que REALMENTE funciona.

📈 RESULTADOS COMPROBADOS:
• Mejora notable en tiempo récord
• Resultados duraderos garantizados
• Cambios visibles desde el primer día
• Satisfacción del 98% de nuestros clientes

La pregunta no es SI funciona... la pregunta es: ¿Cuándo vas a empezar TÚ tu transformación?

💥 Únete a los miles que ya transformaron su vida. Haz clic ahora y empieza tu "después" hoy mismo.`
      },
      {
        title: 'Escasez/Urgencia (FOMO)',
        description: `⚠️ ALERTA DE INVENTARIO CRÍTICO ⚠️

¡Esto es SERIO! Solo quedan POCAS UNIDADES de ${productName} disponibles con el descuento especial de hoy.

📊 DATOS EN TIEMPO REAL:
• ${salesYesterday} unidades vendidas SOLO AYER
• Stock actual: LIMITADO
• Demanda: ALTÍSIMA
• Tiempo restante de oferta: POCAS HORAS

🔥 ¿Por qué tanta demanda?

Porque ${totalSales} clientes ya descubrieron que ${productName} es la solución definitiva que estaban buscando. Y ahora, TODO EL MUNDO lo quiere.

⏰ LA REALIDAD:
Si estás leyendo esto AHORA, todavía tienes oportunidad. Pero en unas horas, es muy probable que este stock se agote COMPLETAMENTE.

Y cuando eso pase, tendrás que esperar semanas para el próximo lote... Y probablemente a un precio MUCHO más alto.

❌ No cometas el error de "pensarlo" demasiado
❌ No seas de los que luego dicen "debí comprarlo cuando pude"
✅ Actúa AHORA mientras todavía hay disponibilidad

👉 Haz clic en "Comprar Ahora" y asegura tu unidad antes de que sea demasiado tarde. ¡No te quedes afuera!`
      },
      {
        title: 'Propuesta de Valor Única',
        description: `¿Qué hace a ${productName} COMPLETAMENTE DIFERENTE de todo lo demás que existe en el mercado? 🤔

Déjame ser directo contigo...

La mayoría de productos similares solo te dan soluciones temporales, materiales de baja calidad, y resultados mediocres. Son baratos por una razón: NO FUNCIONAN.

🎯 ${productName} ES DIFERENTE:

✨ DISEÑO Y FUNCIONALIDAD SUPERIOR:
Mientras otros productos ofrecen lo básico, nosotros entregamos una experiencia premium completa, lo que significa resultados 10X mejores para ti.

💎 CALIDAD PREMIUM GARANTIZADA:
No usamos materiales baratos ni procesos de baja calidad. Cada detalle está cuidadosamente diseñado para darte la mejor experiencia posible.

🔬 RESULTADOS CIENTÍFICAMENTE COMPROBADOS:
No es solo marketing. Tenemos estudios reales y ${totalSales} testimonios de clientes satisfechos que respaldan cada palabra que decimos.

🛡️ GARANTÍA SIN RIESGOS:
Tan seguros estamos de que te va a encantar, que ofrecemos garantía total de satisfacción. Si no funciona, te devolvemos el 100% de tu dinero. Sin preguntas.

🏆 RECONOCIMIENTO Y VALIDACIÓN:
Miles de clientes satisfechos respaldan la calidad y efectividad del producto.

La diferencia entre "otro producto más" y ${productName} es la diferencia entre seguir frustrado o finalmente lograr lo que quieres.

👉 No te conformes con menos. Elige calidad, elige resultados, elige ${productName}. Haz clic ahora.`
      },
      {
        title: 'Desafío/Pregunta Impactante',
        description: `¿Y si te dijera que podrías lograr resultados extraordinarios en tiempo récord? 💭

Sé lo que estás pensando: "Suena demasiado bueno para ser verdad..."

Y tendrías razón... SI estuviéramos hablando de cualquier otro producto.

Pero no estamos hablando de cualquier cosa. Estamos hablando de ${productName}.

🎯 AQUÍ ESTÁ EL DESAFÍO:

${totalSales} personas dijeron "sí" a este desafío. Y TODAS ellas lograron resultados que nunca pensaron posibles.

¿La pregunta real? ¿Eres de las personas que toma acción, o de las que solo observa cómo otros logran sus sueños?

💡 PIÉNSALO ASÍ:
• ¿Cuánto tiempo más vas a esperar para alcanzar tus objetivos?
• ¿Cuántas oportunidades más vas a dejar pasar?
• ¿Realmente puedes darte el lujo de seguir sin esta solución?

⚡ LA VERDAD INCÓMODA:
Dentro de 6 meses estarás en uno de dos lugares:

1️⃣ Celebrando que tomaste la decisión de probar ${productName} hoy
2️⃣ Arrepintiéndote de no haberlo hecho cuando tuviste la oportunidad

🏆 ${salesYesterday} personas aceptaron este desafío AYER.
🏆 ${totalSales} ya están viviendo los resultados.
🏆 Ahora es TU turno.

La pregunta no es "¿funcionará?" - ya sabemos que sí.
La pregunta es: "¿Estás listo para aceptar el desafío?"

👉 Haz clic ahora, acepta el desafío, y demuéstrate a ti mismo de lo que eres capaz. ¡Tu futuro yo te lo agradecerá!`
      }
    ];
  };

  return (
    <div className="fixed inset-0 bg-slate-950 z-50 overflow-y-auto">
      <div className="min-h-screen">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-white">
              Biblioteca: {dayName}
            </h1>
            <div className="flex items-center gap-4">
              <span className="text-slate-400 text-sm">Mostrando 1 publicaciones.</span>
              <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-sm font-medium rounded-lg hover:from-blue-600 hover:to-purple-600 transition">
                Meta Diaria
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                  <h2 className="text-sm font-semibold text-emerald-500 uppercase tracking-wide">
                    RESULTADOS
                  </h2>
                  {(salesImageUrl || imageUrl) && (
                    <button
                      onClick={() => setShowImageModal(true)}
                      className="ml-auto flex items-center gap-2 text-slate-400 hover:text-white transition"
                    >
                      <Maximize2 className="w-4 h-4" />
                      <span className="text-xs">Ampliar</span>
                    </button>
                  )}
                </div>

                <div className="bg-slate-800/50 rounded-lg overflow-hidden mb-4 border border-slate-700">
                  {(salesImageUrl || imageUrl) ? (
                    <img
                      src={salesImageUrl || imageUrl}
                      alt="Sales Report"
                      className="w-full h-64 object-contain bg-slate-900"
                    />
                  ) : (
                    <div className="w-full h-64 flex flex-col items-center justify-center text-slate-500 bg-gradient-to-br from-slate-900 to-slate-800">
                      <DollarSign className="w-16 h-16 mb-3" />
                      <p className="text-sm">Sin imagen de reporte de ventas</p>
                      <p className="text-xs text-slate-600 mt-1">Sube una imagen al editar el video</p>
                    </div>
                  )}
                </div>

                <button
                  onClick={() => setShowAngles(true)}
                  className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-700 transition mb-4 flex items-center justify-center gap-2"
                >
                  <FileText className="w-5 h-5" />
                  5 ÁNGULOS DE VENTAS
                </button>

                <button
                  onClick={() => {
                    const searchQuery = video.product_name || video.title || 'producto';
                    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;
                    window.open(googleSearchUrl, '_blank', 'noopener,noreferrer');
                  }}
                  className="w-full pl-11 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-slate-300 text-sm hover:bg-slate-700/50 transition flex items-center relative"
                >
                  <Search className="absolute left-4 w-4 h-4 text-slate-500" />
                  BUSCAR PRODUCTO (GOOGLE)
                </button>

                {video.store_link && video.store_link.trim() !== '' && (
                  <button
                    onClick={() => {
                      window.open(video.store_link, '_blank', 'noopener,noreferrer');
                    }}
                    className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02] mt-3"
                  >
                    <ShoppingBag className="w-5 h-5" />
                    COMPRAR PROVEEDOR
                  </button>
                )}
              </div>

              <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <h2 className="text-sm font-semibold text-purple-400 uppercase tracking-wide">
                    MÉTRICAS DEL PRODUCTO
                  </h2>
                  <div className="ml-auto flex gap-2">
                    {isEditingMetrics ? (
                      <>
                        <button
                          onClick={handleSaveMetrics}
                          className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg hover:bg-emerald-700 transition"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={handleCancelEditMetrics}
                          className="px-3 py-1 bg-slate-700 text-slate-300 text-xs rounded-lg hover:bg-slate-600 transition"
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setIsEditingMetrics(true)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 transition"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => setShowCalculator(true)}
                          className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-lg hover:bg-slate-700 transition"
                        >
                          Calcular Profit
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-4 mb-4 flex items-center gap-3">
                  <Tag className="w-5 h-5 text-slate-400" />
                  <div className="flex-1">
                    <div className="text-xs text-slate-500 uppercase">Producto Detectado</div>
                    {isEditingMetrics ? (
                      <input
                        type="text"
                        value={editedMetrics.product_name}
                        onChange={(e) => setEditedMetrics({ ...editedMetrics, product_name: e.target.value })}
                        className="mt-1 w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <div className="text-white font-semibold">{video.product_name || video.title || 'Sin nombre'}</div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-lg p-3 mb-4 flex items-center gap-2">
                  <Globe className="w-4 h-4 text-blue-400" />
                  {isEditingMetrics ? (
                    <input
                      type="text"
                      value={editedMetrics.country}
                      onChange={(e) => setEditedMetrics({ ...editedMetrics, country: e.target.value })}
                      className="flex-1 px-2 py-1 bg-slate-700 border border-slate-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <>
                      <div className="text-sm text-white">{video.country || 'Estados Unidos'}</div>
                      <div className="text-xs text-slate-500 ml-1">País / Región</div>
                    </>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-5 h-5 text-orange-400" />
                    </div>
                    {isEditingMetrics ? (
                      <input
                        type="text"
                        value={editedMetrics.ranking_us}
                        onChange={(e) => setEditedMetrics({ ...editedMetrics, ranking_us: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-orange-400 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-orange-400">{video.ranking_us || '452'}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">Ranking de ventas</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Award className="w-5 h-5 text-pink-400" />
                    </div>
                    {isEditingMetrics ? (
                      <input
                        type="text"
                        value={editedMetrics.ranking_category}
                        onChange={(e) => setEditedMetrics({ ...editedMetrics, ranking_category: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-pink-400 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-pink-500"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-pink-400">{video.ranking_category || '23'}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">Ranking en Categoría</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <TrendingUp className="w-5 h-5 text-cyan-400" />
                    </div>
                    {isEditingMetrics ? (
                      <input
                        type="text"
                        value={editedMetrics.per_product}
                        onChange={(e) => setEditedMetrics({ ...editedMetrics, per_product: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-cyan-400 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-cyan-500"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-cyan-400">{video.per_product || '83'}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">Índice de popularidad (Prod)</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Flame className="w-5 h-5 text-red-400" />
                    </div>
                    {isEditingMetrics ? (
                      <input
                        type="text"
                        value={editedMetrics.per_global}
                        onChange={(e) => setEditedMetrics({ ...editedMetrics, per_global: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-red-400 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-red-400">{video.per_global || '58'}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">Índice de popularidad</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Zap className="w-5 h-5 text-blue-400" />
                    </div>
                    {isEditingMetrics ? (
                      <input
                        type="text"
                        value={editedMetrics.sales_yesterday}
                        onChange={(e) => setEditedMetrics({ ...editedMetrics, sales_yesterday: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-blue-400 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-blue-400">{video.sales_yesterday || '-'}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">Ventas Ayer</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <CalendarIcon className="w-5 h-5 text-purple-400" />
                    </div>
                    {isEditingMetrics ? (
                      <input
                        type="text"
                        value={editedMetrics.sales_7_days}
                        onChange={(e) => setEditedMetrics({ ...editedMetrics, sales_7_days: e.target.value })}
                        className="w-full px-2 py-1 bg-slate-700 border border-slate-600 rounded text-purple-400 text-xl font-bold focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <div className="text-2xl font-bold text-purple-400">{video.sales_7_days || '-'}</div>
                    )}
                    <div className="text-xs text-slate-400 mt-1">Ventas últimos 7 días</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{formatNumber(video.total_sales)}</div>
                    <div className="text-xs text-slate-400 mt-1">Ventas totales</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{video.total_gmv || '$1.6millón'}</div>
                    <div className="text-xs text-slate-400 mt-1">Total GMV</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{formatNumber(video.influencers)}</div>
                    <div className="text-xs text-slate-400 mt-1">Influencers de ventas</div>
                  </div>

                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-2xl font-bold text-white">{formatNumber(video.video_count)}</div>
                    <div className="text-xs text-slate-400 mt-1">Número de videos</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-900/50 rounded-xl overflow-hidden border border-slate-800">
                <div className="bg-slate-800/50 px-4 py-3 flex items-center justify-between border-b border-slate-700">
                  <div className="flex items-center gap-2 text-slate-400">
                    <CalendarIcon className="w-4 h-4" />
                    <span className="text-sm">{video.publication_date || new Date().toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleDownload}
                      className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                      title="Descargar"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(video)}
                      className="p-2 hover:bg-slate-700 rounded-lg transition text-slate-400 hover:text-white"
                      title="Editar"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={onDelete}
                      className="p-2 hover:bg-red-900/50 rounded-lg transition text-red-400 hover:text-red-300"
                      title="Eliminar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="aspect-[9/16] bg-black relative">
                  {videoUrl ? (
                    <video
                      src={videoUrl}
                      className="w-full h-full object-contain"
                      controls
                      playsInline
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <VideoIcon className="w-24 h-24 text-slate-700" />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {showAngles && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto border border-slate-700">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-white">5 Ángulos de Venta</h2>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {Array.isArray(video.sales_angles) && video.sales_angles.length > 0
                    ? 'Ángulos personalizados del producto'
                    : '5 estrategias de marketing diferentes generadas para este producto'}
                </p>
              </div>
              <button
                onClick={() => setShowAngles(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {getSalesAngles().map((angle, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 rounded-lg p-5 border border-slate-700 hover:border-emerald-500/50 transition"
                >
                  <h3 className="text-lg font-semibold text-emerald-400 mb-3 break-words">{angle.title}</h3>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">{angle.description}</p>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(angle.description);
                      alert('Ángulo copiado al portapapeles');
                    }}
                    className="mt-3 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                  >
                    Copiar Ángulo
                  </button>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6">
              <button
                onClick={() => setShowAngles(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAdCopies && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 rounded-xl shadow-2xl w-full max-w-3xl max-h-[80vh] overflow-y-auto border border-slate-700">
            <div className="sticky top-0 bg-slate-900 border-b border-slate-700 p-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-emerald-400" />
                  <h2 className="text-2xl font-bold text-white">5 Copies de Facebook Ads</h2>
                </div>
                <p className="text-sm text-slate-400 mt-1">
                  {Array.isArray(video.facebook_ad_copies) && video.facebook_ad_copies.length > 0
                    ? 'Copies personalizados para tus anuncios'
                    : 'Copies generados automáticamente - Edita el video para personalizarlos'}
                </p>
              </div>
              <button
                onClick={() => setShowAdCopies(false)}
                className="p-2 hover:bg-slate-800 rounded-lg transition"
              >
                <X className="w-6 h-6 text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              {getFacebookAdCopies().map((copy, index) => (
                <div
                  key={index}
                  className="bg-slate-800/50 rounded-lg p-5 border border-slate-700 hover:border-emerald-500/50 transition"
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span className="flex-shrink-0 w-8 h-8 bg-emerald-600 text-white font-bold rounded-full flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-emerald-400 break-words">{copy.title}</h3>
                    </div>
                  </div>
                  <p className="text-slate-300 leading-relaxed whitespace-pre-wrap break-words overflow-wrap-anywhere max-w-full">{copy.description}</p>
                  <div className="flex gap-2 mt-4">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(copy.description);
                        alert('Copy copiado al portapapeles');
                      }}
                      className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition"
                    >
                      Copiar Copy
                    </button>
                    <button
                      onClick={() => {
                        const text = `${copy.title}\n\n${copy.description}`;
                        navigator.clipboard.writeText(text);
                        alert('Título y copy copiados al portapapeles');
                      }}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition"
                    >
                      Copiar con Título
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="sticky bottom-0 bg-slate-900 border-t border-slate-700 p-6">
              <button
                onClick={() => setShowAdCopies(false)}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {showImageModal && (salesImageUrl || imageUrl) && (
        <div
          className="fixed inset-0 bg-black/90 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowImageModal(false)}
        >
          <div className="relative max-w-6xl max-h-[90vh] w-full">
            <button
              onClick={() => setShowImageModal(false)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
            >
              <X className="w-6 h-6 text-white" />
            </button>
            <img
              src={salesImageUrl || imageUrl}
              alt="Sales Report - Ampliado"
              className="w-full h-full object-contain rounded-lg"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {showCalculator && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={() => setShowCalculator(false)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-sm shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-slate-700">
              <h3 className="text-white font-semibold">Calculadora</h3>
              <button
                onClick={() => setShowCalculator(false)}
                className="text-slate-400 hover:text-white transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-slate-400 text-xs font-medium mb-2 uppercase">
                  Precio Venta ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={salePrice}
                  onChange={(e) => setSalePrice(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-2 uppercase">
                    Costo Prod.
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={productCost}
                    onChange={(e) => setProductCost(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-xs font-medium mb-2 uppercase">
                    Costo Ads
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={adsCost}
                    onChange={(e) => setAdsCost(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800/80 border border-slate-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Profit:</span>
                  <span className="text-emerald-400 text-xl font-bold">
                    ${(parseFloat(salePrice || '0') - parseFloat(productCost || '0') - parseFloat(adsCost || '0')).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">Margin:</span>
                  <span className="text-orange-400 text-lg font-semibold">
                    {parseFloat(salePrice || '0') > 0
                      ? `${(((parseFloat(salePrice || '0') - parseFloat(productCost || '0') - parseFloat(adsCost || '0')) / parseFloat(salePrice || '0')) * 100).toFixed(0)}%`
                      : '0%'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
