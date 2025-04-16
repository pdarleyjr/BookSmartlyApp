# BookSmartly - Mobile Scheduler App

A mobile-friendly appointment scheduling application built with React, TypeScript, and SQLite.

## Features

- User authentication (login/signup)
- Calendar view to display appointments
- Create, edit, and delete appointments
- Time slot selection with duration options
- Appointment details (title, description, location)
- Mobile-responsive design
- Organization management with locations and appointment types
- Admin dashboard for managing users and settings

## Installation

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

## Project Structure

- `/src/components` - Reusable UI components
- `/src/pages` - Application pages
- `/src/api` - API service functions
- `/src/redux` - Redux store and slices
- `/src/hooks` - Custom React hooks
- `/src/lib` - Utility functions and types
- `/fine/migrations` - Database migrations

## Technologies Used

- React
- TypeScript
- Vite
- Redux Toolkit
- SQLite (via Fine SDK)
- Tailwind CSS
- shadcn/ui components

## Admin Features

### Organization Settings

- **Appointment Types**: Configure service types with duration and pricing
- **Locations**: Manage service locations
- **User Management**: Add and manage organization users

### User Roles

- **Super Admin**: Can manage all organizations and users
- **Organization Admin**: Can manage their organization's settings and users
- **User**: Can create and manage appointments

## Development

The application is set up with:

- ESLint and Prettier for code formatting
- TypeScript for type safety
- Tailwind CSS for styling
- Redux for state management
- React Router for navigation

## License

This project is licensed under the MIT License.