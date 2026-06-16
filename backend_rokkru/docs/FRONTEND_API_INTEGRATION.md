# 🚀 Frontend Integration Guide - Stripe Payment API

Complete API documentation for integrating RokKru payment system with your frontend application.

---

## 📋 Base URL

**Development:**
```
http://localhost:3000/api/v1
```

**Production:**
```
https://your-domain.com/api/v1
```

---

## 🔐 Authentication

Most endpoints are **public** (no authentication required for payment flow).

For authenticated endpoints, include JWT token:
```javascript
headers: {
  'Authorization': 'Bearer YOUR_JWT_TOKEN'
}
```

---

## 📌 API Endpoints

### 1. Get Subscription Plans

**GET** `/stripe/plans`

Get list of all available subscription plans.

**Request:**
```javascript
fetch('http://localhost:3000/api/v1/stripe/plans')
  .then(res => res.json())
  .then(plans => console.log(plans));
```

**Response:**
```json
[
  {
    "subscription_Plan_id": 1,
    "name": "Business Plan",
    "price": "49.990",
    "duration_day": "1970-01-01T00:00:00.030Z",
    "description": "Business Plan subscription plan"
  },
  {
    "subscription_Plan_id": 2,
    "name": "Professional_Plan",
    "price": "19.990",
    "duration_day": "1970-01-01T00:00:00.030Z",
    "description": "Unlock advanced features..."
  }
]
```

---

### 2. Create Checkout Session

**POST** `/stripe/create-checkout-session`

Create a Stripe checkout session for payment.

**Request Body:**
```json
{
  "subscription_plan_id": 1,
  "user_id": 123,
  "email": "user@example.com",
  "success_url": "https://yoursite.com/payment/success?session_id={CHECKOUT_SESSION_ID}",
  "cancel_url": "https://yoursite.com/payment/cancel"
}
```

**JavaScript Example:**
```javascript
async function createCheckout(planId, userId, email) {
  const response = await fetch('http://localhost:3000/api/v1/stripe/create-checkout-session', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      subscription_plan_id: planId,
      user_id: userId,
      email: email,
      success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: window.location.href
    })
  });

  if (!response.ok) {
    throw new Error('Checkout creation failed');
  }

  const data = await response.json();
  
  // Redirect to Stripe Checkout
  window.location.href = data.url;
}
```

**Response:**
```json
{
  "sessionId": "cs_test_a1xxxxxxxxxxxxxxxxxxxxxxx",
  "url": "https://checkout.stripe.com/c/pay/cs_test_...",
  "payment_id": 10
}
```

**Response Fields:**
- `sessionId` - Stripe checkout session ID
- `url` - Redirect URL to Stripe Checkout page
- `payment_id` - Your database payment record ID

---

### 3. Get Checkout Session Status

**GET** `/stripe/session/:sessionId`

Get payment status and details after checkout.

**Request:**
```javascript
const sessionId = 'cs_test_a1xxxxxxxxxxxxxxxxxxxxxxx';

fetch(`http://localhost:3000/api/v1/stripe/session/${sessionId}`)
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response:**
```json
{
  "session_id": "cs_test_a1xxxxxxxxxxxxxxxxxxxxxxx",
  "payment_id": 10,
  "status": "completed",
  "amount": "49.99",
  "currency": "usd",
  "customer_email": "user@example.com",
  "subscription_plan_name": "Business Plan",
  "receiptUrl": "https://stripe.com/receipt/..."
}
```

---

### 4. Get Payment Receipt

**GET** `/stripe/receipt/:payment_id`

Get receipt URL for a completed payment.

**Request:**
```javascript
const paymentId = 10;

fetch(`http://localhost:3000/api/v1/stripe/receipt/${paymentId}`)
  .then(res => res.json())
  .then(data => console.log(data));
