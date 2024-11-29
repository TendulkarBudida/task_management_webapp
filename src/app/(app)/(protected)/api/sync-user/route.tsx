/* eslint-disable @typescript-eslint/ban-ts-comment */
import { NextRequest, NextResponse } from 'next/server'
import payload from 'payload'

export async function POST(req: NextRequest) {
    try {
        const { email, supabaseId } = await req.json()

        // Check if user already exists in Payload
        const existingUser = await payload.find({
            collection: 'users',
            where: {
                supabaseId: {
                    equals: supabaseId,
                },
            },
        })

        if (existingUser.docs.length > 0) {
            // User already exists, return the existing user
            return NextResponse.json(existingUser.docs[0])
        }

        // Create new user in Payload
        const newUser = await payload.create({
            collection: 'users',
            data: {
                email,
                // @ts-expect-error
                supabaseId,
            },
        })

        return NextResponse.json(newUser, { status: 201 })
    } catch (error) {
        console.error('Error syncing user:', error)
        return NextResponse.json({ error: 'Error syncing user' }, { status: 500 })
    }
}

