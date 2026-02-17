'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

interface Stats {
  totalCustomers: number
  totalVehicles: number
  totalServices: number
  monthlyRevenue: number
}

export default function DashboardStats({ userId }: { userId: string }) {
  const [stats, setStats] = useState<Stats>({
    totalCustomers: 0,
    totalVehicles: 0,
    totalServices: 0,
    monthlyRevenue: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const supabase = createClient()

        // Get customer count
        const { count: customersCount } = await supabase
          .from('customers')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        // Get vehicle count
        const { count: vehiclesCount } = await supabase
          .from('vehicles')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        // Get service count
        const { count: servicesCount } = await supabase
          .from('services')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)

        // Get monthly revenue
        const thisMonth = new Date()
        thisMonth.setDate(1)
        thisMonth.setHours(0, 0, 0, 0)

        const { data: monthlyServices } = await supabase
          .from('services')
          .select('amount_paid')
          .gte('submission_date', thisMonth.toISOString())
          .eq('user_id', userId)

        const monthlyRevenue = (monthlyServices || []).reduce(
          (sum, s) => sum + (s.amount_paid || 0),
          0
        )

        setStats({
          totalCustomers: customersCount || 0,
          totalVehicles: vehiclesCount || 0,
          totalServices: servicesCount || 0,
          monthlyRevenue,
        })
      } catch (err) {
        setError('Failed to load statistics')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [userId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600 text-sm">{error}</div>
  }

  const statCards = [
    {
      title: 'Total Customers',
      value: stats.totalCustomers.toString(),
      icon: '👥',
    },
    {
      title: 'Total Vehicles',
      value: stats.totalVehicles.toString(),
      icon: '🚗',
    },
    {
      title: 'Total Services',
      value: stats.totalServices.toString(),
      icon: '🔧',
    },
    {
      title: 'Monthly Revenue',
      value: `$${stats.monthlyRevenue.toFixed(2)}`,
      icon: '💰',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((card, index) => (
        <Card key={index}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <span className="text-2xl">{card.icon}</span>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
