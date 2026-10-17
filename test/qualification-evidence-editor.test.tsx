// Flow contract: 1. A controller selects an active employee. 2. The controller identifies an awarding entity by legal identifier and jurisdiction. 3. The host resolves that entity authoritatively. 4. The controller records evidence reviewed by the employer and acknowledges that it is an employer attestation. 5. The component emits one typed submission intention and displays issuer-confirmation delivery state. Authorization invariant: browser selections never establish controller, employee, issuer or signing authority. Persistence invariant: the controlled component performs no upload, gateway write, credential signing or notification delivery.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { QualificationEvidenceEditor } from '../src/qualification-evidence-editor'

const baseProps = {
  employees: [
    { id: 'employee-1', label: 'Ada Example — active', active: true },
    { id: 'employee-2', label: 'Inactive Example', active: false },
  ],
  issuerResolution: {
    phase: 'resolved' as const,
    organizationReference: 'Organization/university-opaque',
    displayName: 'Example University',
    legalIdentifier: 'university-legal-id',
    jurisdiction: 'ES',
  },
  delivery: {
    phase: 'queued' as const,
    messageReference: 'urn:message:opaque',
  },
  attachment: {
    fileName: 'degree.pdf',
    mediaType: 'application/pdf',
    size: 2048,
    storageReference: 'urn:evidence-document:opaque',
    contentId: 'zKYrhS8ZkySGc9pjHe8KE4bo1RjKKbjaxatf3zM16DD2hLGPvK3bqbSGvpNYA2qafoUeBYT',
  },
} as const

async function completeForm() {
  await userEvent.selectOptions(screen.getByLabelText('Employee'), 'employee-1')
  await userEvent.type(screen.getByLabelText('Qualification title'), 'Degree in Medicine')
  await userEvent.selectOptions(screen.getByLabelText('Qualification type'), 'degree')
  await userEvent.type(screen.getByLabelText('Qualification identifier'), 'degree-opaque')
  await userEvent.type(screen.getByLabelText('Identifier system'), 'https://university.example/qualifications')
  await userEvent.type(screen.getByLabelText('Issuer legal identifier'), 'university-legal-id')
  await userEvent.type(screen.getByLabelText('Issuer jurisdiction'), 'ES')
}

describe('QualificationEvidenceEditor', () => {
  it('resolves the issuer by legal identifier and jurisdiction', async () => {
    const onResolveIssuer = vi.fn()
    render(<QualificationEvidenceEditor {...baseProps} onResolveIssuer={onResolveIssuer} />)

    await userEvent.type(screen.getByLabelText('Issuer legal identifier'), 'university-legal-id')
    await userEvent.type(screen.getByLabelText('Issuer jurisdiction'), 'ES')
    await userEvent.click(screen.getByRole('button', { name: 'Find authoritative issuer' }))

    expect(onResolveIssuer).toHaveBeenCalledWith({
      legalIdentifier: 'university-legal-id',
      jurisdiction: 'ES',
    })
    expect(screen.getByText('Example University')).toBeVisible()
    expect(screen.getByText('Authoritative organization resolved')).toBeVisible()
  })

  it('emits an employer attestation without impersonating the qualification issuer', async () => {
    const onSubmit = vi.fn()
    render(<QualificationEvidenceEditor {...baseProps} onSubmit={onSubmit} />)
    await completeForm()

    const submit = screen.getByRole('button', { name: 'Record employer attestation' })
    expect(submit).toBeDisabled()
    await userEvent.click(screen.getByLabelText(/I confirm that this is the employer's attestation/u))
    await userEvent.click(submit)

    expect(onSubmit).toHaveBeenCalledWith({
      employeeId: 'employee-1',
      qualification: {
        title: 'Degree in Medicine',
        type: 'degree',
        identifier: {
          system: 'https://university.example/qualifications',
          value: 'degree-opaque',
        },
      },
      issuer: {
        organizationReference: 'Organization/university-opaque',
        legalIdentifier: 'university-legal-id',
        jurisdiction: 'ES',
      },
      evidence: {
        reference: 'urn:evidence-document:opaque',
        contentId: 'zKYrhS8ZkySGc9pjHe8KE4bo1RjKKbjaxatf3zM16DD2hLGPvK3bqbSGvpNYA2qafoUeBYT',
        mediaType: 'application/pdf',
        fileName: 'degree.pdf',
      },
      assertionKind: 'employer-attestation',
    })
  })

  it('accepts supported scanned-document formats through a host-owned upload intention', async () => {
    const onEvidenceFileSelected = vi.fn()
    render(<QualificationEvidenceEditor
      {...baseProps}
      attachment={undefined}
      onEvidenceFileSelected={onEvidenceFileSelected}
    />)
    const file = new File(['scan'], 'degree.tiff', { type: 'image/tiff' })

    await userEvent.upload(screen.getByLabelText('Scanned qualification document'), file)

    expect(onEvidenceFileSelected).toHaveBeenCalledWith(file)
  })

  it('rejects an unsupported attachment before asking the host to upload it', async () => {
    const onEvidenceFileSelected = vi.fn()
    render(<QualificationEvidenceEditor
      {...baseProps}
      attachment={undefined}
      onEvidenceFileSelected={onEvidenceFileSelected}
    />)
    const file = new File(['scan'], 'degree.svg', { type: 'image/svg+xml' })

    await userEvent.upload(
      screen.getByLabelText('Scanned qualification document'),
      file,
      { applyAccept: false },
    )

    expect(onEvidenceFileSelected).not.toHaveBeenCalled()
    expect(screen.getByRole('alert')).toHaveTextContent('Use a PDF, PNG, JPEG or TIFF file.')
  })

  it('shows that issuer confirmation is queued without claiming verification', () => {
    render(<QualificationEvidenceEditor {...baseProps} />)

    expect(screen.getByText('Issuer confirmation queued')).toBeVisible()
    expect(screen.getByText('urn:message:opaque')).toBeVisible()
    expect(screen.queryByText('Issuer verified')).not.toBeInTheDocument()
  })
})
