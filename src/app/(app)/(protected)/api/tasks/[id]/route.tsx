import { NextRequest, NextResponse } from 'next/server'
import payload, { CollectionSlug } from 'payload'
import { getUser } from '../../../../../../lib/auth'

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await req.json()
    const updatedTask = await payload.update({
      collection: 'tasks' as CollectionSlug,
      id: params.id,
      data: body,
    })
    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error('Error updating task:', error)
    return NextResponse.json({ error: 'Error updating task' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUser(req)

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    await payload.delete({
      collection: 'tasks' as CollectionSlug,
      where: {
        id: {
          equals: params.id,
        },
        user: {
          equals: user.id,
        },
      },
    })
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    console.error('Error deleting task:', error)
    return NextResponse.json({ error: 'Error deleting task' }, { status: 500 })
  }
}

