# BookSmartly Documentation

Welcome to the BookSmartly documentation. This documentation provides information about using BookSmartly with Fine.dev.

## Table of Contents

- [Deployment Guide](deployment.md): Instructions for deploying BookSmartly to Fine.dev
- [Fine.dev AI Guide](fine-ai-guide.md): Best practices for using Fine.dev AI with BookSmartly
- [Fine.dev Configuration](fine-config.md): Documentation for the Fine.dev configuration options
- [Fine.dev Configuration File](fine.config.json): Example configuration file for Fine.dev
- [Environment Variables](env-example.md): Detailed information about environment variables

## Getting Started

BookSmartly is a booking and appointment management application built with React, TypeScript, and Vite. It's optimized for deployment and development with Fine.dev.

To get started with BookSmartly and Fine.dev:

1. Import the project from GitHub to Fine.dev
2. Configure your environment variables
3. Set up your database schema
4. Start developing with Fine.dev AI

For more detailed instructions, see the [README.md](../README.md) file in the root directory.

## Fine.dev Integration

BookSmartly uses the Fine.dev SDK for:

1. **Authentication**: User sign-up, sign-in, and session management
2. **Database Operations**: CRUD operations for appointments, users, and other entities
3. **Deployment**: Easy deployment to Fine.dev's hosting platform

The integration is configured in `src/lib/fine.ts` and uses environment variables for the Fine.dev endpoint URL.

## Project Structure

- `src/api`: API service functions for data fetching
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions and type definitions
- `src/pages`: Page components
- `src/redux`: Redux store and slices
- `docs`: Documentation for Fine.dev integration and deployment

## Database Schema

BookSmartly uses Fine.dev's built-in PostgreSQL database. The schema includes:

- **users**: User accounts and authentication
- **organizations**: Organizations that users belong to
- **user_roles**: User roles and permissions
- **appointments**: Appointment data
- **appointment_types**: Types of appointments
- **locations**: Locations for appointments

The schema is defined in the `fine/migrations` directory.

## Environment Variables

The project requires the following environment variables:

```
DATABASE_URL=postgresql://username:password@localhost:5432/booksmartly
API_KEY=your_api_key
PORT=3000
```

These can be configured in the Fine.dev Project Settings. For more detailed information about environment variables, see the [Environment Variables](env-example.md) documentation.

## Contributing

When contributing to this project, please follow the existing code style and conventions. Fine.dev AI can help ensure your contributions match the project's standards.