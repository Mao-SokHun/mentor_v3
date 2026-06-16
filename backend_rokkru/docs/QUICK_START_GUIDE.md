# Quick Start Guide - 5 Minutes Setup

## 🚀 Get Started in 5 Minutes

### Step 1: Start the Backend (30 seconds)

```bash
cd backend_rokkru
npm start
```

Expected output:
```
✅ Database connected successfully.
✅ Database synchronized successfully.
🚀 Server is running on port 3000
```

Server is now running at: **http://localhost:3000**

---

### Step 2: Test API (1 minute)

Open your browser or use curl:

```bash
# Health check
curl http://localhost:3000/health

# Get Stripe config
curl http://localhost:3000/api/v1/stripe/config

# Get available plans
curl http://localhost:3000/api/v1/stripe/plans
```

---

### Step 3: Frontend Integration (3 minutes)

#### Install Stripe.js

```bash
npm install @stripe/stripe-js
```

#### Copy-Paste This Code

```javascript
// PaymentButton.jsx
import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

function PaymentButton({ planId, planName, price }) {
  const [loading, setLoading] = useState(false);
  const [stripe, setStripe] = useState(null);

  useEffect(() => {
    // Get Stripe publishable key
    fetch('http://localhost:3000/api/v1/stripe/config')
      .then(r => r.json())
      .then(({ publishableKey }) => loadStripe(publishableKey))
      .then(setStripe);
  }, []);

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Create checkout session
      const response = await fetch('http://localhost:3000/api/v1/stripe/create-checkout-session', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Your JWT token
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription_plan_id: planId,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${window.location.origin}/cancel`
        })
      });

      const { sessionId } = await response.json();
      
      // Redirect to Stripe Checkout
      await stripe.redirectToCheckout({ sessionId });
    } catch (error) {
      alert('Payment failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
      onClick={handlePayment} 
      disabled={loading || !stripe}
      style={{
        padding: '12px 24px',
        fontSize: '16px',
        backgroundColor: '#5469d4',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: loading || !stripe ? 'not-allowed' : 'pointer'
      }}
    >
      {loading ? 'Processing...' : `Pay $${price}`}
    </button>
  );
}

export default PaymentButton;
```

#### Use It

```javascript
<PaymentButton planId={1} planName="Basic Plan" price="9.99" />
```

---

## 📝 Complete Minimal Example

### Full React Component (Copy & Test)

```javascript
import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';

const API_URL = 'http://localhost:3000/api/v1';

function SubscriptionPage() {
  const [plans, setPlans] = useState([]);
  const [stripe, setStripe] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Initialize Stripe
    fetch(`${API_URL}/stripe/config`)
      .then(r => r.json())
      .then(({ publishableKey }) => loadStripe(publishableKey))
      .then(setStripe);

    // Load plans
    fetch(`${API_URL}/stripe/plans`)
      .then(r => r.json())
      .then(setPlans);
  }, []);

  const subscribe = async (planId) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token'); // Your JWT token
      
      const res = await fetch(`${API_URL}/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          subscription_plan_id: planId,
          success_url: `${window.location.origin}/success?session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: window.location.href
        })
      });

      const { sessionId } = await res.json();
      await stripe.redirectToCheckout({ sessionId });
    } catch (err) {
      alert('Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Choose Your Plan</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        {plans.map(plan => (
          <div key={plan.subscription_Plan_id} style={{
            border: '2px solid #e0e0e0',
            borderRadius: '12px',
            padding: '30px',
            textAlign: 'center'
          }}>
            <h2>{plan.name}</h2>
            <div style={{ fontSize: '36px', fontWeight: 'bold', margin: '20px 0' }}>
              ${plan.price}
            </div>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              {plan.description || 'Premium features'}
            </p>
            <button
              onClick={() => subscribe(plan.subscription_Plan_id)}
              disabled={loading || !stripe}
              style={{
                width: '100%',
                padding: '14px',
                fontSize: '16px',
                fontWeight: 'bold',
                backgroundColor: '#5469d4',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading || !stripe ? 'not-allowed' : 'pointer',
                opacity: loading || !stripe ? 0.6 : 1
              }}
            >
              {loading ? 'Processing...' : 'Subscribe Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default SubscriptionPage;
```

---

## 🧪 Test with Stripe Test Card

When redirected to Stripe Checkout, use these test details:

```
Card Number:  4242 4242 4242 4242
Expiry Date:  12/34 (any future date)
CVC:          123 (any 3 digits)
ZIP:          12345 (any 5 digits)
```

---

## ✅ Success Page (Bonus)

```javascript
// SuccessPage.jsx
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

function SuccessPage() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const sessionId = searchParams.get('session_id');
    
    if (sessionId) {
      fetch(`http://localhost:3000/api/v1/stripe/session/${sessionId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
        .then(r => r.json())
        .then(setStatus);
    }
  }, [searchParams]);

  if (!status) return <div>Loading...</div>;

  return (
    <div style={{ textAlign: 'center', padding: '60px' }}>
      <h1 style={{ fontSize: '48px' }}>✅</h1>
      <h2>Payment Successful!</h2>
      <p>Your subscription is now active.</p>
      <p>Amount: ${(status.amountTotal / 100).toFixed(2)}</p>
      <p>Subscription ID: {status.subscriptionId}</p>
    </div>
  );
}

export default SuccessPage;
```

---

## 🔑 Important Notes

### 1. JWT Token Required

Make sure user is logged in and you have the JWT token:

```javascript
// After login, store token
localStorage.setItem('token', jwtToken);

// Use in requests
headers: {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}
```

### 2. CORS Configuration

Backend already configured to allow:
- `http://localhost:5173` (Vite default)

If your frontend runs on different port, update in `app.js`:

```javascript
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend URL
  credentials: true,
}));
```

### 3. Environment Variables

Backend needs these in `.env`:

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
DATABASE_URL=postgresql://...
JWT_SECRET=your-secret
```

---

## 🎯 Testing Checklist

```
□ Backend server running (npm start)
□ Can access http://localhost:3000/health
□ Can fetch plans from /api/v1/stripe/plans
□ User logged in (have JWT token)
□ Payment button shows
□ Click payment → redirects to Stripe
□ Enter test card 4242 4242 4242 4242
□ Payment completes
□ Redirected to success page
□ Subscription shows in database
```

---

## 🐛 Common Issues

### "Not authorized" error
**Fix:** Make sure JWT token is valid and included in Authorization header

### "Stripe is not configured"
**Fix:** Add `STRIPE_SECRET_KEY` to `.env` and restart server

### CORS error
**Fix:** Add your frontend URL to CORS whitelist in `app.js`

### Webhook not working locally
**Fix:** Use Stripe CLI:
```bash
stripe listen --forward-to localhost:3000/api/v1/stripe/webhook
```

---

## 📚 Next Steps

1. ✅ Complete the quick setup above
2. 📖 Read [STRIPE_INTEGRATION_GUIDE.md](./STRIPE_INTEGRATION_GUIDE.md) for details
3. 🎨 Check [PAYMENT_FLOW_DIAGRAM.md](./PAYMENT_FLOW_DIAGRAM.md) for visual flows
4. 🧪 Test with different scenarios
5. 🚀 Deploy to production

---

## 🆘 Need Help?

- **API Docs:** http://localhost:3000/api-docs
- **Health Check:** http://localhost:3000/health
- **Stripe Dashboard:** https://dashboard.stripe.com/test/payments
- **Server Logs:** Check terminal where `npm start` is running

---

**Time to First Payment: ~5 minutes** ⚡

Good luck! 🎉
