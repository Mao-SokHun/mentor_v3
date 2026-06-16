# Payment Flow Diagram - Visual Guide

## 🎨 Simple Visual Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         STRIPE PAYMENT FLOW                          │
└─────────────────────────────────────────────────────────────────────┘

STEP 1: Get Plans
─────────────────
Frontend                          Backend                    
   │                                 │                       
   │──GET /stripe/plans────────────> │                       
   │                                 │                       
   │<────[Plan 1, Plan 2, Plan 3]────│                       
   │                                                         
   └─> Display plans to user                                


STEP 2: User Selects Plan & Clicks "Pay"
─────────────────────────────────────────
Frontend                          Backend                    Stripe
   │                                 │                         │
   │──POST /create-checkout-session──>│                         │
   │  {                               │                         │
   │    plan_id: 1,                   │──Create Session───────>│
   │    success_url: "...",           │                         │
   │    cancel_url: "..."             │<──Session ID & URL──────│
   │  }                               │                         │
   │                                  │                         │
   │<──{sessionId, url}───────────────│                         │
   │                                                            │
   │──Redirect user to Stripe Checkout URL──────────────────────>│


STEP 3: User Pays on Stripe
────────────────────────────
User                              Stripe
   │                                 │
   │──Enter card details────────────>│
   │                                 │
   │──Submit payment─────────────────>│
   │                                 │
   │<──Payment Success───────────────│


STEP 4: Stripe Notifies Backend (Webhook)
──────────────────────────────────────────
Stripe                          Backend (Webhook)              Database
   │                                 │                            │
   │──POST /stripe/webhook──────────>│                            │
   │  {                              │                            │
   │    type: "checkout.completed",  │──Activate Subscription────>│
   │    session: {...}               │                            │
   │  }                              │──Create Transaction───────>│
   │                                 │                            │
   │<──{received: true}──────────────│                            │


STEP 5: Redirect & Confirm
───────────────────────────
Stripe                     User                   Frontend                  Backend
   │                        │                        │                        │
   │──Redirect─────────────>│                        │                        │
   │                        │                        │                        │
   │                        └──Lands on success_url──>│                        │
   │                                                  │                        │
   │                                                  │──GET /session/cs_xxx──>│
   │                                                  │                        │
   │                                                  │<──Status: completed────│
   │                                                  │                        │
   │                                                  └─> Show success message


═══════════════════════════════════════════════════════════════════════
```

---

## 📱 Frontend User Journey

```
┌──────────────────────┐
│   Pricing Page       │
│                      │
│  [ Basic - $9.99  ]  │
│  [ Pro - $29.99   ]  │ <─── User sees plans
│  [ Premium - $49  ]  │
│                      │
└──────────┬───────────┘
           │
           │ User clicks "Subscribe"
           ▼
┌──────────────────────┐
│  Loading...          │ <─── Creating checkout session
└──────────┬───────────┘
           │
           │ Redirect to Stripe
           ▼
┌──────────────────────┐
│  STRIPE CHECKOUT     │
│  ┌────────────────┐  │
│  │ Card Number    │  │
│  │ ************   │  │ <─── User enters payment info
│  │ MM/YY  CVC     │  │
│  │                │  │
│  │   [Pay Now]    │  │
│  └────────────────┘  │
└──────────┬───────────┘
           │
           │ Payment processing...
           ▼
┌──────────────────────┐
│  ✅ SUCCESS!         │
│                      │
│  Payment Complete    │
│  Subscription Active │ <─── User sees confirmation
│                      │
│  [Go to Dashboard]   │
└──────────────────────┘
```

---

## 🔄 API Call Sequence

### Timeline View

```
Time    Frontend                Backend                 Stripe              Database
─────   ────────────────────────────────────────────────────────────────────────────
0:00    GET /stripe/config ──>
                               │
0:01                           └──> Return publishable_key
        <── pk_test_xxx                                
        
0:02    GET /stripe/plans ──>
                               │
0:03                           └──> Query subscription_Plan table ──────>
                                                                           Return plans
