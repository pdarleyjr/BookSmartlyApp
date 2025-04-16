# BookSmartly

BookSmartly is a booking and appointment management application built with React, TypeScript, and Vite. It's optimized for deployment and development with Fine.dev.

## Features

- User authentication and authorization
- Appointment creation, editing, and management
- Calendar view for appointments
- Analytics dashboards
- Organization management
- Admin controls for users, appointment types, and locations

## Tech Stack

- React + TypeScript
- Vite
- Redux Toolkit for state management
- TailwindCSS for styling
- shadcn/ui components
- Fine.dev SDK for authentication and database operations

## Using with Fine.dev

BookSmartly is configured to work seamlessly with Fine.dev's AI-powered development platform.

### Project Setup

1. Import the project from GitHub to Fine.dev:
   - Go to "Projects" in the left-hand menu
   - Click "Import from GitHub"
   - Select the BookSmartly repository

2. Fine.dev will automatically index the codebase and create a knowledge graph for the AI to understand the project structure.

### Environment Variables

The project requires the following environment variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/booksmartly
API_KEY=your_api_key
PORT=3000
```

These can be configured in the Fine.dev Project Settings.

### Database Setup

BookSmartly uses Fine.dev's built-in PostgreSQL database. The schema is defined in the `fine/migrations` directory.

### Development with Fine.dev

1. Use the AI Palette to ask questions about the codebase or request changes.
2. Use the Implement feature to make repository-wide changes.
3. Use the AI Sandbox to test changes before deploying.

### Deployment

To deploy the application:

1. In your conversation with the Agent, click "Deploy" in the top-right corner.
2. For a free subdomain, wait for the green light and click "Visit Site".
3. For a custom domain:
   - Click "Custom Domain"
   - Copy and paste the DNS records to your domain provider
   - Click "Verify" in Fine.dev

For detailed deployment instructions, see the [deployment guide](docs/deployment.md).

## Project Structure

- `src/api`: API service functions for data fetching
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions and type definitions
- `src/pages`: Page components
- `src/redux`: Redux store and slices
- `docs`: Documentation for Fine.dev integration and deployment

## Documentation

The project includes detailed documentation in the `docs` directory:

- [Deployment Guide](docs/deployment.md): Instructions for deploying the application to Fine.dev
- [Fine.dev AI Guide](docs/fine-ai-guide.md): Best practices for using Fine.dev AI with BookSmartly
- [Fine.dev Configuration](docs/fine-config.md): Documentation for the Fine.dev configuration options

## Fine.dev Integration

BookSmartly uses the Fine.dev SDK for:

1. **Authentication**: User sign-up, sign-in, and session management
2. **Database Operations**: CRUD operations for appointments, users, and other entities
3. **Deployment**: Easy deployment to Fine.dev's hosting platform

The integration is configured in `src/lib/fine.ts` and uses environment variables for the Fine.dev endpoint URL.

## Using Fine.dev AI Features

### Adding New Features

To add a new feature using Fine.dev AI:

1. Start a new conversation with the Agent
2. Describe the feature you want to add, for example:
   ```
   Add a feature to allow users to export their appointments to a CSV file
   ```
3. The Agent will create an implementation plan and make the necessary changes
4. Review the changes and click "Run" to test in the sandbox
5. When satisfied, click "Create PR" to create a pull request

### Fixing Issues

To fix issues using Fine.dev AI:

1. Start a new conversation with the Agent
2. Describe the issue, for example:
   ```
   Fix the issue where the calendar doesn't update when a new appointment is created
   ```
3. The Agent will analyze the issue and propose a solution
4. Review the changes and test in the sandbox
5. Create a PR with the fix

### Getting Help

To get help understanding the codebase:

1. Use the Ask feature to ask questions about specific parts of the code
2. Tag relevant files using the @ symbol, for example:
   ```
   How does the authentication work in @src/lib/fine.ts?
   ```

## Local Development

To run the project locally:

1. Clone the repository
2. Copy `.env.example` to `.env` and update the values
3. Install dependencies: `npm install`
4. Start the development server: `npm run dev`
5. Open http://localhost:3000 in your browser

## Contributing

When contributing to this project, please follow the existing code style and conventions. Fine.dev AI can help ensure your contributions match the project's standards.