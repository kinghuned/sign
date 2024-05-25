'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { GitHub, Google } from '@mui/icons-material'
import { Box, Button, Divider, Paper, Stack, TextField, Typography } from '@mui/material'
import Link from 'next/link'
import { redirect, useRouter } from 'next/navigation'
import { SubmitHandler, useForm } from 'react-hook-form'
import { z } from 'zod'
import styles from '../auth.module.scss'
import { signIn, useSession } from 'next-auth/react'
import { toast } from 'react-toastify'

const formSchema = z
  .object({
    name: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z.string().min(1, 'Password is required').min(8, 'Password must have at least 8 characters'),
    confirmPassword: z.string().min(1, 'Confirm Password is required')
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'] // The path of the error message
  })

type FormFields = z.infer<typeof formSchema>

export default function SignUpPage() {
  const router = useRouter()
  const { status } = useSession()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm<FormFields>({
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: ''
    },
    resolver: zodResolver(formSchema)
  })

  const onSubmit: SubmitHandler<FormFields> = async data => {
    try {
      const res = await fetch('/api/user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      })
      if (res.ok) {
        router.push('/auth/sign-in')
        toast.success('Registration successful!')
      } else console.error('Registration failed')

      console.log(data)
    } catch (err) {
      setError('email', {
        message: 'This email is already taken'
      })
    }
  }

  if (status === 'loading') {
    return <div>Loading...</div>
  }

  if (status === 'authenticated') {
    return redirect('/')
  }

  return (
    <Box height='70vh'>
      <Stack sx={{ width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' }}>
        <Paper sx={{ mt: 4, width: '360px', p: 3, borderRadius: '10px' }} elevation={24}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Typography component='h2' variant='h6' textAlign='center'>
              Sign up
            </Typography>
            <Stack mt={2} spacing={2}>
              <TextField
                {...register('name')}
                label='Username'
                type='text'
                placeholder='john'
                variant='outlined'
                size='small'
                fullWidth
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                {...register('email')}
                label='Email'
                type='email'
                placeholder='john@gmail.com'
                variant='outlined'
                size='small'
                fullWidth
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                {...register('password')}
                label='Password'
                type='password'
                variant='outlined'
                size='small'
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <TextField
                {...register('confirmPassword')}
                label='Confirm Password'
                type='password'
                variant='outlined'
                size='small'
                fullWidth
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />
              <Button type='submit' disabled={isSubmitting} variant='contained'>
                {isSubmitting ? 'Submitting...' : 'Sign up'}
              </Button>
              <Divider sx={{ py: 1 }}>or</Divider>
              <Button startIcon={<Google />} variant='outlined' onClick={() => signIn('google')}>
                Sign in with Google
              </Button>
            </Stack>
          </form>

          <Typography textAlign='center' mt={2}>
            Already have an account{' '}
            <Link href='/auth/sign-in' className={styles.redirectLink}>
              Sign in
            </Link>
          </Typography>
        </Paper>
      </Stack>
    </Box>
  )
}
