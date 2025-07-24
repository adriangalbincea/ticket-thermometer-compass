import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';
import * as OTPAuth from 'https://esm.sh/otpauth@9.2.2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VerifyTOTPRequest {
  token: string;
  backup_code?: string;
}

Deno.serve(async (req) => {
  console.log('TOTP verification function called');

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { status: 405, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      console.log('No authorization header provided');
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with the user's token
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Get user from JWT token
    const jwt = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(jwt);
    
    if (authError || !user) {
      console.log('Authentication failed:', authError);
      return new Response(
        JSON.stringify({ error: 'Invalid authentication' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('User authenticated:', user.email);

    // Parse request body
    const { token, backup_code }: VerifyTOTPRequest = await req.json();

    if (!token && !backup_code) {
      return new Response(
        JSON.stringify({ error: 'Token or backup code required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get user's 2FA data
    const { data: userTwoFA, error: fetchError } = await supabase
      .from('user_2fa')
      .select('secret, backup_codes, is_enabled')
      .eq('user_id', user.id)
      .eq('is_enabled', true)
      .single();

    if (fetchError || !userTwoFA) {
      console.log('2FA not found or not enabled for user:', fetchError);
      return new Response(
        JSON.stringify({ error: '2FA not enabled' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle backup code verification
    if (backup_code) {
      console.log('Verifying backup code');
      const isValidBackupCode = userTwoFA.backup_codes?.includes(backup_code.toUpperCase());
      
      if (!isValidBackupCode) {
        console.log('Invalid backup code provided');
        return new Response(
          JSON.stringify({ error: 'Invalid backup code' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Remove used backup code
      const updatedBackupCodes = userTwoFA.backup_codes.filter(
        (code: string) => code !== backup_code.toUpperCase()
      );

      const { error: updateError } = await supabase
        .from('user_2fa')
        .update({ backup_codes: updatedBackupCodes })
        .eq('user_id', user.id);

      if (updateError) {
        console.log('Error updating backup codes:', updateError);
        return new Response(
          JSON.stringify({ error: 'Database error' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      console.log('Backup code verified successfully');
      return new Response(
        JSON.stringify({ success: true, message: 'Backup code verified' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Handle TOTP verification
    if (token) {
      console.log('Verifying TOTP token');
      
      if (!/^\d{6}$/.test(token)) {
        console.log('Invalid token format');
        return new Response(
          JSON.stringify({ error: 'Token must be 6 digits' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      try {
        // Create TOTP instance with user's secret
        const totp = new OTPAuth.TOTP({
          algorithm: 'SHA1',
          digits: 6,
          period: 30,
          secret: userTwoFA.secret,
        });

        // Verify the token with a 1-period window (30 seconds before/after)
        const delta = totp.validate({
          token: token,
          window: 1,
        });

        // delta will be a number if valid, null if invalid
        const isValid = delta !== null;
        
        console.log('TOTP verification result:', isValid);

        if (!isValid) {
          return new Response(
            JSON.stringify({ error: 'Invalid authentication code' }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }

        console.log('TOTP token verified successfully');
        return new Response(
          JSON.stringify({ success: true, message: 'Token verified' }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );

      } catch (error) {
        console.log('Error verifying TOTP:', error);
        return new Response(
          JSON.stringify({ error: 'Verification failed' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: 'No valid verification method provided' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.log('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});