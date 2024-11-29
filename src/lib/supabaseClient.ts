import { createClient } from '@supabase/supabase-js'
import axios from 'axios'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function syncUserWithPayload(user: any) {
  try {
    const response = await axios.post('/api/sync-user', {
      email: user.email,
      supabaseId: user.id,
    })
    return response.data
  } catch (error) {
    console.error('Error syncing user with Payload:', error)
    throw error
  }
}

