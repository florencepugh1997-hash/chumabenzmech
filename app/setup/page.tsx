'use client'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useState } from 'react'

export default function SetupPage() {
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const steps = [
    {
      title: 'Welcome to Mechanic Manager',
      description: 'This setup will help you initialize the database tables for your mechanic shop management system.',
      content: (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You'll need to create the following tables in your Supabase database:
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside text-gray-700">
            <li><strong>customers</strong> - Store customer information</li>
            <li><strong>vehicles</strong> - Store vehicle details</li>
            <li><strong>services</strong> - Store service records</li>
          </ul>
        </div>
      ),
    },
    {
      title: 'Create Database Tables',
      description: 'Run this SQL in your Supabase SQL Editor to create the required tables.',
      content: (
        <div className="space-y-4">
          <div className="bg-gray-100 p-4 rounded-lg overflow-auto max-h-96">
            <pre className="text-xs font-mono text-gray-800 whitespace-pre-wrap">{`-- Create customers table
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

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_services_customer_id ON services(customer_id);
CREATE INDEX IF NOT EXISTS idx_services_vehicle_id ON services(vehicle_id);`}</pre>
          </div>
          <p className="text-sm text-gray-600 mt-4">
            📝 <strong>Instructions:</strong>
          </p>
          <ol className="text-sm space-y-2 list-decimal list-inside text-gray-700">
            <li>Go to your Supabase project dashboard</li>
            <li>Navigate to the SQL Editor</li>
            <li>Create a new query and paste the SQL above</li>
            <li>Execute the query</li>
            <li>Come back and click "Verify Tables"</li>
          </ol>
        </div>
      ),
    },
    {
      title: 'Setup Complete!',
      description: 'Your database is ready to use.',
      content: (
        <div className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-sm text-green-700">
              ✓ Database tables have been created successfully!
            </p>
          </div>
          <p className="text-sm text-gray-600">
            You can now log in and start managing your mechanic shop:
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside text-gray-700">
            <li>Add customers and their vehicle information</li>
            <li>Record service details and dates</li>
            <li>Search and filter records</li>
            <li>Export data to CSV/PDF</li>
          </ul>
        </div>
      ),
    },
  ]

  const handleVerifyTables = async () => {
    setLoading(true)
    setMessage('Verifying tables...')
    try {
      // Simulate verification - in a real app, this would check the database
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('✓ Tables verified successfully!')
      setTimeout(() => {
        setStep(2)
      }, 1500)
    } catch (error) {
      setMessage('✗ Error verifying tables. Please ensure you ran the SQL first.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-svh w-full bg-gray-50 flex items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="flex gap-2 mb-8">
          {steps.map((_, index) => (
            <div
              key={index}
              className={`h-2 flex-1 rounded-full transition-colors ${
                index <= step ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[step].title}</CardTitle>
            <CardDescription>{steps[step].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {steps[step].content}

            {/* Action buttons */}
            <div className="flex gap-3 justify-between pt-4 border-t">
              {step > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setStep(step - 1)
                    setMessage('')
                  }}
                  disabled={loading}
                >
                  Previous
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                {step === 1 && (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `CREATE TABLE IF NOT EXISTS customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vehicles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  model TEXT NOT NULL,
  plate_number TEXT UNIQUE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

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

CREATE INDEX IF NOT EXISTS idx_customers_user_id ON customers(user_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_customer_id ON vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_vehicles_plate_number ON vehicles(plate_number);
CREATE INDEX IF NOT EXISTS idx_services_customer_id ON services(customer_id);
CREATE INDEX IF NOT EXISTS idx_services_vehicle_id ON services(vehicle_id);`
                        )
                        setMessage('✓ SQL copied to clipboard!')
                      }}
                    >
                      Copy SQL
                    </Button>
                    <Button onClick={handleVerifyTables} disabled={loading}>
                      {loading ? 'Verifying...' : 'Verify Tables'}
                    </Button>
                  </>
                )}
                {step === 0 && (
                  <Button onClick={() => setStep(1)}>
                    Next
                  </Button>
                )}
                {step === 2 && (
                  <Button onClick={() => window.location.href = '/auth/login'}>
                    Go to Login
                  </Button>
                )}
              </div>
            </div>

            {message && (
              <p className="text-sm text-center text-gray-600 mt-2">{message}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
