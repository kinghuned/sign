'use client'
import { ConversationCustom } from '@/app/model'
import { SendRounded } from '@mui/icons-material'
import { Box, Button, Stack, TextField, Typography } from '@mui/material'
import { Message } from '@prisma/client'
import { useParams } from 'next/navigation'
import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import DeleteBtn from './deleteBtn'
import styles from './messages.module.scss'

export interface MessageListProps {
  userId: string
  conversation: ConversationCustom
  getMessages: (conversationId: string) => void
  messages: Message[]
  setMessages: Dispatch<SetStateAction<Message[]>>
}

export default function MessageList({ userId, conversation, getMessages, messages, setMessages }: MessageListProps) {
  const [content, setContent] = useState<string>('')
  const [ws, setWs] = useState<WebSocket | null>(null)
  const messagesRef = useRef<HTMLDivElement>(null)
  const params = useParams<{ conversationId: string }>()

  const addMessage = async () => {
    if (content === '') {
      toast.info('Please enter message')
      return
    }
    const data = {
      content: content,
      conversationId: conversation?.id,
      senderId: userId
    }
    const response = await fetch('https://172.25.41.23:8000/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
    const newMessage: Message = await response.json()
    setMessages([...messages, newMessage])
    ws?.send(JSON.stringify(newMessage))
    setContent('')
  }

  useEffect(() => {
    if (userId) {
      const socket = new WebSocket(`wss://172.25.41.23:8000/chat/${userId}`)
      setWs(socket)

      socket.onmessage = event => {
        const message: Message = JSON.parse(event.data)
        console.log('message:', message, message.conversationId)
        if (params.conversationId === message.conversationId) getMessages(message.conversationId)
      }

      return () => {
        if (socket.readyState === WebSocket.OPEN) socket.close()
      }
    }
  }, [userId])

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo(0, messagesRef.current.scrollHeight)
    }
  }, [messages])
  return (
    <Box
      ref={messagesRef}
      className={styles.messageList}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'auto',
        height: 'calc(100vh - 71px - 56px - 120px)'
      }}
    >
      <Box sx={{ flex: '1 1 auto' }} />
      {messages &&
        messages.map((message, idx) => (
          <Box
            key={idx}
            className={styles.message}
            px={0.5}
            mt={0.5}
            sx={{
              display: 'flex',
              ml: message.senderId === userId ? 'auto' : 0,
              mr: message.senderId === userId ? 0 : 'auto',
              justifyContent: 'end'
            }}
          >
            {message.senderId === userId && ws && <DeleteBtn messageId={message.id} ws={ws} />}
            <Typography
              component='p'
              variant='body1'
              marginLeft={message.senderId === userId ? 'auto' : 0}
              marginRight={message.senderId === userId ? 0 : 'auto'}
              width='fit-content'
              p={1}
              px={2}
              sx={{ backgroundColor: message.senderId === userId ? '#0084ff' : '#f0f0f0' }}
              color={message.senderId === userId ? 'white' : 'black'}
              borderRadius='999px'
            >
              {message.content}
            </Typography>
          </Box>
        ))}
      <Stack direction='row' position='absolute' spacing={1} px={0.5} bottom='-46px' width='100%'>
        <TextField
          type='text'
          fullWidth
          name='message'
          size='small'
          value={content}
          autoFocus
          autoComplete='off'
          InputProps={{ sx: { borderRadius: 999 } }}
          onKeyDown={e => e.key === 'Enter' && addMessage()}
          onChange={e => setContent(e.target.value)}
        />
        <Button onClick={addMessage} variant='contained' sx={{ px: 3, borderRadius: 999 }} endIcon={<SendRounded />}>
          Send
        </Button>
      </Stack>
    </Box>
  )
}
