# Stripe Webhook Quick Setup Guide

**For Local Development Testing**

---

## 🚀 Quick Start (2 Steps)

### Step 1: Start Webhook Listener

Open a **new terminal window** and run:

```bash
cd /Users/thabonyembe/Documents/freeflow-app-9
./setup-stripe-webhook.sh
```

**OR** run directly:

```bash
stripe listen --forward-to localhost:3000/api/files/payment/webhook
```

### Step 2: Copy Webhook Secret

The command will output something like:

```
> Ready! Your webhook signing secret is whsec_xxxxxxxxxxxxx
```

**Copy that `whsec_...` value** and add it to your `.env.local`:

```bash
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

Then **restart your dev server**:

```bash
# Stop current dev server (Ctrl+C)
npm run dev
```

---

## ✅ That's It!

Your Stripe webhooks are now configured for local testing! 🎉

---

## 🧪 Testing the Payment Flow

### Test Payment Flow:

1. **Start dev server** (terminal 1):
   ```bash
   npm run dev
   ```

2. **Start webhook listener** (terminal 2):
   ```bash
   ./setup-stripe-webhook.sh
   ```

3. **Navigate to:**
   ```
   http://localhost:3000/dashboard/client-zone/files
   ```

4. **Toggle to Secure Mode**

5. **Upload a file** with payment required:
   - Access Type: **Payment Required**
   - Price: **$25** (or any amount)
   - Escrow: **Enabled** (optional)

6. **Click the file** → **Purchase & Download**

7. **Use Stripe test card:**
   ```
   Card: 4242 4242 4242 4242
   Expiry: Any future date (e.g., 12/25)
   CVC: Any 3 digits (e.g., 123)
   ZIP: Any 5 digits (e.g., 12345)
   ```

8. **Complete payment**

9. **Watch webhook listener** terminal - you should see:
   ```
   2025-12-05 14:30:00  --> checkout.session.completed [evt_xxx]
   ```

10. **Verify in your app:**
    - If escrow enabled: File status → "escrowed"
    - If no escrow: File status → "released"
    - Download button becomes active

---

## 🔍 Troubleshooting

### Webhook Not Receiving Events?

**Check 1:** Is webhook listener running?
```bash
# You should see this in terminal 2:
Ready! Your webhook signing secret is whsec_xxxxx
```

**Check 2:** Is webhook secret in `.env.local`?
```bash
grep STRIPE_WEBHOOK_SECRET .env.local
# Should show: STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

**Check 3:** Did you restart dev server after adding secret?
```bash
# Restart to pick up new env variable
npm run dev
```

**Check 4:** Is dev server on port 3000?
```bash
# Check what's running on port 3000
lsof -i :3000
```

---

## 📋 Webhook Events We Handle

Our webhook endpoint (`/api/files/payment/webhook`) processes:

1. **checkout.session.completed**
   - Triggers when Stripe Checkout payment succeeds
   - Updates file delivery status
   - Creates escrow deposit if enabled
   - Logs transaction

2. **payment_intent.succeeded**
   - Confirms payment was processed
   - Backup verification

3. **payment_intent.payment_failed**
   - Handles failed payments
   - Updates status to 'failed'

---

## 🧪 Testing Specific Scenarios

### Test 1: Public File (No Payment)
```
Access Type: Public
Payment: None
Expected: Instant download, no webhook
```

### Test 2: Password-Protected File
```
Access Type: Password
Password: test123
Expected: Password prompt, no payment, no webhook
```

### Test 3: Paid File (No Escrow)
```
Access Type: Payment
Price: $10
Escrow: Disabled
Expected: Pay → Webhook → Instant download
```

### Test 4: Paid File (With Escrow)
```
Access Type: Payment
Price: $100
Escrow: Enabled
Expected: Pay → Webhook → Status "escrowed" → Seller releases → Download
```

---

## 🎯 Stripe Test Cards

