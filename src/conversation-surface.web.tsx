import { useMemo, useState, type FormEvent } from 'react'
import type { AntifraudConversationMessage, AntifraudConversationSurfaceProps } from './conversation-types.js'

export type { AntifraudConversationMessage, AntifraudConversationSurfaceProps, AntifraudConversationUser } from './conversation-types.js'

/** Browser adapter for the canonical conversation contract used by Expo. */
export function AntifraudConversationSurface<TMessage extends AntifraudConversationMessage = AntifraudConversationMessage>({
  messages, currentUser, onSendText, onAttach, renderMessageContent, footer, copy, composerEnabled = true,
}: AntifraudConversationSurfaceProps<TMessage>) {
  const [draft, setDraft] = useState('')
  const transcript = useMemo(() => [...messages], [messages])
  const submit = (event: FormEvent) => {
    event.preventDefault()
    const text = draft.trim()
    if (!text) return
    void onSendText(text)
    setDraft('')
  }
  return <section aria-label="Conversation" className="antifraud-conversation-surface">
    <ol className="antifraud-conversation-transcript">
      {transcript.map(message => {
        const outgoing = String(message.user._id) === String(currentUser._id)
        return <li key={String(message._id)} data-direction={outgoing ? 'outgoing' : 'incoming'} className="antifraud-conversation-message">
          {message.user.name ? <strong>{message.user.name}</strong> : null}
          {message.text ? <p>{message.text}</p> : null}
          {message.image ? <img src={message.image} alt={message.text || ''} /> : null}
          {message.audio ? <audio controls src={message.audio} aria-label={message.text || 'Audio message'} /> : null}
          {message.file ? <a href={message.file.uri} download={message.file.name}>{message.file.name}</a> : null}
          {renderMessageContent?.(message)}
        </li>
      })}
    </ol>
    {composerEnabled ? <form onSubmit={submit} className="antifraud-conversation-composer">
      <label><span className="sr-only">{copy?.placeholder || 'Message'}</span><input value={draft} placeholder={copy?.placeholder || 'Message'} onChange={event => setDraft(event.currentTarget.value)} /></label>
      {onAttach ? <button type="button" onClick={() => void onAttach()} aria-label="Attach">+</button> : null}
      <button type="submit">{copy?.send || 'Send'}</button>
    </form> : null}
    {footer}
  </section>
}