```

**Optional Query Parameter:**
- `user_id` - For verification (optional)

**Response:**
```json
{
  "payment_id": 10,
  "amount": 49.99,
  "currency": "usd",
  "status": "completed",
  "receipt_url": "https://stripe.com/receipt/...",
  "created_at": "2026-06-12T09:04:23.429Z"
}
```

---

### 5. Get Stripe Config

**GET** `/stripe/config`

Get Stripe publishable key (for Stripe.js integration).

**Request:**
```javascript
fetch('http://localhost:3000/api/v1/stripe/config')
  .then(res => res.json())
  .then(data => console.log(data));
```

**Response:**
```json
{
  "publishableKey": "pk_test_51TXFvFFf1NjKrMMA..."
}
```

---

## 💻 Complete Frontend Integration Example

### React/Next.js Example

```javascript
import { useState, useEffect } from 'react';

export default function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get user info from your auth system
  const user = useAuth(); // Your auth hook

  useEffect(() => {
    // Load plans
    fetch('http://localhost:3000/api/v1/stripe/plans')
      .then(res => res.json())
      .then(data => setPlans(data))
      .catch(err => console.error('Error loading plans:', err));
  }, []);

  const handleSubscribe = async (planId) => {
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:3000/api/v1/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription_plan_id: planId,
          user_id: user.id,
          email: user.email,
          success_url: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: window.location.href
        })
      });

      if (!response.ok) throw new Error('Failed to create checkout');

      const { url } = await response.json();
      
      // Redirect to Stripe
      window.location.href = url;
      
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Failed to start checkout. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Choose Your Plan</h1>
      <div className="plans-grid">
        {plans.map(plan => (
          <div key={plan.subscription_Plan_id} className="plan-card">
            <h2>{plan.name}</h2>
            <p className="price">${parseFloat(plan.price).toFixed(2)}</p>
            <p>{plan.description}</p>
            <button 
              onClick={() => handleSubscribe(plan.subscription_Plan_id)}
              disabled={loading}
            >
              {loading ? 'Loading...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

### Vanilla JavaScript Example

```html
<!DOCTYPE html>
<html>
<head>
  <title>Subscribe</title>
</head>
<body>
  <div id="plans"></div>

  <script>
    const API_BASE = 'http://localhost:3000/api/v1';
    
    // Your user data (from login/session)
    const currentUser = {
      id: 1,
      email: 'user@example.com'
    };

    // Load plans
    async function loadPlans() {
      try {
        const response = await fetch(`${API_BASE}/stripe/plans`);
        const plans = await response.json();

        const container = document.getElementById('plans');
        container.innerHTML = plans.map(plan => `
          <div class="plan">
            <h2>${plan.name}</h2>
            <p>$${parseFloat(plan.price).toFixed(2)}</p>
            <button onclick="subscribe(${plan.subscription_Plan_id})">
              Subscribe
            </button>
          </div>
        `).join('');
      } catch (error) {
        console.error('Error loading plans:', error);
      }
    }

    // Subscribe to plan
    async function subscribe(planId) {
      try {
        const response = await fetch(`${API_BASE}/stripe/create-checkout-session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            subscription_plan_id: planId,
            user_id: currentUser.id,
            email: currentUser.email,
            success_url: `${window.location.origin}/success.html?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: window.location.href
          })
        });

        const { url } = await response.json();
        window.location.href = url;
      } catch (error) {
        alert('Checkout failed: ' + error.message);
      }
    }

    // Load plans on page load
    loadPlans();
  </script>
</body>
</html>
```

---

## 🎯 Success Page Example

After payment, user is redirected to your success URL with `session_id` parameter.

```javascript
// success.html or SuccessPage.jsx

// Get session_id from URL
const urlParams = new URLSearchParams(window.location.search);
const sessionId = urlParams.get('session_id');

if (sessionId) {
  // Get payment details
  fetch(`http://localhost:3000/api/v1/stripe/session/${sessionId}`)
    .then(res => res.json())
    .then(data => {
      console.log('Payment successful!', data);
      
      // Show success message
      document.getElementById('status').textContent = data.status;
      document.getElementById('amount').textContent = `$${data.amount}`;
      document.getElementById('plan').textContent = data.subscription_plan_name;
      
      // Show receipt button if available
      if (data.receiptUrl) {
        document.getElementById('receipt-btn').href = data.receiptUrl;
        document.getElementById('receipt-btn').style.display = 'block';
      }
    });
}
```

---

## 🔒 Security Best Practices

### 1. **Never expose sensitive data**
```javascript
// ❌ DON'T include API keys in frontend
const STRIPE_SECRET = 'sk_test_...'; // NEVER DO THIS!

// ✅ DO use publishable key only
const STRIPE_PUBLIC = 'pk_test_...'; // This is OK
```

### 2. **Always use HTTPS in production**
```javascript
const API_BASE = process.env.NODE_ENV === 'production'
  ? 'https://api.yoursite.com/api/v1'
  : 'http://localhost:3000/api/v1';
```

### 3. **Validate user authentication**
```javascript
// Get user_id from your authenticated session
const user_id = getCurrentUser().id; // From your auth system

// Don't allow users to set arbitrary user_id
```

### 4. **Handle errors gracefully**
```javascript
try {
  const response = await fetch(...);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  const data = await response.json();
} catch (error) {
  console.error('Payment error:', error);
  // Show user-friendly error message
}
```

---

## 🧪 Testing

### Test Cards

**Success:**
```
Card: 4242 4242 4242 4242
Expiry: 12/34
CVC: 123
ZIP: 12345
```

**Declined:**
```
Card: 4000 0000 0000 0002
```

**Requires Authentication:**
```
Card: 4000 0025 0000 3155
```

---

## 📊 Payment Flow Diagram

```
Frontend                    Backend                     Stripe
   |                          |                           |
   |  1. GET /stripe/plans    |                           |
   |------------------------->|                           |
   |  Returns plan list       |                           |
   |<-------------------------|                           |
   |                          |                           |
   |  2. POST /create-checkout|                           |
   |  (user_id, plan_id)      |                           |
   |------------------------->|                           |
   |                          |  3. Create Session        |
   |                          |-------------------------->|
   |                          |  Returns checkout URL     |
   |                          |<--------------------------|
   |  Returns URL             |                           |
   |<-------------------------|                           |
   |                          |                           |
   |  4. Redirect to Stripe   |                           |
   |-------------------------------------------------->|
   |                          |                           |
   |  5. User Pays            |                           |
   |                          |                           |
   |                          |  6. Webhook (payment success)
   |                          |<--------------------------|
   |                          |  7. Save to database      |
   |                          |  (payment, subscription)  |
   |                          |                           |
   |  8. Redirect to success  |                           |
   |<-------------------------------------------------|
   |                          |                           |
   |  9. GET /session/:id     |                           |
   |------------------------->|                           |
   |  Returns payment details |                           |
   |<-------------------------|                           |
```

---

## 🆘 Troubleshooting

### CORS Errors
If you get CORS errors, make sure your backend allows your frontend origin:

```javascript
// In backend: app.js
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  credentials: true
}));
```

### Payment Not Saving to Database
- Check webhook is configured
- Verify `STRIPE_WEBHOOK_SECRET` in `.env`
- Test webhook with Stripe CLI: `stripe listen --forward-to localhost:3000/api/v1/stripe/webhook`

### Session Not Found
- Session IDs expire after 24 hours
- Make sure you're using the correct `session_id` from URL parameter

---

## 📞 Support

For more details, check:
- `STRIPE_INTEGRATION_GUIDE.md` - Complete integration guide
- `QUICK_START_GUIDE.md` - Quick setup instructions
- `INVOICE_RECEIPT_GUIDE.md` - Receipt handling

---

## ✅ Checklist for Frontend Developers

- [ ] Load plans from `/stripe/plans`
- [ ] Get user_id and email from authenticated session
- [ ] Call `/create-checkout-session` with user data
- [ ] Redirect to Stripe checkout URL
- [ ] Handle success page with session_id
- [ ] Display payment confirmation
- [ ] Show receipt link if available
- [ ] Handle errors gracefully
- [ ] Test with test cards
- [ ] Use HTTPS in production

---

**Happy Coding! 🚀**
