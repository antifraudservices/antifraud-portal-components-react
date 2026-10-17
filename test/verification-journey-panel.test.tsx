// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { CredentialProfileSelector } from '../src/credential-profile-selector'
import { VerificationJourneyPanel } from '../src/verification-journey-panel'

describe('CredentialProfileSelector', () => {
  it('is controlled and reports the selected profile', async () => {
    const onChange = vi.fn()
    render(
      <CredentialProfileSelector
        label="Credential profile"
        onChange={onChange}
        options={[
          {id: 'eudi-pid', label: 'EUDI Personal Identification Data'},
          {id: 'mdl', label: 'Mobile Driving Licence'},
        ]}
        value="eudi-pid"
      />,
    )

    await userEvent.selectOptions(screen.getByLabelText('Credential profile'), 'mdl')
    expect(onChange).toHaveBeenCalledWith('mdl')
  })
})

describe('VerificationJourneyPanel', () => {
  it('keeps wallet verification and provider issuance as separate actions', async () => {
    const onRequestCredential = vi.fn()
    render(
      <VerificationJourneyPanel
        phase="presentation-verified"
        requestedClaims={['Given name', 'Date of birth']}
        onRequestCredential={onRequestCredential}
      />,
    )

    expect(screen.getByText('Presentation verified')).toBeVisible()
    expect(screen.getByText(/does not issue a new credential/i)).toBeVisible()
    await userEvent.click(screen.getByRole('button', {name: 'Request signed credential'}))
    expect(onRequestCredential).toHaveBeenCalledOnce()
  })

  it('renders a supplied QR component and never generates or stores one itself', () => {
    render(
      <VerificationJourneyPanel
        authorizationUri="haip-vp://opaque"
        phase="waiting-for-wallet"
        requestedClaims={['Given name']}
        renderQr={(value) => <div data-testid="qr">{value}</div>}
        onRefreshPresentation={() => undefined}
      />,
    )

    expect(screen.getByTestId('qr')).toHaveTextContent('haip-vp://opaque')
    expect(screen.getByRole('button', {name: 'Check presentation'})).toBeEnabled()
  })

  it('shows provider issuance without relabelling it as presentation verification', () => {
    render(
      <VerificationJourneyPanel
        credentialReference="urn:credential:opaque"
        phase="credential-issued"
        requestedClaims={[]}
      />,
    )

    expect(screen.getByText('Credential issued')).toBeVisible()
    expect(screen.getByText('urn:credential:opaque')).toBeVisible()
  })
})