### Success Cards
```
Success: 4242 4242 4242 4242
3D Secure: 4000 0027 6000 3184
```

### Failure Cards
```
Declined: 4000 0000 0000 0002
Insufficient Funds: 4000 0000 0000 9995
```

### All test cards work with:
- **Expiry**: Any future date
- **CVC**: Any 3 digits
- **ZIP**: Any 5 digits

---

## 🚦 Webhook Flow Diagram

```
User clicks "Purchase"
    ↓
Stripe Checkout opens
    ↓
User enters test card: 4242 4242 4242 4242
    ↓
Payment succeeds
    ↓
Stripe sends webhook: checkout.session.completed
    ↓
Webhook listener forwards to: localhost:3000/api/files/payment/webhook
    ↓
Our API verifies signature with: STRIPE_WEBHOOK_SECRET
    ↓
Our API processes payment:
  - Update delivery status
  - Create escrow deposit (if enabled)
  - Log transaction
    ↓
User redirected back to app
    ↓
Download button enabled (or wait for escrow release)
```

---

## 📝 Environment Variables Checklist

Make sure these are in `.env.local`:

```bash
# Stripe Keys
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51RWP...  ✅
STRIPE_SECRET_KEY=sk_test_51RWP...                   ✅
STRIPE_WEBHOOK_SECRET=whsec_...                      ⚠️  Add this!

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://gcinvw...           ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...              ✅

# Wasabi
WASABI_ACCESS_KEY_ID=WFYD46...                       ✅
WASABI_SECRET_ACCESS_KEY=I9gQO8...                   ✅
WASABI_BUCKET_NAME=kazi                              ✅
WASABI_REGION=eu-central-1                           ✅
```

---

## 🎬 Full Demo Workflow

1. **Terminal 1 - Dev Server:**
   ```bash
   cd /Users/thabonyembe/Documents/freeflow-app-9
   npm run dev
   ```

2. **Terminal 2 - Webhook Listener:**
   ```bash
   cd /Users/thabonyembe/Documents/freeflow-app-9
   ./setup-stripe-webhook.sh
   ```
   Copy the `whsec_...` secret to `.env.local`

3. **Browser - Test Upload:**
   - Go to: http://localhost:3000/dashboard/client-zone/files
   - Toggle to **Secure Mode**
   - Click **Upload Files**
   - Select a PDF or image
   - Configure:
     ```
     Access Type: Payment Required
     Price: $25
     Escrow: Enabled
     Buyer Email: buyer@test.com
     ```
   - Upload

4. **Browser - Test Purchase:**
   - Click the uploaded file
   - Click **Purchase & Download**
   - Stripe Checkout opens
   - Enter test card: `4242 4242 4242 4242`
   - Complete payment

5. **Verify - Terminal 2:**
   - Should see: `checkout.session.completed [evt_xxx]`

6. **Verify - Browser:**
   - File status should be: **"Escrowed"**
   - Badge should show: 🛡️ Escrow

7. **Release Escrow:**
   - Click file again
   - Click **Release Escrow**
   - Confirm
   - Status changes to: **"Released"**
   - Download button activates

8. **Download File:**
   - Click **Download**
   - File downloads from Wasabi S3

---

## 🎉 Success!

If you can complete the full workflow above, your secure file delivery system is **100% operational**!

Payment processing ✅
Escrow protection ✅
File security ✅
Webhook integration ✅

You're ready for production! 🚀

---

## 📞 Need Help?

If webhooks aren't working, check:

1. ✅ Stripe CLI is running (`stripe listen...`)
2. ✅ Webhook secret in `.env.local` (starts with `whsec_`)
3. ✅ Dev server restarted after adding secret
4. ✅ Port 3000 is available
5. ✅ Internet connection active
6. ✅ Stripe account in test mode

Still stuck? Check the webhook listener terminal for error messages.

---

**Happy Testing! 🎊**
