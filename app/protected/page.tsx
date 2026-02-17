import { redirect } from 'next/navigation'
import Link from 'next/link'

import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import DashboardStats from '@/components/dashboard-stats'
import LogoutButton from '@/components/logout-button'

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect('/auth/login')
  }

  return (
    <div className="min-h-svh bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Chuma-Benz Mechatronic</h1>
            <p className="text-sm text-gray-600 mt-1">Welcome back, {data.user.email}</p>
          </div>
          <LogoutButton />
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Statistics */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Dashboard Overview</h2>
          <DashboardStats userId={data.user.id} />
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/customers">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Customers</CardTitle>
                  <CardDescription>Manage all customer records</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">View Customers</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/vehicles">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Vehicles</CardTitle>
                  <CardDescription>Track vehicle information</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">View Vehicles</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/services">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Services</CardTitle>
                  <CardDescription>View service history</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">View Services</Button>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/add-service">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardHeader>
                  <CardTitle className="text-lg">Add Service</CardTitle>
                  <CardDescription>Record a new service</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full">New Service</Button>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>

        {/* Getting Started */}
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Follow these steps to get the most out of Chuma-Benz Mechatronic</CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3 list-decimal list-inside text-sm text-gray-700">
              <li>Start by <Link href="/dashboard/customers" className="text-blue-600 hover:underline">adding customers</Link> and their vehicle information</li>
              <li>Record service details, dates, and amounts paid</li>
              <li>Use the search feature to quickly find customers by name or plate number</li>
              <li>View service history for each customer</li>
              <li>Export your data to CSV or PDF for backups and reporting</li>
            </ol>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
