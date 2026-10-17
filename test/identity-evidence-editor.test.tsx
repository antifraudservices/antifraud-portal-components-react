// Flow contract: 1. An authenticated workforce member selects a host-provided subject. 2. The member records subject evidence, a controller relationship, or an age-over predicate. 3. The component emits one typed intention for the trusted host. Authorization invariant: the component never selects the actor, assignment, organization, group authorization or subject authorization. Persistence invariant: the component never signs, stores, uploads or labels an intention as authoritative readback.
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { IdentityEvidenceEditor } from '../src/identity-evidence-editor'

const subjects = Object.freeze([
  { reference: 'urn:subject:student-opaque', label: 'Student' },
  { reference: 'urn:subject:representative-opaque', label: 'Lawful representative' },
])

describe('IdentityEvidenceEditor', () => {
  it('emits separate subject, controller-relationship and age-over intentions', async () => {
    const onSubmit = vi.fn()
    render(<IdentityEvidenceEditor onSubmit={onSubmit} subjects={subjects} />)

    await userEvent.selectOptions(screen.getByLabelText('Subject'), 'urn:subject:student-opaque')
    await userEvent.type(screen.getByLabelText('Evidence check reference'), 'urn:check:student-identity')
    await userEvent.click(screen.getByRole('button', { name: 'Record evidence' }))

    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({
      subjectReference: 'urn:subject:student-opaque',
      target: { kind: 'subject' },
    }))

    await userEvent.selectOptions(screen.getByLabelText('Evidence target'), 'relationship')
    await userEvent.selectOptions(screen.getByLabelText('Related subject'), 'urn:subject:representative-opaque')
    await userEvent.type(screen.getByLabelText('Relationship type'), 'lawful-representative')
    await userEvent.click(screen.getByRole('button', { name: 'Record evidence' }))

    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({
      subjectReference: 'urn:subject:student-opaque',
      target: {
        kind: 'relationship',
        relationshipType: 'lawful-representative',
        relatedSubjectReference: 'urn:subject:representative-opaque',
      },
    }))

    await userEvent.selectOptions(screen.getByLabelText('Subject'), 'urn:subject:student-opaque')
    await userEvent.selectOptions(screen.getByLabelText('Evidence target'), 'age-over')
    await userEvent.clear(screen.getByLabelText('Age threshold'))
    await userEvent.type(screen.getByLabelText('Age threshold'), '21')
    await userEvent.click(screen.getByRole('button', { name: 'Record evidence' }))

    expect(onSubmit).toHaveBeenLastCalledWith(expect.objectContaining({
      subjectReference: 'urn:subject:student-opaque',
      target: {
        kind: 'predicate',
        predicate: 'age-over',
        sourceSubjectReference: 'urn:subject:student-opaque',
        sourceClaimPath: 'org.schema.Person.birthDate',
        threshold: 21,
        result: true,
      },
    }))
  })

  it('accepts 18, 19, 21 and another governed age threshold without calling them all EUDI PID', async () => {
    const onSubmit = vi.fn()
    render(<IdentityEvidenceEditor onSubmit={onSubmit} subjects={subjects} />)
    await userEvent.selectOptions(screen.getByLabelText('Subject'), 'urn:subject:student-opaque')
    await userEvent.selectOptions(screen.getByLabelText('Evidence target'), 'age-over')
    await userEvent.type(screen.getByLabelText('Evidence check reference'), 'urn:check:age')

    for (const threshold of [18, 19, 21, 65]) {
      await userEvent.clear(screen.getByLabelText('Age threshold'))
      await userEvent.type(screen.getByLabelText('Age threshold'), String(threshold))
      await userEvent.click(screen.getByRole('button', { name: 'Record evidence' }))
    }

    expect(onSubmit).toHaveBeenCalledTimes(4)
    expect(screen.getByText(/Only age over 18 maps to the standardized EUDI PID attribute/u)).toBeVisible()
  })

  it('does not expose actor or authorization controls', () => {
    render(<IdentityEvidenceEditor subjects={subjects} />)

    expect(screen.queryByLabelText(/actor/u)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/organization/u)).not.toBeInTheDocument()
    expect(screen.queryByLabelText(/group authorization/u)).not.toBeInTheDocument()
  })
})
