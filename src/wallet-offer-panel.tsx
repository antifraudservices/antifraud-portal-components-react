'use client'

import {useState} from 'react'

type WalletOffer = Readonly<{launchUri: string; transactionCode: string}>

export type WalletOfferPanelProps = Readonly<{
  requestOffer(): Promise<WalletOffer>
  encodeQr(launchUri: string): Promise<string>
  copy: Readonly<Record<'title' | 'prepare' | 'preparing' | 'open' | 'qr' | 'code' | 'error', string>>
}>

/** Presents an authorized, server-prepared credential offer. */
export function WalletOfferPanel({copy, requestOffer, encodeQr}: WalletOfferPanelProps) {
  const [offer, setOffer] = useState<WalletOffer>()
  const [qrImage, setQrImage] = useState<string>()
  const [pending, setPending] = useState(false)
  const [failed, setFailed] = useState(false)

  async function prepare() {
    setOffer(undefined)
    setQrImage(undefined)
    setPending(true)
    setFailed(false)
    try {
      const next = await requestOffer()
      const uri = new URL(next.launchUri)
      if ((uri.protocol !== 'openid-credential-offer:' && uri.protocol !== 'av-vci:') ||
        uri.host || uri.pathname || uri.hash || !/^\d{6}$/u.test(next.transactionCode)) {
        throw new TypeError('Invalid wallet offer')
      }
      const parameters = [...uri.searchParams]
      if (parameters.length !== 1 || parameters[0]?.[0] !== 'credential_offer_uri') {
        throw new TypeError('Invalid wallet offer reference')
      }
      const reference = new URL(parameters[0][1])
      if (reference.protocol !== 'https:' || reference.username || reference.password || reference.hash) {
        throw new TypeError('Invalid wallet offer reference')
      }
      setOffer(next)
      setQrImage(await encodeQr(next.launchUri))
    } catch {
      setFailed(true)
    } finally {
      setPending(false)
    }
  }

  return (
    <details className="panel">
      <summary>{copy.title}</summary>
      <button type="button" disabled={pending} onClick={() => void prepare()}>
        {pending ? copy.preparing : copy.prepare}
      </button>
      {failed && !offer && <p role="alert">{copy.error}</p>}
      {offer && (
        <div className="form">
          <a href={offer.launchUri}>{copy.open}</a>
          {qrImage && <img src={qrImage} width={256} height={256} alt={copy.qr} />}
          <p>{copy.code} <strong>{offer.transactionCode}</strong></p>
        </div>
      )}
    </details>
  )
}
