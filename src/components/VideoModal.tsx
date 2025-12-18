import { useState, useEffect } from 'react';
import { X, Upload, Plus, Trash2, Sparkles } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Video, ExternalUrl } from '../lib/database.types';
import { formatDate } from '../lib/utils';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  weekStartDate: string;
  dayOfWeek: number;
  editingVideo?: Video | null;
}

export default function VideoModal({
  isOpen,
  onClose,
  onSave,
  weekStartDate,
  dayOfWeek,
  editingVideo,
}: VideoModalProps) {
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [salesSummary, setSalesSummary] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [externalUrls, setExternalUrls] = useState<ExternalUrl[]>([]);
  const [salesAngles, setSalesAngles] = useState<string[]>(['', '', '', '', '']);
  const [facebookAdCopies, setFacebookAdCopies] = useState<string[]>(['', '', '', '', '']);

  useEffect(() => {
    if (editingVideo) {
      setTitle(editingVideo.title);
      setDescription(editingVideo.description);
      setSalesSummary(editingVideo.sales_summary);
      setExternalUrls(Array.isArray(editingVideo.external_urls) ? editingVideo.external_urls : []);
      const angles = Array.isArray(editingVideo.sales_angles) ? editingVideo.sales_angles : [];
      setSalesAngles([...angles, ...Array(5 - angles.length).fill('')].slice(0, 5));
      const adCopies = Array.isArray(editingVideo.facebook_ad_copies) ? editingVideo.facebook_ad_copies : [];
      setFacebookAdCopies([...adCopies, ...Array(5 - adCopies.length).fill('')].slice(0, 5));
    } else {
      resetForm();
    }
  }, [editingVideo]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setSalesSummary('');
    setVideoFile(null);
    setImageFile(null);
    setExternalUrls([]);
    setSalesAngles(['', '', '', '', '']);
    setFacebookAdCopies(['', '', '', '', '']);
  };

  const autoFillDemo = () => {
    const demoProducts = [
      {
        title: 'Masajeador Cervical LED - Trending 🔥',
        description: 'Producto viral en TikTok. Alivio instantáneo de dolor cervical con terapia de luz LED. Perfecto para oficinistas y personas con estrés.',
        salesSummary: 'Ventas del día: $2,847 | 67 pedidos | Ticket promedio: $42.50 | ROI: 3.2x | CTR: 4.8%',
        urls: [
          { label: 'AliExpress', url: 'https://aliexpress.com' },
          { label: 'TikTok Ad', url: 'https://tiktok.com' }
        ],
        angles: [
          'Alivio inmediato del dolor - Enfócate en el beneficio principal de eliminar el dolor de cuello en minutos',
          'Tecnología LED avanzada - Destaca la terapia de luz como innovación médica profesional',
          'Ideal para oficinistas - Apela a personas que pasan horas frente a la computadora',
          'Portátil y recargable - Enfatiza la comodidad de usar en cualquier lugar sin cables',
          'Recomendado por fisioterapeutas - Usa el argumento de autoridad y respaldo profesional'
        ],
        adCopies: [
          '¿Dolor de cuello que no te deja trabajar? 😣 Este masajeador LED elimina el dolor cervical en minutos. Miles de oficinistas ya lo usan. ¡Pruébalo ahora sin riesgo!',
          'De: "Mi cuello me mata cada día..." 😭 A: "¡Ya no tengo dolor! Trabajo cómodo todo el día" 🎉 La tecnología LED que cambió mi vida laboral. Descubre cómo →',
          '¡Últimas 20 unidades con 40% OFF! ⏰ Este masajeador viral se agota cada semana. No sufras otro día de dolor. Ordena el tuyo antes de que suba el precio.',
          'A diferencia de masajeadores comunes, este combina vibración + calor + terapia LED profesional. Alivio 3X más rápido. Recomendado por fisioterapeutas. Pruébalo →',
          '¿Podrías trabajar SIN dolor de cuello? 💡 Imagina terminar tu día sin molestias. 67 personas lo lograron ayer con este masajeador. ¿Aceptas el desafío de probarlo?'
        ]
      },
      {
        title: 'Organizador Giratorio de Maquillaje',
        description: 'Best seller en belleza. Organizador de 360° con capacidad para 200+ productos. Ideal para influencers y amantes del maquillaje.',
        salesSummary: 'Ventas del día: $1,923 | 89 pedidos | Ticket promedio: $21.60 | ROI: 4.1x | CTR: 6.2%',
        urls: [
          { label: 'Proveedor', url: 'https://aliexpress.com' },
          { label: 'Instagram Ad', url: 'https://instagram.com' }
        ],
        angles: [
          'Ahorra espacio - Organiza 200+ productos en un espacio reducido, perfecto para baños pequeños',
          'Encuentra todo rápido - Giro 360° permite acceder a cualquier producto en segundos',
          'Look profesional - Luce como un tocador de influencer, ideal para fotos y videos',
          'Protege tus productos - Mantiene maquillaje organizado y protegido del polvo y daños',
          'Regalo perfecto - Ideal para amantes del maquillaje, cumpleaños o día de la madre'
        ],
        adCopies: [
          '¿Cansada de no encontrar tu labial favorito? 😤 Este organizador giratorio guarda 200+ productos y encuentras todo en segundos. ¡Tu baño te lo agradecerá!',
          'De: "Mi maquillaje es un desastre..." 😭 A: "¡Luzco como influencer profesional!" ✨ El organizador 360° que transformó mi rutina de belleza en 1 día.',
          '¡OFERTA HOY! ⏰ Solo 48 horas con envío GRATIS. Este organizador viral está en tendencia. 89 personas lo compraron ayer. Consigue el tuyo ahora →',
          'Giro 360°, capacidad para 200 productos, diseño premium. A diferencia de organizadores básicos, este es ajustable y resistente. El favorito de influencers.',
          '¿Cuánto tiempo pierdes buscando tu maquillaje cada día? 🤔 Imagina tener todo organizado y a la vista. ¿Te atreves a revolucionar tu tocador?'
        ]
      },
      {
        title: 'Lámpara de Proyección Galaxy',
        description: 'Producto tendencia Q4. Crea ambiente espacial en cualquier habitación. Perfecto para regalos y decoración moderna.',
        salesSummary: 'Ventas del día: $3,156 | 124 pedidos | Ticket promedio: $25.45 | ROI: 3.8x | CTR: 5.4%',
        urls: [
          { label: 'Supplier Link', url: 'https://aliexpress.com' },
          { label: 'Video Ad', url: 'https://facebook.com' }
        ],
        angles: [
          'Ambiente relajante - Crea un entorno espacial que reduce estrés y ayuda a dormir mejor',
          'Regalo viral - El regalo más compartido en redes sociales, garantiza sorprender',
          'Multiuso - Perfecto para habitación, sala de cine en casa, o fiestas temáticas',
          'Funciones avanzadas - Control remoto, timer, y múltiples modos de proyección',
          'Decoración moderna - Transforma cualquier espacio en una experiencia inmersiva'
        ],
        adCopies: [
          '¿Estrés que no te deja dormir? 😰 Esta lámpara Galaxy crea un ambiente espacial relajante que te ayuda a desconectar. Duerme mejor desde hoy →',
          'De: "No puedo relajarme después del trabajo..." A: "Mi habitación es mi santuario espacial" 🌌 La lámpara que transformó mis noches. Ver aquí →',
          '¡STOCK LIMITADO! ⏰ El regalo más viral de la temporada. 124 vendidas en 24h. Sorprende con algo único antes de que se agote. Compra ahora.',
          'Control remoto + timer + 10 modos de proyección. A diferencia de lámparas comunes, esta crea experiencias inmersivas. La mejor valorada del mercado.',
          '¿Podrías convertir tu habitación en una experiencia espacial? 🚀 Miles lo hacen cada noche. El secreto está en esta lámpara. ¿Te unes?'
        ]
      },
      {
        title: 'Mini Humidificador Portátil USB',
        description: 'Viral en múltiples nichos. Diseño compacto perfecto para oficina y viajes. Gran margen de ganancia.',
        salesSummary: 'Ventas del día: $1,654 | 103 pedidos | Ticket promedio: $16.05 | ROI: 5.2x | CTR: 7.1%',
        urls: [
          { label: 'AliExpress', url: 'https://aliexpress.com' },
          { label: 'Product Page', url: 'https://shopify.com' }
        ],
        angles: [
          'Piel hidratada - Previene resequedad facial causada por aire acondicionado en oficina',
          'Ultra portátil - Cabe en cualquier bolsa, perfecto para viajes y escritorio',
          'Silencioso - Funciona sin ruido, ideal para trabajar o dormir sin molestias',
          'Ahorro energético - USB recargable, no necesita pilas ni alto consumo eléctrico',
          'Aromaterapia incluida - Agrega aceites esenciales para relajación y mejor ambiente'
        ],
        adCopies: [
          '¿Piel seca por el aire acondicionado? 😔 Este mini humidificador USB mantiene tu rostro hidratado todo el día. Trabaja cómodo sin resequedad →',
          'De: "Mi piel se reseca horriblemente en la oficina..." A: "¡Piel radiante e hidratada todo el día!" ✨ El humidificador que cambió mi rutina laboral.',
          '¡PRECIO ESPECIAL HOY! ⏰ ROI 5.2X comprobado. 103 personas lo compraron ayer. No dejes que tu piel sufra otro día. Oferta termina en 6 horas.',
          'USB recargable + silencioso + aromaterapia incluida. A diferencia de humidificadores grandes, este cabe en tu bolsa. Perfecto para oficina y viajes.',
          '¿Sabías que puedes tener piel hidratada TODO el día con solo USB? 💧 Parece magia, pero es ciencia. 103 personas lo descubrieron ayer. Tu turno →'
        ]
      }
    ];

    const randomProduct = demoProducts[Math.floor(Math.random() * demoProducts.length)];

    setTitle(randomProduct.title);
    setDescription(randomProduct.description);
    setSalesSummary(randomProduct.salesSummary);
    setExternalUrls(randomProduct.urls);
    setSalesAngles(randomProduct.angles);
    setFacebookAdCopies(randomProduct.adCopies);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No autenticado');

      let videoUrl = editingVideo?.video_url || '';
      let imageUrl = editingVideo?.image_url || '';

      if (videoFile) {
        const videoPath = `${user.id}/${Date.now()}_${videoFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('videos')
          .upload(videoPath, videoFile);

        if (uploadError) throw uploadError;
        videoUrl = videoPath;
      }

      if (imageFile) {
        const imagePath = `${user.id}/${Date.now()}_${imageFile.name}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(imagePath, imageFile);

        if (uploadError) throw uploadError;
        imageUrl = imagePath;
      }

      const videoData = {
        title,
        description,
        sales_summary: salesSummary,
        video_url: videoUrl,
        image_url: imageUrl,
        external_urls: externalUrls,
        sales_angles: salesAngles.filter(angle => angle.trim() !== ''),
        facebook_ad_copies: facebookAdCopies.filter(copy => copy.trim() !== ''),
        week_start_date: weekStartDate,
        day_of_week: dayOfWeek,
        user_id: user.id,
      };

      if (editingVideo) {
        const { error } = await supabase
          .from('videos')
          .update(videoData)
          .eq('id', editingVideo.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('videos')
          .insert([videoData]);

        if (error) throw error;
      }

      resetForm();
      onSave();
      onClose();
    } catch (error: any) {
      alert('Error al guardar: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const addUrl = () => {
    setExternalUrls([...externalUrls, { label: '', url: '' }]);
  };

  const updateUrl = (index: number, field: 'label' | 'url', value: string) => {
    const updated = [...externalUrls];
    updated[index][field] = value;
    setExternalUrls(updated);
  };

  const removeUrl = (index: number) => {
    setExternalUrls(externalUrls.filter((_, i) => i !== index));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold text-slate-800">
              {editingVideo ? 'Editar Video' : 'Nuevo Video'}
            </h2>
            {!editingVideo && (
              <button
                type="button"
                onClick={autoFillDemo}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white text-sm font-medium rounded-lg transition shadow-sm"
              >
                <Sparkles className="w-4 h-4" />
                Auto-rellenar
              </button>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition"
          >
            <X className="w-5 h-5 text-slate-600" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              placeholder="Título del video"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Descripción
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Descripción del video..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Video {editingVideo && '(dejar vacío para mantener el actual)'}
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                className="hidden"
                id="video-upload"
                required={!editingVideo}
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">
                  {videoFile ? videoFile.name : 'Subir video vertical'}
                </p>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Imagen / Gráfico {editingVideo && '(opcional)'}
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-400 transition">
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                className="hidden"
                id="image-upload"
              />
              {imageFile ? (
                <div className="text-center">
                  <Upload className="w-8 h-8 text-green-500 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 mb-3">{imageFile.name}</p>
                  <button
                    type="button"
                    onClick={() => setImageFile(null)}
                    className="text-sm text-red-600 hover:text-red-700 font-medium"
                  >
                    Remover imagen
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-8 h-8 text-slate-400 mx-auto" />
                  <div className="flex gap-2 justify-center">
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition"
                    >
                      Subir desde dispositivo
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const canvas = document.createElement('canvas');
                        canvas.width = 800;
                        canvas.height = 800;
                        const ctx = canvas.getContext('2d');

                        if (ctx) {
                          const gradient = ctx.createLinearGradient(0, 0, 800, 800);
                          gradient.addColorStop(0, '#667eea');
                          gradient.addColorStop(1, '#764ba2');
                          ctx.fillStyle = gradient;
                          ctx.fillRect(0, 0, 800, 800);

                          ctx.fillStyle = 'white';
                          ctx.font = 'bold 48px Arial';
                          ctx.textAlign = 'center';
                          ctx.fillText('Métricas del Día', 400, 100);

                          const metricsText = salesSummary || 'Ventas del día: $0 | 0 pedidos | Ticket promedio: $0';
                          const parts = metricsText.split('|').map(p => p.trim());

                          const metrics = [
                            { label: 'Ventas', value: parts[0]?.split(':')[1]?.trim() || '$0' },
                            { label: 'Pedidos', value: parts[1] || '0 pedidos' },
                            { label: 'Ticket Promedio', value: parts[2]?.split(':')[1]?.trim() || '$0' },
                            { label: 'ROI', value: parts[3]?.split(':')[1]?.trim() || '0x' },
                          ];

                          metrics.forEach((metric, index) => {
                            const y = 220 + index * 140;
                            ctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
                            ctx.fillRect(100, y - 40, 600, 100);

                            ctx.fillStyle = 'white';
                            ctx.font = '32px Arial';
                            ctx.textAlign = 'left';
                            ctx.fillText(metric.label, 120, y);
                            ctx.font = 'bold 40px Arial';
                            ctx.fillText(metric.value, 120, y + 40);
                          });

                          canvas.toBlob((blob) => {
                            if (blob) {
                              const file = new File([blob], 'metrics.png', { type: 'image/png' });
                              setImageFile(file);
                            }
                          });
                        }
                      }}
                      className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-500 text-white text-sm font-medium rounded-lg hover:from-emerald-600 hover:to-cyan-600 transition flex items-center gap-1.5"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generar automática
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 text-center">
                    Sube una imagen o genera una gráfica automática con tus métricas
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Resumen de ventas
            </label>
            <textarea
              value={salesSummary}
              onChange={(e) => setSalesSummary(e.target.value)}
              rows={2}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
              placeholder="Métricas y resumen de ventas del día..."
            />
          </div>

          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-5 border-2 border-blue-200">
            <label className="block text-base font-semibold text-slate-800 mb-3">
              5 Ángulos de Venta del Producto
            </label>
            <p className="text-xs text-slate-600 mb-4">
              Crea 5 ángulos de venta diferentes para maximizar conversiones. Cada ángulo debe resaltar un beneficio único del producto.
            </p>
            <div className="space-y-3">
              {salesAngles.map((angle, idx) => (
                <div key={idx}>
                  <label className="block text-xs font-medium text-slate-600 mb-1.5">
                    Ángulo {idx + 1}
                  </label>
                  <textarea
                    value={angle}
                    onChange={(e) => {
                      const updated = [...salesAngles];
                      updated[idx] = e.target.value;
                      setSalesAngles(updated);
                    }}
                    rows={2}
                    className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white"
                    placeholder={`Ejemplo: "Ahorra tiempo - Automatiza tareas que toman horas en solo minutos"`}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border-2 border-emerald-200">
            <label className="block text-base font-semibold text-slate-800 mb-3">
              5 Copies para Facebook Ads
            </label>
            <p className="text-xs text-slate-600 mb-4">
              Genera 5 copies de anuncios usando diferentes ángulos psicológicos para maximizar conversiones en Facebook.
            </p>
            <div className="space-y-3">
              {facebookAdCopies.map((copy, idx) => {
                const angleLabels = [
                  'Problema/Solución (Pain Point)',
                  'Transformación (Antes y Después)',
                  'Escasez/Urgencia (FOMO)',
                  'Propuesta de Valor Única',
                  'Desafío/Pregunta Impactante'
                ];
                return (
                  <div key={idx}>
                    <label className="block text-xs font-medium text-slate-600 mb-1.5">
                      Copy {idx + 1}: {angleLabels[idx]}
                    </label>
                    <textarea
                      value={copy}
                      onChange={(e) => {
                        const updated = [...facebookAdCopies];
                        updated[idx] = e.target.value;
                        setFacebookAdCopies(updated);
                      }}
                      rows={3}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none bg-white"
                      placeholder={`Ejemplo: "¿Cansado de [problema]? Este producto lo soluciona. ¡Pruébalo ahora!"`}
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700">
                Enlaces externos
              </label>
              <button
                type="button"
                onClick={addUrl}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                Agregar
              </button>
            </div>
            <div className="space-y-3">
              {externalUrls.map((link, idx) => (
                <div key={idx} className="flex gap-2">
                  <input
                    type="text"
                    value={link.label}
                    onChange={(e) => updateUrl(idx, 'label', e.target.value)}
                    placeholder="Etiqueta"
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <input
                    type="url"
                    value={link.url}
                    onChange={(e) => updateUrl(idx, 'url', e.target.value)}
                    placeholder="https://..."
                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeUrl(idx)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-slate-300 text-slate-700 font-medium rounded-lg hover:bg-slate-50 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
            >
              {loading ? 'Guardando...' : editingVideo ? 'Actualizar' : 'Crear'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
