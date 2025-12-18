import { useState, useEffect } from 'react';
import { Download, Heart, BookmarkCheck, LogOut, Headphones, ShoppingBag } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { Video } from '../lib/database.types';
import { formatDate } from '../lib/utils';
import VideoDetailView from './VideoDetailView';
import SupportChat from './SupportChat';

const DAYS_ES = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

export default function UserLibrary() {
  const [selectedDay, setSelectedDay] = useState(0);
  const [allVideos, setAllVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewingVideo, setViewingVideo] = useState<Video | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showSupport, setShowSupport] = useState(false);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | undefined>();

  const getCurrentDayOfWeek = () => {
    const today = new Date();
    const day = today.getDay();
    return day;
  };

  const canViewDay = (dayIndex: number) => {
    const currentDay = getCurrentDayOfWeek();

    if (currentDay === 0 || currentDay === 6) {
      return true;
    }

    const adjustedCurrentDay = currentDay - 1;
    return dayIndex <= adjustedCurrentDay;
  };

  useEffect(() => {
    loadAllVideos();
    loadFavorites();
    loadCurrentUser();

    const currentDay = getCurrentDayOfWeek();
    if (currentDay >= 1 && currentDay <= 5) {
      setSelectedDay(currentDay - 1);
    } else {
      setSelectedDay(0);
    }
  }, []);

  const loadCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setCurrentUserEmail(user.email);
    }
  };

  const loadAllVideos = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('publication_date', { ascending: false });

      if (error) throw error;
      setAllVideos(data || []);
    } catch (error: any) {
      console.error('Error loading videos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('video_favorites')
        .select('video_id')
        .eq('user_id', user.id);

      if (error) throw error;

      const favoriteIds = new Set(data?.map(f => f.video_id) || []);
      setFavorites(favoriteIds);
    } catch (error: any) {
      console.error('Error loading favorites:', error.message);
    }
  };

  const videos = showFavoritesOnly
    ? allVideos.filter(v => favorites.has(v.id))
    : allVideos.filter(v => v.day_of_week === selectedDay);

  const toggleFavorite = async (videoId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      if (favorites.has(videoId)) {
        const { error } = await supabase
          .from('video_favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('video_id', videoId);

        if (error) throw error;

        const newFavorites = new Set(favorites);
        newFavorites.delete(videoId);
        setFavorites(newFavorites);
      } else {
        const { error } = await supabase
          .from('video_favorites')
          .insert({ user_id: user.id, video_id: videoId });

        if (error) throw error;

        const newFavorites = new Set(favorites);
        newFavorites.add(videoId);
        setFavorites(newFavorites);
      }
    } catch (error: any) {
      console.error('Error toggling favorite:', error.message);
      alert('Error al actualizar favoritos');
    }
  };

  const handleDownload = async (video: Video) => {
    if (!video.video_url) return;

    try {
      const videoUrl = getVideoUrl(video.video_url);
      const response = await fetch(videoUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `video_${video.product_name || 'download'}.mp4`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading video:', error);
      alert('Error al descargar el video');
    }
  };

  const getVideoUrl = (path: string) => {
    const { data } = supabase.storage.from('videos').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 relative">
      {viewingVideo && (
        <VideoDetailView
          video={viewingVideo}
          onClose={() => setViewingVideo(null)}
          onEdit={() => {}}
          onDelete={async () => {}}
          dayName={DAYS_ES[selectedDay]}
        />
      )}

      <div className="fixed top-6 right-6 z-50 flex gap-3">
        <button
          onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
          className={`px-5 py-2.5 font-medium rounded-xl transition flex items-center gap-2 shadow-xl ${
            showFavoritesOnly
              ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-500/20'
              : 'bg-slate-800 hover:bg-slate-700 text-white shadow-slate-800/20'
          }`}
        >
          <Heart className={`w-5 h-5 ${showFavoritesOnly ? 'fill-current' : ''}`} />
          {showFavoritesOnly ? 'Ver Todos' : `Favoritos (${favorites.size})`}
        </button>
        <button
          onClick={handleSignOut}
          className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl transition flex items-center gap-2 shadow-xl shadow-slate-800/20"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      <div className="p-6 pt-20">
        <div className="max-w-7xl mx-auto">
          {!showFavoritesOnly && (
            <div className="flex flex-col items-center justify-center mb-8">
              <div className="flex gap-3 mb-3">
                {DAYS_ES.map((day, index) => {
                  const dayVideos = allVideos.filter(v => v.day_of_week === index);
                  const count = dayVideos.length;
                  const isAccessible = canViewDay(index);
                  const currentRealDay = getCurrentDayOfWeek();
                  const isWeekend = currentRealDay === 0 || currentRealDay === 6;

                  return (
                    <button
                      key={day}
                      onClick={() => isAccessible && setSelectedDay(index)}
                      disabled={!isAccessible}
                      className={`px-6 py-3 rounded-full font-medium transition-all relative ${
                        selectedDay === index
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30'
                          : isAccessible
                          ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-white border border-slate-700'
                          : 'bg-slate-900/30 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
                      }`}
                      title={!isAccessible ? 'Disponible el ' + day : ''}
                    >
                      {day} {count > 0 && `${count}/5`}
                      {!isAccessible && (
                        <span className="absolute -top-1 -right-1 w-3 h-3 bg-slate-700 rounded-full border-2 border-slate-900"></span>
                      )}
                    </button>
                  );
                })}
              </div>
              {getCurrentDayOfWeek() >= 1 && getCurrentDayOfWeek() <= 5 && (
                <p className="text-slate-500 text-sm">
                  Los videos se desbloquean cada día. Toda la semana disponible los fines de semana.
                </p>
              )}
              {(getCurrentDayOfWeek() === 0 || getCurrentDayOfWeek() === 6) && (
                <p className="text-emerald-400 text-sm font-medium">
                  ¡Es fin de semana! Toda la semana está disponible.
                </p>
              )}
            </div>
          )}

          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
              {showFavoritesOnly ? 'Videos Guardados' : `Biblioteca: ${DAYS_ES[selectedDay]}`}
            </h1>
            <p className="text-slate-400 text-sm">
              {videos.length} {videos.length === 1 ? 'publicación' : 'publicaciones'}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-400 text-lg">
                No hay videos publicados para este día
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/10 transition-all group"
                >
                  <div className="relative aspect-[9/16] bg-black">
                    <div className="absolute inset-0 flex items-center justify-center">
                      {video.video_url ? (
                        <video
                          src={getVideoUrl(video.video_url)}
                          className="w-full h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                          onClick={() => setViewingVideo(video)}
                        />
                      ) : (
                        <div className="text-slate-600">Sin video</div>
                      )}
                    </div>

                    <div className="absolute top-2 right-2 flex gap-1.5">
                      <button
                        onClick={() => toggleFavorite(video.id)}
                        className={`p-2 rounded-lg backdrop-blur-md transition-all shadow-lg ${
                          favorites.has(video.id)
                            ? 'bg-red-500/90 text-white hover:bg-red-600'
                            : 'bg-slate-900/70 text-slate-300 hover:bg-slate-900/90 hover:text-white'
                        }`}
                        title={favorites.has(video.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      >
                        <Heart
                          className={`w-4 h-4 ${
                            favorites.has(video.id) ? 'fill-current' : ''
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => handleDownload(video)}
                        className="p-2 bg-slate-900/70 hover:bg-blue-600 rounded-lg backdrop-blur-md text-slate-300 hover:text-white transition-all shadow-lg"
                        title="Descargar video"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </div>

                    {video.publication_date && (
                      <div className="absolute top-2 left-2 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg border border-slate-700/50 shadow-lg">
                        <p className="text-xs text-slate-200 font-medium">
                          {formatDate(video.publication_date)}
                        </p>
                      </div>
                    )}
                  </div>

                  <div
                    className="p-3.5 cursor-pointer hover:bg-slate-800/60 transition"
                    onClick={() => setViewingVideo(video)}
                  >
                    {video.product_name && (
                      <h3 className="text-white font-semibold mb-1.5 line-clamp-2 text-sm">
                        {video.product_name}
                      </h3>
                    )}
                    {video.country && (
                      <p className="text-slate-400 text-xs font-medium mb-3">
                        {video.country}
                      </p>
                    )}
                    {video.store_link && video.store_link.trim() !== '' && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          window.open(video.store_link, '_blank', 'noopener,noreferrer');
                        }}
                        className="w-full py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-emerald-500/30 hover:scale-[1.02]"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        Comprar Proveedor
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

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
          userEmail={currentUserEmail}
        />
      )}
    </div>
  );
}
