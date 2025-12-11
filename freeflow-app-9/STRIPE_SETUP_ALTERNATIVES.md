# Stripe Webhook Setup - Alternative Methods

Since the Stripe CLI login is having issues, here are alternative approaches:

---

## Option 1: Test Without Webhooks (Quick Start)

You can test the basic payment flow without webhooks first. The checkout will work, but automatic file release won't happen until webhooks are configured.

### What Works Without Webhooks:
- ✅ Creating checkout sessions
- ✅ Stripe payment page opens
- ✅ Payment processing
- ✅ Manual file release

### What Doesn't Work:
- ❌ Automatic file status updates after payment
- ❌ Automatic escrow creation
- ❌ Transaction logging

### Current Setup:
Your `.env.local` has a placeholder webhook secret:
```bash
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here
```

For testing without webhooks, you can leave this as-is.

---

## Option 2: Use ngrok for Local Webhook Testing

If you want full webhook functionality locally:

### Step 1: Install ngrok
```bash
brew install ngrok
```

### Step 2: Start ngrok
```bash
ngrok http 3000
```

This will give you a public URL like: `https://abc123.ngrok.io`

### Step 3: Create Webhook in Stripe Dashboard

1. Go to: https://dashboard.stripe.com/test/webhooks
2. Click "Add endpoint"
3. Enter URL: `https://abc123.ngrok.io/api/files/payment/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the webhook signing secret (starts with `whsec_`)
7. Update `.env.local`:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_ACTUAL_SECRET_HERE
   ```
8. Restart your dev server

---

## Option 3: Production Webhook Setup

When you deploy to production (Vercel, etc.):

### Step 1: Get Your Production URL
```
https://your-app.vercel.app
```

### Step 2: Create Production Webhook

1. Go to: https://dashboard.stripe.com/webhooks (switch to Live mode)
2. Click "Add endpoint"
3. Enter URL: `https://your-app.vercel.app/api/files/payment/webhook`
4. Select events:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Click "Add endpoint"
6. Copy the webhook signing secret
7. Add to Vercel environment variables:
   ```bash
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_PRODUCTION_SECRET
   ```

---

## Option 4: Fix Stripe CLI Login

If you want to try the CLI again:

### Method A: Use API Key Directly
```bash
stripe login --api-key sk_test_51RWPSSGfWWV489qXu79OQRwaQjakiSmYLTmmpC7uDrHGhk30Nrb7gMC1B8UvR8Ko7f1JCF2jSy0ipeQac4rr5XZ300hDheaIha
```

### Method B: Clear Stripe CLI Config
```bash
rm -rf ~/.config/stripe
stripe login
```

### Method C: Check Browser Issues
- Try a different browser
- Disable ad blockers
- Check if you're logged into the correct Stripe account

---

## Recommended Path Forward

### For Immediate Testing:
1. **Skip webhooks for now** (Option 1)
2. Test the payment checkout flow
3. Manually verify payments in Stripe Dashboard
4. Manually release escrow in your app

### For Full Functionality:
1. **Use ngrok** (Option 2)
2. Set up webhook in Stripe Dashboard
3. Get webhook secret
4. Test complete payment → webhook → auto-release flow

### For Production:
1. Deploy to Vercel
2. Set up production webhook (Option 3)
3. Add webhook secret to Vercel env vars

---

## Testing Payment Flow Without Webhooks

You can still test payments! Here's how:

### Step 1: Start Dev Server
```bash
npm run dev
```

### Step 2: Navigate to Files Page
```
http://localhost:3000/dashboard/client-zone/files
```

### Step 3: Toggle to Secure Mode
Click the "Secure" button in the view toggle

### Step 4: Upload a Paid File
- Click "Upload Files"
- Select a file
- Set "Access Type: Payment Required"
- Set "Price: $25"
- Set "Escrow: Enabled"
- Upload

### Step 5: Test Payment
- Click the uploaded file
- Click "Purchase & Download"
- Use test card: `4242 4242 4242 4242`
- Complete payment

### Step 6: Verify Payment
- Go to Stripe Dashboard: https://dashboard.stripe.com/test/payments
- You should see the $25 payment
- Status: Succeeded

### Step 7: Manual Release (Since No Webhook)
- In your app, the file status will still be "pending"
- You can manually update the database:
  ```sql
  UPDATE secure_file_deliveries
  SET status = 'released'
  WHERE id = 'your-delivery-id';
  ```
- Or add a manual release button in your UI

---

## Current Status

✅ **What's Ready:**
- Stripe integration code
- Payment API endpoints
- Checkout session creation
- Webhook handler (waiting for secret)
- Escrow integration
- Client-zone UI

⚠️ **What's Pending:**
- Webhook secret configuration
- Webhook testing

🎯 **Recommended Next Step:**
Test the payment flow without webhooks first to verify everything else works, then add webhooks later using ngrok or production deployment.

---

## Quick Commands

### Test Payment (No Webhook)
```bash
# Terminal 1: Start dev server
npm run dev

# Browser: Test payment flow
http://localhost:3000/dashboard/client-zone/files
```

### Test With ngrok
```bash
# Terminal 1: Start dev server
npm run dev

# Terminal 2: Start ngrok
ngrok http 3000

# Browser: Create webhook with ngrok URL
https://dashboard.stripe.com/test/webhooks
```

### Check Stripe Payments
```bash
# View in browser
https://dashboard.stripe.com/test/payments

# Or via CLI (if logged in)
stripe payments list --limit 10
```

---

## Need Help?

If you're stuck, let me know which option you'd like to pursue:
1. Test without webhooks first
2. Set up ngrok for local webhooks
3. Skip to production deployment

Happy to help with any of these paths! 🚀
