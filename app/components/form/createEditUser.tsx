'use client'
import { Autocomplete, Button, Modal, Stack, TextField, Typography } from '@mui/material'
import { User } from '@prisma/client'
import { Dispatch, SetStateAction, useEffect } from 'react'
import { useForm, SubmitHandler, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: '10px',
  boxShadow: 24,
  p: 4
}

const userFormSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  image: z.union([z.string().url('Invalid URL'), z.literal('')]),
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z.string().min(8, 'Password must have at least 8 characters').optional(),
  role: z.enum(['user', 'admin'])
})

export type UserFormFields = z.infer<typeof userFormSchema>

export interface CreateEditUserFormProps {
  userId?: string
  open: boolean
  setOpen: Dispatch<SetStateAction<boolean>>
  userInfo: User
  setUserInfo: Dispatch<SetStateAction<User>>
  action: 'detail' | 'create' | 'edit'
  createUser: (data: UserFormFields) => void
  editUser: (data: Partial<UserFormFields>) => void
}

export default function CreateEditUserForm({
  userId,
  open,
  setOpen,
  userInfo,
  setUserInfo,
  action,
  createUser,
  editUser
}: CreateEditUserFormProps) {
  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting }
  } = useForm<UserFormFields>({
    defaultValues: {
      name: '',
      image: '',
      email: '',
      password: '',
      role: 'user'
    },
    resolver: zodResolver(userFormSchema)
  })

  const getUserInfo = async () => {
    if (userId) {
      try {
        const response = await fetch(`https://172.25.41.23:8000/users/id/${userId}`)
        const userInfo: User = await response.json()
        console.log('Fetched user info:', userId, userInfo)
        setUserInfo(userInfo)
        setValue('name', userInfo.name ?? '')
        setValue('image', userInfo.image ?? '')
        setValue('email', userInfo.email ?? '')
        setValue('password', userInfo.password ?? '')
        setValue('role', userInfo.role as 'user' | 'admin')
      } catch (error) {
        console.error('Error fetching user info:', error)
      }
    }
  }

  useEffect(() => {
    console.log('Modal open:', open)
    if (open) {
      if (action === 'edit' || (action === 'detail' && userId)) {
        getUserInfo()
      } else {
        setUserInfo({ ...userInfo, name: '', image: '', email: '', role: 'user' })
      }
    }
  }, [open])

  const onSubmit: SubmitHandler<UserFormFields> = data => {
    console.log('Form data:', data)
    if (action === 'create') {
      createUser(data)
    } else {
      const { password, ...rest } = data
      const dataToEdit = password ? { ...rest, password } : rest
      editUser(dataToEdit)
      setValue('name', '')
      setValue('image', '')
      setValue('email', '')
      setValue('password', '')
      setValue('role', 'user')
    }
  }

  return (
    <div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Stack direction='column' spacing={2} sx={style} justifyContent='center' alignItems='center'>
            <Typography variant='h6' component='h2'>
              User Info
            </Typography>
            <TextField
              {...register('name')}
              label='Name'
              type='text'
              fullWidth
              error={!!errors.name}
              helperText={errors.name?.message}
              focused
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: action === 'detail' }}
            />
            <TextField
              {...register('image')}
              label='Image'
              type='url'
              fullWidth
              error={!!errors.image}
              helperText={errors.image?.message}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: action === 'detail' }}
            />
            <TextField
              {...register('email')}
              label='Email'
              type='email'
              fullWidth
              error={!!errors.email}
              helperText={errors.email?.message}
              InputLabelProps={{ shrink: true }}
              InputProps={{ readOnly: action === 'detail' }}
            />
            {action === 'create' && (
              <TextField
                {...register('password')}
                label='Password'
                type='password'
                fullWidth
                error={!!errors.password}
                helperText={errors.password?.message}
                InputLabelProps={{ shrink: true }}
              />
            )}
            <Controller
              name='role'
              control={control}
              render={({ field }) => (
                <Autocomplete
                  {...field}
                  disablePortal
                  options={['user', 'admin']}
                  fullWidth
                  value={field.value || 'user'}
                  onChange={(_, value) => field.onChange(value)}
                  renderInput={params => (
                    <TextField {...params} label='Role' InputProps={{ readOnly: action === 'detail' }} />
                  )}
                />
              )}
            />
            <Button
              type='submit'
              variant='contained'
              disabled={isSubmitting}
              sx={{ display: action === 'detail' ? 'none' : 'block' }}
            >
              Submit
            </Button>
          </Stack>
        </form>
      </Modal>
    </div>
  )
}
