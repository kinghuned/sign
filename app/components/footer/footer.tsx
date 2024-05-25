'use client'
import { AdminPanelSettingsRounded, ChatRounded, TranslateRounded, VideoCallRounded } from '@mui/icons-material'
import { BottomNavigation, BottomNavigationAction, Box, Divider } from '@mui/material'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import styles from './footer.module.scss'
import { useSession } from 'next-auth/react'

export interface FooterProps {}

export default function Footer(props: FooterProps) {
  const path = usePathname()
  const router = useRouter()
  const [value, setValue] = useState(0)
  const { data: session } = useSession()

  useEffect(() => {
    if (path.includes('/video-call')) setValue(1)
    else if (path.includes('/chat')) setValue(2)
    else setValue(0)
  }, [path])

  return (
    <Box className={styles.footer}>
      <Divider />
      <BottomNavigation
        showLabels
        value={value}
        onChange={(event, newValue) => {
          setValue(newValue)
          console.log(newValue)
          switch (newValue) {
            case 0:
              router.push('/')
              break
            case 1:
              router.push('/video-call')
              break
            case 2:
              router.push('/chat')
              break
            case 3:
              router.push('/admin')
              break
          }
          router.refresh()
        }}
      >
        <BottomNavigationAction label='Translate' icon={<TranslateRounded />} />
        <BottomNavigationAction label='Video Call' icon={<VideoCallRounded />} />
        <BottomNavigationAction label='Chat' icon={<ChatRounded />} />
        {session?.user?.role === 'admin' && (
          <BottomNavigationAction label='Admin' icon={<AdminPanelSettingsRounded />} />
        )}
      </BottomNavigation>
    </Box>
  )
}
