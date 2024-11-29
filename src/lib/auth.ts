import { NextApiRequest } from 'next'
import { supabase } from './supabaseClient'
import payload from 'payload'

export async function getUser(req: NextApiRequest) {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return null
  }

  try {
    const { data: { user: supabaseUser }, error } = await supabase.auth.getUser(token)

    if (error || !supabaseUser) {
      return null
    }

    const payloadUser = await payload.find({
      collection: 'users',
      where: {
        supabaseId: {
          equals: supabaseUser.id,
        },
      },
    })

    if (payloadUser.docs.length === 0) {
      return null
    }

    return payloadUser.docs[0]
  } catch (error) {
    console.error('Error getting user:', error)
    return null
  }
}

