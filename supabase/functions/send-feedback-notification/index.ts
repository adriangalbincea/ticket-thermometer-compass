import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const MAILCHIMP_API_KEY = Deno.env.get("MAILCHIMP_API_KEY");
const MAILCHIMP_SERVER = MAILCHIMP_API_KEY?.split('-')[1]; // Extract server from API key

interface FeedbackNotificationRequest {
  feedbackLinkId: string;
  feedbackType: string;
  comment?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { feedbackLinkId, feedbackType, comment }: FeedbackNotificationRequest = await req.json();

    console.log("Processing feedback notification for:", { feedbackLinkId, feedbackType });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get feedback link details
    const { data: feedbackLink, error: linkError } = await supabase
      .from('feedback_links')
      .select('*')
      .eq('id', feedbackLinkId)
      .single();

    if (linkError || !feedbackLink) {
      console.error('Error fetching feedback link:', linkError);
      return new Response(
        JSON.stringify({ error: 'Feedback link not found' }),
        { status: 404, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Get email settings
    const { data: emailSettings, error: settingsError } = await supabase
      .from('email_settings')
      .select('setting_type, setting_key, setting_value');

    if (settingsError) {
      console.error('Error fetching email settings:', settingsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch email settings' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Parse email settings
    const settingsMap = new Map<string, string>();
    emailSettings?.forEach(setting => {
      const key = `${setting.setting_type}_${setting.setting_key}`;
      settingsMap.set(key, setting.setting_value || '');
    });

    // Get notification recipients
    const { data: recipients, error: recipientsError } = await supabase
      .from('notification_recipients')
      .select('*')
      .eq('is_active', true);

    if (recipientsError) {
      console.error('Error fetching notification recipients:', recipientsError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch notification recipients' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (!recipients || recipients.length === 0) {
      console.log('No active notification recipients found');
      return new Response(
        JSON.stringify({ message: 'No active notification recipients configured' }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate Mailchimp configuration
    if (!MAILCHIMP_API_KEY || !MAILCHIMP_SERVER) {
      console.error('Mailchimp API key not configured or invalid format');
      return new Response(
        JSON.stringify({ error: 'Mailchimp API key not configured' }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Prepare email content with nicer templates
    const subject = settingsMap.get('template_notification_subject') || 'New Feedback Received - Ticket #{ticket_number}';
    const htmlTemplate = settingsMap.get('template_notification_html') || `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Feedback Received</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; background-color: #f4f6f9; margin: 0; padding: 20px; }
          .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
          .header h1 { margin: 0; font-size: 28px; font-weight: 600; }
          .content { padding: 30px; }
          .feedback-type { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: 600; text-transform: uppercase; font-size: 12px; letter-spacing: 1px; margin-bottom: 20px; }
          .feedback-happy { background: #d4edda; color: #155724; }
          .feedback-neutral { background: #fff3cd; color: #856404; }
          .feedback-sad { background: #f8d7da; color: #721c24; }
          .details-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 15px; margin: 20px 0; }
          .detail-label { font-weight: 600; color: #666; }
          .detail-value { color: #333; }
          .comment-section { background: #f8f9fa; border-left: 4px solid #667eea; padding: 20px; margin: 20px 0; border-radius: 0 8px 8px 0; }
          .footer { background: #f8f9fa; padding: 20px; text-align: center; font-size: 14px; color: #666; }
          .logo { font-weight: 700; color: #667eea; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>New Feedback Received</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.9;">A customer has submitted feedback for your attention</p>
          </div>
          <div class="content">
            <div class="feedback-type feedback-{feedback_type}">
              {feedback_type} Feedback
            </div>
            
            <div class="details-grid">
              <div class="detail-label">Ticket Number:</div>
              <div class="detail-value"><strong>{ticket_number}</strong></div>
              
              <div class="detail-label">Ticket Title:</div>
              <div class="detail-value">{ticket_title}</div>
              
              <div class="detail-label">Technician:</div>
              <div class="detail-value">{technician}</div>
              
              <div class="detail-label">Customer Name:</div>
              <div class="detail-value">{customer_name}</div>
              
              <div class="detail-label">Customer Email:</div>
              <div class="detail-value">{customer_email}</div>
            </div>
            
            <div class="comment-section">
              <h3 style="margin-top: 0; color: #667eea;">Customer Comment:</h3>
              <p style="margin-bottom: 0;">{comment}</p>
            </div>
          </div>
          <div class="footer">
            <div class="logo">Wiseserve</div>
            <p style="margin: 5px 0 0 0;">Professional IT Services & Support</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Replace variables in subject and template
    const finalSubject = subject
      .replace(/{ticket_number}/g, feedbackLink.ticket_number)
      .replace(/{ticket_title}/g, feedbackLink.ticket_title)
      .replace(/{technician}/g, feedbackLink.technician)
      .replace(/{customer_name}/g, feedbackLink.customer_name || 'N/A')
      .replace(/{customer_email}/g, feedbackLink.customer_email || 'N/A')
      .replace(/{feedback_type}/g, feedbackType)
      .replace(/{comment}/g, comment || 'No comment provided');

    const finalHtmlContent = htmlTemplate
      .replace(/{ticket_number}/g, feedbackLink.ticket_number)
      .replace(/{ticket_title}/g, feedbackLink.ticket_title)
      .replace(/{technician}/g, feedbackLink.technician)
      .replace(/{customer_name}/g, feedbackLink.customer_name || 'N/A')
      .replace(/{customer_email}/g, feedbackLink.customer_email || 'N/A')
      .replace(/{feedback_type}/g, feedbackType)
      .replace(/{comment}/g, comment || 'No comment provided');

    const fromEmail = settingsMap.get('api_from_email') || 'feedback@wiseserve.net';

    // Send emails to all active recipients using Mailchimp API
    const emailPromises = recipients.map(async (recipient) => {
      try {
        console.log(`Sending notification email to ${recipient.email}`);

        const mailchimpPayload = {
          key: MAILCHIMP_API_KEY,
          message: {
            html: finalHtmlContent,
            subject: finalSubject,
            from_email: fromEmail,
            from_name: "Wiseserve",
            to: [
              {
                email: recipient.email,
                type: "to"
              }
            ]
          }
        };

        const response = await fetch(`https://mandrillapp.com/api/1.0/messages/send.json`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(mailchimpPayload),
        });

        const emailResponse = await response.json();
        console.log(`Mailchimp API response for ${recipient.email}:`, emailResponse);

        if (!response.ok) {
          throw new Error(`Mailchimp API error: ${JSON.stringify(emailResponse)}`);
        }

        console.log(`Email sent successfully to ${recipient.email}`);
        return { recipient: recipient.email, success: true };
      } catch (error) {
        console.error(`Error sending email to ${recipient.email}:`, error);
        return { recipient: recipient.email, success: false, error: error.message };
      }
    });

    const emailResults = await Promise.all(emailPromises);
    const successCount = emailResults.filter(result => result.success).length;
    const failureCount = emailResults.length - successCount;

    console.log(`Notification emails sent: ${successCount} successful, ${failureCount} failed`);

    return new Response(JSON.stringify({
      message: `Notification emails sent to ${successCount} recipients`,
      results: emailResults,
      feedbackDetails: {
        ticketNumber: feedbackLink.ticket_number,
        technician: feedbackLink.technician,
        feedbackType: feedbackType
      }
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-feedback-notification function:", error);
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