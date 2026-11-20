'use client'

import {useState} from 'react'

export type ServicePaymentSelection = Readonly<{quantity: number; methodId: string}>
export type ServicePayment = Readonly<{
  defaultQuantity: number
  maximumQuantity: number
  quantityLabel: string
  methods: readonly Readonly<{id: string; label: string; description?: string}>[]
  quote?: Readonly<ServicePaymentSelection & {id: string; formattedTotal: string}>
}>
export type ServiceActivationItem = Readonly<{
  id: string
  name: string
  terms: Readonly<{version: string; href: string}>
  status: 'available' | 'awaiting-payment' | 'active' | 'suspended' | 'failed'
  payment?: ServicePayment
  activationId?: string
  invoice?: Readonly<{href: string; due?: string; graceEnds?: string}>
  checkoutHref?: string
}>

export type ServiceActivationRequest = Readonly<{serviceId: string; termsVersion: string; quoteId?: string}>
export type ServiceActivationCopy = Readonly<Record<
  'select' | 'termsLink' | 'acceptTerms' | 'confirm' | 'paymentMethod' | 'total' | 'quotePending' |
  'invoice' | 'checkout' | 'paymentDue' | 'graceEnds' | 'awaitingPayment' | 'active' | 'suspended' | 'failed' | 'retry',
  string
>>
type Selection = Readonly<{
  acceptedTerms?: ServiceActivationItem['terms']
  payment?: ServicePaymentSelection
}>

function validPayment(payment: ServicePayment, selection: ServicePaymentSelection): boolean {
  return Number.isSafeInteger(selection.quantity) && selection.quantity >= 1
    && selection.quantity <= payment.maximumQuantity
    && payment.methods.some(method => method.id === selection.methodId)
}

function currentQuote(payment: ServicePayment, selection: ServicePaymentSelection) {
  const quote = payment.quote
  return validPayment(payment, selection) && quote?.quantity === selection.quantity && quote.methodId === selection.methodId
    ? quote : undefined
}

function initialPayment(payment: ServicePayment): ServicePaymentSelection {
  return {quantity: payment.defaultQuantity, methodId: payment.methods[0]?.id ?? ''}
}

/** Displays configured purchase options and a price quoted by the host. */
export function ServicePaymentOptions({payment, selection, copy, onChange, disabled}: Readonly<{
  payment: ServicePayment
  selection: ServicePaymentSelection
  copy: Pick<ServiceActivationCopy, 'paymentMethod' | 'total' | 'quotePending'>
  onChange: (selection: ServicePaymentSelection) => void
  disabled?: boolean
}>) {
  const quote = currentQuote(payment, selection)
  const method = payment.methods.find(option => option.id === selection.methodId)
  return <fieldset disabled={disabled} aria-label={copy.paymentMethod}>
    <label>{payment.quantityLabel}
      <input type="number" min={1} max={payment.maximumQuantity} step={1}
        value={Number.isNaN(selection.quantity) ? '' : selection.quantity}
        onChange={event => onChange({...selection, quantity: event.currentTarget.valueAsNumber})}/>
    </label>
    <label>{copy.paymentMethod}
      <select value={selection.methodId} onChange={event => onChange({...selection, methodId: event.currentTarget.value})}>
        {payment.methods.map(method => <option key={method.id} value={method.id}>{method.label}</option>)}
      </select>
    </label>
    {method?.description ? <p>{method.description}</p> : null}
    <p role="status">{quote ? <>{copy.total} <strong>{quote.formattedTotal}</strong></> : copy.quotePending}</p>
  </fieldset>
}

export type ServiceActivationProps = Readonly<{
  services: readonly ServiceActivationItem[]
  copy: ServiceActivationCopy
  disabled?: boolean
  onConfirm: (requests: readonly ServiceActivationRequest[]) => void
  onQuote?: (request: ServicePaymentSelection & {serviceId: string}) => void
  onRetry?: (activationId: string) => void
}>

