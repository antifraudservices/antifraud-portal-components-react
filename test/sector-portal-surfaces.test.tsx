// Flow contract: Personal and Professional portals compose one controlled white-label shell; Trust requests remain separate from Marketplace discovery, sector branding grants no authority, and operational surfaces emit intentions without network or persistence side effects.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import {
  ProfessionalOperationsHome,
  SectorPortalShell,
  TrustVerificationWorkspace,
} from '../src/sector-portal-surfaces'

describe('SectorPortalShell', () => {
  it('renders trusted profile context and emits navigation intentions', async () => {
    const onNavigate = vi.fn()
    render(<SectorPortalShell
      activeNavigation="trust"
      header={<div>Example Legal LLP</div>}
      navigation={[
        {id: 'home', label: 'Home'},
        {id: 'trust', label: 'Trust'},
        {id: 'marketplace', label: 'Marketplace'},
      ]}
      onNavigate={onNavigate}
      portalName="Antifraud Personal"
    ><p>Trusted content</p></SectorPortalShell>)

    expect(screen.getByText('Example Legal LLP')).toBeVisible()
    expect(screen.queryByRole('combobox', {name: /sector/i})).not.toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', {name: 'Marketplace'}))
    expect(onNavigate).toHaveBeenCalledWith('marketplace')
  })

  it('renders the host-supplied shared header without implementing a second one', () => {
    render(<SectorPortalShell
      activeNavigation="home"
      header={<header><button type="button">Shared account control</button></header>}
      navigation={[{id: 'home', label: 'Home'}]}
      onNavigate={() => undefined}
      portalName="Professional services · Personal"
    ><p>Content</p></SectorPortalShell>)

    expect(screen.getByRole('button', {name: 'Shared account control'})).toBeVisible()
  })
})

describe('TrustVerificationWorkspace', () => {
  it('offers the three governed verification requests without claiming a result', async () => {
    const onSelect = vi.fn()
    render(<TrustVerificationWorkspace onSelect={onSelect} requests={[]} />)

    expect(screen.getByRole('heading', {name: 'Trust'})).toBeVisible()
    expect(screen.getByRole('button', {name: 'Verify an employee email'})).toBeEnabled()
    expect(screen.getByRole('button', {name: 'Verify an organization domain'})).toBeEnabled()
    expect(screen.getByRole('button', {name: 'Verify a received document'})).toBeEnabled()
    expect(screen.getByText(/Marketplace is for discovering verified organizations/i)).toBeVisible()
    expect(screen.queryByText(/verified successfully/i)).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', {name: 'Verify an employee email'}))
    expect(onSelect).toHaveBeenCalledWith('employee-email')
  })
})

describe('ProfessionalOperationsHome', () => {
  it('exposes the neutral Connect Health management breadth', () => {
    render(<ProfessionalOperationsHome organizationName="Example Education" profileLabel="Education" onOpen={() => undefined} />)

    expect(screen.getByRole('button', {name: 'Manage clients'})).toBeVisible()
    expect(screen.getByRole('button', {name: 'Review assigned evidence'})).toBeVisible()
    expect(screen.getByRole('button', {name: 'Manage availability'})).toBeVisible()
    expect(screen.getByRole('button', {name: 'Manage catalog'})).toBeVisible()
    expect(screen.getByRole('button', {name: 'Open Trust'})).toBeVisible()
    expect(screen.getByText('Places, public Services and Products')).toBeVisible()
  })
})
