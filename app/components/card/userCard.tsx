import { Avatar, Box, Stack, Typography } from '@mui/material'
import { useParams, useRouter } from 'next/navigation'

export interface UserCardProps {
  conversationId: string
  name: string
  avatar?: string
  content: string
}

export default function UserCard({ conversationId, name, avatar, content }: UserCardProps) {
  const params = useParams<{ conversationId: string }>()
  const router = useRouter()

  return (
    <Box
      sx={{
        p: 1,
        m: 1.5,
        backgroundColor: conversationId === params.conversationId ? '#f0f0f0' : 'inherit',
        borderRadius: '5px',
        cursor: 'pointer'
      }}
      onClick={() => {
        router.push(`/chat/${conversationId}`)
      }}
    >
      <Stack direction='row' spacing={2} alignItems='center'>
        <Avatar src={avatar} alt={name} />
        <Stack>
          <Typography component='h3' variant='subtitle1' fontWeight='bold'>
            {name}
          </Typography>
          <Typography variant='body2'>{content}</Typography>
        </Stack>
      </Stack>
    </Box>
  )
}
