# Railway Deployment

## Build Configuration
- **Builder**: Nixpacks (forced)
- **Node.js**: 18.x
- **Build Command**: npm install && npm run build
- **Start Command**: npm start

## Required Environment Variables
```
NODE_ENV=production
PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
SECRET_KEY=your_secret_key_here
PORT=8080
DEVICE_NAME=UnicaclubBot
```

## Optional Environment Variables
```
WEBHOOK_URL=your_webhook_url
LOG_LEVEL=info
```

## Notes
- Dockerfiles are ignored to force Nixpacks usage
- Chromium is installed via Nix packages
- Build process: install dependencies → build TypeScript → start server
