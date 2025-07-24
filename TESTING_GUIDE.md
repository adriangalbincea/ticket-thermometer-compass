# Testing Guide for Feedback Link System

## API Testing

### Manual Testing with curl

#### 1. Basic Test (Success Case)
```bash
curl -X POST https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_number": "TEST-001",
    "technician": "Test Technician",
    "ticket_title": "Test Issue"
  }'
```

Expected Response:
```json
{
  "success": true,
  "data": {
    "token": "...",
    "feedback_url": "https://your-domain.com/feedback/...",
    "ticket_number": "TEST-001",
    "technician": "Test Technician",
    "ticket_title": "Test Issue",
    "expires_in_hours": 72
  }
}
```

#### 2. Test with All Optional Fields
```bash
curl -X POST https://feedback.wiseserve.net/functions/v1/generate-feedback-link \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_number": "TEST-002",
    "technician": "Jane Smith",
    "ticket_title": "Network connectivity issue",
    "customer_email": "test@example.com",
    "customer_name": "John Customer",
    "expires_hours": 24
  }'
```

#### 3. Test Missing Required Fields (Error Case)
```bash
curl -X POST https://feedback.wiseserve.net/functions/v1/generate-feedback-link \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_number": "TEST-003"
  }'
```

Expected Response:
```json
{
  "error": "Missing required fields: ticket_number, technician, ticket_title"
}
```

#### 4. Test Wrong HTTP Method (Error Case)
```bash
curl -X GET https://feedback.wiseserve.net/functions/v1/generate-feedback-link
```

Expected Response:
```json
{
  "error": "Method not allowed"
}
```

### Automated Testing Script

Create a file `test_api.sh`:

```bash
#!/bin/bash

API_URL="https://feedback.wiseserve.net/functions/v1/generate-feedback-link"

echo "=== Testing Feedback Link Generation API ==="

echo "1. Testing successful generation..."
RESPONSE1=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_number": "AUTO-TEST-001",
    "technician": "Auto Test Tech",
    "ticket_title": "Automated test ticket"
  }')

echo "Response: $RESPONSE1"

if echo "$RESPONSE1" | grep -q '"success":true'; then
    echo "✅ Test 1 PASSED"
else
    echo "❌ Test 1 FAILED"
fi

echo ""
echo "2. Testing with missing fields..."
RESPONSE2=$(curl -s -X POST $API_URL \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_number": "AUTO-TEST-002"
  }')

echo "Response: $RESPONSE2"

if echo "$RESPONSE2" | grep -q "Missing required fields"; then
    echo "✅ Test 2 PASSED"
else
    echo "❌ Test 2 FAILED"
fi

echo ""
echo "3. Testing wrong HTTP method..."
RESPONSE3=$(curl -s -X GET $API_URL)

echo "Response: $RESPONSE3"

if echo "$RESPONSE3" | grep -q "Method not allowed"; then
    echo "✅ Test 3 PASSED"
else
    echo "❌ Test 3 FAILED"
fi

echo ""
echo "=== Testing Complete ==="
```

Run with: `chmod +x test_api.sh && ./test_api.sh`

## Frontend Testing

### Testing the Feedback Form

1. **Generate a test link** using the API or admin panel
2. **Open the feedback link** in your browser
3. **Test the feedback submission flow**:
   - Verify ticket information displays correctly
   - Test each feedback option (Bad, Neutral, Happy)
   - Test with and without comments
   - Verify submission success message
   - Test the "Return to WiseServe" button redirects correctly

### Testing Link Expiration

1. **Generate a link with short expiration**:
```bash
curl -X POST https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link \
  -H "Content-Type: application/json" \
  -d '{
    "ticket_number": "EXPIRE-TEST",
    "technician": "Test Tech",
    "ticket_title": "Expiration Test",
    "expires_hours": 0.01
  }'
```

2. **Wait 1 minute and try to access the link** - should show expiration message

### Testing Link Single-Use

1. **Generate a test link**
2. **Submit feedback successfully**
3. **Try to access the same link again** - should show "already used" message

## Database Testing

### Verify Data Storage
```sql
-- Check generated links
SELECT * FROM feedback_links ORDER BY created_at DESC LIMIT 5;

-- Check submitted feedback
SELECT 
  fs.*,
  fl.ticket_number,
  fl.technician
FROM feedback_submissions fs
JOIN feedback_links fl ON fs.feedback_link_id = fl.id
ORDER BY fs.submitted_at DESC
LIMIT 5;
```

### Test RLS Policies
1. **Test as admin** - should see all data
2. **Test as regular user** - should have limited access
3. **Test unauthenticated access** - feedback submission should work for valid links

## Performance Testing

### Load Testing with Multiple Requests
```bash
#!/bin/bash
# Simple load test - generates 10 links concurrently

for i in {1..10}; do
  curl -X POST https://iaiennljjjvstovtpdhw.supabase.co/functions/v1/generate-feedback-link \
    -H "Content-Type: application/json" \
    -d "{
      \"ticket_number\": \"LOAD-TEST-$i\",
      \"technician\": \"Load Test Tech\",
      \"ticket_title\": \"Load test ticket $i\"
    }" &
done

wait
echo "Load test complete"
```

## Production Testing Checklist

Before deploying to production:

- [ ] API responds correctly to all test cases
- [ ] Database constraints work properly
- [ ] RLS policies allow correct access
- [ ] Links expire as expected
- [ ] Single-use restriction works
- [ ] Feedback form redirects to wiseserve.net
- [ ] Email/webhook notifications work (if implemented)
- [ ] Error handling works for edge cases
- [ ] CORS headers allow browser access
- [ ] Performance is acceptable under load

## Troubleshooting

### Common Issues

1. **API returns 500 error**
   - Check Supabase function logs
   - Verify database function exists
   - Check environment variables

2. **Link doesn't work**
   - Verify token in database
   - Check expiration time
   - Verify link hasn't been used

3. **Feedback submission fails**
   - Check browser console for errors
   - Verify RLS policies
   - Check database constraints

### Useful SQL Queries

```sql
-- Find recent errors in feedback submissions
SELECT * FROM feedback_links 
WHERE created_at > NOW() - INTERVAL '1 hour'
AND NOT EXISTS (
  SELECT 1 FROM feedback_submissions 
  WHERE feedback_link_id = feedback_links.id
);

-- Check expired unused links
SELECT * FROM feedback_links 
WHERE expires_at < NOW() 
AND NOT is_used;
```