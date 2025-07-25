# Feedback Link Generation API

## Overview
This API allows you to generate secure feedback links for customer tickets. Each link is unique, has an expiration time, and can only be used once.

## Endpoint
```
POST https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link
```

## Authentication
This endpoint requires Bearer token authentication.

## Request Format

### Headers
```
Content-Type: application/json
Authorization: Bearer <your-token>
```

### Request Body
```json
{
  "ticket_number": "string (required)",
  "technician": "string (required)", 
  "ticket_title": "string (required)",
  "customer_email": "string (required)",
  "customer_name": "string (required)",
  "expires_hours": "number (required)"
}
```

### Example Request
```bash
curl -X POST https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-token>" \
  -d '{
    "ticket_number": "TK-12345",
    "technician": "John Doe",
    "ticket_title": "Computer won't start",
    "customer_email": "customer@example.com",
    "customer_name": "Jane Smith",
    "expires_hours": 48
  }'
```

## Response Format

### Success Response (200)
```json
{
  "success": true,
  "data": {
    "token": "abc123...",
    "feedback_url": "https://your-domain.com/feedback/abc123...",
    "ticket_number": "TK-12345",
    "technician": "John Doe", 
    "ticket_title": "Computer won't start",
    "expires_in_hours": 48
  }
}
```

### Error Responses

#### 400 - Missing Required Fields
```json
{
  "error": "Missing required fields: ticket_number, technician, ticket_title, customer_email, customer_name, expires_hours"
}
```

#### 401 - Unauthorized
```json
{
  "error": "Missing or invalid authorization token"
}
```

#### 405 - Method Not Allowed
```json
{
  "error": "Method not allowed"
}
```

#### 500 - Internal Server Error
```json
{
  "error": "Failed to create feedback link"
}
```

## Integration Examples

### JavaScript/Node.js
```javascript
const generateFeedbackLink = async (ticketData) => {
  const response = await fetch('https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${process.env.API_TOKEN}`,
    },
    body: JSON.stringify({
      ticket_number: ticketData.ticketNumber,
      technician: ticketData.technician,
      ticket_title: ticketData.title,
      customer_email: ticketData.customerEmail,
      customer_name: ticketData.customerName,
      expires_hours: 72
    })
  });

  const result = await response.json();
  
  if (result.success) {
    console.log('Feedback link:', result.data.feedback_url);
    return result.data.feedback_url;
  } else {
    console.error('Error:', result.error);
    throw new Error(result.error);
  }
};
```

### Python
```python
import requests
import json

def generate_feedback_link(ticket_data, api_token):
    url = "https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link"
    
    payload = {
        "ticket_number": ticket_data["ticket_number"],
        "technician": ticket_data["technician"], 
        "ticket_title": ticket_data["ticket_title"],
        "customer_email": ticket_data.get("customer_email"),
        "customer_name": ticket_data.get("customer_name"),
        "expires_hours": ticket_data.get("expires_hours", 72)
    }
    
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {api_token}'
    }
    
    response = requests.post(url, json=payload, headers=headers)
    result = response.json()
    
    if result.get("success"):
        return result["data"]["feedback_url"]
    else:
        raise Exception(f"API Error: {result.get('error')}")
```

### PHP
```php
<?php
function generateFeedbackLink($ticketData, $apiToken) {
    $url = 'https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link';
    
    $payload = array(
        'ticket_number' => $ticketData['ticket_number'],
        'technician' => $ticketData['technician'],
        'ticket_title' => $ticketData['ticket_title'],
        'customer_email' => $ticketData['customer_email'] ?? null,
        'customer_name' => $ticketData['customer_name'] ?? null,
        'expires_hours' => $ticketData['expires_hours'] ?? 72
    );
    
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($payload));
    curl_setopt($ch, CURLOPT_HTTPHEADER, array(
        'Content-Type: application/json',
        'Authorization: Bearer ' . $apiToken
    ));
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    
    $result = curl_exec($ch);
    curl_close($ch);
    
    $data = json_decode($result, true);
    
    if ($data['success']) {
        return $data['data']['feedback_url'];
    } else {
        throw new Exception('API Error: ' . $data['error']);
    }
}
?>
```

## Rate Limiting
Currently no rate limiting is applied, but consider implementing client-side throttling for production use.

## Security Notes
- Links expire automatically based on `expires_hours` parameter
- Each link can only be used once
- Tokens are cryptographically secure and unpredictable
- No sensitive data is exposed in the URLs

## Support
For technical support or questions about this API, contact your system administrator.