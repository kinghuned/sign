'use client'
import { AppsRounded, SettingsOutlined } from '@mui/icons-material'
import Logout from '@mui/icons-material/Logout'
import PersonAdd from '@mui/icons-material/PersonAdd'
import Settings from '@mui/icons-material/Settings'
import { Avatar, Box, Button, Divider, IconButton, Stack, Typography } from '@mui/material'
import ListItemIcon from '@mui/material/ListItemIcon'
import Menu from '@mui/material/Menu'
import MenuItem from '@mui/material/MenuItem'
import { signIn, useSession } from 'next-auth/react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function Header() {
  const { data } = useSession()
  const router = useRouter()
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget)
  }
  const handleClose = () => {
    setAnchorEl(null)
  }
  return (
    <Box position='fixed' width='100%' zIndex={1000} top={0} sx={{ backgroundColor: 'white' }}>
      <Stack direction='row' px={1.5} py={1.5} justifyContent='space-between'>
        <Stack direction='row' alignItems='center'>
          {/* <Box>
            <IconButton aria-label='menu'>
              <MenuRounded />
            </IconButton>
          </Box> */}
          <Box>
            <Link href='/' prefetch={true}>
              <Image width={200} height={40} priority src='/logo.png' style={{ objectFit: 'contain' }} alt='logo' />
            </Link>
          </Box>
        </Stack>
        <Stack direction='row' alignItems='center' spacing={1} mr={1.5}>
          <Box>
            <IconButton aria-label='menu'>
              <SettingsOutlined />
            </IconButton>
          </Box>
          <Box>
            <IconButton aria-label='menu'>
              <AppsRounded />
            </IconButton>
          </Box>
          {data?.user ? (
            <Stack direction='row' alignItems='center' spacing={2}>
              <Typography component='p'>{'Hello, ' + data.user.name}</Typography>
              <IconButton
                onClick={handleClick}
                size='small'
                aria-controls={open ? 'account-menu' : undefined}
                aria-haspopup='true'
                aria-expanded={open ? 'true' : undefined}
              >
                <Avatar sx={{ border: '1px solid orange' }} alt={data.user.name ?? ''} src={data.user.image ?? ''} />
              </IconButton>
              <Menu
                anchorEl={anchorEl}
                id='account-menu'
                open={open}
                onClose={handleClose}
                onClick={handleClose}
                PaperProps={{
                  elevation: 0,
                  sx: {
                    overflow: 'visible',
                    filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                    mt: 1.5,
                    '& .MuiAvatar-root': {
                      width: 32,
                      height: 32,
                      ml: -0.5,
                      mr: 1
                    },
                    '&::before': {
                      content: '""',
                      display: 'block',
                      position: 'absolute',
                      top: 0,
                      right: 14,
                      width: 10,
                      height: 10,
                      bgcolor: 'background.paper',
                      transform: 'translateY(-50%) rotate(45deg)',
                      zIndex: 0
                    }
                  }
                }}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              >
                <MenuItem onClick={handleClose}>
                  <Avatar /> Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => router.push('/api/auth/signout')}>
                  <ListItemIcon>
                    <Logout fontSize='small' />
                  </ListItemIcon>
                  Logout
                </MenuItem>
              </Menu>
            </Stack>
          ) : (
            <Button variant='contained' onClick={() => signIn()} sx={{ textTransform: 'none' }}>
              Sign in
            </Button>
          )}
        </Stack>
      </Stack>
      <Divider />
    </Box>
  )
}
