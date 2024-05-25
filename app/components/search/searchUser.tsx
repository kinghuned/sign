'use client'
import { ClearRounded, SearchRounded } from '@mui/icons-material'
import {
  Avatar,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  List,
  ListItem,
  ListItemText,
  OutlinedInput
} from '@mui/material'
import { Conversation, User } from '@prisma/client'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import { useDebouncedCallback } from 'use-debounce'
import styles from './searchUser.module.scss'
import { ConversationCustom } from '@/app/model'

export interface SearchUsersProps {
  userId: string
  getConversationList: (userId: string) => void
}

export default function SearchUsers({ userId, getConversationList }: SearchUsersProps) {
  const router = useRouter()
  const [userList, setUserList] = useState<User[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [clearText, setClearText] = useState(false)
  const [isOpenConfirm, setIsOpenConfirm] = useState(false)
  const [userSelected, setUserSelected] = useState<User | null>(null)
  const [ws, setWs] = useState<WebSocket | null>(null)

  useEffect(() => {
    const socket = new WebSocket(`wss://172.25.41.23:8000/conversations/new-conversation/${userId}`)
    setWs(socket)

    socket.onmessage = function (event) {
      console.log('event.data', event.data)
      const newConversation: Conversation = JSON.parse(event.data)
      if (newConversation.user2Id === userId) {
        console.log('newConversation')
        getConversationList(userId)
      }
    }
    return () => {
      if (socket.readyState === WebSocket.OPEN) socket.close()
    }
  }, [])

  const handleClickOpen = (user: User) => {
    setIsOpenConfirm(true)
    setUserSelected(user)
  }

  const handleClose = () => {
    setIsOpenConfirm(false)
  }
  const addConversation = async () => {
    const response = await fetch(`https://172.25.41.23:8000/conversations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user1Id: userId, user2Id: userSelected?.id })
    })
    const newConversation: ConversationCustom = await response.json()

    if (newConversation.status === 'had') {
      toast.info('This user has already been existed')
    } else if (newConversation.status === 'added') {
      toast.success('Add user successfully')
      if (ws) ws.send(JSON.stringify(newConversation))
    }
    router.push(`/chat/${newConversation.id}`)
  }
  const handleConfirm = async () => {
    await addConversation()
    handleClose()
    setSearchTerm('')
    setUserList([])
    getConversationList(userId)
  }

  const debounced = useDebouncedCallback(email => {
    const getUsers = async () => {
      const response = await fetch(`https://172.25.41.23:8000/${userId}/users/email/${email}`)
      const userList: User[] = await response.json()
      setUserList(userList)
    }
    if (email) {
      setClearText(true)
      getUsers()
    } else {
      setUserList([])
      setClearText(false)
    }
  }, 300)

  return (
    <Box>
      <OutlinedInput
        placeholder='Search by email'
        fullWidth
        size='small'
        value={searchTerm}
        autoComplete='off'
        onChange={e => {
          setSearchTerm(e.target.value)
          debounced(e.target.value)
        }}
        startAdornment={<SearchRounded color='action' sx={{ mr: 1 }} />}
        endAdornment={
          searchTerm && (
            <ClearRounded
              color='action'
              sx={{ cursor: 'pointer' }}
              onClick={() => {
                setSearchTerm('')
                setUserList([])
              }}
            />
          )
        }
      />
      <Dialog open={isOpenConfirm} onClose={handleClose}>
        <DialogTitle>Confirm add user to the conversation</DialogTitle>
        <DialogContent>
          <DialogContentText>{`You sure want to add ${userSelected?.name} with email ${userSelected?.email}?`}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>No</Button>
          <Button variant='contained' onClick={handleConfirm} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
      <List className={styles.userList}>
        {userList.length > 0 &&
          userList.map(user => (
            <ListItem className={styles.userItem} key={user.id} onClick={() => handleClickOpen(user)}>
              <Avatar alt={user.name as string} src={user.image as string} />
              <ListItemText sx={{ ml: 2 }} primary={user.email} secondary={user.name} />
            </ListItem>
          ))}
      </List>
    </Box>
  )
}
