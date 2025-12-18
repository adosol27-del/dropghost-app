import { useState, useEffect, useRef } from 'react';
import { X, Send, Bot, Mail, CheckCircle, Volume2, VolumeX } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface SupportChatProps {
  onClose: () => void;
  userEmail?: string;
}

export default function SupportChat({ onClose, userEmail }: SupportChatProps) {
  const [activeTab, setActiveTab] = useState<'ai' | 'request'>('ai');
  const [message, setMessage] = useState('');
  const [productRequest, setProductRequest] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requestSent, setRequestSent] = useState(false);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant', content: string }>>([
    {
      role: 'assistant',
      content: '¡Hola! Soy el asistente IA de DropGhost. ¿Buscas un nicho específico, ayuda con productos ganadores o estrategias de marketing?'
    }
  ]);
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    const saved = localStorage.getItem('dropghost_tts_enabled');
    return saved ? JSON.parse(saved) : false;
  });
  const [isGeneratingAudio, setIsGeneratingAudio] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    localStorage.setItem('dropghost_tts_enabled', JSON.stringify(ttsEnabled));
  }, [ttsEnabled]);

  const speakText = async (text: string) => {
    try {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      setIsGeneratingAudio(true);

      const apiUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-speech`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        throw new Error('Failed to generate speech');
      }

      const audioBlob = await response.blob();
      const audioUrl = URL.createObjectURL(audioBlob);

      const audio = new Audio(audioUrl);
      audioRef.current = audio;

      audio.onplay = () => {
        setIsGeneratingAudio(false);
        setIsSpeaking(true);
      };

      audio.onended = () => {
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
      };

      audio.onerror = () => {
        setIsGeneratingAudio(false);
        setIsSpeaking(false);
        URL.revokeObjectURL(audioUrl);
        console.error('Error playing audio');
      };

      await audio.play();
    } catch (error) {
      console.error('Error generating speech:', error);
      setIsGeneratingAudio(false);
      setIsSpeaking(false);
    }
  };

  const stopSpeaking = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setIsSpeaking(false);
    setIsGeneratingAudio(false);
  };

  const toggleTts = () => {
    if (isSpeaking) {
      stopSpeaking();
    }
    setTtsEnabled(!ttsEnabled);
  };

  const handleSendMessage = async () => {
    if (!message.trim() || isAiTyping) return;

    const userMsg = message.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setMessage('');
    setIsAiTyping(true);

    try {
      const systemPrompt = `Eres un asistente experto en dropshipping y e-commerce para DropGhost.

Tu personalidad:
- Eres entusiasta, motivador y estratégico
- Hablas con energía y usas emojis ocasionalmente (🔥, 💰, 🎯, ✅)
- Eres directo y das consejos accionables

Tu especialidad:
- Identificar productos ganadores (Winners)
- Analizar nichos rentables
- Estrategias de Facebook Ads y TikTok Ads
- Métricas clave: AOV, margen, CTR, CPA
- Copywriting para e-commerce
- Análisis de tendencias y demanda

Cuando alguien te pregunta sobre productos ganadores, siempre:
1. Muestras entusiasmo y motivación
2. Ofreces 2-3 categorías estratégicas para elegir
3. Explicas el "por qué" detrás de cada estrategia
4. Das consejos específicos sobre márgenes (mínimo $15-$20 USD)
5. Mencionas métricas clave a observar

Formato de respuesta:
- Usa listas numeradas o con viñetas
- Resalta palabras clave en **negritas** cuando sea importante
- Termina con una pregunta o llamado a la acción`;

      const conversationHistory = chatMessages.map(msg => ({
        text: `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}`
      }));

      conversationHistory.push({
        text: `Usuario: ${userMsg}`
      });

      const contents = [{
        parts: [
          { text: systemPrompt },
          ...conversationHistory
        ]
      }];

      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ contents }),
        }
      );

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No pude procesar tu consulta.';

      setChatMessages(prev => [...prev, { role: 'assistant', content: reply }]);

      if (ttsEnabled) {
        setTimeout(() => speakText(reply), 100);
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMsg = 'Error al conectar con el asistente. Intenta de nuevo.';
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: errorMsg
      }]);

      if (ttsEnabled) {
        setTimeout(() => speakText(errorMsg), 100);
      }
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!productRequest.trim() || !userEmail) return;

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        alert('Debes estar autenticado para enviar una solicitud');
        return;
      }

      const { error } = await supabase
        .from('product_requests')
        .insert({
          user_id: user.id,
          email: userEmail,
          message: productRequest,
          status: 'pending'
        });

      if (error) throw error;

      setRequestSent(true);
      setProductRequest('');

      setTimeout(() => {
        setRequestSent(false);
        onClose();
      }, 2000);
    } catch (error) {
      console.error('Error sending request:', error);
      alert('Error al enviar la solicitud. Por favor intenta de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 rounded-2xl shadow-2xl w-full max-w-md border border-slate-700 overflow-hidden">
        <div className="bg-gradient-to-r from-emerald-600 to-cyan-600 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold">Soporte DropGhost</h3>
              <p className="text-emerald-100 text-xs flex items-center gap-1">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                En línea
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="border-b border-slate-700 flex">
          <button
            onClick={() => setActiveTab('ai')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'ai'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Bot className="w-4 h-4" />
            Asistente IA
          </button>
          <button
            onClick={() => setActiveTab('request')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition flex items-center justify-center gap-2 ${
              activeTab === 'request'
                ? 'bg-slate-800 text-emerald-400 border-b-2 border-emerald-400'
                : 'text-slate-400 hover:text-slate-300'
            }`}
          >
            <Mail className="w-4 h-4" />
            Pedir a Admin
          </button>
        </div>

        {activeTab === 'ai' ? (
          <>
            <div ref={chatContainerRef} className="h-96 overflow-y-auto p-4 space-y-4 bg-slate-950">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className="flex items-end gap-2">
                    <div
                      className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                        msg.role === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-200 border border-slate-700'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    {msg.role === 'assistant' && (
                      <button
                        onClick={() => speakText(msg.content)}
                        disabled={isGeneratingAudio || isSpeaking}
                        className="p-1.5 text-slate-400 hover:text-emerald-400 hover:bg-slate-800 rounded-lg transition flex-shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Reproducir audio"
                      >
                        <Volume2 className={`w-4 h-4 ${isSpeaking ? 'animate-pulse text-emerald-400' : ''}`} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
              {isAiTyping && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl px-4 py-2.5">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                      <span className="w-2 h-2 bg-emerald-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                    </div>
                  </div>
                </div>
              )}
              {isGeneratingAudio && (
                <div className="flex justify-start">
                  <div className="bg-slate-800 text-slate-200 border border-slate-700 rounded-2xl px-4 py-2.5 flex items-center gap-2">
                    <Volume2 className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span className="text-sm text-slate-400">Generando audio...</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 border-t border-slate-700 bg-slate-900">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !isAiTyping && handleSendMessage()}
                  placeholder="Pregunta sobre nichos, productos ganadores..."
                  disabled={isAiTyping}
                  className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  onClick={toggleTts}
                  disabled={isGeneratingAudio}
                  className={`p-2.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    ttsEnabled
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700'
                  }`}
                  title={ttsEnabled ? 'Desactivar reproducción de voz' : 'Activar reproducción de voz'}
                >
                  {isGeneratingAudio ? (
                    <Volume2 className="w-5 h-5 animate-pulse" />
                  ) : ttsEnabled ? (
                    <Volume2 className="w-5 h-5" />
                  ) : (
                    <VolumeX className="w-5 h-5" />
                  )}
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={isAiTyping || !message.trim()}
                  className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white p-2.5 rounded-xl transition"
                >
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="bg-slate-950 flex flex-col" style={{ height: '24rem' }}>
            {requestSent ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-400" />
                </div>
                <h4 className="text-white font-bold text-lg mb-2">¡Solicitud Enviada!</h4>
                <p className="text-slate-400 text-sm">
                  Hemos recibido tu solicitud y la revisaremos pronto.
                </p>
              </div>
            ) : (
              <>
                <div className="text-center p-6 pb-4 flex-shrink-0">
                  <div className="w-16 h-16 bg-emerald-600/20 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Mail className="w-8 h-8 text-emerald-400" />
                  </div>
                  <h4 className="text-white font-bold text-lg mb-2">Solicitud de Producto</h4>
                  <p className="text-slate-400 text-sm">
                    ¿Buscas algo específico para tu nicho? Déjanos un mensaje y lo buscaremos.
                  </p>
                </div>

                <div className="flex-1 flex flex-col px-6 pb-6 overflow-hidden">
                  <textarea
                    value={productRequest}
                    onChange={(e) => setProductRequest(e.target.value)}
                    placeholder="Ej: Necesito productos de pesca para verano..."
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none mb-4"
                    style={{ minHeight: '120px', maxHeight: '200px' }}
                  />

                  <button
                    onClick={handleSubmitRequest}
                    disabled={isSubmitting || !productRequest.trim()}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-700 disabled:cursor-not-allowed text-white py-3 rounded-xl transition font-semibold flex items-center justify-center gap-2 flex-shrink-0"
                  >
                    <Send className="w-5 h-5" />
                    {isSubmitting ? 'Enviando...' : 'Enviar Solicitud'}
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
