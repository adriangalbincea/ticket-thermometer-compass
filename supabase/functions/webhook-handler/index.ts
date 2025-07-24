import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.52.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WebhookPayload {
  ticket_number: string;
  technician: string;
  ticket_title: string;
  customer_email?: string;
  customer_name?: string;
  expires_hours?: number;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    // Create Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const payload: WebhookPayload = await req.json();
    console.log('Webhook received:', payload);

    // Validate required fields
    if (!payload.ticket_number || !payload.technician || !payload.ticket_title) {
      return new Response(JSON.stringify({ 
        error: 'Missing required fields: ticket_number, technician, ticket_title' 
      }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Generate feedback link using the database function
    const { data: token, error } = await supabase.rpc('create_feedback_link', {
      p_ticket_number: payload.ticket_number,
      p_technician: payload.technician,
      p_ticket_title: payload.ticket_title,
      p_customer_email: payload.customer_email || null,
      p_customer_name: payload.customer_name || null,
      p_expires_hours: payload.expires_hours || 72,
    });

    if (error) {
      console.error('Error creating feedback link:', error);
      return new Response(JSON.stringify({ error: 'Failed to create feedback link' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get the request origin to build the feedback URL
    const origin = req.headers.get('origin') || 
                   req.headers.get('x-forwarded-proto') + '://' + req.headers.get('host') ||
                   'https://iaiennljjjvstovtpdhw.supabase.co';
    
    const feedbackUrl = `${origin}/feedback?token=${token}`;

    console.log('Feedback link created:', { token, feedbackUrl });

    // Return the generated link
    return new Response(JSON.stringify({
      success: true,
      data: {
        token,
        feedback_url: feedbackUrl,
        ticket_number: payload.ticket_number,
        technician: payload.technician,
        ticket_title: payload.ticket_title,
        expires_in_hours: payload.expires_hours || 72,
      }
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});