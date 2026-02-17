# Chuma-Benz Mechatronic - Setup Guide

Welcome to Mechanic Manager! This is a secure web application for managing your mechanic shop's customer, vehicle, and service records.

## Quick Start

### 1. Installation
```bash
# Install dependencies
pnpm install

# Run development server
pnpm dev
```

The application will be available at `http://localhost:3000`

### 2. Database Setup

The application uses Supabase for authentication and data storage. You'll need to set up the database tables:

#### Option A: Using the Setup Wizard (Recommended)
1. Visit `/setup` in your browser
2. Follow the on-screen instructions
3. Copy the SQL and run it in your Supabase SQL Editor
4. Click "Verify Tables" when done

#### Option B: Manual Setup
1. Go to your Supabase Project Dashboard
2. Navigate to "SQL Editor"
3. Create a new query and paste this SQL:

```sql
-- Create customers table
CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  plate_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create services table
CREATE TABLE IF NOT EXISTS services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vehicle_id UUID NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  description TEXT,
  submission_date TIMESTAMP WITH TIME ZONE NOT NULL,
  collection_date TIMESTAMP WITH TIME ZONE,
  amount_paid DECIMAL(10, 2),
  status TEXT DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_services_customer_id ON services(customer_id);
CREATE INDEX IF NOT EXISTS idx_services_vehicle_id ON services(vehicle_id);
```

4. Execute the query

### 3. Create Your First Account

1. Go to `/auth/login` or just visit the home page
2. Click "Sign up" to create a new account
3. Enter your email and password
4. Click "Sign up"
5. You'll be logged in and redirected to the dashboard

## Features

### Dashboard
- View key statistics: total customers, vehicles, and services
- Quick access to all major sections
- Monthly revenue tracking

### Customer Management
- Add new customers with contact information
- Search customers by name, email, or phone
- View detailed customer profiles
- Manage customer vehicles
- View complete service history
- Edit and delete customer records

### Vehicle Management
- Add vehicles to customer profiles
- Track vehicle models and plate numbers
- View all vehicles in the system
- Delete vehicle records

### Service Records
- Record services with dates, descriptions, and amounts
- Track service status (pending/completed)
- Search services by customer or plate number
- View complete service history per customer
- Delete service records

### Data Export
- Export customer data to CSV
- Export service records to CSV
- Export reports to PDF format
- Download filtered data based on your search

## User Flow

```
Home Page
  ↓
Login Page (if not authenticated)
  ↓ (after login)
Dashboard
  ├→ Customers Page
  │   ├→ Add/Edit/Delete Customers
  │   └→ Customer Details (vehicles + service history)
  │
  ├→ Vehicles Page
  │   └→ View all vehicles
  │
  ├→ Services Page
  │   ├→ View all services
  │   └→ Add Service Record
  │
  └→ Logout
```

## Database Schema

### customers table
- **id** (UUID): Unique identifier
- **user_id** (UUID): Reference to authenticated user
- **name** (TEXT): Customer's full name
- **email** (TEXT, optional): Customer's email address
- **phone** (TEXT, optional): Customer's phone number
- **created_at** (TIMESTAMP): Record creation date
- **updated_at** (TIMESTAMP): Last update date

### vehicles table
- **id** (UUID): Unique identifier
- **customer_id** (UUID): Reference to customer
- **model** (TEXT): Vehicle model/make
- **plate_number** (TEXT): License plate number
- **created_at** (TIMESTAMP): Record creation date
- **updated_at** (TIMESTAMP): Last update date

### services table
- **id** (UUID): Unique identifier
- **vehicle_id** (UUID): Reference to vehicle
- **customer_id** (UUID): Reference to customer
- **description** (TEXT, optional): Service description
- **submission_date** (TIMESTAMP): When vehicle was submitted
- **collection_date** (TIMESTAMP, optional): When vehicle was collected
- **amount_paid** (DECIMAL, optional): Service cost
- **status** (TEXT): pending or completed
- **created_at** (TIMESTAMP): Record creation date
- **updated_at** (TIMESTAMP): Last update date

## Authentication

The app uses Supabase Auth with email/password authentication. Each user's data is isolated and only they can see their records.

## File Structure

```
/app
  /auth
    /login - Login page
    /signup - Sign up page
  /protected - Main dashboard
  /dashboard
    /customers - Customer management
      /[id] - Customer details
    /vehicles - Vehicle listing
    /services - Service management
    /add-service - Add service form
  /setup - Database setup wizard
  page.tsx - Home page

/components
  - dashboard-stats.tsx - Statistics display
  - customer-form.tsx - Customer form
  - logout-button.tsx - Logout functionality
  - /ui - shadcn/ui components

/lib
  - database.ts - Database utilities
  - export-utils.ts - CSV/PDF export functions
  - supabase/
    - client.ts - Browser client
    - server.ts - Server client
    - proxy.ts - Session handling
```

## Environment Variables

The app automatically uses environment variables set by the Supabase integration:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

## Troubleshooting

### "Table does not exist" error
- Run the database setup SQL from the setup wizard or manual guide above

### Can't log in
- Ensure you created an account on the sign up page first
- Check that your Supabase project is active and accessible

### Data not appearing
- Ensure you're logged in with the correct account
- Refresh the page to reload data
- Check browser console for any error messages

### Export not working
- jsPDF library will fall back to CSV if PDF generation fails
- Try CSV export as an alternative

## Security Notes

- All user data is encrypted and securely stored in Supabase
- Each user only sees their own data (not other users' data)
- Passwords are securely hashed
- Session tokens are managed securely via Supabase

## Support

For issues with:
- **Supabase**: Visit https://supabase.com/docs
- **Next.js**: Visit https://nextjs.org/docs
- **This App**: Check the SETUP_GUIDE.md or review the code comments

## Getting Help

1. Check the console for error messages (browser DevTools → Console)
2. Ensure all environment variables are properly set
3. Verify your Supabase project is properly configured
4. Try restarting the development server

---

**Happy managing!** 🔧
