import type { ReactNode } from 'react'

export type AntifraudConversationUser = Readonly<{
  _id: string | number
  name?: string
  avatar?: string
}>

export type AntifraudConversationMessage = Readonly<Record<string, unknown>> & {
  _id: string | number
  text: string
  createdAt: Date | number
  user: AntifraudConversationUser
  audio?: string
  image?: string
  file?: Readonly<{ uri: string; name: string; type?: string }>
}

export type AntifraudConversationSurfaceProps<TMessage extends AntifraudConversationMessage> = Readonly<{
  messages: readonly TMessage[]
  currentUser: AntifraudConversationUser
  locale?: string
  onSendText(text: string): void | Promise<void>
  onAttach?(): void | Promise<void>
  renderMessageContent?(message: TMessage): ReactNode
  footer?: ReactNode
  copy?: Readonly<{ placeholder: string; send: string }>
  composerEnabled?: boolean
}>
