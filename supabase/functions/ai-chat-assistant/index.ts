import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const SYSTEM_PROMPT = `Eres un asistente experto en dropshipping y e-commerce para DropGhost.

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface RequestBody {
  messages: ChatMessage[];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    console.log('[AI Chat] Nueva solicitud recibida');

    const { messages }: RequestBody = await req.json();
    console.log('[AI Chat] Mensajes recibidos:', messages?.length || 0);

    if (!messages || !Array.isArray(messages)) {
      console.error('[AI Chat] Error: formato de mensajes inválido');
      throw new Error('Invalid request: messages array is required');
    }

    const contents = [{
      parts: [
        { text: SYSTEM_PROMPT },
        ...messages.map(msg => ({ text: `${msg.role === 'user' ? 'Usuario' : 'Asistente'}: ${msg.content}` }))
      ]
    }];

    const apiKey = Deno.env.get('GEMINI_API_KEY');
    console.log('[AI Chat] API Key presente:', !!apiKey);

    if (!apiKey) {
      console.error('[AI Chat] ERROR CRÍTICO: GEMINI_API_KEY no configurada');
      throw new Error('GEMINI_API_KEY environment variable is not set');
    }

    console.log('[AI Chat] Llamando a Gemini API...');
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

    console.log('[AI Chat] Respuesta de Gemini:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[AI Chat] Error de Gemini API:', response.status, errorText);
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    console.log('[AI Chat] Datos recibidos de Gemini:', JSON.stringify(data).substring(0, 100));

    const aiMessage = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!aiMessage) {
      console.error('[AI Chat] Error: respuesta vacía de Gemini');
      throw new Error('Empty response from Gemini API');
    }

    console.log('[AI Chat] Respuesta exitosa, longitud:', aiMessage.length);

    return new Response(
      JSON.stringify({ message: aiMessage }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('[AI Chat] Error completo:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        message: '¡Hey! 👋 Parece que hubo un problema técnico. Intenta de nuevo en un momento.'
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});