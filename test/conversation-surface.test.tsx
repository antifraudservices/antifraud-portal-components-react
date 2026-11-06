// Flow contract: the neutral portal conversation surface delegates transcript and composer behavior to the maintained React Native chat while the host retains delivery, attachment and governed-resource rendering authority.
// @vitest-environment jsdom
import React from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'

const capture = vi.hoisted(() => vi.fn())
vi.mock('@kesha-antonov/react-native-chat', () => ({
  Chat: (props: any) => {
    capture(props)
    return <div data-testid="native-conversation">
      {props.messages.map((message: any) => <span key={message._id}>{message.text}</span>)}
      <button type="button" onClick={() => props.onSend([{ text: 'Host-owned send' }])}>Mock send</button>
    </div>
  },
}))

import { AntifraudConversationSurface } from '../src/conversation-surface.js'

afterEach(() => { cleanup(); capture.mockClear() })

describe('AntifraudConversationSurface', () => {
  it('renders one supplied IMessage transcript and delegates sending', () => {
    const onSendText = vi.fn()
    render(<AntifraudConversationSurface
      messages={[{ _id: 'update-1', createdAt: new Date('2026-11-06T12:00:00.000Z'), text: 'Records index updated', user: { _id: 'Service/records', name: 'Records service' }, system: true }]}
      currentUser={{ _id: 'Person/self', name: 'Me' }}
      onSendText={onSendText}
    />)
    expect(screen.getByTestId('native-conversation')).toBeVisible()
    expect(screen.getByText('Records index updated')).toBeVisible()
    expect(capture.mock.calls[0]![0].attachments).toBe(false)
    fireEvent.click(screen.getByRole('button', { name: 'Mock send' }))
    expect(onSendText).toHaveBeenCalledWith('Host-owned send')
  })
})
