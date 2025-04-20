# BookSmartly with Fine.dev and OpenAI Integration

BookSmartly is an appointment scheduling and management application built with React, TypeScript, and Vite. This version includes AI-powered features using OpenAI's GPT models integrated with Fine.dev.

## Features

- **AI Assistant**: Chat with an AI assistant to schedule appointments, get information about your calendar, and answer questions about BookSmartly
- **AI-Powered Analytics**: Get insights about your business performance through natural language queries
- **Calendar Management**: View and manage appointments in day, week, and month views
- **Client Management**: Manage client information and import clients from CSV files
- **User Management**: Admin tools for managing users and permissions
- **Organization Management**: Support for multiple organizations and locations

## Getting Started

### Prerequisites

- Node.js 16+
- npm or yarn
- PostgreSQL database
- OpenAI API key

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/booksmartly.git
   cd booksmartly
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. **Create your environment file from the canonical template:**
   ```
   cp .env.production.example .env
   ```
   - For production deployments, use `.env.production` instead of `.env`.

4. Update your environment file with your database connection string, OpenAI API key, and any other required secrets. **Never commit real secrets to the repository.**

5. Start the development server:
   ```
   npm run dev
   ```

> **Note:**  
> - `.env.production.example` is the **only** template you should use for environment variables.  
> - All other example env files have been removed to avoid confusion.  
> - For documentation on environment variables, see [docs/env-example.md](docs/env-example.md).  
> - For deployment and secrets best practices, see [docs/Hostinger_Migration_Guide](docs/Hostinger_Migration_Guide).

## AI Features

### OpenAI Integration

BookSmartly uses OpenAI's GPT models to provide AI-powered features:

1. **Chat Assistant**: The AI assistant can help users with:
   - Scheduling appointments
   - Checking calendar availability
   - Getting information about clients
   - Answering questions about BookSmartly features

2. **Financial Analytics**: The AI can analyze appointment and revenue data to provide insights:
   - Revenue by location
   - Revenue by user/staff member
   - Performance over time
   - Trends and patterns

### Function Calling

The OpenAI integration uses function calling to perform actions within BookSmartly:

- `createAppointment`: Schedule a new appointment
- `cancelAppointment`: Cancel an existing appointment
- `rescheduleAppointment`: Reschedule an appointment to a new time
- `getFinancialAnalytics`: Get financial analytics data
- `getAppInfo`: Get information about BookSmartly features and routes

## Fine.dev Integration

BookSmartly is built to work seamlessly with Fine.dev:

- **Authentication**: User authentication and session management
- **Database**: PostgreSQL database for storing application data
- **Deployment**: Easy deployment to Fine.dev's hosting platform

## Project Structure

- `src/api`: API service functions for data fetching
- `src/components`: Reusable UI components
- `src/hooks`: Custom React hooks
- `src/lib`: Utility functions and type definitions
- `src/pages`: Page components
- `src/services`: Service functions for external APIs (OpenAI)

## Environment Variables

All environment variables must be defined in your `.env` or `.env.production` file, based on the `.env.production.example` template.  
See [docs/env-example.md](docs/env-example.md) for detailed documentation.

## License

This project is licensed under the MIT License - see the LICENSE file for details.