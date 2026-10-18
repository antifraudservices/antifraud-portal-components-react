// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.
// Reimplemented as a neutral public workforce component; see docs/PROVENANCE.md.
import type { FormEvent } from 'react'

export type WorkforceLicenseSummary = Readonly<{
  total: number
  used: number
  free: number
}>

export type WorkforceEmployee = Readonly<{
  id: string
  licenseId: string
  email: string
  role: string
  status: 'active' | 'inactive'
  deviceCount?: number
}>

export type WorkforceInvitation = Readonly<{
  id: string
  email: string
  role: string
  status: 'pending' | 'accepted' | 'cancelled'
  sentAt?: string
}>

export type WorkforceRoleOption = Readonly<{ value: string; label: string }>

export type OrganizationWorkforceCopy = Readonly<{
  title: string
  description: string
  totalLicenses: string
  usedLicenses: string
  freeLicenses: string
  employeesTitle: string
  invitationsTitle: string
  inviteTitle: string
  emailLabel: string
  roleLabel: string
  unlockSecretLabel: string
  invite: string
  inviting: string
  noFreeLicenses: string
  noEmployees: string
  noInvitations: string
  licenseColumn: string
  employeeColumn: string
  roleColumn: string
  statusColumn: string
  devicesColumn: string
  actionsColumn: string
  active: string
  inactive: string
  pending: string
  accepted: string
  cancelled: string
  disable: string
  reactivate: string
  purge: string
  confirmDisable: string
  confirmReactivate: string
  confirmPurge: string
  devicesLater: string
}>

export type OrganizationWorkforceAdministrationProps = Readonly<{
  copy: OrganizationWorkforceCopy
  summary: WorkforceLicenseSummary
  employees: readonly WorkforceEmployee[]
  invitations: readonly WorkforceInvitation[]
  roles: readonly WorkforceRoleOption[]
  email: string
  role: string
  unlockSecret: string
  busyAction?: string
  error?: string
  onEmailChange: (value: string) => void
  onRoleChange: (value: string) => void
  onUnlockSecretChange: (value: string) => void
  onInvite: () => void | Promise<void>
  onDisable: (employeeId: string) => void | Promise<void>
  onReactivate: (employeeId: string) => void | Promise<void>
  onPurge: (employeeId: string) => void | Promise<void>
}>

/**
 * Controlled organization workforce surface shared by controller portals.
 *
 * The component never infers authorization or changes GW state. The host owns
 * invitation persistence, license reads and employee lifecycle commands.
 */
export function OrganizationWorkforceAdministration({
  copy,
  summary,
  employees,
  invitations,
  roles,
  email,
  role,
  unlockSecret,
  busyAction,
  error,
  onEmailChange,
  onRoleChange,
  onUnlockSecretChange,
  onInvite,
  onDisable,
  onReactivate,
  onPurge,
}: OrganizationWorkforceAdministrationProps) {
  const noCapacity = summary.free < 1
  const inviting = busyAction === 'invite'
  const canInvite = !noCapacity && !inviting && Boolean(email.trim() && role && unlockSecret)

  function submitInvitation(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (canInvite) void onInvite()
  }

  function confirmAction(message: string, action: () => void | Promise<void>) {
    if (window.confirm(message)) void action()
  }

  return (
    <section className="afpc-workforce" aria-labelledby="afpc-workforce-title">
      <header>
        <div>
          <h1 id="afpc-workforce-title">{copy.title}</h1>
          <p>{copy.description}</p>
        </div>
        <dl className="afpc-license-summary">
          <div><dt>{copy.totalLicenses}</dt><dd>{summary.total}</dd></div>
          <div><dt>{copy.usedLicenses}</dt><dd>{summary.used}</dd></div>
          <div><dt>{copy.freeLicenses}</dt><dd>{summary.free}</dd></div>
        </dl>
      </header>

      <section className="afpc-workforce-panel" aria-labelledby="afpc-invite-title">
        <h2 id="afpc-invite-title">{copy.inviteTitle}</h2>
        {noCapacity && <p role="status" className="afpc-workforce-warning">{copy.noFreeLicenses}</p>}
        <form onSubmit={submitInvitation}>
          <label><span>{copy.emailLabel}</span><input type="email" required value={email} onChange={(event) => onEmailChange(event.currentTarget.value)} /></label>
          <label><span>{copy.roleLabel}</span><select required value={role} onChange={(event) => onRoleChange(event.currentTarget.value)}><option value="" />{roles.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
          <label><span>{copy.unlockSecretLabel}</span><input type="password" required value={unlockSecret} onChange={(event) => onUnlockSecretChange(event.currentTarget.value)} /></label>
          <button type="submit" disabled={!canInvite}>{inviting ? copy.inviting : copy.invite}</button>
        </form>
      </section>

      <section className="afpc-workforce-panel" aria-labelledby="afpc-employees-title">
        <h2 id="afpc-employees-title">{copy.employeesTitle}</h2>
        {employees.length === 0 ? <p>{copy.noEmployees}</p> : (
          <div className="afpc-table-scroll"><table><thead><tr><th>{copy.licenseColumn}</th><th>{copy.employeeColumn}</th><th>{copy.roleColumn}</th><th>{copy.statusColumn}</th><th>{copy.devicesColumn}</th><th>{copy.actionsColumn}</th></tr></thead><tbody>
            {employees.map((employee) => {
              const rowBusy = busyAction === employee.id
              return <tr key={employee.id}>
                <td><code>{employee.licenseId}</code></td><td>{employee.email}</td><td>{employee.role}</td>
                <td><span className={`afpc-status afpc-status-${employee.status}`}>{employee.status === 'active' ? copy.active : copy.inactive}</span></td>
                <td>{employee.deviceCount === undefined ? copy.devicesLater : employee.deviceCount}</td>
                <td className="afpc-row-actions">
                  {employee.status === 'active' ? (
                    <button type="button" className="afpc-warning-action" disabled={rowBusy} onClick={() => confirmAction(copy.confirmDisable, () => onDisable(employee.id))}>{copy.disable}</button>
                  ) : (<>
                    <button type="button" className="afpc-primary-action" disabled={rowBusy} onClick={() => confirmAction(copy.confirmReactivate, () => onReactivate(employee.id))}>{copy.reactivate}</button>
                    <button type="button" className="afpc-danger" disabled={rowBusy} onClick={() => confirmAction(copy.confirmPurge, () => onPurge(employee.id))}>{copy.purge}</button>
                  </>)}
                </td>
              </tr>
            })}
          </tbody></table></div>
        )}
      </section>

      <section className="afpc-workforce-panel" aria-labelledby="afpc-invitations-title">
        <h2 id="afpc-invitations-title">{copy.invitationsTitle}</h2>
        {invitations.length === 0 ? <p>{copy.noInvitations}</p> : <ul className="afpc-invitation-list">{invitations.map((invitation) => <li key={invitation.id}><span><strong>{invitation.email}</strong><small>{invitation.role}</small></span><span className={`afpc-status afpc-status-${invitation.status}`}>{copy[invitation.status]}</span></li>)}</ul>}
      </section>

      {error && <p role="alert" className="afpc-error">{error}</p>}
    </section>
  )
}
