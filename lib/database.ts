import { createClient } from '@/lib/supabase/server'

export async function createTables() {
  const supabase = await createClient()
  
  // Create customers table
  const { error: customersError } = await supabase.from('customers').select('count', { count: 'exact', head: true }).limit(1)
  
  if (customersError?.code === 'PGRST116') {
    // Table doesn't exist, create it
    await supabase.rpc('exec', {
      sql: `
        CREATE TABLE IF NOT EXISTS customers (
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
        CREATE INDEX IF NOT EXISTS idx_services_vehicle_id ON services(vehicle_id);
      `
    })
  }
}

// Customers queries
export async function getCustomers(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select(`
      *,
      vehicles:vehicles(count),
      services:services(count)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getCustomerById(customerId: string, userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .eq('user_id', userId)
    .single()
  
  if (error) throw error
  return data
}

export async function createCustomer(userId: string, name: string, email?: string, phone?: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .insert([{ user_id: userId, name, email, phone }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateCustomer(customerId: string, userId: string, updates: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('customers')
    .update(updates)
    .eq('id', customerId)
    .eq('user_id', userId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteCustomer(customerId: string, userId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('customers')
    .delete()
    .eq('id', customerId)
    .eq('user_id', userId)
  
  if (error) throw error
}

// Vehicles queries
export async function getVehiclesByCustomer(customerId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vehicles')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createVehicle(customerId: string, model: string, plateNumber: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vehicles')
    .insert([{ customer_id: customerId, model, plate_number: plateNumber }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateVehicle(vehicleId: string, updates: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('vehicles')
    .update(updates)
    .eq('id', vehicleId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteVehicle(vehicleId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('vehicles')
    .delete()
    .eq('id', vehicleId)
  
  if (error) throw error
}

// Services queries
export async function getServices(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select(`
      *,
      customer:customers(name),
      vehicle:vehicles(model, plate_number)
    `)
    .eq('services.user_id', userId)
    .order('submission_date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function getServicesByCustomer(customerId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('customer_id', customerId)
    .order('submission_date', { ascending: false })
  
  if (error) throw error
  return data
}

export async function createService(vehicleId: string, customerId: string, serviceData: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .insert([{ vehicle_id: vehicleId, customer_id: customerId, ...serviceData }])
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function updateService(serviceId: string, updates: any) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', serviceId)
    .select()
    .single()
  
  if (error) throw error
  return data
}

export async function deleteService(serviceId: string) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('services')
    .delete()
    .eq('id', serviceId)
  
  if (error) throw error
}

// Dashboard statistics
export async function getDashboardStats(userId: string) {
  const supabase = await createClient()
  
  const [{ count: customersCount }, { count: vehiclesCount }, { count: servicesCount }] = await Promise.all([
    supabase.from('customers').select('count', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('vehicles').select('count', { count: 'exact', head: true }).eq('user_id', userId),
    supabase.from('services').select('count', { count: 'exact', head: true }).eq('user_id', userId),
  ])
  
  // Calculate monthly stats
  const thisMonth = new Date()
  thisMonth.setDate(1)
  thisMonth.setHours(0, 0, 0, 0)
  
  const { data: monthlyServices } = await supabase
    .from('services')
    .select('amount_paid')
    .gte('submission_date', thisMonth.toISOString())
    .eq('user_id', userId)
  
  const monthlyRevenue = (monthlyServices || []).reduce((sum, s) => sum + (s.amount_paid || 0), 0)
  
  return {
    totalCustomers: customersCount || 0,
    totalVehicles: vehiclesCount || 0,
    totalServices: servicesCount || 0,
    monthlyRevenue,
  }
}
