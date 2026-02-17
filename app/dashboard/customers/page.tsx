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
import CustomerForm from '@/components/customer-form'
import { exportToCSV, exportToPDF, formatExportData } from '@/lib/export-utils'

interface Customer {
  id: string
  name: string
  email?: string
  phone?: string
  created_at: string
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null)

  const supabase = createClient()

  useEffect(() => {
    fetchCustomers()
  }, [])

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
      setFilteredCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const filtered = customers.filter(customer =>
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.phone?.includes(searchQuery)
    )
    setFilteredCustomers(filtered)
  }, [searchQuery, customers])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this customer?')) return

    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id)

      if (error) throw error
      setCustomers(customers.filter(c => c.id !== id))
    } catch (error) {
      console.error('Error deleting customer:', error)
    }
  }

  return (
    <div className="min-h-svh bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/protected">
                <Button variant="outline" className="mb-4">
                  ← Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold text-gray-900">Customers</h1>
              <p className="text-sm text-gray-600 mt-1">Manage your customer database</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {showForm && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>
                {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerForm
                onSuccess={() => {
                  setShowForm(false)
                  setEditingCustomer(null)
                  fetchCustomers()
                }}
                initialData={editingCustomer}
              />
            </CardContent>
          </Card>
        )}

        {/* Search and Add Button */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Search customers by name, email, or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {filteredCustomers.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    const formatted = formatExportData(filteredCustomers)
                    exportToCSV(formatted, `customers_${new Date().toISOString().split('T')[0]}.csv`)
                  }}
                >
                  📥 CSV
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    const formatted = formatExportData(filteredCustomers)
                    exportToPDF(formatted, `customers_${new Date().toISOString().split('T')[0]}.pdf`, 'Customers Report')
                  }}
                >
                  📥 PDF
                </Button>
              </>
            )}
            <Button
              onClick={() => {
                setEditingCustomer(null)
                setShowForm(!showForm)
              }}
            >
              {showForm ? 'Cancel' : '+ Add Customer'}
            </Button>
          </div>
        </div>

        {/* Customers Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Customers</CardTitle>
            <CardDescription>
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center text-gray-500 py-8">Loading...</div>
            ) : filteredCustomers.length === 0 ? (
              <div className="text-center text-gray-500 py-8">
                {customers.length === 0
                  ? 'No customers yet. Add one to get started!'
                  : 'No customers match your search.'}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Name</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Email</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Phone</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-900">Added</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filteredCustomers.map((customer) => (
                      <tr key={customer.id} className="hover:bg-gray-50">
                        <td className="py-3 px-4">
                          <Link
                            href={`/dashboard/customers/${customer.id}`}
                            className="text-blue-600 hover:underline font-medium"
                          >
                            {customer.name}
                          </Link>
                        </td>
                        <td className="py-3 px-4 text-gray-600">{customer.email || '-'}</td>
                        <td className="py-3 px-4 text-gray-600">{customer.phone || '-'}</td>
                        <td className="py-3 px-4 text-gray-600 text-sm">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex justify-end gap-2">
                            <Link href={`/dashboard/customers/${customer.id}`}>
                              <Button variant="outline" size="sm">
                                View
                              </Button>
                            </Link>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingCustomer(customer)
                                setShowForm(true)
                              }}
                            >
                              Edit
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(customer.id)}
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
