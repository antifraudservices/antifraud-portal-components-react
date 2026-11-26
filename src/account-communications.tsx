'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'

export type AccountCommunicationKind = 'call' | 'video-call' | 'audio' | 'text' | 'file'

export type AccountCommunicationEntry = Readonly<{
  id: string
  kind: AccountCommunicationKind
  title: string
  subject?: string
  time?: Readonly<{ dateTime: string; label: string }>
  content?: ReactNode
}>

type AccountCommunicationsProps = Readonly<{
  copy: Readonly<{ title: string; close: string; empty: string }>
  live?: Readonly<{ kind: 'call' | 'video-call'; label: string; ringing?: boolean }>
  notice?: Readonly<{ count: number; summary: string }>
  groups: readonly Readonly<{ label: string; entries: readonly AccountCommunicationEntry[] }>[]
  pending?: string
  error?: string
  content?: ReactNode
}>

const iconPaths = {
  inbox: 'M3 5h18v13H8l-5 4V5zm4 5h10M7 14h7',
  call: 'M5 3h4l2 5-3 2a13 13 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 3 5a2 2 0 0 1 2-2z',
  'video-call': 'M3 6h12v12H3zM15 10l6-3v10l-6-3',
  audio: 'M3 10v4M7 7v10M12 3v18M17 7v10M21 10v4',
  text: 'M3 5h18v14H3zM3 6l9 7 9-7',
  file: 'M6 3h8l4 4v14H6zM14 3v5h4M9 13h6m-6 4h6',
}

function CommunicationIcon({ kind }: { kind: keyof typeof iconPaths }) {
  return <svg className="afpc-account-communications-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
    strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={iconPaths[kind]} /></svg>
}

/** Renders communications already selected for this account by the host. */
export function AccountCommunications({ copy, live, notice, groups, pending, error, content }: AccountCommunicationsProps) {
  const [open, setOpen] = useState(false)
  const id = useId()
  const trigger = useRef<HTMLButtonElement>(null)
  const panel = useRef<HTMLDivElement>(null)
  const alert = live?.label || (notice && notice.count > 0 ? notice.summary : '')
  const triggerLabel = live?.label || [copy.title, alert].filter(Boolean).join(', ')
  const hasEntries = groups.some(group => group.entries.length > 0)

  useEffect(() => { if (open) panel.current?.focus() }, [open])

  function close() {
    setOpen(false)
    trigger.current?.focus()
  }

  return <div className="afpc-account-communications" onKeyDown={event => {
    if (open && event.key === 'Escape') {
      event.stopPropagation()
      close()
    }
  }}>
    <button ref={trigger} type="button" className="afpc-account-communications-trigger"
      data-ringing={live?.ringing || undefined} aria-label={triggerLabel} aria-expanded={open} aria-controls={id}
      onClick={() => open ? close() : setOpen(true)}>
      <CommunicationIcon kind={live?.kind || 'inbox'} />
      {notice && notice.count > 0 ? <span className="afpc-account-communications-count" aria-hidden="true">{notice.count}</span> : null}
    </button>
    <span className="afpc-account-communications-announcement" role="status">{alert}</span>
    <div ref={panel} id={id} hidden={!open} tabIndex={-1} role="region" aria-labelledby={`${id}-title`} className="afpc-account-communications-panel">
      <div className="afpc-account-communications-heading">
        <h2 id={`${id}-title`}>{copy.title}</h2>
        <button type="button" onClick={close}>{copy.close}</button>
      </div>
      {pending ? <p role="status">{pending}</p> : null}
      {error ? <p role="alert">{error}</p> : null}
      {content}
      {groups.filter(group => group.entries.length > 0).map(group => <section key={group.label}>
        <h3>{group.label}</h3>
        <ul>
          {group.entries.map(entry => <li key={entry.id}>
            <div className="afpc-account-communications-entry-title"><CommunicationIcon kind={entry.kind} /><strong>{entry.title}</strong></div>
            {entry.subject ? <p>{entry.subject}</p> : null}
            {entry.time ? <time dateTime={entry.time.dateTime}>{entry.time.label}</time> : null}
            {entry.content}
          </li>)}
        </ul>
      </section>)}
      {!hasEntries && !pending && !error && !content ? <p>{copy.empty}</p> : null}
    </div>
  </div>
}
