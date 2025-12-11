# ⚡ Kazi - Quick Test Setup (3 Minutes)

## 🎯 Goal: Get a test user with sample data

---

## Step 1: Create Test User (1 min)

**The Supabase Users page should be open.**

Click **"Add user"** → **"Create new user"**

Fill in:
```
Email: test@kazi.dev
Password: test12345
Auto-confirm user: ✅ YES (Important!)
```

Click **"Create user"**

**✅ You should see the user in the list**

---

## Step 2: Add Profile & Sample Data (1 min)

Copy SQL to clipboard:
```bash
cat scripts/setup-test-user.sql | pbcopy
```

Open SQL Editor:
https://supabase.com/dashboard/project/gcinvwprtlnwuwuvmrux/sql/new

1. Paste (Cmd+V)
2. Click **"Run"**
3. Wait for success

**✅ You should see "Setup Complete!" message**

---

## Step 3: Login & Test (1 min)

Start dev server:
```bash
npm run dev
```

Visit: http://localhost:9323/auth/login

Login:
```
Email: test@kazi.dev
Password: test12345
```

**✅ You should see the dashboard with sample data!**

---

## 🎉 What You Now Have

- ✅ Test user: test@kazi.dev
- ✅ 1 client: Acme Corporation
- ✅ 1 project: Website Redesign (45% complete)
- ✅ 3 tasks: 1 completed, 1 in progress, 1 todo
- ✅ 1 invoice: $5,000
- ✅ 1 notification: Welcome message

---

## 🔍 Verify Data

Dashboard should show:
- Projects tab: 1 project
- Tasks: 3 tasks
- Clients: 1 client
- Invoices: 1 invoice

If you see this, **database is fully wired and working!** 🎊

---

## 🛠️ Troubleshooting

### Can't login?
- Check email is exactly: `test@kazi.dev`
- Password: `test12345`
- Make sure "Auto-confirm" was checked

### No data showing?
- Run the SQL script again
- Check you're logged in as test@kazi.dev
- Check browser console for errors

### Need to start over?
Delete user from dashboard and repeat steps 1-3.

---

**Ready? Start with Step 1! 👆**
