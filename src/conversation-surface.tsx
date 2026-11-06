import { useMemo } from 'react'
import { Chat, type BubbleProps } from '@kesha-antonov/react-native-chat'
import type { AntifraudConversationMessage, AntifraudConversationSurfaceProps } from './conversation-types.js'

export type { AntifraudConversationMessage, AntifraudConversationSurfaceProps, AntifraudConversationUser } from './conversation-types.js'

/**
 * Product-neutral React Native/Web transcript and composer. The host supplies
 * already-authorized messages and owns every delivery, attachment and
 * governed-resource action.
 */
export function AntifraudConversationSurface<TMessage extends AntifraudConversationMessage = AntifraudConversationMessage>({
  messages,
  currentUser,
  locale,
  onSendText,
  onAttach,
  renderMessageContent,
  footer,
  copy,
  composerEnabled = true,
}: AntifraudConversationSurfaceProps<TMessage>) {
  const transcript = useMemo(() => [...messages], [messages])
  return <Chat<TMessage>
    messages={transcript}
    user={currentUser as any}
    {...(locale ? { locale } : {})}
    {...(copy ? { labels: copy } : {})}
    onSend={next => {
      for (const message of next) {
        const text = message.text.trim()
        if (text) void onSendText(text)
      }
    }}
    {...(onAttach ? { onPressActionButton: () => void onAttach() } : {})}
    attachments={false}
    audioRecording={false}
    videoRecording={false}
    {...(!composerEnabled ? { renderInputToolbar: () => null } : {})}
    {...(renderMessageContent ? { renderCustomView: (props: BubbleProps<TMessage>) => renderMessageContent(props.currentMessage) } : {})}
    {...(footer ? { renderChatFooter: () => footer } : {})}
  />
}
