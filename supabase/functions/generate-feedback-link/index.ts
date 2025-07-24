import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

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

serve(async (req) => {
  console.log('Function called with method:', req.method);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling CORS preflight');
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    console.log('Invalid method:', req.method);
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { 'Content-Type': 'application/json', ...corsHeaders } 
      }
    );
  }

  try {
    console.log('Starting feedback link generation...');
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    if (!supabaseUrl || !supabaseServiceKey) {
      console.error('Missing environment variables');
      return new Response(
        JSON.stringify({ error: 'Server configuration error' }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: FeedbackLinkRequest = await req.json();
    console.log('Request body:', body);
    
    const { ticket_number, technician, ticket_title, customer_email, customer_name, expires_hours = 72 } = body;

    if (!ticket_number || !technician || !ticket_title) {
      console.log('Missing required fields');
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
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Failed to create feedback link: ' + error.message }),
        { 
          status: 500, 
          headers: { 'Content-Type': 'application/json', ...corsHeaders } 
        }
      );
    }

    console.log('Generated token:', token);

    // Build feedback URL
    const origin = req.headers.get('origin') || 
                   (req.headers.get('x-forwarded-proto') && req.headers.get('host') ? 
                    `${req.headers.get('x-forwarded-proto')}://${req.headers.get('host')}` : 
                    'https://your-domain.com');
    
    const feedbackUrl = `${origin}/feedback/${token}`;

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
    console.error('Function error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    );
  }
});