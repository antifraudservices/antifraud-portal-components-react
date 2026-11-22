// Flow contract: the signed-in holder explicitly requests an offer, then sees
// the wallet link, QR and one-use code. The host owns authorization and custody.
import {fireEvent, render, screen} from '@testing-library/react'
import {expect, it, vi} from 'vitest'
import {WalletOfferPanel, type WalletOfferPanelProps} from '../src/index'

const copy: WalletOfferPanelProps['copy'] = {
  title: 'Proof of age', prepare: 'Prepare offer', preparing: 'Preparing…',
  open: 'Open wallet', qr: 'Scan wallet offer', code: 'One-use code', error: 'Offer unavailable',
}
const launchUri = 'av-vci://?credential_offer_uri=https%3A%2F%2Fissuer.example%2Foffers%2Fopaque'
const transactionCode = '123456'

it('opens an age offer only after the holder requests it', async () => {
  const requestOffer = vi.fn(async () => ({launchUri, transactionCode}))
  const image = 'data:image/png;base64,AA=='
  const encodeQr = vi.fn(async () => image)
  render(<WalletOfferPanel copy={copy} requestOffer={requestOffer} encodeQr={encodeQr} />)
  expect(requestOffer).not.toHaveBeenCalled()
  fireEvent.click(screen.getByText(copy.title))
  fireEvent.click(screen.getByRole('button', {name: copy.prepare}))
  expect((await screen.findByText(copy.open)).closest('a')).toHaveAttribute('href', launchUri)
  expect(await screen.findByAltText(copy.qr)).toHaveAttribute('src', image)
  expect(encodeQr).toHaveBeenCalledWith(launchUri)
  expect(screen.getByText(transactionCode)).toBeVisible()
})

it('rejects an unsafe launch URI before offering a link or rendering a QR', async () => {
  const encodeQr = vi.fn()
  render(<WalletOfferPanel copy={copy} encodeQr={encodeQr}
    requestOffer={async () => ({ launchUri: 'https://untrusted.example', transactionCode })} />)
  fireEvent.click(screen.getByText(copy.title))
  fireEvent.click(screen.getByRole('button', {name: copy.prepare}))
  expect(await screen.findByRole('alert')).toHaveTextContent(copy.error)
  expect(screen.queryByText(copy.open)).toBeNull()
  expect(encodeQr).not.toHaveBeenCalled()
})
