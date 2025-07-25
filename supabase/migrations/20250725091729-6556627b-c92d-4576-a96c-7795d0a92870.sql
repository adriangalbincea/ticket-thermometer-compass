UPDATE email_settings 
SET setting_value = REPLACE(
  setting_value, 
  '<strong><span style="font-family:&quot;Aptos&quot;,sans-serif">Feedback Type:</span></strong> {feedback_type}',
  '<strong><span style="font-family:&quot;Aptos&quot;,sans-serif">Feedback Type:</span></strong> {feedback_type_emoji} {feedback_type}'
) 
WHERE setting_type = 'template' AND setting_key = 'notification_html';