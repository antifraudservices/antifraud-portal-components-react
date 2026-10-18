// Flow contract: reuse shared test fixtures and canonical types; do not introduce duplicated literals.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { EnvironmentSelector } from '../src/environment-selector.js'

describe('EnvironmentSelector', () => {
  it('exposes Demo as the only enabled environment and labels its simulated ledger honestly', async () => {
    const onChange = vi.fn()
    render(<EnvironmentSelector value="demo" onChange={onChange} />)

    expect(screen.getByRole('radio', {name: /Demo — simulated blockchain/i})).toBeChecked()
    expect(screen.getByRole('radio', {name: /Test Network/i})).toBeDisabled()
    expect(screen.getByRole('radio', {name: /Production/i})).toBeDisabled()

    await userEvent.click(screen.getByRole('radio', {name: /Test Network/i}))
    expect(onChange).not.toHaveBeenCalled()
    expect(screen.getByText(/requires provisioned Fabric endpoints and credentials/i)).toBeVisible()
  })
})
