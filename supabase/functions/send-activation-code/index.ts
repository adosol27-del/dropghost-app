import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface EmailRequest {
  email: string;
  code: string;
  plan: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { email, code, plan }: EmailRequest = await req.json();

    if (!email || !code || !plan) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    const ADMIN_EMAIL = 'holayuxty@gmail.com';

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Email service not configured. Please contact support with your code: ' + code 
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        },
      );
    }

    const planNames: Record<string, string> = {
      'daily': 'Acceso Diario (1.99€)',
      'monthly_offer': 'Oferta Especial (19.99€ de por vida)',
      'monthly_standard': 'Acceso Mensual (29.99€/mes)'
    };

    const userEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #10b981 0%, #06b6d4 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
          .code-box { background: white; border: 2px dashed #10b981; padding: 20px; text-align: center; margin: 20px 0; border-radius: 10px; }
          .code { font-size: 32px; font-weight: bold; color: #10b981; letter-spacing: 5px; }
          .button { display: inline-block; background: #10b981; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Bienvenido a dropghost!</h1>
          </div>
          <div class="content">
            <h2>Gracias por tu compra</h2>
            <p>Has adquirido el plan: <strong>${planNames[plan] || plan}</strong></p>
            <p>Tu código de activación es:</p>
            <div class="code-box">
              <div class="code">${code}</div>
            </div>
            <p>Para activar tu cuenta:</p>
            <ol>
              <li>Inicia sesión o crea una cuenta en dropghost</li>
              <li>Ingresa este código de 6 dígitos</li>
              <li>¡Disfruta de todo el contenido premium!</li>
            </ol>
            <p style="color: #e74c3c; margin-top: 20px;">
              <strong>Importante:</strong> Este código solo puede usarse una vez. No lo compartas con nadie.
            </p>
          </div>
          <div class="footer">
            <p>Si no realizaste esta compra, puedes ignorar este email.</p>
            <p>© 2024 dropghost. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: #1f2937; color: white; padding: 20px; border-radius: 10px 10px 0 0; }
          .content { background: #f9fafb; padding: 20px; border-radius: 0 0 10px 10px; }
          .info-row { padding: 10px; border-bottom: 1px solid #e5e7eb; }
          .label { font-weight: bold; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2>Nueva Venta - dropghost</h2>
          </div>
          <div class="content">
            <div class="info-row">
              <span class="label">Email del cliente:</span> ${email}
            </div>
            <div class="info-row">
              <span class="label">Plan adquirido:</span> ${planNames[plan] || plan}
            </div>
            <div class="info-row">
              <span class="label">Código generado:</span> <strong>${code}</strong>
            </div>
            <div class="info-row">
              <span class="label">Fecha:</span> ${new Date().toLocaleString('es-ES')}
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const sendEmail = async (to: string, subject: string, html: string) => {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'dropghost <noreply@dropghost.com>',
          to: [to],
          subject: subject,
          html: html,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Failed to send email: ${error}`);
      }

      return await response.json();
    };

    await Promise.all([
      sendEmail(email, `Tu código de activación: ${code}`, userEmailHtml),
      sendEmail(ADMIN_EMAIL, `Nueva venta - ${email}`, adminEmailHtml),
    ]);

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Emails sent successfully' 
      }),
      {
        status: 200,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message || 'Internal server error' 
      }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      },
    );
  }
});