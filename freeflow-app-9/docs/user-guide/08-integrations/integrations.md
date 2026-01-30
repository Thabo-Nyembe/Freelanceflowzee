# Integrations Guide

Connect KAZI with your favorite tools to streamline your workflow.

## Available Integrations

### Payment Processors
- **Stripe**: Credit/debit card payments
- **PayPal**: PayPal payments
- **Wise**: International transfers
- **Crypto**: Bitcoin, Ethereum, USDC

### Calendars
- **Google Calendar**: Two-way sync
- **Outlook Calendar**: Two-way sync
- **Apple Calendar**: iCal feed

### Communication
- **Slack**: Notifications and commands
- **Discord**: Team notifications
- **Email**: Gmail, Outlook integration

### Cloud Storage
- **Google Drive**: File attachments
- **Dropbox**: File sync
- **OneDrive**: Microsoft files

### Accounting
- **QuickBooks**: Invoice sync
- **Xero**: Financial data
- **FreshBooks**: Migration support

### Project Management
- **Asana**: Task sync
- **Trello**: Board import
- **Jira**: Issue tracking
- **Linear**: Development tasks

### Development
- **GitHub**: Repository linking
- **GitLab**: Project integration
- **Bitbucket**: Code hosting

---

## Stripe Integration

### Setup
1. Go to **Settings > Integrations**
2. Find **Stripe** and click **Connect**
3. Log into your Stripe account
4. Authorize KAZI access
5. Connection complete!

### Features
- Accept credit/debit cards
- Automatic payment processing
- Payment links on invoices
- Subscription billing support

### Configuration
- **Live/Test Mode**: Toggle environment
- **Webhook URL**: Auto-configured
- **Payment Methods**: Cards, bank transfers
- **Currency**: Set default currency

### Troubleshooting
- Ensure Stripe account is verified
- Check webhook status in Stripe dashboard
- Verify API keys are correct

---

## Google Calendar Integration

### Setup
1. Go to **Settings > Integrations**
2. Find **Google Calendar** and click **Connect**
3. Sign in with Google
4. Select calendars to sync
5. Choose sync direction

### Sync Options
- **One-way (KAZI → Google)**: KAZI events appear in Google
- **One-way (Google → KAZI)**: Google events appear in KAZI
- **Two-way**: Full synchronization

### What Syncs
- Project deadlines
- Task due dates
- Meetings (if enabled)
- Time blocks

### Settings
- Sync frequency (real-time, hourly, daily)
- Default calendar for new events
- Event visibility (public/private)

---

## Slack Integration

### Setup
1. Go to **Settings > Integrations**
2. Find **Slack** and click **Connect**
3. Authorize KAZI in Slack
4. Select notification channel

### Notifications
Configure what triggers Slack messages:
- New project created
- Invoice paid
- Task assigned
- Timer started/stopped
- Payment received
- Client message

### Slash Commands
Use in any Slack channel:
- `/kazi time` - View today's time
- `/kazi start [project]` - Start timer
- `/kazi stop` - Stop timer
- `/kazi projects` - List projects

### Channel Mapping
- Map projects to specific channels
- Set default notification channel
- Configure DM preferences

---

## QuickBooks Integration

### Setup
1. Go to **Settings > Integrations**
2. Find **QuickBooks** and click **Connect**
3. Sign into QuickBooks
4. Authorize data access
5. Map accounts

### Sync Features
- **Clients**: Sync customer records
- **Invoices**: Push invoices to QuickBooks
- **Payments**: Record payments automatically
- **Expenses**: Sync expense data

### Configuration
- Income account mapping
- Tax code mapping
- Customer sync direction
- Invoice numbering rules

---

## GitHub Integration

### Setup
1. Go to **Settings > Integrations**
2. Find **GitHub** and click **Connect**
3. Authorize with GitHub
4. Select repositories

### Features
- Link repos to projects
- Track commits and PRs
- View activity in project timeline
- Automatic time tracking from commits

### Commit Tracking
Add project code to commits for automatic linking:
```
git commit -m "[PRJ-001] Fixed login bug"
```

---

## Zapier Integration

### Setup
1. Go to **Settings > Integrations**
2. Find **Zapier** and click **Connect**
3. Copy your API key
4. Use in Zapier

### Available Triggers
- Invoice created
- Invoice paid
- Project created
- Task completed
- Time entry added
- Client added

### Available Actions
- Create project
- Add time entry
- Create invoice
- Update task
- Add client

### Example Zaps
- **Typeform → KAZI**: Create client from form
- **KAZI → Google Sheets**: Log invoices
- **Gmail → KAZI**: Create task from email
- **KAZI → Slack**: Custom notifications

---

## API Access

### Getting API Keys
1. Go to **Settings > API Keys**
2. Click **Generate New Key**
3. Name your key
4. Set permissions
5. Copy and store securely

### Authentication
```bash
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://api.kazi.com/v1/projects
```

### Rate Limits
- 100 requests per minute
- 10,000 requests per day
- Contact support for higher limits

### Endpoints
Full API documentation available at:
`https://api.kazi.com/docs`

---

## Webhooks

### Setting Up Webhooks
1. Go to **Settings > Webhooks**
2. Click **+ Add Webhook**
3. Enter endpoint URL
4. Select events to trigger
5. Test the webhook

### Event Types
- `invoice.created`
- `invoice.paid`
- `project.created`
- `project.completed`
- `time.started`
- `time.stopped`
- `client.created`
- `payment.received`

### Payload Format
```json
{
  "event": "invoice.paid",
  "timestamp": "2024-01-15T10:30:00Z",
  "data": {
    "invoice_id": "INV-001",
    "amount": 1500.00,
    "currency": "USD",
    "client_id": "client-123"
  }
}
```

### Security
- Verify webhook signatures
- Use HTTPS endpoints only
- Implement retry handling

---

## Troubleshooting Integrations

### Connection Issues
1. Disconnect and reconnect
2. Check third-party service status
3. Verify account permissions
4. Clear browser cache

### Sync Problems
1. Check sync logs
2. Verify data mapping
3. Force manual sync
4. Contact support

### API Errors
1. Verify API key validity
2. Check rate limits
3. Review error messages
4. Test with minimal request
