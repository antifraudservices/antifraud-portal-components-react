// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

import { useState, type FormEvent } from 'react'

export type QualificationEvidenceIssuerResolution =
  | Readonly<{ phase: 'idle' | 'resolving' | 'not-found'; message?: string }>
  | Readonly<{
      phase: 'resolved'
      organizationReference: string
      displayName: string
      legalIdentifier: string
      jurisdiction: string
    }>
  | Readonly<{ phase: 'failed'; message: string }>

export type QualificationEvidenceDelivery = Readonly<{
  phase: 'not-requested' | 'queued' | 'delivered' | 'delivery-failed'
  messageReference?: string
}>

export type QualificationEvidenceSubmission = Readonly<{
  employeeId: string
  qualification: Readonly<{
    title: string
    type: 'degree' | 'certificate' | 'licence' | 'accreditation' | 'training'
    identifier: Readonly<{ system: string; value: string }>
  }>
  issuer: Readonly<{
    organizationReference: string
    legalIdentifier: string
    jurisdiction: string
  }>
  evidence: Readonly<{
    reference: string
    contentId: string
    mediaType: 'application/pdf' | 'image/png' | 'image/jpeg' | 'image/tiff'
    fileName: string
  }>
  assertionKind: 'employer-attestation'
}>

export type QualificationEvidenceEditorProps = Readonly<{
  employees: readonly Readonly<{ id: string; label: string; active: boolean }>[]
  issuerResolution: QualificationEvidenceIssuerResolution
  delivery: QualificationEvidenceDelivery
  attachment?: Readonly<{
    fileName: string
    mediaType: QualificationEvidenceSubmission['evidence']['mediaType']
    size: number
    storageReference: string
    contentId: string
  }> | undefined
  onResolveIssuer?(query: Readonly<{ legalIdentifier: string; jurisdiction: string }>): void
  onEvidenceFileSelected?(file: File): void
  onSubmit?(submission: QualificationEvidenceSubmission): void
}>

const DELIVERY_LABELS: Readonly<Record<QualificationEvidenceDelivery['phase'], string>> = {
  'not-requested': 'Issuer confirmation not requested',
  queued: 'Issuer confirmation queued',
  delivered: 'Issuer confirmation delivered',
  'delivery-failed': 'Issuer confirmation delivery failed',
}

const SUPPORTED_EVIDENCE_MEDIA_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/tiff',
])