0:04                           <──────────────────────────────────────────
        <── [plans array]
        
        [User selects plan]
        
0:10    POST /create-checkout-session ──>
        Authorization: Bearer token
        { plan_id: 1 }
                               │
0:11                           ├──> Verify JWT token
                               │
0:12                           └──> stripe.checkout.sessions.create() ──>
                                                                           Create session
0:13                                                               <──────
                               │
0:14                           ├──> Insert into stripe_payment ─────────>
                                                                           Save record
0:15                           <──────────────────────────────────────────
        
        <── { sessionId, url }
        
0:16    Redirect user to url ───────────────────────────────────────────>
        
        [User enters payment on Stripe]
        
0:45                                                    Payment success!
        
0:46                           <── POST /stripe/webhook
                                   checkout.session.completed
                               │
0:47                           ├──> Verify webhook signature
                               │
0:48                           ├──> Create subscription ────────────────>
0:49                           │                               Save subscription
                               ├──> Update stripe_payment ──────────────>
0:50                           │                               Update status
                               ├──> Create transaction_detail ─────────>
0:51                           │                               Save transaction
                               <──────────────────────────────────────────
                               │
0:52                           └──> Return { received: true }
                                    
0:53                                    Redirect user ──────────────────>
        
        <── success_url
        
0:54    GET /stripe/session/cs_xxx ──>
        Authorization: Bearer token
                               │
0:55                           ├──> stripe.checkout.sessions.retrieve()─>
0:56                           <────────────────────────────────────────
                               │
0:57                           └──> Query stripe_payment table ────────>
0:58                                                            Return data
                               <──────────────────────────────────────────
        
        <── { status: "completed", subscriptionId: 123 }
        
0:59    Display success message
```

---

## 🗂️ Data Flow

### What Gets Stored Where

```
┌─────────────────────────────────────────────────────────────────┐
│                     DATABASE RECORDS CREATED                     │
└─────────────────────────────────────────────────────────────────┘

BEFORE PAYMENT (on checkout session creation):
───────────────────────────────────────────────
┌──────────────────┐
│ stripe_payment   │
├──────────────────┤
│ user_id          │ ← From JWT token
│ session_id       │ ← From Stripe
│ amount           │ ← From subscription_Plan
│ currency         │ ← From config (USD)
│ status           │ ← "pending"
│ subscription_id  │ ← NULL (not created yet)
└──────────────────┘


AFTER PAYMENT (webhook processes):
───────────────────────────────────
┌──────────────────┐      ┌────────────────────┐      ┌──────────────────┐
│ subscription     │      │ stripe_payment     │      │ transaction_     │
│                  │      │                    │      │ detail           │
├──────────────────┤      ├────────────────────┤      ├──────────────────┤
│ user_id          │◄────►│ user_id            │      │ user_id          │
│ plan_id          │      │ subscription_id    │◄────►│ subscription_id  │
│ start_date       │      │ payment_intent_id  │      │ bank_tx_id       │
│ end_date         │      │ amount             │      │ paid_account     │
│ status: active   │      │ status: completed  │      │ remark           │
└──────────────────┘      └────────────────────┘      └──────────────────┘
         │
         │ Linked to
         ▼
┌──────────────────┐
│ user             │
├──────────────────┤
│ user_id          │
│ email            │
│ user_type_id     │ ← Gets updated if needed
└──────────────────┘
```

---

## 🎯 Success Criteria Checklist

### For Each Payment

```
✅ Checkout Session Created
   ├─ stripe_payment record created with status "pending"
   ├─ Stripe session ID stored
   └─ User redirected to Stripe Checkout

✅ Payment Completed on Stripe
   ├─ User entered card details
   ├─ Card validated by Stripe
   └─ Payment authorized

✅ Webhook Received
   ├─ Signature verified
   ├─ Event type is "checkout.session.completed"
   └─ Metadata contains user_id and plan_id

✅ Subscription Activated
   ├─ subscription record created
   ├─ stripe_payment updated to "completed"
   ├─ transaction_detail created
   └─ User's user_type_id updated if needed

