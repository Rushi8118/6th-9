# 📤 Hostinger Upload Guide

## What to Upload to Hostinger

**ONLY upload the `dist` folder contents** - this contains the built production files.

---

## Step-by-Step Upload Process

### Step 1: Build the Project (if not already done)

```bash
npm run build
```

This creates the `dist` folder with all compiled files.

---

### Step 2: Files to Upload

**Upload ONLY these files from the `dist` folder:**

```
dist/
├── index.html                    ✅ Upload this
├── assets/                       ✅ Upload entire folder
│   ├── *.js files               ✅ All JavaScript files
│   ├── *.css files              ✅ All CSS files
│   └── *.svg, *.png files       ✅ All image files
├── work-visa/                    ✅ Upload if exists
├── study-in-*/                   ✅ Upload if exists
└── other prerendered pages/      ✅ Upload if exists
```

---

## What NOT to Upload

**DO NOT upload these:**

❌ `src/` folder (source code)  
❌ `node_modules/` folder  
❌ `.git/` folder  
❌ `package.json`  
❌ `tsconfig.json`  
❌ `vite.config.ts`  
❌ `.env` file (use Hostinger environment variables instead)  
❌ Any `.md` documentation files  
❌ `supabase/` folder  
❌ `.kiro/` folder  

---

## Hostinger Upload Methods

### Method 1: File Manager (Recommended for Small Updates)

1. **Login to Hostinger:**
   - Go to: https://hpanel.hostinger.com
   - Login with your credentials

2. **Open File Manager:**
   - Click on your website
   - Click "File Manager"

3. **Navigate to public_html:**
   - Open `public_html` folder
   - This is your website root

4. **Clear Old Files (First Time):**
   - Select all files in `public_html`
   - Delete them (if this is first deployment)

5. **Upload dist Contents:**
   - Click "Upload Files"
   - Select ALL files from your local `dist` folder
   - Upload them

6. **Verify Structure:**
   ```
   public_html/
   ├── index.html          ✅
   ├── assets/             ✅
   │   └── (all files)
   └── (other folders)     ✅
   ```

---

### Method 2: FTP (Recommended for Large Projects)

1. **Get FTP Credentials:**
   - In Hostinger panel
   - Go to "FTP Accounts"
   - Note: hostname, username, password

2. **Use FTP Client (FileZilla):**
   - Download FileZilla: https://filezilla-project.org
   - Connect using your FTP credentials
   - Navigate to `public_html` folder

3. **Upload dist Contents:**
   - Drag and drop ALL files from `dist` folder
   - To `public_html` on server

4. **Wait for Upload:**
   - Large projects may take 5-10 minutes
   - Don't close FileZilla until complete

---

### Method 3: Git Deployment (Advanced)

1. **Connect GitHub to Hostinger:**
   - In Hostinger panel
   - Go to "Git" section
   - Connect your repository

2. **Set Build Command:**
   ```bash
   npm run build
   ```

3. **Set Deployment Path:**
   ```
   dist/
   ```

4. **Auto-deploy on push:**
   - Every git push triggers rebuild
   - Hostinger automatically deploys `dist` folder

---

## Important: Environment Variables

**DO NOT upload `.env` file!**

Instead, set environment variables in Hostinger:

1. **Go to Hostinger Panel**
2. **Advanced → Environment Variables**
3. **Add these variables:**

