# BookSmartly - Mobile Scheduler App

A mobile-friendly appointment scheduling application built with React, TypeScript, and PostgreSQL.

## Features

- User authentication (login/signup)
- Calendar view to display appointments
- Create, edit, and delete appointments
- Time slot selection with duration options
- Appointment details (title, description, location)
- Mobile-responsive design

## Installation

```bash
# Install dependencies
npm install
```

## Environment Variables

The following environment variables are required:

```
DATABASE_URL=postgresql://username:password@localhost:5432/booksmartly
API_KEY=your_api_key
PORT=3000
```

You can set these in your project settings or in a `.env` file.

## Development

```bash
# Run the development server
npm run dev
```

The application will be available at http://localhost:3000.

## Technologies Used

- React
- TypeScript
- Vite
- Redux Toolkit
- PostgreSQL
- Fine SDK for authentication
- Tailwind CSS
- shadcn/ui components

## Database Schema

The application uses a PostgreSQL database with the following schema:

```sql
CREATE TABLE appointments (
  id SERIAL PRIMARY KEY,
  userId TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  location TEXT,
  startTime TIMESTAMP NOT NULL,
  endTime TIMESTAMP NOT NULL,
  createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_appointments_userId ON appointments(userId);
CREATE INDEX idx_appointments_startTime ON appointments(startTime);