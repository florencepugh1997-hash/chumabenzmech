'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

interface Vehicle {
  id: string
  customer_id: string
  model: string
  plate_number: string
  created_at: string
  customer?: { name: string }
}

export default function VehiclesPage() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    fetchVehicles()
  }, [])

  const fetchVehicles = async () => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select(`
          *,
          customer:customers(name)
        `)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVehicles(data || [])
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return

    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', id)

      if (error) throw error
      setVehicles(vehicles.filter(v => v.id !== id))
    } catch (error) {
      console.error('Error deleting vehicle:', error)
    }
  }

  return (
    <div className="min-h-svh bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/protected">
            <Button variant="outline" className="mb-4">
              ← Back to Dashboard
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Vehicles</h1>
          <p className="text-sm text-gray-600 mt-1">View all vehicles in the system</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>All Vehicles</CardTitle>
            <CardDescription>
              {vehicles.length} vehicle{vehicles.length !== 1 ? 's' : ''} in the system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : vehicles.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                No vehicles yet. <Link href="/dashboard/customers" className="text-blue-600 hover:underline">Add vehicles through customer profiles</Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Plate Number</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Model</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Owner</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Added</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {vehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4 font-mono font-semibold">{vehicle.plate_number}</td>
                        <td className="py-3 px-4">{vehicle.model}</td>
                        <td className="py-3 px-4">
                          <Link
                            href={`/dashboard/customers/${vehicle.customer_id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {vehicle.customer?.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {new Date(vehicle.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDelete(vehicle.id)}
                          >
                            Delete
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
