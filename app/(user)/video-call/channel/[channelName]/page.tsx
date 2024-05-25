'use client'
import Call from '@/app/components/call/call'
import LinearProgressCustom from '@/app/components/loading/LinearProgressCustom'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'

export default function Page({ params }: { params: { channelName: string } }) {
  const { data: session, status } = useSession()
  console.log('appid', process.env.NEXT_PUBLIC_AGORA_APP_ID!)
  if (status === 'loading') return <LinearProgressCustom />
  else if (status === 'unauthenticated') redirect(`/auth/sign-in?callbackUrl=/video-call/channel/${params.channelName}`)

  return <Call appId={process.env.NEXT_PUBLIC_AGORA_APP_ID!} channelName={params.channelName} />
}
