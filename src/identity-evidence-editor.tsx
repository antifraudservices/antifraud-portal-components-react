// Copyright 2026 Antifraud Services Inc. under the Apache License, Version 2.0.

import { useState, type FormEvent } from 'react'

export type IdentityEvidenceSubjectOption = Readonly<{
  reference: string
  label: string
  disabled?: boolean
}>

export type IdentityEvidenceEditorTarget =
  | Readonly<{ kind: 'subject' }>
  | Readonly<{
      kind: 'relationship'
      relationshipType: string
      relatedSubjectReference: string
    }>
  | Readonly<{
      kind: 'predicate'
      predicate: 'age-over'
      sourceSubjectReference: string
      sourceClaimPath: 'org.schema.Person.birthDate'
      threshold: number
      result: boolean
    }>

export type IdentityEvidenceEditorSubmission = Readonly<{
  subjectReference: string
  target: IdentityEvidenceEditorTarget
  checkReference: string
}>

export type IdentityEvidenceEditorProps = Readonly<{
  subjects: readonly IdentityEvidenceSubjectOption[]
  onSubmit?(submission: IdentityEvidenceEditorSubmission): void
  disabled?: boolean
}>

type TargetChoice = 'subject' | 'relationship' | 'age-over'

export function IdentityEvidenceEditor({
  subjects,
  onSubmit,
  disabled = false,
}: IdentityEvidenceEditorProps) {
  const [subjectReference, setSubjectReference] = useState('')
  const [targetChoice, setTargetChoice] = useState<TargetChoice>('subject')
  const [relatedSubjectReference, setRelatedSubjectReference] = useState('')
  const [relationshipType, setRelationshipType] = useState('')
  const [ageThreshold, setAgeThreshold] = useState(18)
  const [ageResult, setAgeResult] = useState(true)
  const [checkReference, setCheckReference] = useState('')

  const targetComplete = targetChoice === 'subject'
    || (targetChoice === 'relationship'
      && relatedSubjectReference.length > 0
      && relationshipType.trim().length > 0)
    || (targetChoice === 'age-over'
      && Number.isInteger(ageThreshold)
      && ageThreshold >= 1
      && ageThreshold <= 150)
  const complete = !disabled
    && subjectReference.length > 0
    && checkReference.trim().length > 0
    && targetComplete

  function submit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault()
    if (!complete) return

    const target: IdentityEvidenceEditorTarget = targetChoice === 'relationship'
      ? {
          kind: 'relationship',
          relationshipType: relationshipType.trim(),
          relatedSubjectReference,
        }
      : targetChoice === 'age-over'
        ? {
            kind: 'predicate',
            predicate: 'age-over',
            sourceSubjectReference: subjectReference,
            sourceClaimPath: 'org.schema.Person.birthDate',
            threshold: ageThreshold,
            result: ageResult,
          }
        : { kind: 'subject' }

    onSubmit?.({
      subjectReference,
      target,
      checkReference: checkReference.trim(),
    })
  }

  return (
    <section aria-labelledby="identity-evidence-editor-title">
      <header>
        <h2 id="identity-evidence-editor-title">Identity evidence</h2>
        <p>
          Record what was examined. The trusted service supplies the employee,
          organization and authorization and returns the authoritative result.
        </p>
      </header>

      <form onSubmit={submit}>
        <label>
          <span>Subject</span>
          <select
            disabled={disabled}
            onChange={event => setSubjectReference(event.currentTarget.value)}
            required
            value={subjectReference}
          >
            <option value="">Select a subject</option>
            {subjects.map(subject => (
              <option
                disabled={subject.disabled}
                key={subject.reference}
                value={subject.reference}
              >
                {subject.label}
              </option>
            ))}
          </select>
        </label>

        <label>
          <span>Evidence target</span>
          <select
            disabled={disabled}
            onChange={event => setTargetChoice(event.currentTarget.value as TargetChoice)}
            value={targetChoice}
          >
            <option value="subject">Subject identity</option>
            <option value="relationship">Relationship between subjects</option>
            <option value="age-over">Age-over predicate</option>
          </select>
        </label>

        {targetChoice === 'relationship' ? (
          <fieldset>
            <legend>Relationship evidence</legend>
            <label>
              <span>Related subject</span>
              <select
                disabled={disabled}
                onChange={event => setRelatedSubjectReference(event.currentTarget.value)}
                required
                value={relatedSubjectReference}
              >
                <option value="">Select the related subject</option>
                {subjects
                  .filter(subject => subject.reference !== subjectReference)
                  .map(subject => (
                    <option
                      disabled={subject.disabled}
                      key={subject.reference}
                      value={subject.reference}
                    >
                      {subject.label}
                    </option>
                  ))}
              </select>
            </label>
            <label>
              <span>Relationship type</span>
              <input
                disabled={disabled}
                onChange={event => setRelationshipType(event.currentTarget.value)}
                required
                value={relationshipType}
              />
            </label>
          </fieldset>
        ) : null}

        {targetChoice === 'age-over' ? (
          <fieldset>
            <legend>Age predicate</legend>
            <label>
              <span>Age threshold</span>
              <input
                disabled={disabled}
                max={150}
                min={1}
                onChange={event => setAgeThreshold(event.currentTarget.valueAsNumber)}
                required
                type="number"
                value={ageThreshold}
              />
            </label>
            <label>
              <input
                checked={ageResult}
                disabled={disabled}
                onChange={event => setAgeResult(event.currentTarget.checked)}
                type="checkbox"
              />
              <span>The subject meets this age threshold</span>
            </label>
            <p>
              Only age over 18 maps to the standardized EUDI PID attribute.
              Other thresholds remain explicitly governed predicates.
            </p>
          </fieldset>
        ) : null}

        <label>
          <span>Evidence check reference</span>
          <input
            disabled={disabled}
            onChange={event => setCheckReference(event.currentTarget.value)}
            required
            value={checkReference}
          />
        </label>

        <button disabled={!complete} type="submit">Record evidence</button>
      </form>
    </section>
  )
}
