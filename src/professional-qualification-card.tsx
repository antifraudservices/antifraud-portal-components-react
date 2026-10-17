// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

export type QualificationAuthorityKind =
  | 'employer'
  | 'qualification-issuer'
  | 'professional-body'

export type QualificationVerificationStatus =
  | 'attested'
  | 'verified'
  | 'in-process'
  | 'requires-reverification'
  | 'verification-failed'
  | 'reverification-failed'
  | 'entered-in-error'

export type ProfessionalQualificationCardModel = Readonly<{
  id: string
  title: string
  type: 'degree' | 'certificate' | 'licence' | 'accreditation' | 'training'
  identifier: string
  issuer: Readonly<{
    name: string
    legalIdentifier: string
    jurisdiction: string
  }>
  period?: Readonly<{ start?: string; end?: string }>
  lifecycleStatus: 'active' | 'suspended' | 'revoked' | 'expired' | 'unknown'
  proofs: readonly Readonly<{
    id: string
    authorityKind: QualificationAuthorityKind
    status: QualificationVerificationStatus
    organizationName: string
    legalIdentifier: string
    jurisdiction: string
    verifiedAt: string
  }>[]
}>

export type ProfessionalQualificationCardProps = Readonly<{
  qualification: ProfessionalQualificationCardModel
  expandedProofId?: string
  onToggleProof?: (proofId: string) => void
}>

const STATUS_LABEL: Readonly<Record<QualificationVerificationStatus, string>> = {
  attested: 'Attested',
  verified: 'Verified',
  'in-process': 'In process',
  'requires-reverification': 'Requires reverification',
  'verification-failed': 'Verification failed',
  'reverification-failed': 'Reverification failed',
  'entered-in-error': 'Entered in error',
}

function isCurrent(status: QualificationVerificationStatus): boolean {
  return status === 'attested' || status === 'verified'
}

function proofLabel(
  authorityKind: QualificationAuthorityKind,
  status: QualificationVerificationStatus,
): string {
  const authority = authorityKind === 'employer'
    ? 'Employer'
    : authorityKind === 'qualification-issuer'
      ? 'Issuer'
      : 'Professional body'

  if (status === 'attested') return `${authority} attested`
  if (status === 'verified') return `${authority} verified`
  if (status === 'verification-failed') return `${authority} validation failed`
  return `${authority}: ${STATUS_LABEL[status].toLowerCase()}`
}

export function ProfessionalQualificationCard({
  qualification,
  expandedProofId,
  onToggleProof,
}: ProfessionalQualificationCardProps) {
  return (
    <article aria-labelledby={`${qualification.id}-title`}>
      <header>
        <h3 id={`${qualification.id}-title`}>{qualification.title}</h3>
        <p>{qualification.identifier}</p>
      </header>

      <div aria-label="Qualification verification">
        {qualification.proofs.map((proof) => {
          const label = proofLabel(proof.authorityKind, proof.status)
          const state = isCurrent(proof.status) ? 'current' : 'attention'
          const isExpanded = expandedProofId === proof.id
          return (
            <span key={proof.id}>
              {onToggleProof ? (
                <button
                  aria-expanded={isExpanded}
                  data-verification-state={state}
                  onClick={() => onToggleProof(proof.id)}
                  type="button"
                >
                  {label}
                </button>
              ) : (
                <span data-verification-state={state}>{label}</span>
              )}
            </span>
          )
        })}
        {qualification.type === 'licence' ? (
          <span
            data-verification-state={qualification.lifecycleStatus === 'active'
              ? 'current'
              : 'attention'}
          >
            Licence {qualification.lifecycleStatus}
          </span>
        ) : null}
      </div>

      {qualification.proofs
        .filter((proof) => proof.id === expandedProofId)
        .map((proof) => (
          <section aria-label="Authoritative verification details" key={proof.id}>
            <dl>
              <dt>Authority</dt>
              <dd>{proof.organizationName}</dd>
              <dt>Legal identifier</dt>
              <dd>{proof.legalIdentifier}</dd>
              <dt>Jurisdiction</dt>
              <dd>{proof.jurisdiction}</dd>
              <dt>Status</dt>
              <dd>{STATUS_LABEL[proof.status]}</dd>
              <dt>Verified at</dt>
              <dd>{proof.verifiedAt}</dd>
            </dl>
          </section>
        ))}
    </article>
  )
}
