import { db } from '@/lib/db'
import { NextResponse } from 'next/server'
import { hash } from 'bcryptjs'
import * as z from 'zod'

const userSchema = z.object({
  name: z.string().min(1, 'Username is required').max(100),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(1, 'Password is required').min(8, 'Password must have than 8 characters')
})

export async function GET(req: Request) {
  return NextResponse.json({ message: 'hello world' }, { status: 200 })
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, name, password } = userSchema.parse(body)

    const existUserByEmail = await db.user.findUnique({
      where: { email: email }
    })

    if (existUserByEmail) {
      return NextResponse.json({ user: null, message: 'User with this email already exists' }, { status: 409 })
    }

    const existUserByUsername = await db.user.findUnique({
      where: { email: email }
    })

    if (existUserByUsername) {
      return NextResponse.json({ user: null, message: 'User with this username already exists' }, { status: 409 })
    }

    const hashedPassword = await hash(password, 10)

    const newUser = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user'
      }
    })

    const { password: newUserPassword, ...rest } = newUser

    return NextResponse.json({ user: rest, message: 'User created successfully' }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ message: 'Something went wrong!' }, { status: 500 })
  }
}
