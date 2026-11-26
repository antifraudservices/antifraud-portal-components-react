// Flow contract: one neutral account disclosure presents live and recent communications, preserves host-owned actions and restores keyboard focus.
import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { AccountCommunications } from '../src/account-communications.js'

afterEach(cleanup)

const copy = { title: 'Communications', close: 'Close', live: 'Now', recent: 'Recent', empty: 'No communications yet' }

it('opens a video call and recent voice and text messages from one disclosure', () => {
  const answer = vi.fn()
  render(<AccountCommunications copy={copy} notice={{ count: 2, summary: '2 new messages' }}
    live={{ kind: 'video-call', label: 'Incoming video call', ringing: true }}
    groups={[
      { label: copy.live, entries: [{ id: 'live', kind: 'video-call', title: 'Incoming video call', subject: 'Case 1', content: <button onClick={answer}>Answer</button> }] },
      { label: copy.recent, entries: [
        { id: 'audio', kind: 'audio', title: 'Voice message', subject: 'Case 2', time: { dateTime: '2026-11-25T10:00:00Z', label: '10:00' } },
        { id: 'text', kind: 'text', title: 'Message', subject: 'Case 3' },
      ] },
    ]} />)
  const trigger = screen.getByRole('button', { name: 'Incoming video call' })
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
  expect(screen.getByRole('status')).toHaveTextContent('Incoming video call')
  fireEvent.click(trigger)
  const panel = screen.getByRole('region', { name: 'Communications' })
  expect(panel).toHaveFocus()
  expect(within(panel).getByText('Case 2')).toBeVisible()
  expect(within(panel).getByText('Case 3')).toBeVisible()
  expect(within(panel).getByText('10:00')).toHaveAttribute('datetime', '2026-11-25T10:00:00Z')
  fireEvent.click(within(panel).getByRole('button', { name: 'Answer' }))
  expect(answer).toHaveBeenCalledOnce()
  fireEvent.keyDown(panel, { key: 'Escape' })
  expect(trigger).toHaveFocus()
  expect(trigger).toHaveAttribute('aria-expanded', 'false')
})

it('announces the host-provided unread count and keeps an empty state in the panel', () => {
  const view = render(<AccountCommunications copy={copy} notice={{ count: 2, summary: '2 new messages' }} groups={[]} />)
  expect(screen.getByRole('status')).toHaveTextContent('2 new messages')
  fireEvent.click(screen.getByRole('button', { name: 'Communications, 2 new messages' }))
  expect(screen.getByText(copy.empty)).toBeVisible()
  view.rerender(<AccountCommunications copy={copy} groups={[]} />)
  expect(screen.getByRole('button', { name: 'Communications' })).toHaveAttribute('aria-expanded', 'true')
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(screen.getByRole('button', { name: 'Communications' })).toHaveFocus()
})
