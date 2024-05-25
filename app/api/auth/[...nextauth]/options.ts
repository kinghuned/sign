import type { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import { GoogleProfile } from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { db } from '@/lib/db'
import { compare } from 'bcryptjs'

export const options: NextAuthOptions = {
  adapter: PrismaAdapter(db),
  pages: {
    newUser: '/auth/sign-up',
    signIn: '/auth/sign-in'
  },
  providers: [
    GoogleProvider({
      profile(profile: GoogleProfile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
          role: profile.role ?? 'user'
        }
      },
      clientId: process.env.PUBLIC_CLIENT_ID!,
      clientSecret: process.env.PUBLIC_CLIENT_SECRET!
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email', placeholder: 'example@gmail.com' },
        password: { label: 'Password', type: 'password' }
      },

      async authorize(credentials, req) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }
        const existUser = await db.user.findUnique({
          where: { email: credentials?.email }
        })

        if (!existUser) return null

        if (existUser.password) {
          const passwordMatch = await compare(credentials.password, existUser.password)
          if (!passwordMatch) {
            return null // return null when the password doesn't match
          }
        } else {
          return null // return null when there's no password
        }

        return {
          id: existUser.id,
          name: existUser.name ?? null,
          email: existUser.email,
          emailVerified: existUser.emailVerified ?? null,
          role: existUser.role ?? 'user',
          image: existUser.image ?? null,
          createdAt: existUser.createdAt,
          updatedAt: existUser.updatedAt
        }
      }
    })
  ],
  session: {
    strategy: 'jwt'
  },
  logger: {
    error(code, metadata) {
      console.error(code, metadata)
    },
    warn(code) {
      console.warn(code)
    },
    debug(code, metadata) {
      console.debug(code, metadata)
    }
  },
  callbacks: {
    // async redirect({ url, baseUrl }) {
    //   return baseUrl
    // },
    jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.id = user.id
      }
      return token
    },
    session({ session, token }) {
      session.user.role = token.role
      session.user.id = token.id
      return session
    }
  },
  theme: {
    colorScheme: 'light'
  },
  secret: process.env.NEXTAUTH_SECRET
}
