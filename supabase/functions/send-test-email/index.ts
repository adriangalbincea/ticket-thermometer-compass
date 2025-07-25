import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
const MAILCHIMP_SERVER = MAILCHIMP_API_KEY?.split('-')[1]; // Extract server from API key

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface TestEmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
  fromEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { to, subject, htmlContent, fromEmail }: TestEmailRequest = await req.json();

    // Validate input
    if (!to || !subject || !htmlContent) {
      console.error("Missing required fields:", { to: !!to, subject: !!subject, htmlContent: !!htmlContent });
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, subject, and htmlContent are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log("Attempting to send email with:", { 
      to, 
      subject, 
      fromEmail: fromEmail || "feedback@wiseserve.net",
      hasContent: !!htmlContent
    });
    console.log("MAILCHIMP_API_KEY configured:", !!MAILCHIMP_API_KEY);
    console.log("MAILCHIMP_SERVER:", MAILCHIMP_SERVER);

    if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER) {
      throw new Error("MAILCHIMP_API_KEY is not configured or invalid format");
    }

    // Prepare Mailchimp transactional email request
    const mailchimpPayload = {
      key: MAILCHIMP_API_KEY,
      message: {
        html: htmlContent,
        subject: subject,
        from_email: fromEmail || "feedback@wiseserve.net",
        from_name: "WiseServe",
        to: [
          {
            email: to,
            type: "to"
          }
        ]
      }
    };

    console.log("Sending email via Mailchimp Mandrill...");
    
    // Send email via Mailchimp Mandrill API
    const response = await fetch(`https://mandrillapp.com/api/1.0/messages/send.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(mailchimpPayload),
    });

    const emailResponse = await response.json();
    console.log("Mailchimp API response:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-test-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);