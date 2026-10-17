// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { ProfessionalQualificationCard } from '../src/professional-qualification-card'

const qualification = {
  id: 'qualification-opaque',
  title: 'Registered professional',
  type: 'licence' as const,
  identifier: 'qualification-id-opaque',
  issuer: {
    name: 'Awarding university',
    legalIdentifier: 'university-legal-id',
    jurisdiction: 'Test jurisdiction',
  },
  period: {
    start: '2025-01-01',
    end: '2027-01-01',
  },
  lifecycleStatus: 'active' as const,
  proofs: [
    {
      id: 'proof-employer',
      authorityKind: 'employer' as const,
      status: 'attested' as const,
      organizationName: 'Employer organization',
      legalIdentifier: 'employer-legal-id',
      jurisdiction: 'Test jurisdiction',
      verifiedAt: '2026-10-17T10:00:00.000Z',
    },
    {
      id: 'proof-issuer',
      authorityKind: 'qualification-issuer' as const,
      status: 'verified' as const,
      organizationName: 'Awarding university',
      legalIdentifier: 'university-legal-id',
      jurisdiction: 'Test jurisdiction',
      verifiedAt: '2026-10-18T10:00:00.000Z',
    },
    {
      id: 'proof-regulator',
      authorityKind: 'professional-body' as const,
      status: 'verified' as const,
      organizationName: 'Professional college',
      legalIdentifier: 'college-legal-id',
      jurisdiction: 'Test jurisdiction',
      verifiedAt: '2026-10-19T10:00:00.000Z',
    },
  ],
}

describe('ProfessionalQualificationCard', () => {
  it('shows independent employer, issuer, regulator and licence badges', () => {
    render(<ProfessionalQualificationCard qualification={qualification} />)

    expect(screen.getByRole('heading', { name: 'Registered professional' })).toBeVisible()
    expect(screen.getByText('Employer attested')).toBeVisible()
    expect(screen.getByText('Issuer verified')).toBeVisible()
    expect(screen.getByText('Professional body verified')).toBeVisible()
    expect(screen.getByText('Licence active')).toBeVisible()
  })

  it('emits a controlled proof-selection intention and renders authoritative details', async () => {
    const onToggleProof = vi.fn()
    const { rerender } = render(
      <ProfessionalQualificationCard
        onToggleProof={onToggleProof}
        qualification={qualification}
      />,
    )

    await userEvent.click(screen.getByRole('button', { name: 'Issuer verified' }))
    expect(onToggleProof).toHaveBeenCalledWith('proof-issuer')

    rerender(
      <ProfessionalQualificationCard
        expandedProofId="proof-issuer"
        onToggleProof={onToggleProof}
        qualification={qualification}
      />,
    )

    expect(screen.getByText('Awarding university')).toBeVisible()
    expect(screen.getByText('university-legal-id')).toBeVisible()
    expect(screen.getByText('Test jurisdiction')).toBeVisible()
    expect(screen.getByText('Verified')).toBeVisible()
  })

  it('marks a failed verification for attention without hiding its provenance', () => {
    render(
      <ProfessionalQualificationCard
        expandedProofId="proof-issuer"
        qualification={{
          ...qualification,
          proofs: qualification.proofs.map((proof) => proof.id === 'proof-issuer'
            ? { ...proof, status: 'verification-failed' as const }
            : proof),
        }}
      />,
    )

    expect(screen.getByText('Issuer validation failed')).toHaveAttribute(
      'data-verification-state',
      'attention',
    )
    expect(screen.getByText('Awarding university')).toBeVisible()
  })
})
