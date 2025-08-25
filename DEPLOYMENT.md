# 🚀 AI Workbench Deployment Guide: Vercel + Railway

## **Overview**
This guide walks you through deploying your AI Workbench application using:
- **Vercel**: Frontend (Next.js)
- **Railway**: Backend (API + Database + Temporal)
- **Modal**: ML Services (Training + Inference)

## **Phase 1: Deploy Frontend to Vercel**

### **Step 1: Install Vercel CLI**
```bash
npm i -g vercel
```

### **Step 2: Login to Vercel**
```bash
vercel login
```

### **Step 3: Deploy Frontend**
```bash
cd apps/web
vercel --prod
```

**During deployment, Vercel will ask:**
- Set up and deploy? → **Yes**
- Which scope? → **Select your account**
- Link to existing project? → **No**
- Project name? → **ai-workbench-frontend**
- Directory? → **./**
- Override settings? → **No**

### **Step 4: Configure Environment Variables**
In Vercel Dashboard → Your Project → Settings → Environment Variables:

```bash
# Copy from apps/web/env.production.template
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET=your-s3-bucket-name
```

## **Phase 2: Deploy Backend to Railway**

### **Step 1: Install Railway CLI**
```bash
npm i -g @railway/cli
```

### **Step 2: Login to Railway**
```bash
railway login
```

### **Step 3: Create New Project**
```bash
railway init
```

**Select:**
- Create new project → **Yes**
- Project name → **ai-workbench-backend**

### **Step 4: Add PostgreSQL Service**
```bash
railway add
```

**Select:**
- PostgreSQL → **Add**

### **Step 5: Deploy Backend**
```bash
railway up
```

### **Step 6: Configure Environment Variables**
```bash
railway variables
```

**Add all variables from `railway.env.template`**

## **Phase 3: Configure Database**

### **Step 1: Get Database URL**
```bash
railway variables
```

**Copy the `DATABASE_URL`**

### **Step 2: Update Frontend Environment**
In Vercel Dashboard, add:
```bash
DATABASE_URL=your_railway_postgresql_url
```

### **Step 3: Run Database Migrations**
```bash
cd apps/web
railway run pnpm db:push
```

## **Phase 4: Deploy Temporal Worker**

### **Option 1: Railway (Recommended)**
```bash
# In Railway dashboard, add new service
# Upload your ml-services directory
# Set start command: python run_worker.py
```

### **Option 2: Modal (Alternative)**
```bash
cd apps/ml-services
modal deploy run_worker.py
```

## **Phase 5: Test Deployment**

### **Test Frontend**
```bash
# Your Vercel URL
https://ai-workbench-frontend.vercel.app
```

### **Test Backend Health**
```bash
# Your Railway health endpoint
https://your-railway-app.up.railway.app/api/health
```

### **Test Database Connection**
```bash
# Check if experiments page loads
# Try creating a new project
```

## **Phase 6: Configure Domains**

### **Custom Domain (Optional)**
- **Vercel**: Add custom domain in dashboard
- **Railway**: Add custom domain in dashboard

## **Environment Variables Reference**

### **Frontend (Vercel)**
```bash
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=clerk_pk_...
NEXT_PUBLIC_API_URL=https://your-railway-app.up.railway.app
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_S3_BUCKET=your-bucket-name
```

### **Backend (Railway)**
```bash
DATABASE_URL=postgresql://...
CLERK_SECRET_KEY=clerk_sk_...
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
MODAL_TOKEN_ID=...
MODAL_TOKEN_SECRET=...
```

## **Troubleshooting**

### **Common Issues:**
1. **Build Failures**: Check Node.js version (>=24.3.0)
2. **Database Connection**: Verify DATABASE_URL format
3. **CORS Issues**: Check API URL configuration
4. **Environment Variables**: Ensure all required vars are set

### **Useful Commands:**
```bash
# Check Railway logs
railway logs

# Check Vercel deployment status
vercel ls

# Restart Railway service
railway service restart

# View Railway variables
railway variables
```

## **Next Steps After Deployment**

1. **Test User Authentication** (Clerk)
2. **Test File Uploads** (AWS S3)
3. **Test ML Workflows** (Temporal + Modal)
4. **Monitor Performance** (Vercel Analytics + Railway Metrics)
5. **Set up Monitoring** (Error tracking, uptime monitoring)

## **Cost Estimation**

- **Vercel**: Free tier (personal projects)
- **Railway**: $5/month (starter plan)
- **Modal**: Pay-per-use (very affordable for testing)
- **Total**: ~$5-10/month for full production setup

---

**🎉 Congratulations! Your AI Workbench is now running in production!**
