// Flow contract: render every ordered credential and companion QR segment, keep downloads
// separate, and send only the labeled QR images to the print dialog.
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, expect, it, vi } from 'vitest'
import type { ComponentType } from 'react'
import * as portal from '../src/index.js'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  vi.unstubAllGlobals()
})

it('keeps all companion segments in the print view and exports the signed credential independently', async () => {
  const component: unknown = Reflect.get(portal, 'PortableCredentialOutput')
  expect(typeof component).toBe('function')
  const codes = [
    { label: 'Card', values: ['shc:/1234'] },
    { label: 'Post-quantum proof', values: ['pqc:/1/2/1234', 'pqc:/2/2/5678'] },
  ]
  const credential = { label: 'Download card', filename: 'document.smart-health-card', type: 'application/smart-health-card', contents: '{"verifiableCredential":["test"]}' }
  const encodeQr = vi.fn(async (_value: string) => 'data:image/png;base64,QQ==')
  const copy = { title: 'Portable credential', print: 'Print QR codes', renderError: 'QR unavailable', printError: 'Could not print' }
  const Output = component as ComponentType<{ codes: typeof codes; downloads: typeof credential[]; encodeQr: typeof encodeQr; copy: typeof copy }>
  const originalAppend = document.body.append.bind(document.body)
  const print = vi.fn()
  vi.spyOn(document.body, 'append').mockImplementation((...nodes) => {
    originalAppend(...nodes)
    for (const node of nodes) if (node instanceof HTMLIFrameElement) {
      node.contentWindow!.print = print
      node.contentWindow!.focus = vi.fn()
      Object.defineProperty((node.contentWindow as Window & typeof globalThis).HTMLImageElement.prototype, 'decode', { configurable: true, value: async () => {} })
    }
  })
  const createObjectURL = vi.fn((_blob: Blob) => 'blob:credential')
  vi.stubGlobal('URL', { createObjectURL, revokeObjectURL: vi.fn() })
  const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
  render(<Output codes={codes} downloads={[credential]} encodeQr={encodeQr} copy={copy} />)
  await screen.findByRole('img', { name: 'Post-quantum proof 2/2' })
  expect(screen.getAllByRole('img').map(image => image.getAttribute('alt')))
    .toEqual(['Card 1/1', 'Post-quantum proof 1/2', 'Post-quantum proof 2/2'])
  expect(encodeQr.mock.calls).toEqual(codes.flatMap(group => group.values.map(value => [value])))

  fireEvent.click(screen.getByRole('button', { name: 'Download card' }))
  expect(createObjectURL.mock.calls[0]?.[0]).toBeInstanceOf(Blob)
  expect(click.mock.instances[0]).toMatchObject({ download: credential.filename })

  fireEvent.click(screen.getByRole('button', { name: 'Print QR codes' }))
  await waitFor(() => expect(print).toHaveBeenCalledOnce())
  const frame = document.querySelector('iframe')!
  const printDocument = frame.contentDocument!
  expect(Array.from(printDocument.querySelectorAll('img')).map(image => image.alt))
    .toEqual(['Card 1/1', 'Post-quantum proof 1/2', 'Post-quantum proof 2/2'])
  expect(printDocument.body.textContent).not.toContain(credential.contents)
  frame.contentWindow!.dispatchEvent(new Event('afterprint'))
  expect(document.querySelector('iframe')).toBeNull()
})