export function QualificationEvidenceEditor({
  employees,
  issuerResolution,
  delivery,
  attachment,
  onResolveIssuer,
  onEvidenceFileSelected,
  onSubmit,
}: QualificationEvidenceEditorProps) {
  const [employeeId, setEmployeeId] = useState('')
  const [title, setTitle] = useState('')
  const [type, setType] = useState<QualificationEvidenceSubmission['qualification']['type']>('degree')
  const [identifier, setIdentifier] = useState('')
  const [identifierSystem, setIdentifierSystem] = useState('')
  const [issuerLegalIdentifier, setIssuerLegalIdentifier] = useState('')
  const [issuerJurisdiction, setIssuerJurisdiction] = useState('')
  const [employerAcknowledged, setEmployerAcknowledged] = useState(false)
  const [uploadError, setUploadError] = useState<string>()

  const employeeActive = employees.some(employee => employee.id === employeeId && employee.active)
  const issuerMatches = issuerResolution.phase === 'resolved'
    && issuerResolution.legalIdentifier === issuerLegalIdentifier.trim()
    && issuerResolution.jurisdiction === issuerJurisdiction.trim()
  const complete = employeeActive
    && title.trim().length > 0
    && identifier.trim().length > 0
    && identifierSystem.trim().length > 0
    && attachment !== undefined
    && issuerMatches
    && employerAcknowledged

  function resolveIssuer(): void {
    const legalIdentifier = issuerLegalIdentifier.trim()
    const jurisdiction = issuerJurisdiction.trim()
    if (legalIdentifier && jurisdiction) onResolveIssuer?.({ legalIdentifier, jurisdiction })
  }

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!complete || issuerResolution.phase !== 'resolved' || !attachment) return
    onSubmit?.({
      employeeId,
      qualification: {
        title: title.trim(),
        type,
        identifier: {
          system: identifierSystem.trim(),
          value: identifier.trim(),
        },
      },
      issuer: {
        organizationReference: issuerResolution.organizationReference,
        legalIdentifier: issuerResolution.legalIdentifier,
        jurisdiction: issuerResolution.jurisdiction,
      },
      evidence: {
        reference: attachment.storageReference,
        contentId: attachment.contentId,
        mediaType: attachment.mediaType,
        fileName: attachment.fileName,
      },
      assertionKind: 'employer-attestation',
    })
  }

  return (
    <section aria-labelledby="qualification-evidence-editor-title">
      <header>
        <h2 id="qualification-evidence-editor-title">Employee qualification evidence</h2>
        <p>
          Record evidence reviewed by this employer. This does not create a
          university credential, professional licence or employee authorization.
        </p>
      </header>

      <form onSubmit={submit}>
        <label>
          <span>Employee</span>
          <select value={employeeId} onChange={event => setEmployeeId(event.currentTarget.value)} required>
            <option value="">Select an active employee</option>
            {employees.map(employee => (
              <option disabled={!employee.active} key={employee.id} value={employee.id}>
                {employee.label}
              </option>
            ))}
          </select>
        </label>

        <fieldset>
          <legend>Qualification described by the evidence</legend>
          <label><span>Qualification title</span><input value={title} onChange={event => setTitle(event.currentTarget.value)} required /></label>
          <label>
            <span>Qualification type</span>
            <select value={type} onChange={event => setType(event.currentTarget.value as typeof type)}>
              <option value="degree">Degree</option>
              <option value="certificate">Certificate</option>
              <option value="licence">Licence</option>
              <option value="accreditation">Accreditation</option>
              <option value="training">Training</option>
            </select>
          </label>
          <label><span>Qualification identifier</span><input value={identifier} onChange={event => setIdentifier(event.currentTarget.value)} required /></label>
          <label><span>Identifier system</span><input value={identifierSystem} onChange={event => setIdentifierSystem(event.currentTarget.value)} required /></label>
        </fieldset>

        <fieldset>
          <legend>Claimed qualification issuer</legend>
          <label><span>Issuer legal identifier</span><input value={issuerLegalIdentifier} onChange={event => setIssuerLegalIdentifier(event.currentTarget.value)} required /></label>
          <label><span>Issuer jurisdiction</span><input value={issuerJurisdiction} onChange={event => setIssuerJurisdiction(event.currentTarget.value)} required /></label>
          <button disabled={!issuerLegalIdentifier.trim() || !issuerJurisdiction.trim()} onClick={resolveIssuer} type="button">
            Find authoritative issuer
          </button>
          {issuerResolution.phase === 'resolved' ? (
            <div role="status">
              <strong>Authoritative organization resolved</strong>
              <span>{issuerResolution.displayName}</span>
              <span>{issuerResolution.legalIdentifier}</span>
              <span>{issuerResolution.jurisdiction}</span>
            </div>
          ) : null}
          {issuerResolution.phase === 'not-found' ? <p role="status">Authoritative issuer not found</p> : null}
          {issuerResolution.phase === 'failed' ? <p role="alert">{issuerResolution.message}</p> : null}
        </fieldset>

        <fieldset>
          <legend>Evidence reviewed by the employer</legend>
          <label>
            <span>Scanned qualification document</span>
            <input
              accept=".pdf,.png,.jpg,.jpeg,.tif,.tiff,application/pdf,image/png,image/jpeg,image/tiff"
              onChange={event => {
                const file = event.currentTarget.files?.[0]
                if (!file) return
                if (!SUPPORTED_EVIDENCE_MEDIA_TYPES.has(file.type)) {
                  setUploadError('Use a PDF, PNG, JPEG or TIFF file.')
                  return
                }
                setUploadError(undefined)
                onEvidenceFileSelected?.(file)
              }}
              type="file"
            />
          </label>
          {attachment ? (
            <dl>
              <dt>File</dt><dd>{attachment.fileName}</dd>
              <dt>Media type</dt><dd>{attachment.mediaType}</dd>
              <dt>Content identifier</dt><dd>{attachment.contentId}</dd>
            </dl>
          ) : <p>The trusted backend must upload the document and return its content identifier.</p>}
          {uploadError ? <p role="alert">{uploadError}</p> : null}
          <label>
            <input checked={employerAcknowledged} onChange={event => setEmployerAcknowledged(event.currentTarget.checked)} type="checkbox" />
            <span>I confirm that this is the employer&apos;s attestation about evidence reviewed, not a credential issued by the claimed qualification issuer.</span>
          </label>
        </fieldset>

        <button disabled={!complete} type="submit">Record employer attestation</button>
      </form>

      <aside aria-label="Issuer confirmation delivery">
        <strong>{DELIVERY_LABELS[delivery.phase]}</strong>
        {delivery.messageReference ? <span>{delivery.messageReference}</span> : null}
      </aside>
    </section>
  )
}
