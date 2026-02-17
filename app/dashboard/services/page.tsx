'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'
import { exportToCSV, exportToPDF, formatExportData } from '@/lib/export-utils'

interface Service {
  id: string
  customer_id: string
  vehicle_id: string
  description?: string
  submission_date: string
  collection_date?: string
  amount_paid?: number
  status: string
  customer?: { name: string }
  vehicle?: { model: string; plate_number: string }
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [filteredServices, setFilteredServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  const supabase = createClient()

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          customer:customers(name),
          vehicle:vehicles(model, plate_number)
        `)
        .order('submission_date', { ascending: false })

      if (error) throw error
      setServices(data || [])
      setFilteredServices(data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = services.filter(service =>
      (service.customer?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.vehicle?.plate_number || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (service.vehicle?.model || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    setFilteredServices(filtered)
  }, [searchQuery, services])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this service record?')) return

    try {
      const { error } = await supabase
        .from('services')
        .delete()
        .eq('id', id)

      if (error) throw error
      setServices(services.filter(s => s.id !== id))
    } catch (error) {
      console.error('Error deleting service:', error)
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
          <h1 className="text-3xl font-bold text-gray-900">Services</h1>
          <p className="text-sm text-gray-600 mt-1">View and manage all service records</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search and Export */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search by customer name or plate number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {filteredServices.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    const formatted = formatExportData(filteredServices)
                    exportToCSV(formatted, `services_${new Date().toISOString().split('T')[0]}.csv`)
                  }}
                >
                  📥 CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const formatted = formatExportData(filteredServices)
                    exportToPDF(formatted, `services_${new Date().toISOString().split('T')[0]}.pdf`, 'Service Report')
                  }}
                >
                  📥 PDF
                </Button>
              </>
            )}
            <Link href="/dashboard/add-service">
              <Button>+ Add Service</Button>
            </Link>
          </div>
        </div>

        {/* Services Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Services</CardTitle>
            <CardDescription>
              {filteredServices.length} service{filteredServices.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : filteredServices.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {services.length === 0
                  ? 'No services recorded yet.'
                  : 'No services match your search.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Customer</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Vehicle</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Plate</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Submitted</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Collected</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredServices.map((service) => (
                      <tr key={service.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">{service.customer?.name || '-'}</td>
                        <td className="py-3 px-4">{service.vehicle?.model || '-'}</td>
                        <td className="py-3 px-4 font-mono text-sm">{service.vehicle?.plate_number || '-'}</td>
                        <td className="py-3 px-4 text-sm">
                          {new Date(service.submission_date).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {service.collection_date
                            ? new Date(service.collection_date).toLocaleDateString()
                            : '-'}
                        </td>
                        <td className="py-3 px-4">${service.amount_paid?.toFixed(2) || '0.00'}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-1 rounded text-xs font-semibold ${
                              service.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}
                          >
                            {service.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                // Edit functionality would go here
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(service.id)}
                            >
                              Delete
                            </Button>
                          </div>
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