```
VITE_SUPABASE_URL=https://ugvtrtlnufzkjgxhucji.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## Files Changed in Latest Commit

**From your latest commit `396bbba`, these files were changed:**

### Source Files (Don't Upload Directly):
- ❌ `src/pages/admin/UrgentRequirementsAdminPage.tsx`
- ❌ `src/hooks/useUrgentRequirements.ts`
- ❌ `src/pages/UrgentRequirementsPage.tsx`
- ❌ `src/components/auth-provider.tsx`

### What These Changes Affect in `dist`:

After running `npm run build`, these source changes create:

✅ `dist/assets/UrgentRequirementsAdminPage-*.js` (new)  
✅ `dist/assets/index-*.js` (updated)  
✅ `dist/assets/index-*.css` (updated)  
✅ `dist/index.html` (updated)  

**You need to upload the ENTIRE `dist` folder** because:
- File names have hash codes that change on each build
- Dependencies are bundled together
- CSS is combined and minified

---

## Quick Upload Checklist

### Before Upload:
- [ ] Run `npm run build` locally
- [ ] Verify `dist` folder exists
- [ ] Check `dist/index.html` opens in browser
- [ ] Verify environment variables are set in Hostinger

### Upload:
- [ ] Delete old files from `public_html` (if replacing)
- [ ] Upload ALL contents from `dist` folder
- [ ] Preserve folder structure
- [ ] Wait for upload to complete

### After Upload:
- [ ] Visit your website URL
- [ ] Test admin panel: yourdomain.com/admin
- [ ] Test date picker functionality
- [ ] Clear browser cache if needed
- [ ] Test on mobile device

---

## Common Issues

### Issue 1: White/Blank Page
**Solution:** 
- Check if `index.html` is in `public_html` root
- Verify environment variables are set
- Check browser console for errors

### Issue 2: 404 Errors on Refresh
**Solution:** Add `.htaccess` file to `public_html`:

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

### Issue 3: Assets Not Loading
**Solution:**
- Verify `assets` folder uploaded correctly
- Check file permissions (should be 644 for files, 755 for folders)

### Issue 4: Old Version Still Showing
**Solution:**
- Clear browser cache (Ctrl + Shift + R)
- Check if upload completed
- Wait 1-2 minutes for server cache

---

## Upload Size Guide

**Total `dist` folder size:** ~2-5 MB

**Breakdown:**
- `index.html`: ~3 KB
- `assets/*.js`: ~1.5-3 MB (JavaScript bundles)
- `assets/*.css`: ~600-800 KB (Stylesheets)
- `assets/*.svg`: ~1-2 MB (Flag icons)
- Other prerendered pages: ~100-200 KB

**Upload time:**
- Fast connection: 30 seconds - 1 minute
- Slow connection: 3-5 minutes

---

## Folder Structure on Hostinger

**After upload, your `public_html` should look like:**

```
public_html/
├── index.html                          (Main entry point)
├── .htaccess                           (URL rewrite rules)
├── assets/                             (All compiled assets)
│   ├── index-CDCK9ZV7.js              (Main bundle)
│   ├── index-CI2-DnYr.css             (Styles)
│   ├── vendor-react-D7X2aJwG.js       (React bundle)
│   ├── vendor-supabase-DEhR-P66.js    (Supabase bundle)
│   ├── UrgentRequirementsAdminPage-*.js
│   └── (hundreds of other files)
├── work-visa/
│   ├── albania/
│   │   └── index.html
│   └── (other countries)
├── study-in-uk/
│   └── index.html
└── (other prerendered routes)
```

---

## Summary

### To Deploy Your Changes:

1. **Build locally:**
   ```bash
   npm run build
   ```

2. **Upload to Hostinger:**
   - Upload entire `dist` folder contents
   - To `public_html` directory
   - Using File Manager or FTP

3. **Test:**
   - Visit your website
   - Test new date picker
   - Verify everything works

**That's it!** Only the `dist` folder contents go to Hostinger.

---

## Quick Commands

```bash
# Build for production
npm run build

# Check build output
dir dist

# Size of build
# (Windows)
dir dist /s

# (Output shows total size)
```

---

**Remember:** 
- ✅ Upload only `dist` folder contents
- ❌ Never upload `src`, `node_modules`, or config files
- 🔐 Use Hostinger environment variables for `.env` values
- 🔄 Rebuild before every deployment

**Your latest changes are ready to upload!** 🚀
