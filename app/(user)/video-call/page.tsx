'use client'
import {
  Button,
  FormControl,
  FormControlLabel,
  FormLabel,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  TextField,
  Typography
} from '@mui/material'
import { redirect, useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useSession } from 'next-auth/react'
import * as z from 'zod'
import LinearProgressCustom from '@/app/components/loading/LinearProgressCustom'
import { toast } from 'react-toastify'
import { useState } from 'react'

// Define the schema with optional email
const schema = z.object({
  channel: z.string().min(1, 'Channel name is required'),
  currentUserType: z.enum(['normal', 'deaf-dumb']),
  friendUserType: z.enum(['normal', 'deaf-dumb']),
  email: z.string().email('Invalid email').optional().or(z.literal(''))
})

type FormData = z.infer<typeof schema>

export default function VideoCall() {
  const {
    control,
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      channel: Date.now().toString(),
      currentUserType: 'normal',
      friendUserType: 'normal',
      email: ''
    }
  })
  const router = useRouter()
  const { status } = useSession()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true)
    const { channel, currentUserType, email } = data
    console.log('Form data:', data)
    const inviteLink = `${window.location.origin}/video-call/channel/${channel}${
      currentUserType === 'deaf-dumb' ? '/?user=dd' : '?user=normal '
    }`
    if (email) {
      try {
        const sendEmail = await fetch('https://172.25.41.23:8000/send-email', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ toEmail: email, url: inviteLink })
        })
        const result = await sendEmail.json()
        console.log(sendEmail)
        if (sendEmail.status === 404) {
          console.log(result)
          toast.error(result.detail)
          setIsSubmitting(false)
          return
        } else {
          toast.success('Email sent successfully')
          router.push(inviteLink)
          router.refresh()
        }
      } catch (error) {
        toast.error('Failed to send email')
        setIsSubmitting(false)
      }
    } else {
      router.push(inviteLink)
      router.refresh()
    }
    setIsSubmitting(false)
  }

  const currentUserType = watch('currentUserType')
  const friendUserType = watch('friendUserType')

  if (status === 'loading') {
    return <LinearProgressCustom />
  }

  if (status === 'unauthenticated') {
    return redirect('/auth/sign-in?callbackUrl=' + encodeURIComponent(window.location.origin + '/video-call'))
  }

  return (
    <Stack justifyContent='center' alignItems='center' spacing={2} height='80vh'>
      <Paper sx={{ p: 3 }} elevation={12}>
        <Typography variant='h5' component='h1' mb={4} align='center'>
          Create Room
        </Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack alignItems='center' width='500px' spacing={2}>
            <TextField
              label='Channel Name'
              type='text'
              {...register('channel')}
              error={!!errors.channel}
              helperText={errors.channel?.message}
              placeholder='Enter channel name'
              required
              size='small'
              fullWidth
            />
            <FormControl fullWidth sx={{ pl: 0.5 }}>
              <FormLabel>Current user type</FormLabel>
              <Controller
                name='currentUserType'
                control={control}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel value='normal' control={<Radio />} label='Normal' />
                    <FormControlLabel value='deaf-dumb' control={<Radio />} label='Deaf-dumb' />
                  </RadioGroup>
                )}
              />
            </FormControl>
            <FormControl fullWidth sx={{ pl: 0.5 }}>
              <FormLabel>Your friend type</FormLabel>
              <Controller
                name='friendUserType'
                control={control}
                render={({ field }) => (
                  <RadioGroup row {...field}>
                    <FormControlLabel value='normal' control={<Radio />} label='Normal' />
                    <FormControlLabel value='deaf-dumb' control={<Radio />} label='Deaf-dumb' />
                  </RadioGroup>
                )}
              />
            </FormControl>
            <TextField
              label='Email of user to invite (optional)'
              type='email'
              {...register('email')}
              error={!!errors.email}
              helperText={errors.email?.message}
              size='small'
              fullWidth
            />
            <TextField
              label='Invite Link'
              type='text'
              value={`${window.location.origin}/video-call/channel/${watch('channel')}${
                friendUserType === 'deaf-dumb' ? '/?user=dd' : '?user=normal'
              }`}
              InputProps={{
                readOnly: true
              }}
              size='small'
              fullWidth
            />
            <Button type='submit' variant='contained' color='primary' disabled={isSubmitting}>
              {isSubmitting ? 'Submitting...' : 'Join'}
            </Button>
          </Stack>
        </form>
      </Paper>
    </Stack>
  )
}
