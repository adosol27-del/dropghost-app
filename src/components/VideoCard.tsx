import { useState, useEffect } from 'react';
import { Edit2, Trash2, ExternalLink, Image as ImageIcon, Eye, ShoppingBag } from 'lucide-react';
import type { Video } from '../lib/database.types';
import { supabase } from '../lib/supabase';

interface VideoCardProps {
  video: Video;
  onEdit: (video: Video) => void;
  onDelete: () => void;
  onView: (video: Video) => void;
}

export default function VideoCard({ video, onEdit, onDelete, onView }: VideoCardProps) {
  const [showFullDescription, setShowFullDescription] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>('');
  const [videoUrl, setVideoUrl] = useState<string>('');

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
    };
    loadUrls();
  }, [video]);

  const externalUrls = Array.isArray(video.external_urls) ? video.external_urls : [];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition group">
      <div className="aspect-[9/16] bg-slate-900 relative overflow-hidden cursor-pointer" onClick={() => onView(video)}>
        {videoUrl && (
          <>
            <video
              src={videoUrl}
              className="w-full h-full object-cover"
              playsInline
            />
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
              <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
                <Eye className="w-8 h-8 text-white" />
              </div>
            </div>
          </>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-slate-800 flex-1">
            {video.title || 'Sin título'}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <button
              onClick={() => onView(video)}
              className="p-1.5 hover:bg-emerald-50 text-emerald-600 rounded transition"
              title="Ver"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={() => onEdit(video)}
              className="p-1.5 hover:bg-blue-50 text-blue-600 rounded transition"
              title="Editar"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 hover:bg-red-50 text-red-600 rounded transition"
              title="Eliminar"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {video.description && (
          <div className="mb-3">
            <p className="text-sm text-slate-600">
              {showFullDescription || video.description.length <= 120
                ? video.description
                : `${video.description.substring(0, 120)}...`}
            </p>
            {video.description.length > 120 && (
              <button
                onClick={() => setShowFullDescription(!showFullDescription)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium mt-1"
              >
                {showFullDescription ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </div>
        )}

        {imageUrl && (
          <div className="mb-3 rounded-lg overflow-hidden border border-slate-200">
            <img
              src={imageUrl}
              alt="Gráfico o imagen"
              className="w-full h-auto"
            />
          </div>
        )}

        {video.sales_summary && (
          <div className="bg-slate-50 rounded-lg p-3 mb-3">
            <div className="flex items-start gap-2">
              <ImageIcon className="w-4 h-4 text-slate-500 mt-0.5" />
              <p className="text-sm text-slate-700">{video.sales_summary}</p>
            </div>
          </div>
        )}

        {Array.isArray(video.sales_angles) && video.sales_angles.length > 0 && (
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg p-3 mb-3 border border-blue-200">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Ángulos de Venta:</h4>
            <div className="space-y-2">
              {video.sales_angles.slice(0, 3).map((angle, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="flex-shrink-0 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <p className="text-xs text-slate-700 flex-1">{angle}</p>
                </div>
              ))}
              {video.sales_angles.length > 3 && (
                <p className="text-xs text-blue-600 font-medium text-center pt-1">
                  +{video.sales_angles.length - 3} más (ver detalle)
                </p>
              )}
            </div>
          </div>
        )}

        {externalUrls.length > 0 && (
          <div className="space-y-2 mb-3">
            {externalUrls.map((link, idx) => (
              <a
                key={idx}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 py-1.5 rounded transition"
              >
                <ExternalLink className="w-4 h-4" />
                <span className="truncate">{link.label}</span>
              </a>
            ))}
          </div>
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
  );
}
