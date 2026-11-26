'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

export type CurrentSubjectOption = Readonly<{
  id: string
  label: string
  avatar?: ReactNode
  secondaryLabel?: string
  disabled?: boolean
}>

type CurrentSubjectSelectorProps = Readonly<{
  subjects: readonly CurrentSubjectOption[]
  selectedId?: string
  copy: Readonly<{ select: string; change: string; pending: string; error: string }>
  onSelect(id: string): boolean | void | Promise<boolean | void>
}>

/** Presents the host's eligible subjects; only the host can confirm a new selection. */
export function CurrentSubjectSelector({ subjects, selectedId, copy, onSelect }: CurrentSubjectSelectorProps) {
  const details = useRef<HTMLDetailsElement>(null)
  const trigger = useRef<HTMLElement>(null)
  const inFlight = useRef(false)
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)
  const selected = subjects.find(subject => subject.id === selectedId)

  useEffect(() => {
    function closeOutside(event: PointerEvent) {
      const element = details.current
      if (element?.open && !element.contains(event.target as Node)) element.open = false
    }
    document.addEventListener('pointerdown', closeOutside)
    return () => document.removeEventListener('pointerdown', closeOutside)
  }, [])

  if (subjects.length === 0) return null

  function close() {
    if (details.current) details.current.open = false
    trigger.current?.focus({ preventScroll: true })
  }

  async function select(id: string) {
    if (inFlight.current) return
    inFlight.current = true
    setPending(true)
    setFailed(false)
    try {
      if (await onSelect(id) !== false) close()
    } catch {
      setFailed(true)
    } finally {
      inFlight.current = false
      setPending(false)
    }
  }

  return <details ref={details} className="afpc-current-subject-selector" onKeyDown={event => {
    if (event.key === 'Escape' && event.currentTarget.open) {
      event.stopPropagation()
      close()
    }
  }}>
    <summary ref={trigger} aria-label={selected ? `${copy.change} · ${selected.label}` : copy.select}>
      {selected?.avatar}
      <span>{selected?.label || copy.select}</span>
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" aria-hidden="true"><path d="m4 6 4 4 4-4" /></svg>
    </summary>
    <ul>
      {subjects.map(subject => <li key={subject.id}>
        <button type="button" disabled={pending || subject.disabled} aria-pressed={subject.id === selectedId} onClick={() => void select(subject.id)}>
          {subject.avatar}
          <span><span>{subject.label}</span>{subject.secondaryLabel ? <small>{subject.secondaryLabel}</small> : null}</span>
        </button>
      </li>)}
      {pending ? <li role="status">{copy.pending}</li> : null}
      {failed ? <li role="alert">{copy.error}</li> : null}
    </ul>
  </details>
}
