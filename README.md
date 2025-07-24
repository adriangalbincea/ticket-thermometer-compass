# WiseServe Feedback System

A customer feedback management system built with React, TypeScript, and Supabase.

## Project info

**URL**: https://lovable.dev/projects/d5b1966f-cda2-4519-86ff-1877fc3575ac

## Technology Stack

This project is built with:

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS, shadcn-ui components
- **Backend**: Supabase (Database, Auth, Edge Functions)
- **Deployment**: Multiple options (Vercel, Netlify, self-hosted)

## Features

- 🔐 User authentication and role-based access
- 📊 Real-time feedback dashboard with interactive charts
- 🔗 Secure feedback link generation with expiration
- 📱 Responsive design for all devices
- 🎨 Modern UI with WiseServe branding
- 📈 Analytics and feedback filtering
- 👥 User management system

## Quick Start (Development)

### Prerequisites

- Node.js 18+ and npm ([install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- Supabase account for backend services

### Local Development

```sh
# Clone the repository
git clone <YOUR_GIT_URL>
cd <YOUR_PROJECT_NAME>

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

## Production Deployment

### Option 1: Vercel (Recommended)

1. **Connect to Vercel**:
   ```sh
   npm install -g vercel
   vercel login
   vercel
   ```

2. **Environment Variables**: Set in Vercel dashboard:
   - `VITE_SUPABASE_URL`: Your Supabase project URL
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key

3. **Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `dist`

### Option 2: Netlify

1. **Deploy via Git**:
   - Connect your GitHub repository to Netlify
   - Set build command: `npm run build`
   - Set publish directory: `dist`

2. **Environment Variables**: Add in Netlify dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`

### Option 3: Self-Hosted

1. **Build the application**:
   ```sh
   npm run build
   ```

2. **Serve static files**:
   ```sh
   # Using serve
   npm install -g serve
   serve -s dist -p 3000
   
   # Using nginx (recommended for production)
   # Copy dist/ contents to your nginx web root
   ```

3. **Nginx Configuration** (example):
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       root /path/to/dist;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
       
       # Security headers
       add_header X-Frame-Options "SAMEORIGIN" always;
       add_header X-Content-Type-Options "nosniff" always;
       add_header Referrer-Policy "no-referrer-when-downgrade" always;
   }
   ```

### Option 4: Docker

1. **Create Dockerfile**:
   ```dockerfile
   FROM node:18-alpine AS builder
   WORKDIR /app
   COPY package*.json ./
   RUN npm ci
   COPY . .
   RUN npm run build
   
   FROM nginx:alpine
   COPY --from=builder /app/dist /usr/share/nginx/html
   COPY nginx.conf /etc/nginx/conf.d/default.conf
   EXPOSE 80
   CMD ["nginx", "-g", "daemon off;"]
   ```

2. **Build and run**:
   ```sh
   docker build -t wiseserve-feedback .
   docker run -p 80:80 wiseserve-feedback
   ```

## Environment Configuration

### Required Environment Variables

Create a `.env.local` file for development or set these in your deployment platform:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### Supabase Setup

1. **Database**: Tables are automatically created via migrations
2. **Authentication**: Configure providers in Supabase dashboard
3. **Row Level Security**: Policies are set up for secure data access
4. **Edge Functions**: Deployed automatically with the application

## Security Considerations

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Secure feedback link generation with expiration
- ✅ Role-based access control
- ✅ Input validation and sanitization
- ⚠️ Review Supabase security settings before production

## Performance Optimization

- 🚀 Static site generation with Vite
- 📦 Code splitting and lazy loading
- 🗜️ Asset optimization and compression
- 📱 Responsive images and modern formats
- ⚡ Edge function caching

## Monitoring & Analytics

- 📊 Built-in feedback analytics dashboard
- 🔍 Real-time data filtering and charts
- 📈 Export functionality for reports
- 🚨 Error tracking via console logs

## How to Edit This Code

### Use Lovable (Recommended)

Visit the [Lovable Project](https://lovable.dev/projects/d5b1966f-cda2-4519-86ff-1877fc3575ac) and start prompting. Changes made via Lovable will be committed automatically to this repo.

### Use Your Preferred IDE

Clone this repo and push changes. Pushed changes will also be reflected in Lovable.

### GitHub Codespaces

- Navigate to the main page of your repository
- Click on the "Code" button → "Codespaces" tab → "New codespace"
- Edit files directly within the Codespace

## Deployment via Lovable

Simply open [Lovable](https://lovable.dev/projects/d5b1966f-cda2-4519-86ff-1877fc3575ac) and click on Share → Publish.

## Custom Domain

You can connect a custom domain by navigating to Project > Settings > Domains in Lovable.

Read more: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)

## Support

For technical support or questions about the WiseServe Feedback System, please contact the development team or refer to the Lovable documentation.
