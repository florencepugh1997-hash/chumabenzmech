'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  created_at: string
}

interface Vehicle {
  id: string
  model: string
  plate_number: string
  created_at: string
}

interface Service {
  id: string
  description?: string
  submission_date: string
  collection_date?: string
  amount_paid?: number
  status: string
}

export default function CustomerDetailsPage() {
  const params = useParams()
  const customerId = params.id as string
  const supabase = createClient()

  const [customer, setCustomer] = useState<Customer | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [showVehicleForm, setShowVehicleForm] = useState(false)
  const [newVehicleModel, setNewVehicleModel] = useState('')
  const [newVehiclePlate, setNewVehiclePlate] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [customerId])

  const fetchData = async () => {
    try {
      // Fetch customer
      const { data: customerData, error: customerError } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single()

      if (customerError) throw customerError
      setCustomer(customerData)

      // Fetch vehicles
      const { data: vehiclesData, error: vehiclesError } = await supabase
        .from('vehicles')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (vehiclesError) throw vehiclesError
      setVehicles(vehiclesData || [])

      // Fetch services
      const { data: servicesData, error: servicesError } = await supabase
        .from('services')
        .select('*')
        .eq('customer_id', customerId)
        .order('submission_date', { ascending: false })

      if (servicesError) throw servicesError
      setServices(servicesData || [])
    } catch (err) {
      setError('Failed to load customer details')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase
        .from('vehicles')
        .insert([
          {
            user_id: user.id,
            customer_id: customerId,
            model: newVehicleModel,
            plate_number: newVehiclePlate,
          },
        ])

      if (insertError) throw insertError
      setNewVehicleModel('')
      setNewVehiclePlate('')
      setShowVehicleForm(false)
      fetchData()
    } catch (err) {
      setError('Failed to add vehicle')
    }
  }

  const handleDeleteVehicle = async (vehicleId: string) => {
    if (!confirm('Delete this vehicle?')) return
    try {
      const { error } = await supabase
        .from('vehicles')
        .delete()
        .eq('id', vehicleId)

      if (error) throw error
      setVehicles(vehicles.filter(v => v.id !== vehicleId))
    } catch (err) {
      setError('Failed to delete vehicle')
    }
  }

  const handleDeleteService = async (serviceId: string) => {
    if (!confirm('Delete this service record?')) return
    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', serviceId)

      if (error) throw error
      setServices(services.filter(s => s.id !== serviceId))
    } catch (err) {
      setError('Failed to delete service')
    }
  }

  if (loading) {
    return <div className="min-h-svh bg-gray-50 p-8">Loading...</div>
  }

  if (!customer) {
    return <div className="min-h-svh bg-gray-50 p-8">Customer not found</div>
  }

  return (
    <div className="min-h-svh bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard/customers">
            <Button variant="outline" className="mb-4">
              ← Back to Customers
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{customer.name}</h1>
          <p className="text-sm text-gray-600 mt-1">Customer ID: {customer.id}</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Customer Info */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-gray-600">Email</Label>
                <p className="text-lg font-medium">{customer.email || 'Not provided'}</p>
              </div>
              <div>
                <Label className="text-gray-600">Phone</Label>
                <p className="text-lg font-medium">{customer.phone || 'Not provided'}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Vehicles Section */}
        <Card className="mb-8">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Vehicles ({vehicles.length})</CardTitle>
              <CardDescription>All vehicles owned by this customer</CardDescription>
            </div>
            <Button
              size="sm"
              onClick={() => setShowVehicleForm(!showVehicleForm)}
            >
              {showVehicleForm ? 'Cancel' : '+ Add Vehicle'}
            </Button>
          </CardHeader>
          <CardContent>
            {showVehicleForm && (
              <form onSubmit={handleAddVehicle} className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
                <div>
                  <Label htmlFor="model">Vehicle Model *</Label>
                  <Input
                    id="model"
                    placeholder="Toyota Corolla"
                    value={newVehicleModel}
                    onChange={(e) => setNewVehicleModel(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="plate">Plate Number *</Label>
                  <Input
                    id="plate"
                    placeholder="ABC-1234"
                    value={newVehiclePlate}
                    onChange={(e) => setNewVehiclePlate(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit">Add Vehicle</Button>
                </div>
              </form>
            )}

            {vehicles.length === 0 ? (
              <p className="text-gray-500 text-sm">No vehicles yet</p>
            ) : (
              <div className="space-y-3">
                {vehicles.map(vehicle => (
                  <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium">{vehicle.model}</p>
                      <p className="text-sm text-gray-600">Plate: {vehicle.plate_number}</p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteVehicle(vehicle.id)}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Section */}
        <Card>
          <CardHeader>
            <CardTitle>Service History ({services.length})</CardTitle>
            <CardDescription>All services performed for this customer</CardDescription>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-gray-500 text-sm">No services recorded yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-left py-2 px-2">Description</th>
                      <th className="text-left py-2 px-2">Amount</th>
                      <th className="text-left py-2 px-2">Status</th>
                      <th className="text-right py-2 px-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {services.map(service => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="py-2 px-2">
                          {new Date(service.submission_date).toLocaleDateString()}
                        </td>
                        <td className="py-2 px-2">{service.description || '-'}</td>
                        <td className="py-2 px-2">${service.amount_paid?.toFixed(2) || '0.00'}</td>
                        <td className="py-2 px-2">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${service.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                              }`}
                          >
                            {service.status}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleDeleteService(service.id)}
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
