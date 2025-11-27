# Deployment Guide

This guide covers how to deploy the MCP-UI Calculator to various platforms.

## Prerequisites

- Node.js 18+ and npm installed
- Project built locally and tested
- Public URL for ChatGPT integration

## Deployment Options

### 1. Heroku (Free tier available)

```bash
# Install Heroku CLI
brew tap heroku/brew && brew install heroku

# Login to Heroku
heroku login

# Create a new app
heroku create mcp-calculator-app

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

Update your ChatGPT configuration with:
```
https://mcp-calculator-app.herokuapp.com/mcp
```

### 2. Railway.app (Recommended - Free for first $5)

1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Select this repository
4. Railway auto-detects Node.js and deploys
5. Get your public URL from the Railway dashboard

Update ChatGPT with:
```
https://your-railway-domain.up.railway.app/mcp
```

### 3. Vercel (Recommended)

Vercel can run Node.js servers via serverless functions:

```bash
npm install -g vercel
vercel
```

### 4. DigitalOcean App Platform

1. Go to [digitalocean.com/products/app-platform](https://www.digitalocean.com/products/app-platform)
2. Connect GitHub
3. Select "Node.js" runtime
4. Set build command: `npm run build`
5. Set start command: `npm start`

### 5. Docker + Any Cloud

#### Build Docker image:

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/server.js"]
```

Build and run:
```bash
docker build -t mcp-calculator .
docker run -p 3000:3000 mcp-calculator
```

Then push to:
- Docker Hub
- AWS ECR
- Google Container Registry
- Azure Container Registry

### 6. AWS Lambda + API Gateway

For production AWS deployment, use:
- **AWS Lambda** for the function
- **API Gateway** for HTTP endpoint
- **CloudWatch** for logs

Use the serverless framework:
```bash
npm install -g serverless
serverless deploy
```

## Environment Variables

If you need environment variables (for production):

1. Create a `.env` file (not committed to git):
```
PORT=3000
NODE_ENV=production
LOG_LEVEL=info
```

2. Update `server.ts` to use:
```typescript
const PORT = process.env.PORT || 3000;
```

## Monitoring

### Log Aggregation

For production, consider:
- **Heroku Logs**: `heroku logs --tail`
- **Railway Logs**: Dashboard > Logs
- **Vercel Analytics**: Dashboard
- **DataDog**: Integration available
- **LogRocket**: Session replay + logs

### Uptime Monitoring

Set up monitors for `/health` endpoint:
- **UptimeRobot**: Free uptime monitoring
- **Pingdom**: Uptime + performance
- **Datadog**: Full APM suite

```bash
# Monitor the health endpoint
curl https://your-domain.com/health
```

## Performance Optimization

### Before Deploying to Production

1. **Minify HTML in calculator.ts**
   - Remove extra whitespace
   - Minify inline styles and scripts

2. **Enable gzip compression**
```typescript
import compression from 'compression';
app.use(compression());
```

3. **Add response caching**
```typescript
app.get('/calculator', (req, res) => {
  res.set('Cache-Control', 'public, max-age=3600');
  res.send(renderCalculatorWidget());
});
```

4. **Rate limiting**
```typescript
import rateLimit from 'express-rate-limit';
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100 });
app.use('/mcp', limiter);
```

## Security Considerations

### 1. HTTPS Only
- All production deployments must use HTTPS
- Most platforms (Heroku, Railway, Vercel) provide free HTTPS

### 2. API Key Protection (Optional)
```typescript
app.use((req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  if (apiKey !== process.env.API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  next();
});
```

### 3. CORS Configuration
Current setup allows all origins. For production:
```typescript
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(','),
  credentials: true,
}));
```

### 4. Content Security Policy
```typescript
app.use((req, res, next) => {
  res.set('Content-Security-Policy', "default-src 'self'; script-src 'self' 'unsafe-inline'");
  next();
});
```

## Rollback Procedure

### Heroku
```bash
heroku releases
heroku rollback v2  # Rollback to previous version
```

### Railway
Railway automatically keeps version history - rollback via dashboard

### GitHub + CD/CI
Revert commit and push:
```bash
git revert <commit-hash>
git push
```

## Health Check Setup

All deployed instances should monitor:
```bash
GET /health

Response:
{
  "status": "ok",
  "service": "calculator-mcp",
  "version": "1.0.0",
  "timestamp": "2025-11-27T12:00:00Z"
}
```

Set up alerts if health check fails 3 times in a row.

---

**Ready to deploy? Choose your platform above!** 🚀
