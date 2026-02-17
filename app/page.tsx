import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function HomePage() {
  const supabase = await createClient()
  const { data } = await supabase.auth.getUser()

  // If user is authenticated, redirect to dashboard
  if (data?.user) {
    redirect('/protected')
  }

  // Otherwise redirect to login
  redirect('/auth/login')
}
