'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
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
}

interface Vehicle {
  id: string
  model: string
  plate_number: string
  customer_id: string
}

export default function AddServicePage() {
  const router = useRouter()
  const supabase = createClient()

  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [selectedCustomerId, setSelectedCustomerId] = useState('')
  const [selectedVehicleId, setSelectedVehicleId] = useState('')
  const [description, setDescription] = useState('')
  const [submissionDate, setSubmissionDate] = useState('')
  const [collectionDate, setCollectionDate] = useState('')
  const [amountPaid, setAmountPaid] = useState('')
  const [status, setStatus] = useState('pending')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchCustomers()
  }, [])

  useEffect(() => {
    if (selectedCustomerId) {
      fetchVehicles(selectedCustomerId)
    } else {
      setVehicles([])
      setSelectedVehicleId('')
    }
  }, [selectedCustomerId])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('id, name')
        .order('name')

      if (error) throw error
      setCustomers(data || [])
    } catch (err) {
      console.error('Error fetching customers:', err)
      setError('Failed to load customers')
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicles = async (customerId: string) => {
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .select('id, model, plate_number, customer_id')
        .eq('customer_id', customerId)

      if (error) throw error
      setVehicles(data || [])
    } catch (err) {
      console.error('Error fetching vehicles:', err)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError(null)

    try {
      if (!selectedCustomerId || !selectedVehicleId) {
        throw new Error('Please select both customer and vehicle')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const { error: insertError } = await supabase
        .from('services')
        .insert([
          {
            user_id: user.id,
            customer_id: selectedCustomerId,
            vehicle_id: selectedVehicleId,
            description,
            submission_date: submissionDate,
            collection_date: collectionDate || null,
            amount_paid: amountPaid ? parseFloat(amountPaid) : null,
            status,
          },
        ])

      if (insertError) throw insertError

      router.push('/dashboard/services')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-svh bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link href="/dashboard/services">
            <Button variant="outline" className="mb-4">
              ← Back to Services
            </Button>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Add Service Record</h1>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Card>
          <CardHeader>
            <CardTitle>New Service</CardTitle>
            <CardDescription>Record a new service for a customer's vehicle</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Selection */}
              <div>
                <Label htmlFor="customer">Select Customer *</Label>
                {loading ? (
                  <div className="text-sm text-gray-500">Loading customers...</div>
                ) : customers.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    No customers found. <Link href="/dashboard/customers" className="text-blue-600 hover:underline">Add a customer first</Link>
                  </div>
                ) : (
                  <select
                    id="customer"
                    value={selectedCustomerId}
                    onChange={(e) => setSelectedCustomerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">-- Select a customer --</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                )}
              </div>

              {/* Vehicle Selection */}
              <div>
                <Label htmlFor="vehicle">Select Vehicle *</Label>
                {!selectedCustomerId ? (
                  <div className="text-sm text-gray-500">Select a customer first</div>
                ) : vehicles.length === 0 ? (
                  <div className="text-sm text-gray-500">
                    This customer has no vehicles. <Link href="/dashboard/customers" className="text-blue-600 hover:underline">Add a vehicle first</Link>
                  </div>
                ) : (
                  <select
                    id="vehicle"
                    value={selectedVehicleId}
                    onChange={(e) => setSelectedVehicleId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">-- Select a vehicle --</option>
                    {vehicles.map(v => (
                      <option key={v.id} value={v.id}>
                        {v.model} ({v.plate_number})
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Service Description */}
              <div>
                <Label htmlFor="description">Service Description</Label>
                <textarea
                  id="description"
                  placeholder="e.g., Oil change, filter replacement, engine diagnostic..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={4}
                />
              </div>

              {/* Submission Date */}
              <div>
                <Label htmlFor="submission-date">Submission Date *</Label>
                <Input
                  id="submission-date"
                  type="date"
                  value={submissionDate}
                  onChange={(e) => setSubmissionDate(e.target.value)}
                  required
                />
              </div>

              {/* Collection Date */}
              <div>
                <Label htmlFor="collection-date">Collection Date</Label>
                <Input
                  id="collection-date"
                  type="date"
                  value={collectionDate}
                  onChange={(e) => setCollectionDate(e.target.value)}
                />
              </div>

              {/* Amount Paid */}
              <div>
                <Label htmlFor="amount">Amount Paid ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                />
              </div>

              {/* Status */}
              <div>
                <Label htmlFor="status">Status *</Label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              {/* Buttons */}
              <div className="flex gap-3">
                <Button type="submit" disabled={submitting}>
                  {submitting ? 'Saving...' : 'Add Service'}
                </Button>
                <Link href="/dashboard/services">
                  <Button type="button" variant="outline">
                    Cancel
                  </Button>
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
