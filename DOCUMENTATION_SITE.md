# 🚨 On Call Runbook

A beautiful, modern documentation website built with Next.js and Tailwind CSS, optimized for Vercel deployment. Your essential companion for on-call troubleshooting!

## 🎯 What You Got

✨ **Modern Features:**
- Beautiful tabbed interface for 3 documentation sections
- Real-time search functionality across all docs
- Dark mode support (auto-detects system preference)
- Fully responsive design
- Optimized markdown rendering with syntax highlighting
- Fast static site generation

📖 **Documentation Sections:**
1. **Helm Chart** - Complete guide for Helm deployments
2. **Kubernetes** - Comprehensive troubleshooting runbook
3. **Terraform** - Infrastructure troubleshooting guide
4. **ArgoCD** - GitOps deployment and management
5. **GitOps CI** - CI/CD pipeline guides
6. **Templates** - Interactive Helm template viewer/editor

## 🚀 Deploy to Vercel (2 Minutes)

### Method 1: One-Click Deploy
```bash
npm install -g vercel
vercel login
vercel
```
Just follow the prompts! ✨

### Method 2: GitHub Integration
1. Push this repo to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repository
4. Click Deploy
5. Done! 🎉

## 💻 Local Development

```bash
# Install dependencies
npm install

# Run dev server
npm run dev
# Open http://localhost:3000

# Build for production
npm run build

# Preview production build
npm run start
```

## 📁 Project Structure

```
on-call-runbook/
├── app/
│   ├── page.tsx        # Main documentation page with 6 tabs
│   ├── layout.tsx      # App layout with metadata
│   └── globals.css     # Global styles + markdown styling
├── templates/          # Helm chart templates
├── package.json        # Dependencies
├── next.config.js      # Next.js config
├── tailwind.config.ts  # Tailwind CSS config
└── vercel.json         # Vercel deployment config
```

## 🎨 Customization

### Update Documentation
Edit the markdown strings in `app/page.tsx`:
- `helmChartDocs`
- `kubernetesDocs`
- `terraformDocs`

### Change Colors/Styling
Modify `app/globals.css` or `tailwind.config.ts`

### Add New Tabs
1. Add new state in `app/page.tsx`
2. Add new markdown content
3. Add new tab button

## 🌐 After Deployment

Your site will be available at:
- `https://your-project-name.vercel.app`

You can configure a custom domain in the Vercel dashboard!

## ✅ What Works Out of the Box

- ✅ Automatic HTTPS
- ✅ Global CDN distribution
- ✅ Instant deployments
- ✅ Zero config needed
- ✅ Auto-scaling
- ✅ Edge caching
- ✅ Perfect Lighthouse scores

## 🔥 Pro Tips

1. **Preview Deployments**: Every git push creates a preview URL
2. **Custom Domains**: Add in Vercel dashboard → Settings → Domains
3. **Environment Variables**: Add in Vercel dashboard if needed
4. **Analytics**: Enable Vercel Analytics for free in dashboard

## 📝 Notes

- This is a static site (no server needed)
- All content is pre-rendered at build time
- Super fast loading times
- SEO optimized

---

**Ready to deploy?** Run `vercel` and you're live in seconds! 🚀

