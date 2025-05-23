# Environment Variables for BookSmartly

This document provides detailed information about the environment variables used in the BookSmartly project.

## Required Environment Variables

### Database Connection

```
DATABASE_URL=postgresql://username:password@localhost:5432/booksmartly
```

This variable defines the connection string for the PostgreSQL database. The format is:

```
postgresql://[username]:[password]@[host]:[port]/[database_name]
```

- **username**: Database user
- **password**: Database password
- **host**: Database host (localhost for local development)
- **port**: Database port (default: 5432)
- **database_name**: Database name (booksmartly)

### API Key

```
API_KEY=your_api_key
```

This variable defines the API key used for external services. Replace `your_api_key` with your actual API key.

### Port

```
PORT=3000
```

This variable defines the port that the application will run on. The default is 3000.

### Square Credentials

```
SQUARE_ENVIRONMENT=production
SQUARE_ACCESS_TOKEN=YOUR_SQUARE_ACCESS_TOKEN
SQUARE_LOCATION_ID=YOUR_SQUARE_LOCATION_ID
```

These variables are required for Square integration. Use sandbox credentials for development and production credentials for deployment. **Never commit real secrets.**

### Clerk Authentication

```
VITE_CLERK_PUBLISHABLE_KEY=YOUR_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY=YOUR_CLERK_SECRET_KEY
```

These variables are required for Clerk authentication. See the Hostinger_Migration_Guide for setup instructions.

## Optional Environment Variables

### Fine.dev Endpoint

```
VITE_FINE_ENDPOINT=https://platform.fine.dev/your-project-endpoint
```

This variable defines the endpoint URL for the Fine.dev platform. If not provided, the default endpoint in `src/lib/fine.ts` will be used.

### Node Environment

```
NODE_ENV=development
```

This variable defines the environment mode. Possible values:

- **development**: Development mode with hot reloading and debugging
- **production**: Production mode with optimized build
- **test**: Test mode for running tests

## Environment-Specific Variables

You can create different environment files for different environments:

- **.env**: Default environment variables (never commit secrets)
- **.env.local**: Local overrides (not committed to Git)
- **.env.development**: Development environment variables
- **.env.production**: Production environment variables (never commit secrets)
- **.env.production.example**: Example template for production (use placeholders only)
- **.env.test**: Test environment variables

## Using Environment Variables in the Application

Environment variables are accessed in the application using:

```typescript
// For Vite-specific environment variables (prefixed with VITE_)
import.meta.env.VITE_FINE_ENDPOINT

// For Node.js environment variables (using process.env requires additional setup in Vite)
// Requires @types/node and appropriate Vite configuration
process.env.DATABASE_URL
```

## Setting Up Environment Variables for Deployment

- For production, copy `.env.production.example` to `.env.production` and fill in real values.
- Follow the [Hostinger_Migration_Guide](./Hostinger_Migration_Guide) for secure deployment and secrets management.

## Security Considerations

- **Never commit sensitive environment variables to Git**
- Use .env.local for local development with sensitive values
- Use environment variable management systems for production deployments
- Rotate API keys and credentials regularly