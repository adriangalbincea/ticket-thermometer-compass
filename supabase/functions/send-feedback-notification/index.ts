import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.52.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

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

    // Prepare email content
    const subject = settingsMap.get('template_notification_subject') || 'New Feedback Received - Ticket #{ticket_number}';
    const htmlTemplate = settingsMap.get('template_notification_html') || `
      <h1>New Feedback Received</h1>
      <p>A new feedback has been submitted for ticket <strong>{ticket_number}</strong>.</p>
      <h3>Details:</h3>
      <ul>
        <li><strong>Ticket Number:</strong> {ticket_number}</li>
        <li><strong>Ticket Title:</strong> {ticket_title}</li>
        <li><strong>Technician:</strong> {technician}</li>
        <li><strong>Customer Name:</strong> {customer_name}</li>
        <li><strong>Customer Email:</strong> {customer_email}</li>
        <li><strong>Feedback Type:</strong> {feedback_type}</li>
        <li><strong>Comment:</strong> {comment}</li>
      </ul>
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

    // Send emails to all active recipients using the configured SMTP settings
    const emailPromises = recipients.map(async (recipient) => {
      try {
        // Call the send-test-email function with notification content
        const emailResponse = await supabase.functions.invoke('send-test-email', {
          body: {
            to: recipient.email,
            subject: finalSubject,
            htmlContent: finalHtmlContent,
            fromEmail: settingsMap.get('smtp_username') ? `WiseServe <${settingsMap.get('smtp_username')}>` : undefined,
          },
        });

        if (emailResponse.error) {
          console.error(`Failed to send email to ${recipient.email}:`, emailResponse.error);
          return { recipient: recipient.email, success: false, error: emailResponse.error };
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