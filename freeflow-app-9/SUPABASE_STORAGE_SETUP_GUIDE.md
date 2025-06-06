# 🗂️ Supabase Storage Setup Guide

## 📋 Overview
This guide will help you set up the storage bucket for your FreeflowZee project through the Supabase dashboard.

---

## 🎯 **Quick Setup Steps**

### 1. **Access Your Supabase Dashboard**
- Open: https://supabase.com/dashboard/projects
- Navigate to your project: `zozfeyszmzonvrelyhff`
- Or go directly: https://supabase.com/dashboard/project/zozfeyszmzonvrelyhff

### 2. **Create Storage Bucket**
1. In the left sidebar, click **"Storage"**
2. Click **"Create a new bucket"**
3. Configure the bucket:
   ```
   Bucket Name: project-files
   Public bucket: ❌ (Keep it private)
   ```
4. Click **"Create bucket"**

### 3. **Configure Bucket Settings** 
1. Click on the `project-files` bucket
2. Go to **"Configuration"** tab
3. Set these options:
   ```
   File size limit: 100 MB (104857600 bytes)
   Allowed MIME types: */* (or see detailed list below)
   ```

---

## 📁 **Detailed MIME Types** (Optional)
If you want to restrict file types, use these MIME types:

```
Images:
- image/jpeg, image/jpg, image/png, image/gif, image/webp, image/svg+xml

Documents:
- application/pdf, text/plain, text/csv
- application/msword, application/vnd.openxmlformats-officedocument.wordprocessingml.document
- application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet

Audio:
- audio/mpeg, audio/wav, audio/mp3, audio/ogg, audio/aac

Video:
- video/mp4, video/webm, video/ogg, video/avi, video/mov

Archives:
- application/zip, application/x-zip-compressed, application/x-rar-compressed
```

---

## 🔒 **Storage Policies** (Advanced)

### If RLS is enabled, you may need these policies:

1. **Allow Authenticated Uploads**
   ```sql
   CREATE POLICY "Allow authenticated uploads" ON storage.objects
   FOR INSERT WITH CHECK (
     auth.role() = 'authenticated' AND
     bucket_id = 'project-files'
   );
   ```

2. **Allow Authenticated Access**
   ```sql
   CREATE POLICY "Allow authenticated select" ON storage.objects
   FOR SELECT USING (
     auth.role() = 'authenticated' AND
     bucket_id = 'project-files'
   );
   ```

3. **Allow Authenticated Delete**
   ```sql
   CREATE POLICY "Allow authenticated delete" ON storage.objects
   FOR DELETE USING (
     auth.role() = 'authenticated' AND
     bucket_id = 'project-files'
   );
   ```

To add these:
1. Go to **SQL Editor** in your Supabase dashboard
2. Paste and run each policy individually
3. Or use **Storage > Policies** in the dashboard UI

---

## ✅ **Verification Steps**

After creating the bucket, verify it works:

1. **Check Bucket Exists**
   - Go to Storage → project-files
   - Should show an empty bucket

2. **Test Upload** (Optional)
   - Try uploading a test file through the dashboard
   - Should work without errors

3. **Run Our Tests**
   ```bash
   npm run test:e2e:storage
   ```

---

## 🚀 **Next Steps**

Once the bucket is created:

1. ✅ **Run storage tests**: `npm run test:e2e`
2. ✅ **Verify uploads work**: Check API endpoints
3. ✅ **Test file downloads**: Confirm signed URLs work
4. ✅ **Production deployment**: Your storage system is ready!

---

## 🆘 **Troubleshooting**

### Common Issues:

**"Bucket already exists"**
- ✅ Good! It means it's already set up

**"Permission denied"**
- Check if you're the project owner
- Verify RLS policies are correct

**"File upload fails"**
- Confirm bucket name is `project-files`
- Check file size limit (100MB max)
- Verify MIME type is allowed

---

## 📞 **Support**

If you need help:
1. Check Supabase docs: https://supabase.com/docs/guides/storage
2. Verify your project URL: https://zozfeyszmzonvrelyhff.supabase.co
3. Ensure API keys are correct in `.env.local`

---

**💡 Pro Tip**: After setup, your FreeflowZee storage tests should go from ~50% to ~90%+ success rate! 