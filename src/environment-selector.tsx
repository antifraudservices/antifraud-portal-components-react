import type { ChangeEvent } from 'react'

export type PortalEnvironment = 'demo' | 'test-network' | 'production'

export type EnvironmentSelectorProps = Readonly<{
  value: PortalEnvironment
  onChange: (environment: PortalEnvironment) => void
  testNetworkEnabled?: boolean
  productionEnabled?: boolean
}>

const ENVIRONMENTS = Object.freeze([
  {
    id: 'demo' as const,
    label: 'Demo — simulated blockchain',
    description: 'Normal application flow with a six-second in-memory ledger simulation.',
  },
  {
    id: 'test-network' as const,
    label: 'Test Network',
    description: 'Requires provisioned Fabric endpoints and credentials.',
  },
  {
    id: 'production' as const,
    label: 'Production',
    description: 'Unavailable until production governance and infrastructure are approved.',
  },
])

/** Controlled presentation only. The trusted BFF remains the environment authority. */
export function EnvironmentSelector({
  value,
  onChange,
  testNetworkEnabled = false,
  productionEnabled = false,
}: EnvironmentSelectorProps) {
  const enabled = (environment: PortalEnvironment): boolean => environment === 'demo'
    || (environment === 'test-network' && testNetworkEnabled)
    || (environment === 'production' && productionEnabled)

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.currentTarget.value as PortalEnvironment
    if (enabled(next)) onChange(next)
  }

  return (
    <fieldset className="af-environment-selector">
      <legend>Environment</legend>
      {ENVIRONMENTS.map(environment => {
        const isEnabled = enabled(environment.id)
        return (
          <label key={environment.id} className="af-environment-option">
            <input
              type="radio"
              name="antifraud-environment"
              value={environment.id}
              checked={value === environment.id}
              disabled={!isEnabled}
              onChange={handleChange}
            />
            <span>
              <strong>{environment.label}</strong>
              <small>{environment.description}</small>
            </span>
          </label>
        )
      })}
    </fieldset>
  )
}
