# Azure Web App Deployment Guide

## ✅ Project Configured for Azure Web Apps (Node 24 LTS)

This project is now ready to deploy to **Azure Web Apps** as a unified full-stack application.

## Architecture

- **Frontend**: React + Vite + TypeScript (builds to `/dist`)
- **Backend**: Node.js/Express API (in `/server`)
- **Database**: Azure SQL Server
- **Node Version**: 24 LTS

## Deployment Files Created

1. **`web.config`** - IIS configuration for Azure Web Apps
2. **`.deployment`** - Tells Azure to build during deployment
3. **Updated `package.json`** - Added deployment scripts
4. **Updated `server/server.js`** - Now serves static frontend files

## Azure Web App Configuration

### 1. Create Azure Web App

```bash
# Using Azure CLI
az webapp create \
  --resource-group <your-resource-group> \
  --plan <your-app-service-plan> \
  --name <your-app-name> \
  --runtime "NODE:24-lts"
```

### 2. Configure Application Settings

In Azure Portal → Your Web App → Configuration → Application Settings, add:

```
PORT=8080
NODE_ENV=production
FRONTEND_URL=https://<your-app-name>.azurewebsites.net
JWT_SECRET=<your-secure-secret>
JWT_EXPIRES_IN=7d
DB_SERVER=deiafrica.database.windows.net,1433
DB_DATABASE=deiafrica
DB_USER=admin1
DB_PASSWORD=deiafrica123$
DB_PORT=1433
EMAIL_USER=jaredmoodley1212@gmail.com
EMAIL_PASSWORD=<your-email-app-password>
```

⚠️ **Important**: Use Azure Key Vault or App Settings for secrets in production!

### 3. Set Startup Command

In Azure Portal → Configuration → General Settings:

**Startup Command**: `node server/server.js`

### 4. Configure Node Version

In Azure Portal → Configuration → General Settings:

**Runtime stack**: Node 24 LTS

### 5. Enable Build Automation

In Azure Portal → Configuration → Application Settings, verify:

```
SCM_DO_BUILD_DURING_DEPLOYMENT=true
WEBSITE_NODE_DEFAULT_VERSION=24-lts
```

## Deployment Options

### Option A: Deploy via Azure Portal (Easiest)

1. Go to Azure Portal → Your Web App → Deployment Center
2. Choose source: GitHub, Local Git, or Azure DevOps
3. Configure the branch (`main` or `feature/coderabbit-setup`)
4. Azure will automatically build and deploy

### Option B: Deploy via GitHub Actions

Create `.github/workflows/azure-webapps-node.yml`:

```yaml
name: Deploy to Azure Web App

on:
  push:
    branches:
      - main
  workflow_dispatch:

env:
  AZURE_WEBAPP_NAME: your-app-name
  NODE_VERSION: '24.x'

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm run install-all
      
      - name: Build frontend
        run: npm run build
      
      - name: Upload artifact
        uses: actions/upload-artifact@v3
        with:
          name: node-app
          path: |
            .
            !node_modules/
            !server/node_modules/

  deploy:
    runs-on: ubuntu-latest
    needs: build
    environment:
      name: 'Production'
      url: ${{ steps.deploy.outputs.webapp-url }}
    
    steps:
      - name: Download artifact
        uses: actions/download-artifact@v3
        with:
          name: node-app
      
      - name: Install production dependencies
        run: |
          npm ci --production
          cd server && npm ci --production
      
      - name: Deploy to Azure Web App
        id: deploy
        uses: azure/webapps-deploy@v2
        with:
          app-name: ${{ env.AZURE_WEBAPP_NAME }}
          publish-profile: ${{ secrets.AZURE_WEBAPP_PUBLISH_PROFILE }}
          package: .
```

### Option C: Deploy via Azure CLI

```bash
# Build locally
npm run build-all

# Deploy via ZIP
az webapp deployment source config-zip \
  --resource-group <your-resource-group> \
  --name <your-app-name> \
  --src deploy.zip
```

### Option D: Deploy via Git

```bash
# Add Azure remote
git remote add azure https://<deployment-username>@<your-app-name>.scm.azurewebsites.net/<your-app-name>.git

# Push to Azure
git push azure main
```

## Environment Variables

Move sensitive data from `.env` to Azure App Settings:

1. Go to Azure Portal → Your Web App → Configuration
2. Add all variables from your `.env` file
3. **Delete or gitignore your `.env` file** to prevent committing secrets

## Post-Deployment Verification

1. **Health Check**: `https://<your-app-name>.azurewebsites.net/health`
2. **Frontend**: `https://<your-app-name>.azurewebsites.net`
3. **API**: `https://<your-app-name>.azurewebsites.net/api/auth/demo-login`

## Troubleshooting

### Check Logs

```bash
# Stream logs
az webapp log tail --name <your-app-name> --resource-group <your-resource-group>

# Download logs
az webapp log download --name <your-app-name> --resource-group <your-resource-group>
```

Or in Azure Portal → Your Web App → Log Stream

### Common Issues

1. **Build fails**: Check Node version is 24 LTS
2. **Static files not loading**: Verify `dist` folder exists after build
3. **API routes 404**: Check startup command is `node server/server.js`
4. **Database connection fails**: Verify connection string and firewall rules
5. **CORS errors**: Update `FRONTEND_URL` in App Settings

## Local Testing

Test the production build locally:

```bash
# Build everything
npm run build-all

# Start server (serves both API and frontend)
npm start

# Visit http://localhost:5000
```

## Database Firewall

Add your Azure Web App's outbound IP to Azure SQL Server firewall:

1. Azure Portal → Your Web App → Properties → Outbound IP addresses
2. Azure Portal → SQL Server → Firewalls and virtual networks
3. Add each outbound IP

Or allow Azure services:
- Enable "Allow Azure services and resources to access this server"

## Monitoring

- **Application Insights**: Enable for performance monitoring
- **Metrics**: CPU, Memory, HTTP requests
- **Alerts**: Set up for errors and high resource usage

## Security Checklist

- [ ] Move all secrets to Azure Key Vault or App Settings
- [ ] Enable HTTPS only
- [ ] Configure custom domain and SSL
- [ ] Set up managed identity for database access
- [ ] Enable Application Insights
- [ ] Configure CORS properly
- [ ] Review security headers in `web.config`
- [ ] Enable Azure DDoS protection
- [ ] Set up Azure Front Door (optional)

## Scaling

- **Scale Up**: Increase VM size (Basic, Standard, Premium)
- **Scale Out**: Add more instances (auto-scaling)
- Recommended: Standard S1 or higher for production

---

**Your app is ready to deploy!** 🚀

Choose your deployment method above and follow the steps.
