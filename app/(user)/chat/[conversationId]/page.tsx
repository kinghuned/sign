'use client'
import MessageList from '@/app/components/messages/messages'
import { ConversationCustom } from '@/app/model'
import { Stack, Avatar, Typography, Divider, Box, LinearProgress } from '@mui/material'
import { Message } from '@prisma/client'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

export interface ConversationPageProps {
  params: { conversationId: string }
}

export default function ConversationPage({ params }: ConversationPageProps) {
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [conversation, setConversation] = useState<ConversationCustom>()

  const getMessages = async (conversationId: string) => {
    const response = await fetch(`https://172.25.41.23:8000/${conversationId}/messages`)
    const messages: Message[] = await response.json()
    setMessages(messages)
  }

  const getConversation = async (conversationId: string) => {
    const response = await fetch(`https://172.25.41.23:8000/conversations/${conversationId}`)
    const conversation: ConversationCustom = await response.json()
    setConversation(conversation)
  }

  useEffect(() => {
    getConversation(params.conversationId)
    getMessages(params.conversationId)
  }, [])

  if (conversation === undefined)
    return (
      <Box>
        <LinearProgress />
      </Box>
    )

  return (
    <Box width='100%' position='relative'>
      <Stack p={2} spacing={2} direction='row' alignItems='center '>
        {session?.user?.id === conversation?.user1Id ? (
          <Avatar src={conversation?.user2?.image!} />
        ) : (
          <Avatar src={conversation?.user1?.image!} />
        )}
        <Typography variant='h5' component='h1' fontWeight='bold' mb={1}>
          {session?.user?.id === conversation?.user1Id ? conversation?.user2.name : conversation?.user1.name}
        </Typography>
      </Stack>
      <Divider />
      <MessageList
        userId={session?.user?.id!}
        conversation={conversation!}
        getMessages={getMessages}
        messages={messages!}
        setMessages={setMessages}
      />
    </Box>
  )
}
