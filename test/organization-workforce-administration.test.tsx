// Flow contract: 1. A controller reads server-supplied licence, employee and invitation state. 2. Complete invitation input emits one intention. 3. Suspend, reactivate and purge require confirmation. Authorization invariant: the component never selects the organization, controller or sector. Persistence invariant: every mutation remains a host-owned callback and the component never reports authoritative completion.
// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'

import {
  OrganizationWorkforceAdministration,
  type OrganizationWorkforceAdministrationProps,
} from '../src/organization-workforce-administration'

const copy: OrganizationWorkforceAdministrationProps['copy'] = {
  title: 'Licences and employees', description: 'Manage capacity and invitations.',
  totalLicenses: 'Total', usedLicenses: 'Used', freeLicenses: 'Free',
  employeesTitle: 'Employees using licences', invitationsTitle: 'Invitations',
  inviteTitle: 'Invite an employee', emailLabel: 'Email', roleLabel: 'Role',
  unlockSecretLabel: 'Controller PIN', invite: 'Send invitation', inviting: 'Sending…',
  noFreeLicenses: 'No free licences.', noEmployees: 'No employees.',
  noInvitations: 'No invitations.', licenseColumn: 'Licence', employeeColumn: 'Employee',
  roleColumn: 'Role', statusColumn: 'Status', devicesColumn: 'Devices', actionsColumn: 'Actions',
  active: 'Active', inactive: 'Inactive', pending: 'Pending', accepted: 'Accepted',
  cancelled: 'Cancelled', disable: 'Suspend', reactivate: 'Reactivate',
  purge: 'Delete permanently', confirmDisable: 'Suspend this employee?',
  confirmReactivate: 'Reactivate this employee?',
  confirmPurge: 'Permanently delete this employee and free the licence?',
  devicesLater: 'Not reported',
}

afterEach(cleanup)

function props(overrides: Partial<OrganizationWorkforceAdministrationProps> = {}): OrganizationWorkforceAdministrationProps {
  return {
    copy,
    summary: { total: 3, used: 2, free: 1 },
    employees: [
      { id: 'active-1', licenseId: 'licence-1', email: 'one@example.invalid', role: 'Identity reviewer', status: 'active' },
      { id: 'inactive-2', licenseId: 'licence-2', email: 'two@example.invalid', role: 'Member manager', status: 'inactive', deviceCount: 2 },
    ],
    invitations: [{ id: 'invite-1', email: 'pending@example.invalid', role: 'Audit viewer', status: 'pending' }],
    roles: [{ value: 'identity-reviewer', label: 'Identity reviewer' }],
    email: '', role: '', unlockSecret: '',
    onEmailChange: vi.fn(), onRoleChange: vi.fn(), onUnlockSecretChange: vi.fn(),
    onInvite: vi.fn(), onDisable: vi.fn(), onReactivate: vi.fn(), onPurge: vi.fn(),
    ...overrides,
  }
}

describe('OrganizationWorkforceAdministration', () => {
  it('renders controlled capacity, employee lifecycle and invitation state', () => {
    render(<OrganizationWorkforceAdministration {...props()} />)
    expect(screen.getByText('3')).toBeVisible()
    expect(screen.getByText('pending@example.invalid')).toBeVisible()
    expect(screen.getByText('Not reported')).toBeVisible()
  })

  it('emits an invitation only with capacity and complete controlled input', async () => {
    const onInvite = vi.fn()
    const { rerender } = render(<OrganizationWorkforceAdministration {...props({ onInvite })} />)
    expect(screen.getByRole('button', { name: 'Send invitation' })).toBeDisabled()
    rerender(<OrganizationWorkforceAdministration {...props({ email: 'new@example.invalid', role: 'identity-reviewer', unlockSecret: '1234', onInvite })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Send invitation' }))
    expect(onInvite).toHaveBeenCalledOnce()
    rerender(<OrganizationWorkforceAdministration {...props({ summary: { total: 2, used: 2, free: 0 }, email: 'new@example.invalid', role: 'identity-reviewer', unlockSecret: '1234', onInvite })} />)
    expect(screen.getByRole('button', { name: 'Send invitation' })).toBeDisabled()
  })

  it('requires confirmation before each lifecycle intention', async () => {
    const onDisable = vi.fn(), onReactivate = vi.fn(), onPurge = vi.fn()
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<OrganizationWorkforceAdministration {...props({ onDisable, onReactivate, onPurge })} />)
    await userEvent.click(screen.getByRole('button', { name: 'Suspend' }))
    await userEvent.click(screen.getByRole('button', { name: 'Reactivate' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete permanently' }))
    expect(onDisable).not.toHaveBeenCalled()
    expect(onReactivate).not.toHaveBeenCalled()
    expect(onPurge).not.toHaveBeenCalled()
    confirm.mockReturnValue(true)
    await userEvent.click(screen.getByRole('button', { name: 'Suspend' }))
    await userEvent.click(screen.getByRole('button', { name: 'Reactivate' }))
    await userEvent.click(screen.getByRole('button', { name: 'Delete permanently' }))
    expect(onDisable).toHaveBeenCalledWith('active-1')
    expect(onReactivate).toHaveBeenCalledWith('inactive-2')
    expect(onPurge).toHaveBeenCalledWith('inactive-2')
  })
})
