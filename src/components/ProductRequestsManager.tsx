import { useState, useEffect } from 'react';
import { X, Mail, Clock, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ProductRequest {
  id: string;
  user_id: string;
  email: string;
  message: string;
  status: 'pending' | 'reviewing' | 'completed';
  created_at: string;
  updated_at: string;
  admin_notes: string | null;
}

interface ProductRequestsManagerProps {
  onClose: () => void;
}

export default function ProductRequestsManager({ onClose }: ProductRequestsManagerProps) {
  const [requests, setRequests] = useState<ProductRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRequest, setSelectedRequest] = useState<ProductRequest | null>(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRequests(data || []);
    } catch (error) {
      console.error('Error loading requests:', error);
      alert('Error al cargar solicitudes');
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId: string, status: 'pending' | 'reviewing' | 'completed') => {
    try {
      const { error } = await supabase
        .from('product_requests')
        .update({
          status,
          admin_notes: adminNotes,
          updated_at: new Date().toISOString()
        })
        .eq('id', requestId);

      if (error) throw error;

      await loadRequests();
      setSelectedRequest(null);
      setAdminNotes('');
    } catch (error) {
      console.error('Error updating request:', error);
      alert('Error al actualizar solicitud');
    }
  };

  const deleteRequest = async (requestId: string) => {
    if (!confirm('¿Estás seguro de eliminar esta solicitud?')) return;

    try {
      const { error } = await supabase
        .from('product_requests')
        .delete()
        .eq('id', requestId);

      if (error) throw error;
      await loadRequests();
      setSelectedRequest(null);
    } catch (error) {
      console.error('Error deleting request:', error);
      alert('Error al eliminar solicitud');
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      reviewing: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      completed: 'bg-green-500/20 text-green-400 border-green-500/30'
    };

    const labels = {
      pending: 'Pendiente',
      reviewing: 'Revisando',
      completed: 'Completado'
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium border ${styles[status as keyof typeof styles]}`}>
        {labels[status as keyof typeof labels]}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const pendingCount = requests.filter(r => r.status === 'pending').length;
  const reviewingCount = requests.filter(r => r.status === 'reviewing').length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] border border-slate-700 overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-6 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-white mb-2">Solicitudes de Productos</h2>
            <p className="text-emerald-100 text-sm">Gestiona las solicitudes de tus usuarios</p>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex gap-4 p-4 bg-slate-800/50 border-b border-slate-700 flex-shrink-0">
          <div className="flex-1 bg-slate-900/50 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-400 text-sm font-medium">Pendientes</p>
                <p className="text-3xl font-bold text-white mt-1">{pendingCount}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-400 text-sm font-medium">Revisando</p>
                <p className="text-3xl font-bold text-white mt-1">{reviewingCount}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-400" />
            </div>
          </div>
          <div className="flex-1 bg-slate-900/50 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-400 text-sm font-medium">Completadas</p>
                <p className="text-3xl font-bold text-white mt-1">{completedCount}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-500"></div>
            </div>
          ) : requests.length === 0 ? (
            <div className="text-center py-20">
              <Mail className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400 text-lg">No hay solicitudes de productos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {requests.map((request) => (
                <div
                  key={request.id}
                  className="bg-slate-800/50 border border-slate-700 rounded-xl p-5 hover:border-emerald-500/50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Mail className="w-5 h-5 text-emerald-400" />
                        <span className="text-white font-semibold">{request.email}</span>
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-slate-400 text-sm">
                        {formatDate(request.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedRequest(request);
                          setAdminNotes(request.admin_notes || '');
                        }}
                        className="p-2 bg-emerald-600/20 hover:bg-emerald-600 text-emerald-400 hover:text-white rounded-lg transition"
                        title="Ver detalles"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => deleteRequest(request.id)}
                        className="p-2 bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white rounded-lg transition"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-slate-300 whitespace-pre-wrap">{request.message}</p>
                  </div>

                  {request.admin_notes && (
                    <div className="mt-3 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                      <p className="text-xs text-blue-400 font-medium mb-1">Notas del Admin:</p>
                      <p className="text-slate-300 text-sm">{request.admin_notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedRequest && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl border border-slate-700">
              <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-4 flex items-center justify-between">
                <h3 className="text-white font-bold">Gestionar Solicitud</h3>
                <button
                  onClick={() => {
                    setSelectedRequest(null);
                    setAdminNotes('');
                  }}
                  className="text-white/80 hover:text-white transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-slate-400 text-sm mb-2">Email del usuario:</label>
                  <p className="text-white font-medium">{selectedRequest.email}</p>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Mensaje:</label>
                  <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedRequest.message}</p>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-2">Notas del Admin (opcional):</label>
                  <textarea
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Añade notas internas sobre esta solicitud..."
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
                    rows={4}
                  />
                </div>

                <div>
                  <label className="block text-slate-400 text-sm mb-3">Cambiar estado:</label>
                  <div className="grid grid-cols-3 gap-3">
                    <button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'pending')}
                      disabled={updating}
                      className="py-3 px-4 bg-yellow-500/20 hover:bg-yellow-500/30 border border-yellow-500/30 text-yellow-400 rounded-xl transition font-medium disabled:opacity-50"
                    >
                      Pendiente
                    </button>
                    <button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'reviewing')}
                      disabled={updating}
                      className="py-3 px-4 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/30 text-blue-400 rounded-xl transition font-medium disabled:opacity-50"
                    >
                      Revisando
                    </button>
                    <button
                      onClick={() => updateRequestStatus(selectedRequest.id, 'completed')}
                      disabled={updating}
                      className="py-3 px-4 bg-green-500/20 hover:bg-green-500/30 border border-green-500/30 text-green-400 rounded-xl transition font-medium disabled:opacity-50"
                    >
                      Completado
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
