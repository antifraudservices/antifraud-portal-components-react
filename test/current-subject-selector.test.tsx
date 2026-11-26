// Flow contract: the host owns the eligible list and current subject; the shared selector delegates a change and keeps the old subject if the host rejects it.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import { CurrentSubjectSelector } from '../src/current-subject-selector.js'

afterEach(cleanup)

const subjects = [{ id: 'one', label: 'Case 1' }, { id: 'two', label: 'Case 2' }, { id: 'three', label: 'Case 3', disabled: true }]
const copy = { select: 'Select subject', change: 'Change subject', pending: 'Opening subject…', error: 'Could not open the subject.' }

it('returns focus after selection and displays the selected subject supplied by the host', async () => {
  const onSelect = vi.fn(async () => true)
  const view = render(<CurrentSubjectSelector subjects={subjects} selectedId="one" copy={copy} onSelect={onSelect} />)
  const trigger = screen.getByText('Case 1', { selector: 'summary > span' })
  fireEvent.click(trigger)
  expect(screen.getByRole('button', { name: 'Case 3' })).toBeDisabled()
  fireEvent.click(screen.getByRole('button', { name: 'Case 2' }))
  await waitFor(() => expect(trigger.closest('details')).not.toHaveAttribute('open'))
  expect(trigger.closest('summary')).toHaveFocus()
  expect(onSelect).toHaveBeenCalledWith('two')
  view.rerender(<CurrentSubjectSelector subjects={subjects} selectedId="two" copy={copy} onSelect={onSelect} />)
  expect(screen.getByLabelText('Change subject · Case 2')).toBeVisible()
})

it('keeps the current selection and tells the user if the host fails to open a subject', async () => {
  const onSelect = vi.fn().mockRejectedValue(new Error('private implementation detail'))
  render(<CurrentSubjectSelector subjects={subjects} selectedId="one" copy={copy} onSelect={onSelect} />)
  const trigger = screen.getByLabelText('Change subject · Case 1')
  fireEvent.click(trigger)
  fireEvent.click(screen.getByRole('button', { name: 'Case 2' }))
  expect(await screen.findByRole('alert')).toHaveTextContent(copy.error)
  expect(trigger.closest('details')).toHaveAttribute('open')
  fireEvent.keyDown(trigger, { key: 'Escape' })
  expect(trigger).toHaveFocus()
  expect(trigger.closest('details')).not.toHaveAttribute('open')
})
