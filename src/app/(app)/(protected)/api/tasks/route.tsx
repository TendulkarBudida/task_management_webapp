import { NextRequest, NextResponse } from 'next/server'
import payload, { CollectionSlug } from 'payload'
import { getUser } from '../../../../../lib/auth'

export async function GET(req: NextRequest) {
  const user = await getUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const tasks = await payload.find({
      collection: 'tasks' as CollectionSlug,
      where: {
        user: {
          equals: user.id,
        },
      },
    })
    return NextResponse.json(tasks.docs)
  } catch (error) {
    console.error('Error fetching tasks:', error)
    return NextResponse.json({ error: 'Error fetching tasks' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  const user = await getUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const newTask = await payload.create({
      collection: 'tasks' as CollectionSlug,
      data: {
        ...body,
        user: user.id,
        priority: body.priority || 'MEDIUM',
      },
    })
    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error('Error creating task:', error)
    return NextResponse.json({ error: 'Error creating task' }, { status: 500 })
  }
}

