# Deploying BookSmartly to Fine.dev

This guide provides detailed instructions for deploying the BookSmartly application to Fine.dev's hosting platform.

## Prerequisites

Before deploying, ensure you have:

1. A Fine.dev account
2. Your project imported into Fine.dev
3. Configured environment variables
4. Set up your database schema

## Deployment Steps

### 1. Configure Project Settings

First, ensure your project settings are properly configured in Fine.dev:

1. Navigate to "Projects" in the left-hand menu
2. Click the settings icon (gear) on your BookSmartly project
3. Add the following scripts:
   - Install Script: `npm install`
   - Run Script: `npm run dev`
   - App Port: `3000`
4. Add your environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `API_KEY`: Your API key
   - `PORT`: 3000
5. Click Save

### 2. Deploy to a Free Subdomain

For quick testing or sharing prototypes:

1. In your most recent conversation with the Agent, click "Deploy" in the top-right corner
2. Wait for the green light to appear, indicating successful deployment
3. Click "Visit Site" to open your deployed application in a new tab
4. The URL will be: `booksmartly.hellofine.dev` (or similar)

### 3. Deploy to a Custom Domain

For production use with your own domain:

1. Purchase a domain from a provider like GoDaddy, Namecheap, or Google Domains
2. In your Fine.dev conversation, click "Deploy" in the top-right corner
3. Click "Custom Domain"
4. Fine.dev will display DNS variables (A record and TXT record)
5. Log in to your domain provider's dashboard
6. Navigate to the DNS settings section
7. Add the A record and TXT record provided by Fine.dev
8. Return to Fine.dev and click "Verify"
9. Wait for verification (can take up to 24 hours, but usually much faster)
10. Once verified, your site will be accessible at your custom domain

## Redeploying After Changes

To update your deployed application after making changes:

1. Make your changes in Fine.dev or push them to your GitHub repository
2. In your Fine.dev conversation, click "Deploy" in the top-right corner
3. Click "Redeploy"
4. Wait for the deployment to complete
5. Your changes will be live on both your subdomain and custom domain (if configured)

## Monitoring Your Deployment

Fine.dev provides basic monitoring for your deployed application:

1. In the deployment panel, you can see the status of your deployment
2. If there are any issues, error messages will be displayed
3. You can view logs by clicking on the deployment status

## Troubleshooting

If you encounter issues with your deployment:

### Blank Screen

If you see a blank white screen:

1. Check the browser console for errors
2. Verify that your environment variables are correctly set
3. Ensure your database is properly configured
4. Check that your routes are correctly defined

### Database Connection Issues

If you're having trouble connecting to the database:

1. Verify your `DATABASE_URL` environment variable
2. Check that your database schema is correctly set up
3. Ensure your database user has the necessary permissions

### Custom Domain Not Working

If your custom domain isn't working:

1. Verify that the DNS records are correctly set up
2. Check that the verification status in Fine.dev is "Verified"
3. Remember that DNS propagation can take up to 24 hours

## Best Practices

For optimal deployment performance:

1. Minimize bundle size by removing unused dependencies
2. Optimize images and assets
3. Use code splitting to improve load times
4. Set up proper caching headers
5. Implement SEO best practices as described in the Fine.dev documentation

## Additional Resources

- [Fine.dev Deployment Documentation](https://docs.fine.dev/deployment)
- [Fine.dev Environment Variables Guide](https://docs.fine.dev/environment-variables)
- [Fine.dev Database Configuration](https://docs.fine.dev/database)