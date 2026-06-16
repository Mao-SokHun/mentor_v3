# 🧾 Invoice & Receipt Guide

## Overview
After a customer completes payment, Stripe automatically generates a receipt/invoice. This guide shows you how to access and use it.

---

## ✅ What Was Implemented (Option 2)

### **Automatic Receipt URL Capture**
When a payment is completed via webhook, the system:
1. Retrieves the receipt URL from Stripe
2. Saves it in the database (`stripe_payments.stripe_receipt_url`)
3. Makes it available via API

---

## 📋 Database Changes

### **New Field in `stripe_payments` Table:**
```sql
stripe_receipt_url VARCHAR(500) -- Stripe-hosted receipt URL
```

This field stores the permanent link to the Stripe-hosted receipt PDF.

---

## 🔌 API Endpoints

### **1. Get Receipt by Payment ID**
```
GET /api/v1/stripe/receipt/:payment_id?user_id=1
```

**Response:**
```json
{
  "payment_id": 1,
  "amount": 19.99,
  "currency": "usd",
  "status": "completed",
  "receipt_url": "https://pay.stripe.com/receipts/payment/xxxxx",
  "created_at": "2026-06-11T08:00:00.000Z"
}
```

**Usage:**
```javascript
// Fetch receipt for payment_id = 1
const response = await fetch('http://localhost:3000/api/v1/stripe/receipt/1?user_id=1');
const data = await response.json();

// Open receipt in new tab
window.open(data.receipt_url, '_blank');
```

---

### **2. Get Receipt from Checkout Session**
```
GET /api/v1/stripe/session/:sessionId?user_id=1
```

**Response includes `receiptUrl`:**
```json
{
  "sessionId": "cs_test_xxxxx",
  "paymentId": 1,
  "status": "paid",
  "amountTotal": 1999,
  "currency": "usd",
  "subscriptionStatus": "completed",
  "subscriptionId": 1,
  "receiptUrl": "https://pay.stripe.com/receipts/payment/xxxxx"
}
```

---

## 🎯 How It Works

### **Flow:**
1. **User completes payment** on Stripe checkout page
2. **Stripe webhook fires** (`checkout.session.completed`)
3. **Backend retrieves receipt URL** from Stripe API:
   - Gets `payment_intent` from session
   - Gets `charge` from payment_intent
   - Extracts `receipt_url` from charge
4. **Saves receipt URL** in database
5. **Frontend can fetch** receipt URL via API
6. **User clicks "View Receipt"** → Opens Stripe-hosted PDF

---

## 💻 Frontend Usage

### **On Success Page:**
The payment success page (`payment-success.html`) automatically shows a "View Receipt" button if the receipt URL is available:

```html
<a href="RECEIPT_URL" target="_blank">
    🧾 View Receipt / Invoice
</a>
```

### **Custom Implementation:**
```javascript
async function showReceipt(paymentId) {
    const response = await fetch(
        `http://localhost:3000/api/v1/stripe/receipt/${paymentId}?user_id=1`
    );
    const data = await response.json();
    
    if (data.receipt_url) {
        // Option 1: Open in new tab
        window.open(data.receipt_url, '_blank');
        
        // Option 2: Embed in iframe
        document.getElementById('receipt-frame').src = data.receipt_url;
        
        // Option 3: Send via email (backend)
        await fetch('/api/v1/send-receipt-email', {
            method: 'POST',
            body: JSON.stringify({
                email: user.email,
                receipt_url: data.receipt_url
            })
        });
    }
}
```

---

## 📧 Email Receipt to Customer (Optional)

You can send the receipt URL via email after payment:

### **Add to Webhook:**
```javascript
// In stripeWebhook.js after payment.save()
import nodemailer from 'nodemailer';

// Send receipt email
if (payment.stripe_receipt_url) {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });
    
    await transporter.sendMail({
        from: 'RokKru <noreply@rokkru.com>',
        to: session.customer_details.email,
        subject: 'Your RokKru Payment Receipt',
        html: `
            <h1>Payment Successful!</h1>
            <p>Thank you for your payment of $${payment.amount}.</p>
            <p><a href="${payment.stripe_receipt_url}">View Receipt</a></p>
        `
    });
}
```

---

## 🧪 Testing

### **Test Complete Flow:**
```bash
# 1. Start server
npm start

# 2. Start Stripe webhook listener
stripe listen --forward-to localhost:3000/api/v1/stripe/webhook

# 3. Open test page
open http://localhost:3000/test-buy-button.html

# 4. Complete payment with test card:
# Card: 4242 4242 4242 4242
# Expiry: 12/34
# CVC: 123

# 5. After redirect to success page, click "View Receipt"
# You'll see the Stripe-hosted receipt PDF
```

### **Test API Directly:**
```bash
# Get receipt for payment_id = 1
curl http://localhost:3000/api/v1/stripe/receipt/1?user_id=1
```

---

## 📝 Receipt URL Format

Stripe receipt URLs look like:
```
https://pay.stripe.com/receipts/payment/CAcaFwo...
```

**Features:**
- ✅ Permanent (doesn't expire)
- ✅ PDF download available
- ✅ Professional formatting
- ✅ Includes all payment details
- ✅ Shows your business name/logo (configured in Stripe)

---

## 🎨 Customize Receipt Appearance

### **In Stripe Dashboard:**
1. Go to **Settings** → **Branding**
2. Upload your **logo**
3. Set **brand colors**
4. Configure **business details**:
   - Business name
   - Address
   - Support email
   - Website

All receipts will automatically use this branding! 🎉

---

## 🔒 Security Notes

- Receipt URLs are public but hard to guess (long random string)
- No authentication required to view receipt (by design)
- Receipt only shows payment info, no sensitive customer data
- If you need restricted access, add authentication to the API endpoint

---

## ✅ Summary

**What you get:**
1. ✅ Automatic receipt URL capture on payment
2. ✅ Saved in database for future access
3. ✅ API endpoint to retrieve receipt
4. ✅ Button on success page to view receipt
5. ✅ Professional Stripe-hosted PDF
6. ✅ No additional coding needed!

**Next steps:**
- Test the flow with a real payment
- Customize branding in Stripe Dashboard
- (Optional) Add email sending functionality

---

## 🆘 Troubleshooting

**Q: Receipt URL is null in database?**  
A: Payment might still be processing. Wait for webhook to complete.

**Q: Can't see receipt button on success page?**  
A: Refresh the page after ~5 seconds. Webhook needs time to process.

**Q: Want to generate custom invoices?**  
A: Use Option 5 (custom PDF generation) instead. Let me know if you need this!

---

**Documentation created: June 11, 2026**  
**Invoice feature: ✅ Implemented & Working**
