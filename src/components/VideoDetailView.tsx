import { useState, useEffect } from 'react';
import { X, Download, Edit2, Trash2, Maximize2, ShoppingBag, Search, TrendingUp, Award, Flame, Zap, Calendar as CalendarIcon, Users, Video as VideoIcon, DollarSign, Tag, Globe, FileText } from 'lucide-react';
import type { Video } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import { generateUniqueSalesAngles, generateUniqueFacebookAdCopies } from '../lib/salesAnglesGenerator';

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
  const [salesAngles, setSalesAngles] = useState<Array<{title: string, description: string}>>([]);
  const [loadingAngles, setLoadingAngles] = useState(false);
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

  useEffect(() => {
    const loadSalesAngles = async () => {
      if (Array.isArray(video.sales_angles) && video.sales_angles.length > 0) {
        setSalesAngles(video.sales_angles.map((angle, index) => ({
          title: `Ángulo ${index + 1}`,
          description: angle
        })));
        return;
      }

      setLoadingAngles(true);
      try {
        const angles = await generateUniqueSalesAngles({
          id: video.id,
          product_name: video.product_name,
          title: video.title,
          category: video.category,
          total_sales: video.total_sales,
          sales_yesterday: video.sales_yesterday,
          country_origin: video.country
        });
        setSalesAngles(angles);
      } catch (error) {
        console.error('Error loading sales angles:', error);
      } finally {
        setLoadingAngles(false);
      }
    };

    loadSalesAngles();
  }, [video.id, video.sales_angles, video.product_name, video.title, video.category, video.total_sales, video.sales_yesterday, video.country]);

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

    return generateUniqueFacebookAdCopies({
      id: video.id,
      product_name: video.product_name,
      title: video.title,
      category: video.category,
      total_sales: video.total_sales,
      sales_yesterday: video.sales_yesterday,
      country_origin: video.country
    });
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
              {loadingAngles ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500 mb-4"></div>
                  <p className="text-slate-400 text-center">Generando ángulos de venta únicos con IA...</p>
                  <p className="text-slate-500 text-sm mt-2">Esto puede tomar unos segundos</p>
                </div>
              ) : salesAngles.length > 0 ? (
                salesAngles.map((angle, index) => (
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
                ))
              ) : (
                <div className="text-center py-12 text-slate-400">
                  <p>No hay ángulos de venta disponibles</p>
                </div>
              )}
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
