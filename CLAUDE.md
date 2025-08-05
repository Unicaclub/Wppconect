# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a fork of WPPConnect Server maintained by Unicaclub - a WhatsApp Web automation API server built with Node.js, TypeScript, and Express. The server provides RESTful endpoints for WhatsApp message automation, session management, and multi-client support.

**Key Technologies:**
- TypeScript/Node.js 18+
- Express.js with Socket.IO
- WPPConnect library for WhatsApp automation
- Puppeteer for browser automation
- JWT-based authentication
- Multi-database support (MongoDB, Redis, File-based)
- AWS S3 integration for media storage

## Development Commands

### Core Development
```bash
# Install dependencies
npm install

# Start development server (recommended)
npm run dev

# Build the project
npm run build

# Start production server
npm start

# Run tests
npm test

# Lint code
npm run lint
```

### Build Variations
```bash
# Full build with types and transpilation
npm run build

# Simple build (faster, for development)
npm run build:simple

# Railway deployment build
npm run railway:build
```

### Other Commands
```bash
# Generate Swagger documentation
npm run docs

# Run license checks
npm run license:check

# Generate changelog
npm run changelog:preview
```

## Project Structure

### Main Directories
- `src/` - TypeScript source code
- `dist/` - Compiled JavaScript output
- `tokens/` - Session authentication tokens
- `userDataDir/` - Puppeteer user data
- `uploads/` - File upload directory
- `WhatsAppImages/` - Static file serving

### Source Code Architecture

**Controllers** (`src/controller/`):
- `sessionController.ts` - Session management (start/stop/qr-code)
- `messageController.ts` - Message sending and handling
- `deviceController.ts` - Device and chat operations
- `groupController.ts` - WhatsApp group management
- `catalogController.ts` - Business catalog features
- `communityController.ts` - Community features
- `statusController.ts` - Status/story management

**Core Infrastructure**:
- `src/config.ts` - Main configuration with environment variable support
- `src/index.ts` - Server initialization
- `src/server.ts` - Express server entry point
- `src/routes/index.ts` - Complete API route definitions

**Utilities** (`src/util/`):
- `tokenStore/` - Token storage implementations (File/MongoDB/Redis/Firebase)
- `db/` - Database connection utilities
- `logger.ts` - Winston logging configuration
- `sessionUtil.ts` - Session management utilities

**Middleware** (`src/middleware/`):
- `auth.ts` - JWT token verification
- `statusConnection.ts` - Connection status checking
- `healthCheck.ts` - Kubernetes health checks
- `instrumentation.ts` - Prometheus metrics

## Configuration

The server uses `src/config.ts` for configuration, which supports environment variables:

### Key Configuration Areas
- **Authentication**: `SECRET_KEY` for JWT tokens
- **Server**: `HOST`, `PORT`, `DEVICE_NAME`
- **Database**: MongoDB/Redis connection settings
- **Webhooks**: URL and event configuration
- **AWS S3**: Media storage configuration
- **Logging**: Level and output configuration

### Environment Variables
All configuration can be overridden with environment variables (see `src/config.ts` for complete list).

## API Architecture

### Authentication Flow
1. Generate token: `POST /api/:session/:secretkey/generate-token`
2. Use token in `Authorization: Bearer {token}` header
3. All API endpoints require authentication except token generation

### Session Management
- Sessions are isolated WhatsApp Web instances
- Each session has independent authentication and state
- Sessions can be started/stopped individually
- QR codes are generated per session

### Route Pattern
```
/api/:session/:endpoint - Session-specific operations
/api/:secretkey/:endpoint - Global operations
```

## Testing

### Running Tests
```bash
npm test
```

### Test Structure
- Tests located in `src/tests/`
- Uses Jest testing framework
- Currently minimal test coverage - add tests for new functionality

## Deployment

### Docker Support
Multiple Dockerfile configurations available:
- `Dockerfile` - Production build
- `Dockerfile.dev` - Development build
- `Dockerfile.simple` - Minimal build
- `Dockerfile.ubuntu` - Ubuntu-based build

