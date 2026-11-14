// Flow contract: locator resolution only identifies a target; explicit host request state and selected sections govern the controlled view without granting access.
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'

afterEach(cleanup)
const loadPanel = (path: string) => import(/* @vite-ignore */ path)
const copy = {
  title: 'Request access', description: 'Select a subject and sections',
  locatorKindLabel: 'Locator kind', locatorKinds: { 'numeric-code': 'Card code', 'phone-number': 'Telephone' },
  locatorLabel: 'Locator', resolve: 'Find subject', resolving: 'Finding subject',
  sectionsLabel: 'Sections', request: 'Send request', requesting: 'Sending request',
  requested: 'Awaiting controller approval', granted: 'Access approved',
}

it('keeps resolution separate from an explicit selected-section request and pending approval', async () => {
  const { SubjectAccessRequestPanel } = await loadPanel('../src/subject-access-request-panel.js')
  const onResolve = vi.fn()
  const onRequest = vi.fn()
  const props = { copy, locatorKind: 'numeric-code', locator: '000000', status: 'idle', sections: [], onLocatorKindChange: vi.fn(), onLocatorChange: vi.fn(), onToggleSection: vi.fn(), onResolve, onRequest }
  const view = render(<SubjectAccessRequestPanel {...props}/>)
  expect(screen.queryByRole('button', { name: 'Send request' })).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Find subject' }))
  expect(onResolve).toHaveBeenCalledOnce()
  expect(onRequest).not.toHaveBeenCalled()
  view.rerender(<SubjectAccessRequestPanel {...props} status="resolved" target={{ subjectId: 'selected', display: 'Selected subject' }} sections={[{ code: 'identity', label: 'Identity', selected: false }]}/>)
  expect((screen.getByRole('button', { name: 'Send request' }) as HTMLButtonElement).disabled).toBe(true)
  view.rerender(<SubjectAccessRequestPanel {...props} status="resolved" target={{ subjectId: 'selected', display: 'Selected subject' }} sections={[{ code: 'identity', label: 'Identity', selected: true }]}/>)
  fireEvent.click(screen.getByRole('button', { name: 'Send request' }))
  expect(onRequest).toHaveBeenCalledOnce()
  expect(screen.queryByRole('status')).toBeNull()
  view.rerender(<SubjectAccessRequestPanel {...props} status="requested"/>)
  expect(screen.getByRole('status').textContent).toBe(copy.requested)
  expect(screen.queryByText(copy.granted)).toBeNull()
})

it('renders only supplied locator options and disables editing during host resolution', async () => {
  const { SubjectAccessRequestPanel } = await loadPanel('../src/subject-access-request-panel.js')
  const onLocatorChange = vi.fn()
  const props = { copy, locatorKind: 'phone-number', locator: '', status: 'idle', sections: [], onLocatorKindChange: vi.fn(), onLocatorChange, onToggleSection: vi.fn(), onResolve: vi.fn(), onRequest: vi.fn() }
  const view = render(<SubjectAccessRequestPanel {...props}/>)
  expect(screen.getAllByRole('option')).toHaveLength(2)
  expect(screen.getByRole('textbox', { name: 'Locator' }).getAttribute('type')).toBe('tel')
  expect((screen.getByRole('button', { name: 'Find subject' }) as HTMLButtonElement).disabled).toBe(true)
  view.rerender(<SubjectAccessRequestPanel {...props} status="resolving"/>)
  expect((screen.getByRole('textbox', { name: 'Locator' }) as HTMLInputElement).disabled).toBe(true)
  expect((screen.getByRole('combobox', { name: 'Locator kind' }) as HTMLSelectElement).disabled).toBe(true)
  expect(onLocatorChange).not.toHaveBeenCalled()
})
