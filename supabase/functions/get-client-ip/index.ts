import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP from various headers
    const forwarded = req.headers.get("x-forwarded-for");
    const realIp = req.headers.get("x-real-ip");
    const cfConnectingIp = req.headers.get("cf-connecting-ip");
    
    // Try to get the most accurate client IP
    let clientIp = cfConnectingIp || realIp || forwarded?.split(',')[0] || "unknown";
    
    // Clean up the IP address
    if (clientIp !== "unknown") {
      clientIp = clientIp.trim();
      
      // Remove port if present
      if (clientIp.includes(':') && !clientIp.includes('::')) {
        const parts = clientIp.split(':');
        if (parts.length === 2 && /^\d+$/.test(parts[1])) {
          clientIp = parts[0];
        }
      }
    }

    console.log("Client IP detection:", {
      forwarded,
      realIp,
      cfConnectingIp,
      final: clientIp
    });

    return new Response(JSON.stringify({ ip: clientIp }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error getting client IP:", error);
    return new Response(
      JSON.stringify({ error: error.message, ip: "unknown" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);