### Railway Deployment
- Uses `railway.toml` configuration
- Build command: `npm run railway:build`
- Start command: `npm run railway:start`

### Environment Setup
Required for deployment:
- Node.js 18+
- Chrome/Chromium for Puppeteer
- Optional: MongoDB, Redis for token storage
- Optional: AWS S3 for media storage

## Key Development Patterns

### Controller Structure
Controllers follow the pattern:
```typescript
export async function handlerName(req: Request, res: Response) {
  try {
    const client = req.client; // WhatsApp client instance
    const result = await client.someOperation();
    return res.status(200).json({ status: 'success', response: result });
  } catch (error) {
    return res.status(500).json({ status: 'error', message: error.message });
  }
}
```

### Session Management
- Sessions are managed through `sessionUtil.ts`
- Each session maintains its own WhatsApp Web instance
- Token storage is configurable (file/mongodb/redis)

### Error Handling
- Consistent error response format
- Logging through Winston logger
- Status codes follow HTTP standards

## Fork-Specific Changes

This is a Unicaclub fork with the following modifications:
- Package name: `@unicaclub/wppconnect-server`
- Branding updates throughout codebase
- Repository references updated to Unicaclub/Wppconect
- See `FORK_INFO.md` for detailed change history

## Advanced Automation System

### New Services Added
- **AutomationEngine** (`src/services/AutomationEngine.ts`) - Core automation processing
- **QueueService** (`src/services/QueueService.ts`) - Job scheduling and delays
- **ContactSegmentationService** (`src/services/ContactSegmentationService.ts`) - Contact segmentation
- **MessageTemplateService** (`src/services/MessageTemplateService.ts`) - Dynamic message templates
- **AnalyticsService** (`src/services/AnalyticsService.ts`) - Performance metrics and analytics
- **ChannelService** (`src/services/ChannelService.ts`) - Multi-channel messaging support

### Database Models
- **AutomationModels** (`src/models/AutomationModels.ts`) - MongoDB schemas for all automation entities
- **AutomationTypes** (`src/types/AutomationTypes.ts`) - TypeScript interfaces and types

### Key Features Implemented
1. **Advanced Automations**: Keyword triggers, scheduled actions, conditional logic
2. **Queue System**: Background job processing with delays and retry logic  
3. **Contact Segmentation**: Dynamic contact filtering and categorization
4. **Message Templates**: Variable substitution with dynamic content (`{{name}}`, `{{date}}`, etc.)
5. **Analytics Dashboard**: Comprehensive metrics and performance tracking
6. **Multi-channel Support**: WhatsApp, Telegram, Instagram, SMS, Email
7. **Webhook Integration**: Support for multiple webhook formats (Z-API, native WhatsApp, etc.)

### Automation API Endpoints
```
# Automations
POST/GET /api/:userId/automations
GET/PUT/DELETE /api/automations/:automationId

# Templates  
POST/GET /api/:userId/templates

# Segments
POST/GET /api/:userId/segments

# Analytics
GET /api/:userId/analytics/dashboard
GET /api/automations/:automationId/analytics

# Webhooks
POST /api/webhook/whatsapp
POST /api/webhook/zapi
POST /api/webhook/:userId/:sessionId/telegram
```

### Integration Requirements
- MongoDB database for automation storage
- Queue processing for delayed actions
- Webhook endpoints for multi-channel message reception
- AutomationEngine integration with existing WhatsApp clients

### Development Commands for Automation System
```bash
# Initialize automation system (requires MongoDB)
npm run dev

# Test automation processing
curl -X POST "/api/automations/:id/test"

# Monitor queue status  
curl -X GET "/api/queue/stats"
```

## Development Notes

- Use TypeScript strict mode
- Follow existing code patterns for consistency
- Add proper error handling and logging
- Update Swagger documentation for new endpoints
- Test with multiple sessions when possible
- Consider webhook implications for new features
- **Automation System**: Initialize MongoDB connection before using automation features
- **Queue Processing**: QueueService runs automatically with 5-second intervals
- **Multi-channel**: Configure channel credentials in environment variables
- **Analytics**: Use AnalyticsService.trackEvent() to record custom metrics