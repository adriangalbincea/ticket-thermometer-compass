-- Update the notification email template with a nicer design including smileys
UPDATE public.email_settings 
SET setting_value = '<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Customer Feedback</title>
    <style>
        @import url(''https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'');
        
        body {
            margin: 0;
            padding: 0;
            font-family: ''Inter'', ''Segoe UI'', Tahoma, Geneva, Verdana, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 40px 20px;
        }
        
        .email-container {
            max-width: 600px;
            margin: 0 auto;
            background: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }
        
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
            position: relative;
        }
        
        .header::before {
            content: '''';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url(''data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="20" cy="20" r="1" fill="white" opacity="0.1"/><circle cx="80" cy="40" r="1" fill="white" opacity="0.1"/><circle cx="40" cy="80" r="1" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>'');
        }
        
        .header h1 {
            margin: 0;
            font-size: 32px;
            font-weight: 700;
            position: relative;
            z-index: 1;
        }
        
        .header p {
            margin: 12px 0 0 0;
            opacity: 0.9;
            font-size: 18px;
            font-weight: 300;
            position: relative;
            z-index: 1;
        }
        
        .content {
            padding: 40px 30px;
        }
        
        .feedback-hero {
            text-align: center;
            margin-bottom: 40px;
        }
        
        .feedback-emoji {
            font-size: 80px;
            margin-bottom: 16px;
            display: block;
            text-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .feedback-type {
            display: inline-block;
            padding: 12px 24px;
            border-radius: 50px;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 14px;
            letter-spacing: 1.5px;
            margin-bottom: 24px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }
        
        .feedback-happy {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
        }
        
        .feedback-neutral {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
        }
        
        .feedback-sad {
            background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
            color: white;
        }
        
        .ticket-info {
            background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            border-left: 5px solid #667eea;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .info-grid {
            display: grid;
            grid-template-columns: 1fr 2fr;
            gap: 16px;
            margin: 20px 0;
        }
        
        .info-label {
            font-weight: 600;
            color: #64748b;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .info-value {
            color: #1e293b;
            font-weight: 500;
            font-size: 16px;
        }
        
        .ticket-number {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-weight: 700;
            font-size: 14px;
            display: inline-block;
        }
        
        .comment-section {
            background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
            border-radius: 12px;
            padding: 30px;
            margin: 30px 0;
            border-left: 5px solid #0ea5e9;
            position: relative;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        
        .comment-section::before {
            content: "💬";
            position: absolute;
            top: -10px;
            right: 20px;
            font-size: 24px;
            background: white;
            padding: 8px;
            border-radius: 50%;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
        
        .comment-section h3 {
            margin-top: 0;
            color: #0369a1;
            font-size: 20px;
            font-weight: 600;
            margin-bottom: 16px;
        }
        
        .comment-text {
            font-size: 16px;
            line-height: 1.7;
            color: #1e293b;
            margin: 0;
            font-style: italic;
            border-left: 3px solid #0ea5e9;
            padding-left: 20px;
        }
        
        .footer {
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 40px 30px;
            text-align: center;
        }
        
        .logo {
            font-weight: 700;
            font-size: 24px;
            margin-bottom: 8px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
            background-clip: text;
        }
        
        .tagline {
            color: #94a3b8;
            font-size: 14px;
            margin: 0;
            font-weight: 300;
        }
        
        .divider {
            height: 2px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            margin: 30px 0;
            border-radius: 2px;
        }
        
        @media (max-width: 600px) {
            .email-container {
                margin: 0;
                border-radius: 0;
            }
            
            .content, .header, .footer {
                padding: 30px 20px;
            }
            
            .info-grid {
                grid-template-columns: 1fr;
                gap: 12px;
            }
            
            .header h1 {
                font-size: 28px;
            }
            
            .feedback-emoji {
                font-size: 60px;
            }
        }
    </style>
</head>
<body>
    <div class="email-container">
        <div class="header">
            <h1>🎯 New Feedback Alert</h1>
            <p>A customer has shared their experience with us</p>
        </div>
        
        <div class="content">
            <div class="feedback-hero">
                <span class="feedback-emoji">
                    <!-- This will be replaced based on feedback type -->
                    {feedback_type_emoji}
                </span>
                <div class="feedback-type feedback-{feedback_type}">
                    {feedback_type} Feedback
                </div>
            </div>
            
            <hr class="divider">
            
            <div class="ticket-info">
                <div class="info-grid">
                    <div class="info-label">Ticket Number</div>
                    <div class="info-value">
                        <span class="ticket-number">#{ticket_number}</span>
                    </div>
                    
                    <div class="info-label">Issue Description</div>
                    <div class="info-value">{ticket_title}</div>
                    
                    <div class="info-label">Assigned Technician</div>
                    <div class="info-value">👨‍💻 {technician}</div>
                    
                    <div class="info-label">Customer Name</div>
                    <div class="info-value">👤 {customer_name}</div>
                    
                    <div class="info-label">Customer Email</div>
                    <div class="info-value">📧 {customer_email}</div>
                </div>
            </div>
            
            <div class="comment-section">
                <h3>💭 Customer''s Detailed Feedback</h3>
                <p class="comment-text">"{comment}"</p>
            </div>
        </div>
        
        <div class="footer">
            <div class="logo">Wiseserve</div>
            <p class="tagline">Professional IT Services & Support Excellence</p>
        </div>
    </div>
    
    <script>
        // Replace emoji based on feedback type
        document.addEventListener("DOMContentLoaded", function() {
            const feedbackType = "{feedback_type}";
            const emojiElement = document.querySelector(".feedback-emoji");
            
            switch(feedbackType) {
                case "happy":
                    emojiElement.textContent = "😊";
                    break;
                case "neutral":
                    emojiElement.textContent = "😐";
                    break;
                case "sad":
                case "unhappy":
                    emojiElement.textContent = "😞";
                    break;
                default:
                    emojiElement.textContent = "📝";
            }
        });
    </script>
</body>
</html>'
WHERE setting_type = 'template' AND setting_key = 'notification_html';