✅ Frontend Confirmation
   ├─ User redirected to success_url
   ├─ Session status retrieved
   └─ Success message displayed
```

---

## 🚨 Error Scenarios

### What Can Go Wrong

```
┌─────────────────────────────────────────────────────────────┐
│                    ERROR SCENARIOS                           │
└─────────────────────────────────────────────────────────────┘

1. USER NOT AUTHENTICATED
   Frontend ──X── Backend
   Response: 401 Unauthorized
   Fix: Ensure JWT token is included in request

2. INVALID PLAN ID
   Frontend ──✓── Backend ──X── Database
   Response: 404 Plan not found
   Fix: Use valid subscription_Plan_id from /stripe/plans

3. STRIPE NOT CONFIGURED
   Frontend ──✓── Backend ──X── Stripe
   Response: 503 Stripe not configured
   Fix: Add STRIPE_SECRET_KEY to .env

4. PAYMENT DECLINED BY STRIPE
   Frontend ──✓── Backend ──✓── Stripe ──X── Card declined
   User sees: Error on Stripe Checkout page
   Fix: User must use different payment method

5. WEBHOOK SIGNATURE INVALID
   Stripe ──X── Backend
   Response: 400 Webhook Error
   Fix: Verify STRIPE_WEBHOOK_SECRET is correct

6. WEBHOOK TIMEOUT
   Stripe ──?── Backend (no response)
   Result: Stripe retries webhook (exponential backoff)
   Fix: Check backend logs, ensure server is running

7. DATABASE ERROR DURING ACTIVATION
   Stripe ──✓── Backend ──X── Database
   Result: Payment recorded but subscription not activated
   Fix: Check database logs, manually activate subscription
```

---

## 📋 Pre-Launch Checklist

```
ENVIRONMENT SETUP
─────────────────
□ STRIPE_SECRET_KEY configured
□ STRIPE_PUBLISHABLE_KEY configured  
□ STRIPE_WEBHOOK_SECRET configured
□ Database tables exist (run resetDatabase.js)
□ Server starts without errors

STRIPE DASHBOARD SETUP
───────────────────────
□ Stripe account created
□ Test mode enabled
□ Webhook endpoint added
□ Webhook events selected (checkout.session.*)
□ Test cards work

FRONTEND SETUP
──────────────
□ @stripe/stripe-js installed
□ API base URL configured
□ JWT token storage working
□ Success/cancel pages created
□ Error handling implemented

TESTING
───────
□ Can fetch plans
□ Can create checkout session
□ Can redirect to Stripe
□ Can complete payment with test card
□ Webhook receives events
□ Subscription activates
□ Database records created
□ Success page shows correct data

PRODUCTION READINESS
────────────────────
□ Environment variables set on production server
□ Webhook URL uses HTTPS
□ Production Stripe keys configured
□ Webhook secret from production dashboard
□ Frontend URLs updated to production domain
□ Error logging configured
□ Database backups enabled
```

---

## 🆘 Quick Troubleshooting

| Problem | Check | Solution |
|---------|-------|----------|
| Can't create checkout session | JWT token | Login again and get fresh token |
| "Stripe not configured" error | .env file | Add STRIPE_SECRET_KEY |
| Webhook not firing | Stripe CLI | Run `stripe listen --forward-to ...` |
| Payment not activating | Server logs | Check for webhook errors |
| Session status returns 404 | User ID | Verify session belongs to logged-in user |
| Redirect not working | URLs | Use full URLs with http:// or https:// |

---

## 📞 Need Help?

1. Check server logs: `npm start` output
2. Check Stripe Dashboard → Events
3. Test webhook: `stripe trigger checkout.session.completed`
4. Verify database: Check tables subscription, stripe_payment, transaction_detail
5. API Documentation: http://localhost:3000/api-docs

**Contact Backend Team:**
- Check this guide first
- Include error messages
- Mention which step failed
- Share network request details

---

**Created:** June 2026  
**Version:** 1.0  
**Maintained by:** Backend Team
