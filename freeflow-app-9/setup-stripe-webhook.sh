#!/bin/bash

# Stripe Webhook Setup Script for Local Development
# This script sets up Stripe webhook forwarding for local testing

echo "🔧 Stripe Webhook Setup for Secure File Delivery"
echo "=================================================="
echo ""

# Check if Stripe CLI is logged in
echo "Checking Stripe CLI authentication..."
if ! stripe config --list &> /dev/null; then
    echo "❌ Not logged in to Stripe CLI"
    echo ""
    echo "Please run: stripe login"
    echo "Then run this script again."
    exit 1
fi

echo "✅ Stripe CLI is authenticated"
echo ""

# Display current configuration
echo "📋 Current Configuration:"
stripe config --list | grep -E "(test_mode_api_key|device_name)" || true
echo ""

# Ask for confirmation
echo "This will start forwarding Stripe webhooks to:"
echo "  http://localhost:3000/api/files/payment/webhook"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled."
    exit 0
fi

echo ""
echo "🚀 Starting Stripe webhook forwarding..."
echo ""
echo "⚠️  IMPORTANT: Copy the webhook signing secret that appears below!"
echo "   It will start with 'whsec_' and you'll need to add it to .env.local"
echo ""
echo "   Add this line to your .env.local file:"
echo "   STRIPE_WEBHOOK_SECRET=whsec_..."
echo ""
echo "───────────────────────────────────────────────────────────────"
echo ""

# Start listening (this will block)
stripe listen --forward-to localhost:3000/api/files/payment/webhook

# This part only runs if the user stops the webhook listener
echo ""
echo "───────────────────────────────────────────────────────────────"
echo ""
echo "Webhook listener stopped."
echo ""
echo "Remember to:"
echo "1. Copy the webhook signing secret (whsec_...) to .env.local"
echo "2. Restart your Next.js dev server to pick up the new env variable"
echo ""
