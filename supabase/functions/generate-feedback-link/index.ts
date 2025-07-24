import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FeedbackLinkRequest {
  ticket_number: string;
  technician: string;
  ticket_title: string;
  customer_email?: string;
  customer_name?: string;
  expires_hours?: number;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: FeedbackLinkRequest = await req.json();
    
    const { ticket_number, technician, ticket_title, customer_email, customer_name, expires_hours = 72 } = body;

    if (!ticket_number || !technician || !ticket_title) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: ticket_number, technician, ticket_title' }),
        { 
          status: 400, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Creating feedback link for:', { ticket_number, technician, ticket_title });

    // Call the database function to create the feedback link
    const { data: token, error } = await supabase.rpc('create_feedback_link', {
      p_ticket_number: ticket_number,
      p_technician: technician,
      p_ticket_title: ticket_title,
      p_customer_email: customer_email || null,
      p_customer_name: customer_name || null,
      p_expires_hours: expires_hours
    });

    if (error) {
      console.error('Error creating feedback link:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create feedback link: ' + error.message }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    const feedbackUrl = `${req.headers.get('origin') || 'https://your-domain.com'}/feedback/${token}`;

    console.log('Successfully created feedback link:', { token, feedbackUrl });

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          token,
          feedback_url: feedbackUrl,
          ticket_number,
          technician,
          ticket_title,
          expires_in_hours: expires_hours
        }
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error('Error in generate-feedback-link function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
};

serve(handler);