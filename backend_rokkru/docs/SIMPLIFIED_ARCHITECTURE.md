# Simplified Stripe Architecture

## 🎯 Goal

When user pays successfully:
1. Save to `subscription` table ✅
2. Get `subscription_plan` from Stripe directly (no database table needed) ✅

---

## 📊 Database Tables

### Keep These:
- ✅ `subscription` - User subscriptions
- ✅ `stripe_payments` - Payment records  
- ✅ `transaction_detail` - Transaction history
- ✅ `user` - User accounts

### Remove This:
- ❌ `subscription_Plan` - Get from Stripe instead

---

## 🔄 New Flow

### 1. List Plans (from Stripe)

```http
GET /api/v1/stripe/plans
```

**Returns plans from Stripe Dashboard:**
```json
[
  {
    "id": "price_xxx",
    "product": "prod_xxx",
    "name": "Basic Plan",
    "amount": 999,
    "currency": "usd",
    "interval": "month"
  }
]
```

### 2. Create Checkout

```http
POST /api/v1/stripe/create-checkout-session
{
  "price_id": "price_xxx",  // Stripe Price ID
  "user_id": 1,
  "email": "user@example.com"
}
```

### 3. Payment Success → Webhook

```
Stripe webhook → Save to `subscription` table
```

**subscription table:**
```sql
{
  subscription_id: 1,
  user_id: 1,
  stripe_subscription_id: "sub_xxx",
  stripe_price_id: "price_xxx",
  start_date: "2026-06-10",
  end_date: "2026-07-10",
  status: "active"
}
```

---

## ✅ Benefits

1. **Single Source of Truth** - Plans live in Stripe Dashboard
2. **No Sync Issues** - Always up-to-date
3. **Simpler Database** - Less tables to manage
4. **Easy Updates** - Change plans in Stripe Dashboard only

---

## 🔧 What You Need to Do

### Step 1: Create Products & Prices in Stripe Dashboard

Go to: https://dashboard.stripe.com/test/products

Create products with prices:
- Basic Plan - $9.99/month
- Premium Plan - $29.99/month  
- Enterprise - $99.99/month

### Step 2: Use the Updated API

The code is already updated! Just use:
- `/api/v1/stripe/plans` - Fetches from Stripe
- `/api/v1/stripe/create-checkout-session` - Uses `price_id`
- Webhook saves to `subscription` table

### Step 3: Remove subscription_Plan table (optional)

If you want to clean up:
```sql
DROP TABLE subscription_Plan;
```

---

**You're all set!** 🎉