/** Collects activation intentions. The consuming portal supplies authoritative terms, offers and results. */
export function ServiceActivation({services, copy, disabled, onConfirm, onQuote, onRetry}: ServiceActivationProps) {
  const [choices, setChoices] = useState<ReadonlyMap<string, Selection>>(() => new Map())
  const selected = services.filter(item => item.status === 'available' && choices.has(item.id))
  const requests = selected.flatMap(item => {
    const choice = choices.get(item.id)
    const acceptance = choice?.acceptedTerms
    if (acceptance?.version !== item.terms.version || acceptance.href !== item.terms.href) return []
    const request = {serviceId: item.id, termsVersion: item.terms.version}
    if (!item.payment) return [request]
    const quote = currentQuote(item.payment, choice?.payment ?? initialPayment(item.payment))
    return quote ? [{...request, quoteId: quote.id}] : []
  })
  const canConfirm = !disabled && selected.length > 0 && selected.length === requests.length

  function update(id: string, selection?: Selection) {
    setChoices(previous => {
      const next = new Map(previous)
      if (selection) next.set(id, selection)
      else next.delete(id)
      return next
    })
  }

  return <form className="afpc-service-activation" onSubmit={event => {
    event.preventDefault()
    if (canConfirm) onConfirm(requests)
  }}>
    {services.map(item => {
      const choice = choices.get(item.id)
      const accepted = choice?.acceptedTerms?.version === item.terms.version && choice.acceptedTerms.href === item.terms.href
      const status = {available: '', 'awaiting-payment': copy.awaitingPayment, active: copy.active, suspended: copy.suspended, failed: copy.failed}[item.status]
      const activationId = item.activationId
      return <details className="afpc-service-activation-card" key={item.id}>
        <summary><strong>{item.name}</strong>{status ? <> · <span>{status}</span></> : null}</summary>
        {item.status === 'available' ? <fieldset disabled={disabled} aria-label={item.name}>
          <label><input type="checkbox" checked={Boolean(choice)} onChange={event => {
            if (!event.currentTarget.checked) return update(item.id)
            const payment = item.payment && initialPayment(item.payment)
            update(item.id, payment ? {payment} : {})
            if (item.payment && payment && validPayment(item.payment, payment) && !currentQuote(item.payment, payment)) {
              onQuote?.({serviceId: item.id, ...payment})
            }
          }}/>{copy.select}</label>
          <p><a href={item.terms.href} target="_blank" rel="noreferrer">{copy.termsLink}</a></p>
          <label><input type="checkbox" checked={accepted} disabled={!choice} onChange={event => {
            const payment = choice?.payment
            const next = payment ? {payment} : {}
            update(item.id, event.currentTarget.checked ? {...next, acceptedTerms: item.terms} : next)
          }}/>{copy.acceptTerms}</label>
          {item.payment && choice ? <ServicePaymentOptions payment={item.payment}
            selection={choice.payment ?? initialPayment(item.payment)} copy={copy} onChange={payment => {
              update(item.id, {...choice, payment})
              if (item.payment && validPayment(item.payment, payment)) onQuote?.({serviceId: item.id, ...payment})
            }}/> : null}
        </fieldset> : null}
        {item.checkoutHref && item.status === 'awaiting-payment' ? <p><a href={item.checkoutHref}>{copy.checkout}</a></p> : null}
        {item.invoice ? <div>
          <a href={item.invoice.href}>{copy.invoice}</a>
          {item.invoice.due ? <p>{copy.paymentDue} {item.invoice.due}</p> : null}
          {item.invoice.graceEnds ? <p>{copy.graceEnds} {item.invoice.graceEnds}</p> : null}
        </div> : null}
        {item.status === 'failed' && activationId && onRetry
          ? <button type="button" disabled={disabled} onClick={() => onRetry(activationId)}>{copy.retry}</button> : null}
      </details>
    })}
    {services.some(item => item.status === 'available') ? <button type="submit" disabled={!canConfirm}>{copy.confirm}</button> : null}
  </form>
}
