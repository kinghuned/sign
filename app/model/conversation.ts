import { Conversation, Message, User } from '@prisma/client'

export type ConversationCustom = {
  user1: User
  user2: User
  Message: Message[]
  status?: string
} & Conversation
