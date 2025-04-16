# Fine.dev Configuration Guide

This document explains the configuration options for Fine.dev in the BookSmartly project.

## Configuration File

The `fine.config.json` file contains the configuration for Fine.dev. This file is used by Fine.dev to understand how to build, run, and deploy your application.

```json
{
  "name": "BookSmartly",
  "description": "A booking and appointment management application",
  "scripts": {
    "install": "npm install",
    "run": "npm run dev",
    "build": "npm run build"
  },
  "port": 3000,
  "environment": {
    "DATABASE_URL": "postgresql://username:password@localhost:5432/booksmartly",
    "API_KEY": "your_api_key",
    "PORT": "3000"
  },
  "projectInstructions": [
    "BookSmartly is a booking and appointment management application built with React, TypeScript, and Vite.",
    "The application uses the Fine.dev SDK for authentication and database operations.",
    "The project follows a component-based architecture with pages, components, and API services.",
    "The application uses Redux Toolkit for state management.",
    "The UI is built with TailwindCSS and shadcn/ui components.",
    "The application has user and admin sections with different permissions.",
    "The database schema includes users, organizations, appointments, appointment types, and locations."
  ]
}
```

## Configuration Options

### Basic Information

- **name**: The name of your project.
- **description**: A brief description of your project.

### Scripts

The `scripts` section defines the commands that Fine.dev will use to install dependencies, run the application, and build the application.

- **install**: The command to install dependencies.
- **run**: The command to run the application in development mode.
- **build**: The command to build the application for production.

### Port

The `port` option specifies the port that your application will run on in the Fine.dev sandbox environment.

### Environment Variables

The `environment` section defines the environment variables that your application needs to run. These variables will be set in the Fine.dev sandbox environment.

- **DATABASE_URL**: The connection string for your PostgreSQL database.
- **API_KEY**: The API key for external services.
- **PORT**: The port for your application to run on.

### Project Instructions

The `projectInstructions` section provides guidance to the Fine.dev AI about your project. These instructions help the AI understand the structure, architecture, and conventions of your project.

## Using the Configuration

When you import your project into Fine.dev, the AI will use this configuration to:

1. Set up the development environment
2. Install dependencies
3. Run the application
4. Deploy the application

## Updating the Configuration

If you need to update the configuration:

1. Edit the `fine.config.json` file
2. Commit and push the changes to your GitHub repository
3. Fine.dev will automatically use the updated configuration

## Environment-Specific Configuration

You can create environment-specific configurations by using environment variables. For example:

```json
{
  "environment": {
    "DATABASE_URL": {
      "development": "postgresql://username:password@localhost:5432/booksmartly_dev",
      "production": "postgresql://username:password@localhost:5432/booksmartly_prod"
    }
  }
}
```

## Advanced Configuration

For advanced configuration options, refer to the [Fine.dev documentation](https://docs.fine.dev/configuration).