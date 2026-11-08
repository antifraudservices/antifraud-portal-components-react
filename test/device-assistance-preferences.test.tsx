// Flow contract: a single controlled device-preferences view separates opt-in, runtime availability and preparation; it never starts downloads on render and always permits revoking a retained opt-in.
import {fireEvent, render, screen} from '@testing-library/react'
import {describe, expect, it, vi} from 'vitest'
import {DeviceAssistancePreferences, type DeviceAssistanceFeature} from '../src/device-assistance-preferences.js'

const feature = (overrides: Partial<DeviceAssistanceFeature> = {}): DeviceAssistanceFeature => ({
  id:'speech', label:'Speech to text', enabled:false, available:true,
  prepareLabel:'Prepare model', onEnabledChange:vi.fn(), onPrepare:vi.fn(), ...overrides,
})

describe('Device assistance preferences', () => {
  it('emits an opt-in intention without preparing or changing controlled state', () => {
    const item = feature()
    render(<DeviceAssistancePreferences title="Device assistance" description="Local options" features={[item]} />)
    expect(item.onPrepare).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('switch', {name:item.label}))
    expect(item.onEnabledChange).toHaveBeenCalledWith(true)
    expect(screen.getByRole('switch')).not.toBeChecked()
    expect(screen.getByRole('button', {name:'Prepare model'})).toBeDisabled()
    expect(item.onPrepare).not.toHaveBeenCalled()
  })
  it('explains unavailability and prevents opting in or preparing', () => {
    const item = feature({available:false, unavailableReason:'Runtime not configured'})
    render(<DeviceAssistancePreferences title="Device assistance" description="Local options" features={[item]} />)
    expect(screen.getByRole('switch')).toBeDisabled()
    expect(screen.getByText('Runtime not configured')).toBeVisible()
    fireEvent.click(screen.getByRole('button'))
    expect(item.onPrepare).not.toHaveBeenCalled()
  })
  it('allows revoking an opt-in when a runtime becomes unavailable', () => {
    const item = feature({enabled:true, available:false, unavailableReason:'Device changed'})
    render(<DeviceAssistancePreferences title="Device assistance" description="Local options" features={[item]} />)
    const toggle = screen.getByRole('switch')
    expect(toggle).not.toBeDisabled()
    fireEvent.click(toggle)
    expect(item.onEnabledChange).toHaveBeenCalledWith(false)
  })
  it('prepares only an available enabled idle feature after an explicit click', () => {
    const item = feature({enabled:true})
    const {rerender} = render(<DeviceAssistancePreferences title="Device assistance" description="Local options" features={[item]} />)
    fireEvent.click(screen.getByRole('button', {name:'Prepare model'}))
    expect(item.onPrepare).toHaveBeenCalledOnce()
    rerender(<DeviceAssistancePreferences title="Device assistance" description="Local options" features={[{...item,preparing:true}]} />)
    expect(screen.getByRole('button')).toBeDisabled()
  })
})
