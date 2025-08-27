import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SupportEmailRequest {
  subject: string;
  message: string;
  senderEmail: string;
  senderName: string;
  ticketId?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, message, senderEmail, senderName, ticketId }: SupportEmailRequest = await req.json();

    // Email to super admin
    const emailResponse = await resend.emails.send({
      from: "Support <support@gabonshop.com>",
      to: ["admin@gabonshop.com"], // Remplacez par l'email du super admin
      subject: `[Support] ${subject}${ticketId ? ` - Ticket #${ticketId}` : ''}`,
      html: `
        <h2>Nouveau message de support</h2>
        <p><strong>De:</strong> ${senderName} (${senderEmail})</p>
        <p><strong>Sujet:</strong> ${subject}</p>
        ${ticketId ? `<p><strong>Ticket ID:</strong> ${ticketId}</p>` : ''}
        <hr>
        <h3>Message:</h3>
        <p>${message.replace(/\n/g, '<br>')}</p>
        <hr>
        <p><em>Ce message a été envoyé via le système de support de GabonShop</em></p>
      `,
    });

    console.log("Support email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ 
      success: true, 
      emailId: emailResponse.data?.id 
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-support-email function:", error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);