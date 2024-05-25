'use client'
import PieChartCustom from '@/app/components/chart/pie'
import CreateEditUserForm, { UserFormFields } from '@/app/components/form/createEditUser'
import { AddRounded, DeleteRounded, EditRounded, VisibilityRounded } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Stack,
  Typography
} from '@mui/material'
import { BarChart } from '@mui/x-charts/BarChart'
import { DataGrid, GridColDef, GridRowSelectionModel } from '@mui/x-data-grid'
import { hash } from 'bcryptjs'
import { User } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface SumConversationsMessages {
  label: string
  data: number[]
}

const highlightScope = {
  highlighted: 'series',
  faded: 'global'
} as const

const columns: GridColDef[] = [
  { field: 'id', headerName: 'ID', width: 200 },
  { field: 'name', headerName: 'Full name', width: 200 },
  { field: 'email', headerName: 'Email', width: 250 },
  {
    field: 'image',
    headerName: 'Avatar',
    width: 130,
    headerAlign: 'center',

    renderCell: params => (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%' }}>
        <Avatar alt={params.row.name} src={params.value} sx={{ border: '1px solid orange' }} />
      </Box>
    )
  },
  {
    field: 'role',
    headerName: 'Role',
    headerAlign: 'center',
    align: 'center',
    width: 100,

    renderCell: params => <Chip color={params.value === 'admin' ? 'warning' : 'info'} label={params.value} />
  }
]

export default function AdminPage() {
  const { data: session, status } = useSession()
  const [userInfo, setUserInfo] = useState<User>({
    id: '',
    emailVerified: null,
    password: '',
    name: '',
    image: '',
    email: '',
    role: 'user',
    createdAt: new Date(),
    updatedAt: new Date()
  })
  const router = useRouter()
  const [userList, setUserList] = useState<User[]>([])
  const [conversationsAndMessages, setConversationsAndMessages] = useState<SumConversationsMessages[]>([])
  const [selection, setSelection] = useState<GridRowSelectionModel>([])
  const [openCreateEditUser, setOpenCreateEditUser] = useState(false)
  const [action, setAction] = useState<'detail' | 'create' | 'edit'>('create')
  const [isOpenConfirm, setIsOpenConfirm] = useState(false)

  const getUserList = async () => {
    const response = await fetch('https://172.25.41.23:8000/users')
    const userList: User[] = await response.json()
    setUserList(userList)
  }

  const getSumConversationsAndMessages = async () => {
    const response = await fetch('https://172.25.41.23:8000/sum-conversations-and-messages')
    const conversationsAndMessages: SumConversationsMessages[] = await response.json()
    console.log(conversationsAndMessages)
    setConversationsAndMessages(conversationsAndMessages)
  }

  const createUser = async (data: UserFormFields) => {
    try {
      const hashedPassword = await hash(data.password || '', 10)
      const response = await fetch('https://172.25.41.23:8000/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          image: data.image,
          password: hashedPassword,
          role: data.role
        })
      })
      const result = await response.json()
      toast.success('Create user successfully')
      setOpenCreateEditUser(false)
      getUserList()
    } catch (error) {
      console.error(error)
    }
  }

  const editUser = async (data: Partial<UserFormFields>) => {
    console.log('Editing user with data:', data)
    const body: any = {
      name: data.name,
      email: data.email,
      image: data.image,
      role: data.role
    }
    if (data.password) {
      body.password = await hash(data.password, 10)
    }

    const response = await fetch(`https://172.25.41.23:8000/users/${selection[0]}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
    const result = await response.json()
    toast.info('Edit user successfully')
    setOpenCreateEditUser(false)
    getUserList()
  }

  const deleteUsers = async () => {
    try {
      const response = await fetch('https://172.25.41.23:8000/users/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: selection })
      })
      const result = await response.json()
      toast.success(`Delete ${selection.length > 1 ? 'users' : 'user'} successfully`)
      setIsOpenConfirm(false)
      getUserList()
    } catch (error) {
      console.error(error)
    }
  }

  useEffect(() => {
    getUserList()
    getSumConversationsAndMessages()
  }, [])

  if (status === 'loading') return <Typography>Loading...</Typography>
  if (session?.user?.role !== 'admin') {
    console.log(session?.user.role)
    setTimeout(() => {
      router.push('/')
    }, 10000)
    return <Typography textAlign='center'>You are not an admin, redirecting after 10 seconds...</Typography>
  }

  return (
    <Box>
      <Typography component='h1' variant='h5' fontWeight='bold'>
        Admin Page
      </Typography>
      <Stack direction='row' spacing={10} alignItems='center' mt={2}>
        <PieChartCustom userList={userList} />
        <BarChart height={300} series={conversationsAndMessages.map(s => ({ ...s, highlightScope, data: s.data }))} />
      </Stack>
      <Stack direction='row' justifyContent='space-between' alignItems='center' mt={2}>
        <Typography component='h2' variant='h6'>
          List users
        </Typography>
        <Stack direction='row' spacing={2}>
          <Button
            variant='contained'
            startIcon={<AddRounded />}
            color='success'
            onClick={() => {
              setAction('create')
              setOpenCreateEditUser(true)
            }}
          >
            Add new user
          </Button>
          <Button
            variant='contained'
            startIcon={<VisibilityRounded />}
            color='info'
            disabled={selection?.length !== 1}
            onClick={() => {
              setAction('detail')
              setOpenCreateEditUser(true)
            }}
          >
            Detail
          </Button>
          <Button
            variant='contained'
            startIcon={<EditRounded />}
            color='info'
            disabled={selection?.length !== 1}
            onClick={() => {
              setAction('edit')
              setOpenCreateEditUser(true)
            }}
          >
            Edit
          </Button>
          <Button
            variant='contained'
            startIcon={<DeleteRounded />}
            color='error'
            disabled={selection?.length === 0}
            onClick={() => setIsOpenConfirm(true)}
          >
            Delete
          </Button>
        </Stack>
      </Stack>
      <CreateEditUserForm
        action={action}
        createUser={createUser}
        editUser={editUser}
        open={openCreateEditUser}
        setOpen={setOpenCreateEditUser}
        userInfo={userInfo}
        setUserInfo={setUserInfo}
        userId={selection?.[0] as string}
      />
      <Dialog open={isOpenConfirm} onClose={() => setIsOpenConfirm(false)}>
        <DialogTitle>Confirm delete user</DialogTitle>
        <DialogContent>
          <DialogContentText>{`Are you sure you want to delete ${
            selection?.length > 1 ? 'users' : 'user'
          } with id ${selection?.join(', ')}`}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsOpenConfirm(false)}>No</Button>
          <Button variant='contained' onClick={deleteUsers} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <Box mt={2}>
        <DataGrid
          rows={userList}
          columns={columns}
          initialState={{
            pagination: {
              paginationModel: { page: 0, pageSize: 5 }
            }
          }}
          checkboxSelection
          onRowSelectionModelChange={selection => {
            console.log(selection)
            setSelection(selection)
          }}
          pageSizeOptions={[5, 10, 20, 50, 100]}
        />
      </Box>
    </Box>
  )
}
