'use client'

import { useEffect, useState } from 'react'

type CodeGroup = Readonly<{ label: string; values: readonly string[] }>
type Download = Readonly<{ label: string; filename: string; type: string; contents: string }>
type CodeImage = Readonly<{ label: string; source: string }>

export type PortableCredentialOutputProps = Readonly<{
  codes: readonly CodeGroup[]
  downloads: readonly Download[]
  encodeQr(value: string): Promise<string>
  copy: Readonly<{ title: string; print: string; renderError: string; printError: string }>
}>

function downloadArtifact(artifact: Download) {
  const url = URL.createObjectURL(new Blob([artifact.contents], { type: artifact.type }))
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = artifact.filename
  document.body.append(anchor)
  try {
    anchor.click()
  } finally {
    anchor.remove()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}

async function printCodes(title: string, codes: readonly CodeImage[]) {
  const frame = document.createElement('iframe')
  frame.title = title
  frame.setAttribute('aria-hidden', 'true')
  frame.tabIndex = -1
  frame.setAttribute('sandbox', 'allow-same-origin allow-modals')
  Object.assign(frame.style, { position: 'fixed', right: '0', bottom: '0', width: '1px', height: '1px', border: '0' })
  document.body.append(frame)
  try {
    const page = frame.contentDocument
    const target = frame.contentWindow
    if (!page?.body || !target) throw new Error('Print document is unavailable')
    page.title = title
    const heading = page.createElement('h1')
    heading.textContent = title
    page.body.append(heading)
    const images = codes.map(code => {
      const label = page.createElement('figcaption')
      label.textContent = code.label
      const img = page.createElement('img')
      img.src = code.source
      img.alt = code.label
      img.style.width = '72mm'
      img.style.maxWidth = '100%'
      const figure = page.createElement('figure')
      figure.style.breakInside = 'avoid'
      figure.append(label, img)
      page.body.append(figure)
      return img
    })
    await Promise.all(images.map(image => image.decode()))
    target.addEventListener('afterprint', () => frame.remove(), { once: true })
    target.focus()
    target.print()
  } catch (error) {
    frame.remove()
    throw error
  }
}

/** Presents already-issued artifacts. Issuance, consent and credential verification belong to the caller. */
export function PortableCredentialOutput({ codes, downloads, encodeQr, copy }: PortableCredentialOutputProps) {
  const [rendered, setRendered] = useState<{ codes: readonly CodeGroup[]; images?: readonly CodeImage[] }>()
  const [printing, setPrinting] = useState(false)
  const [printFailed, setPrintFailed] = useState(false)
  const images = rendered?.codes === codes ? rendered.images : undefined
  const renderFailed = rendered?.codes === codes && !images

  useEffect(() => {
    let current = true
    void Promise.all(codes.flatMap(group => group.values.map(async (value, index) => ({
      label: `${group.label} ${index + 1}/${group.values.length}`,
      source: await encodeQr(value),
    })))).then(results => {
      if (current) setRendered({ codes, images: results })
    }, () => {
      if (current) setRendered({ codes })
    })
    return () => { current = false }
  }, [codes, encodeQr])

  async function print() {
    if (!images?.length) return
    setPrinting(true)
    setPrintFailed(false)
    try {
      await printCodes(copy.title, images)
    } catch {
      setPrintFailed(true)
    } finally {
      setPrinting(false)
    }
  }

  return <section aria-label={copy.title}>
    {images?.map(({ label, source }) => <figure key={label}>
      <img src={source} alt={label} width={384} height={384} style={{ maxWidth: '100%', height: 'auto' }} />
      <figcaption>{label}</figcaption>
    </figure>)}
    {renderFailed && <p role="alert">{copy.renderError}</p>}
    {printFailed && <p role="alert">{copy.printError}</p>}
    {downloads.map(artifact => <button key={artifact.filename} type="button" onClick={() => downloadArtifact(artifact)}>{artifact.label}</button>)}
    <button type="button" disabled={!images?.length || printing} onClick={() => void print()}>{copy.print}</button>
  </section>
}
