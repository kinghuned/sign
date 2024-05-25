'use client'
import AgoraRTC, { AgoraRTCProvider, useRTCClient } from 'agora-rtc-react'
import Videos from '../videos/videos'
import { Suspense } from 'react'

export default function Call(props: { appId: string; channelName: string }) {
  const client = useRTCClient(AgoraRTC.createClient({ codec: 'vp8', mode: 'rtc' }))

  return (
    <AgoraRTCProvider client={client}>
      <Suspense>
        <Videos channelName={props.channelName} AppID={props.appId} />
      </Suspense>
    </AgoraRTCProvider>
  )
}
