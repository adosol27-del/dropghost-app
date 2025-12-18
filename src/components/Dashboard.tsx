import { useState, useEffect, useRef } from 'react';
import { Upload, Download, Copy, Trash2, Eye, LogOut, Sparkles, User, MessageSquare, KeyRound, Headphones, Inbox, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Video } from '../lib/database.types';
import { formatDate } from '../lib/utils';
import VideoDetailView from './VideoDetailView';
import UserLibrary from './UserLibrary';
import PricingPage from './PricingPage';
import AdminCodeGenerator from './AdminCodeGenerator';
import SupportChat from './SupportChat';
import ProductRequestsManager from './ProductRequestsManager';

const DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function Dashboard() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userRole, setUserRole] = useState<'admin' | 'user' | null>(null);
  const [viewingVideo, setViewingVideo] = useState<Video | null>(null);
  const [isUserView, setIsUserView] = useState(false);
  const [hasActiveSubscription, setHasActiveSubscription] = useState<boolean | null>(null);
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [showCodeGenerator, setShowCodeGenerator] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [showProductRequests, setShowProductRequests] = useState(false);
  const metricsImageInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    videoFile: null as File | null,
    publicationDay: 'Lunes',
    country: 'Estados Unidos',
    productName: '',
    rankingUS: '',
    rankingCategory: '',
    perProduct: '',
    perGlobal: '',
    salesYesterday: '',
    sales7Days: '',
    totalSales: '',
    totalGMV: '',
    impressions: '',
    videoCount: '',
    productImageFile: null as File | null,
    salesImageFile: null as File | null,
    storeLink: ''
  });

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    if (hasActiveSubscription !== null) {
      loadVideos();
    }
  }, [selectedDay, hasActiveSubscription]);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setCurrentUser(user);

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      const role = profile?.role || 'user';
      setUserRole(role);

      if (role === 'user') {
        setIsUserView(true);
      }

      await checkSubscription(user.id, role);
    }
  };

  const checkSubscription = async (userId: string, role: string) => {
    try {
      if (role === 'admin') {
        setHasActiveSubscription(true);
        setCheckingSubscription(false);
        return;
      }

      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (!data) {
        setHasActiveSubscription(false);
        setCheckingSubscription(false);
        return;
      }

      if (data.subscription_type === 'daily') {
        const expiresAt = new Date(data.expires_at);
        const now = new Date();

        if (expiresAt < now) {
          await supabase
            .from('subscriptions')
            .update({ status: 'expired' })
            .eq('id', data.id);

          setHasActiveSubscription(false);
        } else {
          setHasActiveSubscription(true);
        }
      } else {
        setHasActiveSubscription(true);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setHasActiveSubscription(false);
    } finally {
      setCheckingSubscription(false);
    }
  };

  const loadVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('day_of_week', selectedDay)
        .order('publication_date', { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error: any) {
      console.error('Error loading videos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, videoFile: file });
    }
  };

  const handleProductImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, productImageFile: file });
    }
  };

  const handleSalesImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({ ...formData, salesImageFile: file });
    }
  };

  const handleMetricsImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData({
        ...formData,
        country: 'Estados Unidos',
        productName: 'Producto Demo',
        rankingUS: '125',
        rankingCategory: '8',
        perProduct: '$45.50',
        perGlobal: '$38.20',
        salesYesterday: '$2,450',
        sales7Days: '$15,230',
        totalSales: '$125,400',
        totalGMV: '$89,500',
        impressions: '458K',
        videoCount: '12',
        productImageFile: file
      });
    }
  };

  const uploadFile = async (file: File, bucket: string, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}/${Math.random()}.${fileExt}`;

    const { error } = await supabase.storage
      .from(bucket)
      .upload(fileName, file);

    if (error) throw error;

    return fileName;
  };

  const handlePublish = async () => {
    if (!formData.videoFile) {
      alert('Por favor sube un video');
      return;
    }

    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const videoPath = await uploadFile(formData.videoFile, 'videos', user.id);

      let productImagePath = '';
      if (formData.productImageFile) {
        productImagePath = await uploadFile(formData.productImageFile, 'images', user.id);
      }

      let salesImagePath = '';
      if (formData.salesImageFile) {
        salesImagePath = await uploadFile(formData.salesImageFile, 'images', user.id);
      }

      const dayIndex = DAYS_ES.indexOf(formData.publicationDay);
      const publicationDate = new Date();
      publicationDate.setDate(publicationDate.getDate() + ((dayIndex - publicationDate.getDay() + 7) % 7));

      const dataToInsert = {
        user_id: user.id,
        video_url: videoPath,
        day_of_week: dayIndex,
        week_start_date: formatDate(new Date()),
        publication_date: formatDate(publicationDate),
        country: formData.country,
        product_name: formData.productName,
        ranking_us: formData.rankingUS ? parseInt(formData.rankingUS) : null,
        ranking_category: formData.rankingCategory ? parseInt(formData.rankingCategory) : null,
        per_product: formData.perProduct ? parseFloat(formData.perProduct) : null,
        per_global: formData.perGlobal ? parseFloat(formData.perGlobal) : null,
        sales_yesterday: formData.salesYesterday,
        sales_7_days: formData.sales7Days,
        total_sales: formData.totalSales,
        total_gmv: formData.totalGMV,
        impressions: formData.impressions,
        video_count: formData.videoCount,
        product_image_url: productImagePath,
        sales_image_url: salesImagePath,
        store_link: formData.storeLink,
        title: formData.productName,
        description: '',
        image_url: '',
        sales_summary: '',
        external_urls: []
      };

      const { error } = await supabase.from('videos').insert(dataToInsert);

      if (error) throw error;

      alert('Video publicado exitosamente');
      handleClearForm();
      loadVideos();
    } catch (error: any) {
      alert('Error al publicar: ' + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClearForm = () => {
    setFormData({
      videoFile: null,
      publicationDay: 'Lunes',
      country: 'Estados Unidos',
      productName: '',
      rankingUS: '',
      rankingCategory: '',
      perProduct: '',
      perGlobal: '',
      salesYesterday: '',
      sales7Days: '',
      totalSales: '',
      totalGMV: '',
      impressions: '',
      videoCount: '',
      productImageFile: null,
      salesImageFile: null,
      storeLink: ''
    });
  };

  const handleDeleteVideo = async (video: Video) => {
    if (!confirm('¿Eliminar este video?')) return;

    try {
      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', video.id);

      if (error) throw error;

      if (video.video_url) {
        await supabase.storage.from('videos').remove([video.video_url]);
      }
      if (video.product_image_url) {
        await supabase.storage.from('images').remove([video.product_image_url]);
      }
      if (video.sales_image_url) {
        await supabase.storage.from('images').remove([video.sales_image_url]);
      }

      loadVideos();
    } catch (error: any) {
      alert('Error al eliminar: ' + error.message);
    }
  };

  const handleDeleteWeek = async () => {
    const dayName = DAYS_ES[selectedDay];

    if (!confirm(`¿Estás seguro de que deseas borrar TODOS los videos del día ${dayName}?`)) {
      return;
    }

    if (!confirm(`⚠️ ADVERTENCIA: Esta acción NO se puede deshacer.\n\n¿Confirmas que deseas eliminar permanentemente TODOS los videos del ${dayName}?`)) {
      return;
    }

    try {
      const videosToDelete = videos;

      for (const video of videosToDelete) {
        if (video.video_url) {
          await supabase.storage.from('videos').remove([video.video_url]);
        }
        if (video.product_image_url) {
          await supabase.storage.from('images').remove([video.product_image_url]);
        }
        if (video.sales_image_url) {
          await supabase.storage.from('images').remove([video.sales_image_url]);
        }
        if (video.image_url) {
          await supabase.storage.from('images').remove([video.image_url]);
        }
      }

      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('day_of_week', selectedDay);

      if (error) throw error;

      loadVideos();
      alert(`Todos los videos del ${dayName} han sido eliminados correctamente.`);
    } catch (error: any) {
      console.error('Error deleting week videos:', error.message);
      alert('Error al eliminar los videos de la semana. Intenta nuevamente.');
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  const handleSubscribed = async () => {
    if (currentUser) {
      await checkSubscription(currentUser.id, userRole || 'user');
    }
  };

  const getVideoUrl = (path: string) => {
    const { data } = supabase.storage.from('videos').getPublicUrl(path);
    return data.publicUrl;
  };

  const getImageUrl = (path: string) => {
    const { data } = supabase.storage.from('images').getPublicUrl(path);
    return data.publicUrl;
  };

  if (checkingSubscription) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-400">Verificando acceso...</p>
        </div>
      </div>
    );
  }

  if (!hasActiveSubscription && userRole !== 'admin') {
    return <PricingPage onSubscribed={handleSubscribed} />;
  }

  if (isUserView) {
    return (
      <div className="relative min-h-screen">
        {userRole === 'admin' && (
          <div className="fixed top-6 right-6 z-50">
            <button
              onClick={() => setIsUserView(false)}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition flex items-center gap-2 shadow-xl shadow-blue-500/20"
            >
              <User className="w-5 h-5" />
              Vista Admin
            </button>
          </div>
        )}
        <UserLibrary />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex">
      <aside className="w-96 bg-slate-900/50 border-r border-slate-700/50 p-6 overflow-y-auto">
        <div className="flex items-center gap-3 mb-2">
          <MessageSquare className="w-6 h-6 text-slate-400" />
          <h1 className="text-xl font-bold text-white">Studio Creator</h1>
        </div>
        <p className="text-sm text-slate-400 mb-8">Sube tus 5 videos diarios aquí</p>

        <div className="space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-emerald-400 mb-3">
              <span className="text-white">1.</span> VIDEO VERTICAL
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-8 text-center hover:border-slate-600 transition cursor-pointer">
              <input
                type="file"
                accept="video/*"
                onChange={handleVideoUpload}
                className="hidden"
                id="video-upload"
              />
              <label htmlFor="video-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-slate-500 mx-auto mb-2" />
                <p className="text-sm text-slate-400">
                  {formData.videoFile ? formData.videoFile.name : 'Click para subir video'}
                </p>
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
              <span>2.</span> DÍA DE PUBLICACIÓN
            </label>
            <select
              value={formData.publicationDay}
              onChange={(e) => setFormData({ ...formData, publicationDay: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500"
            >
              {DAYS_ES.map(day => (
                <option key={day} value={day}>{day}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-cyan-400">
                <Sparkles className="w-4 h-4" />
                <span className="text-white">3.</span> MÉTRICAS DEL PRODUCTO
              </label>
              <input
                ref={metricsImageInputRef}
                type="file"
                accept="image/*"
                onChange={handleMetricsImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => metricsImageInputRef.current?.click()}
                className="px-3 py-1.5 bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-medium rounded-lg hover:from-cyan-600 hover:to-blue-600 transition"
              >
                Auto-rellenar con Imagen
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">País</label>
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Nombre del producto</label>
                <input
                  type="text"
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Ranking US</label>
                <input
                  type="text"
                  value={formData.rankingUS}
                  onChange={(e) => setFormData({ ...formData, rankingUS: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-cyan-400 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Ranking Cat.</label>
                <input
                  type="text"
                  value={formData.rankingCategory}
                  onChange={(e) => setFormData({ ...formData, rankingCategory: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Por Producto</label>
                <input
                  type="text"
                  value={formData.perProduct}
                  onChange={(e) => setFormData({ ...formData, perProduct: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-cyan-400 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Por Global</label>
                <input
                  type="text"
                  value={formData.perGlobal}
                  onChange={(e) => setFormData({ ...formData, perGlobal: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Ventas Ayer</label>
                <input
                  type="text"
                  value={formData.salesYesterday}
                  onChange={(e) => setFormData({ ...formData, salesYesterday: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-cyan-400 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="1.2mil"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Ventas 7 Días</label>
                <input
                  type="text"
                  value={formData.sales7Days}
                  onChange={(e) => setFormData({ ...formData, sales7Days: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="15.4mil"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Ventas Totales</label>
                <input
                  type="text"
                  value={formData.totalSales}
                  onChange={(e) => setFormData({ ...formData, totalSales: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-cyan-400 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="513.2mil"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Total GMV</label>
                <input
                  type="text"
                  value={formData.totalGMV}
                  onChange={(e) => setFormData({ ...formData, totalGMV: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="$12.9millón"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Impresiones</label>
                <input
                  type="text"
                  value={formData.impressions}
                  onChange={(e) => setFormData({ ...formData, impressions: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-cyan-400 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="9.2mil"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1 uppercase">Videos</label>
                <input
                  type="text"
                  value={formData.videoCount}
                  onChange={(e) => setFormData({ ...formData, videoCount: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-white text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                  placeholder="7.2mil"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-sm font-semibold text-emerald-400">
                <Upload className="w-4 h-4" />
                <span className="text-white">4.</span> IMAGEN PRODUCTO (PARA LENS)
              </label>
              <button className="px-3 py-1.5 bg-emerald-500 text-white text-xs font-medium rounded-lg">
                PARA BÚSQUEDA LENS
              </button>
            </div>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-slate-600 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleProductImageUpload}
                className="hidden"
                id="product-image-upload"
              />
              <label htmlFor="product-image-upload" className="cursor-pointer">
                <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  {formData.productImageFile ? formData.productImageFile.name : 'Subir foto'}
                </p>
              </label>
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-semibold text-white mb-3">
              <span>5.</span> IMAGEN DE VENTAS (CAPTURA)
            </label>
            <div className="border-2 border-dashed border-slate-700 rounded-xl p-6 text-center hover:border-slate-600 transition cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleSalesImageUpload}
                className="hidden"
                id="sales-image-upload"
              />
              <label htmlFor="sales-image-upload" className="cursor-pointer">
                <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                <p className="text-xs text-slate-400">
                  {formData.salesImageFile ? formData.salesImageFile.name : 'Subir captura de gráfico o resultados'}
                </p>
              </label>
            </div>
          </div>

          <div className="bg-emerald-900/20 border-2 border-emerald-600/30 rounded-2xl p-5">
            <label className="flex items-center gap-3 text-base font-bold text-emerald-400 mb-3">
              <div className="p-2 bg-emerald-600/20 rounded-lg">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <span className="text-white">6.</span> LINK DEL PROVEEDOR
              </div>
            </label>
            <p className="text-sm text-slate-400 mb-3">
              Los usuarios verán un botón en la tarjeta del video para visitar directamente tu proveedor (AliExpress, web, etc.)
            </p>
            <input
              type="url"
              value={formData.storeLink}
              onChange={(e) => setFormData({ ...formData, storeLink: e.target.value })}
              className="w-full px-4 py-3 bg-slate-800/50 border border-emerald-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 placeholder:text-slate-500"
              placeholder="https://es.aliexpress.com/item/12345.html"
            />
          </div>

          <button
            onClick={handlePublish}
            disabled={uploading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Upload className="w-5 h-5" />
            {uploading ? 'Publicando...' : 'Publicar en Biblioteca'}
          </button>

          <button
            onClick={handleDeleteWeek}
            className="w-full py-3 bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 rounded-xl transition flex items-center justify-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Borrar Semana Completa
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <header className="bg-slate-900/30 border-b border-slate-700/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-slate-400">{userRole === 'admin' ? 'Administrador' : 'Usuario'}</p>
                <p className="text-sm text-white font-medium">{userRole === 'admin' ? 'ADMINISTRADOR' : 'USUARIO'}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {userRole === 'admin' && (
                <>
                  <button
                    onClick={() => setShowCodeGenerator(true)}
                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition flex items-center gap-2 font-medium"
                  >
                    <KeyRound className="w-4 h-4" />
                    <span className="text-sm">Generar Código</span>
                  </button>
                  <button
                    onClick={() => setShowProductRequests(true)}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white rounded-lg transition flex items-center gap-2 font-medium"
                  >
                    <Inbox className="w-4 h-4" />
                    <span className="text-sm">Solicitudes</span>
                  </button>
                  <button
                    onClick={() => setIsUserView(true)}
                    className="text-slate-400 hover:text-white transition flex items-center gap-2"
                  >
                    <Eye className="w-5 h-5" />
                    <span className="text-sm">Vista Usuario</span>
                  </button>
                </>
              )}
              <button
                onClick={handleSignOut}
                className="p-2 hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-5 h-5 text-slate-400" />
              </button>
            </div>
          </div>
        </header>

        <div className="p-6">
          <div className="flex items-center gap-3 mb-6">
            {DAYS_ES.map((day, index) => (
              <button
                key={day}
                onClick={() => setSelectedDay(index)}
                className={`px-6 py-2.5 rounded-full font-medium transition ${
                  selectedDay === index
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                    : 'bg-slate-800/50 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-white mb-2">
              Biblioteca: {DAYS_ES[selectedDay]}
            </h2>
            <p className="text-slate-400">
              Mostrando {videos.length} {videos.length === 1 ? 'publicación' : 'publicaciones'}.
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <p className="mt-4 text-slate-400">Cargando videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-slate-500">No hay videos para este día</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-slate-900/50 border border-slate-700/50 rounded-xl overflow-hidden">
                  <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-slate-400">
                      <span>{video.publication_date ? new Date(video.publication_date).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewingVideo(video)}
                        className="p-2 hover:bg-emerald-500/20 rounded-lg transition"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4 text-emerald-400" />
                      </button>
                      <button
                        className="p-2 hover:bg-slate-800 rounded-lg transition"
                        title="Descargar"
                      >
                        <Download className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        className="p-2 hover:bg-slate-800 rounded-lg transition"
                        title="Copiar"
                      >
                        <Copy className="w-4 h-4 text-slate-400" />
                      </button>
                      <button
                        onClick={() => handleDeleteVideo(video)}
                        className="p-2 hover:bg-red-500/20 rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </button>
                    </div>
                  </div>

                  <div
                    className="aspect-[9/16] bg-black relative group cursor-pointer"
                    onClick={() => setViewingVideo(video)}
                  >
                    <video
                      src={getVideoUrl(video.video_url)}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <div className="bg-white/20 backdrop-blur-sm rounded-full p-6">
                        <Eye className="w-10 h-10 text-white" />
                      </div>
                    </div>
                  </div>

                  {video.product_name && (
                    <div className="p-4 border-t border-slate-700/50">
                      <p className="text-sm font-medium text-white mb-1">{video.product_name}</p>
                      <p className="text-xs text-slate-400">{video.country}</p>
                    </div>
                  )}

                  {(video.sales_image_url || video.product_image_url || video.image_url) && (
                    <div className="p-4 border-t border-slate-700/50">
                      <div className={`grid gap-3 ${
                        [video.sales_image_url, video.product_image_url, video.image_url].filter(Boolean).length === 1
                          ? 'grid-cols-1'
                          : 'grid-cols-2'
                      }`}>
                        {(video.sales_image_url || video.image_url) && (
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Reporte de Ventas</p>
                            <img
                              src={getImageUrl(video.sales_image_url || video.image_url)}
                              alt="Sales Report"
                              className="w-full h-24 object-cover rounded-lg border border-slate-700 cursor-pointer hover:opacity-80 transition"
                              onClick={() => setViewingVideo(video)}
                            />
                          </div>
                        )}
                        {video.product_image_url && (
                          <div className="space-y-1">
                            <p className="text-xs text-slate-400">Producto</p>
                            <img
                              src={getImageUrl(video.product_image_url)}
                              alt="Product"
                              className="w-full h-24 object-cover rounded-lg border border-slate-700 cursor-pointer hover:opacity-80 transition"
                              onClick={() => setViewingVideo(video)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {viewingVideo && (
        <VideoDetailView
          video={viewingVideo}
          onClose={() => setViewingVideo(null)}
          onEdit={(video) => {
            setViewingVideo(null);
          }}
          onDelete={async () => {
            await handleDeleteVideo(viewingVideo);
            setViewingVideo(null);
          }}
          dayName={DAYS_ES[selectedDay]}
        />
      )}

      {showCodeGenerator && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="relative max-w-2xl w-full">
            <button
              onClick={() => setShowCodeGenerator(false)}
              className="absolute -top-4 -right-4 w-10 h-10 bg-slate-700 hover:bg-slate-600 rounded-full flex items-center justify-center text-white transition z-10"
            >
              ✕
            </button>
            <AdminCodeGenerator />
          </div>
        </div>
      )}

      <button
        onClick={() => setShowSupport(true)}
        className="fixed bottom-6 right-6 w-16 h-16 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 rounded-full shadow-2xl flex items-center justify-center text-white transition transform hover:scale-110 z-40"
        title="Soporte DropGhost"
      >
        <Headphones className="w-7 h-7" />
      </button>

      {showSupport && (
        <SupportChat
          onClose={() => setShowSupport(false)}
          userEmail={currentUser?.email}
        />
      )}

      {showProductRequests && (
        <ProductRequestsManager
          onClose={() => setShowProductRequests(false)}
        />
      )}
    </div>
  );
}
