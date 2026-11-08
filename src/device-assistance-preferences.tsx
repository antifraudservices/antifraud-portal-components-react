'use client'

import {useId, type ReactNode} from 'react'

export type DeviceAssistanceFeature = Readonly<{
  id: string
  label: string
  enabled: boolean
  available: boolean
  unavailableReason?: string
  preparing?: boolean
  prepareLabel?: string
  onEnabledChange(enabled: boolean): void
  onPrepare?: () => void
  detail?: ReactNode
}>

export type DeviceAssistancePreferencesProps = Readonly<{
  title: string
  description: string
  features: readonly DeviceAssistanceFeature[]
}>

/** Presentation only: adapters own preferences, capability checks and preparation. */
export function DeviceAssistancePreferences({title, description, features}: DeviceAssistancePreferencesProps) {
  const prefix = useId()
  return <section className="afpc-device-preferences" aria-labelledby={`${prefix}-title`}>
    <h2 id={`${prefix}-title`}>{title}</h2>
    <p>{description}</p>
    <div className="afpc-device-preferences-list">
      {features.map(feature => <section key={feature.id} className="afpc-device-preference">
        <label>
          <input type="checkbox" role="switch" checked={feature.enabled}
            disabled={!feature.available && !feature.enabled}
            aria-describedby={!feature.available && feature.unavailableReason ? `${prefix}-${feature.id}-reason` : undefined}
            onChange={event => feature.onEnabledChange(event.currentTarget.checked)} />
          <span>{feature.label}</span>
        </label>
        {!feature.available && feature.unavailableReason ? <p id={`${prefix}-${feature.id}-reason`}>{feature.unavailableReason}</p> : null}
        {feature.detail}
        {feature.onPrepare && feature.prepareLabel ? <button type="button"
          disabled={!feature.available || !feature.enabled || feature.preparing}
          aria-busy={feature.preparing || undefined}
          onClick={() => feature.onPrepare?.()}>{feature.prepareLabel}</button> : null}
      </section>)}
    </div>
  </section>
}
